"""Data cleaning and hybrid dataset preparation pipeline for AudioVibe ML recommendation service.

This script builds the unified AudioVibe dataset by combining:
1. high_popularity_spotify_data.csv (modern chart hits through 2024 with album names)
2. low_popularity_spotify_data.csv (curated Lo-Fi, Ambient, Chill, Electronic, Jazz, Pop/Rock with album names)
3. SpotifyFeatures.csv (large-scale 176k+ track catalog, excluding 'Comedy', popularity >= 25)

Pipeline steps:
1. Filters out genre == 'Comedy'
2. Normalizes schemas and genres across all input datasets
3. Deduplicates tracks by track_id (prioritizing tracks with album_name and mainstream genre labels)
4. Filters out tracks with low popularity (< 25)
5. Combines all curated modern tracks (High + Low popularity datasets) and tops up from SpotifyFeatures.csv
   to reach the target sample_size (default: 15,000 tracks)
6. Exports the cleaned dataset to apps/ml-service/data/spotify_tracks_cleaned.csv
   and delivers a copy to apps/core-api/prisma/data/ for Prisma database seeding.
"""

from __future__ import annotations

import argparse
import logging
import shutil
from pathlib import Path
from typing import Final

import pandas as pd

logging.basicConfig(
    level=logging.INFO,
    format="[%(asctime)s] %(levelname)s - %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger("clean_dataset")

AUDIO_FEATURE_COLUMNS: Final[list[str]] = [
    "danceability",
    "valence",
    "energy",
    "acousticness",
    "instrumentalness",
    "liveness",
    "speechiness",
]

REQUIRED_COLUMNS: Final[list[str]] = [
    "track_id",
    "track_name",
    "artist_name",
    "genre",
    "popularity",
    "duration_ms",
    *AUDIO_FEATURE_COLUMNS,
]

EXPORT_COLUMNS: Final[list[str]] = [
    "genre",
    "artist_name",
    "track_name",
    "album_name",
    "track_id",
    "popularity",
    "acousticness",
    "danceability",
    "duration_ms",
    "energy",
    "instrumentalness",
    "key",
    "liveness",
    "loudness",
    "mode",
    "speechiness",
    "tempo",
    "time_signature",
    "valence",
]

# Genre normalization mapping for high_popularity and low_popularity datasets
GENRE_NORMALIZATION_MAP: Final[dict[str, str]] = {
    "pop": "Pop",
    "rock": "Rock",
    "hip-hop": "Hip-Hop",
    "r&b": "R&B",
    "electronic": "Electronic",
    "gaming": "Electronic",
    "lofi": "Lo-Fi",
    "ambient": "Ambient",
    "wellness": "Ambient",
    "latin": "Latin",
    "jazz": "Jazz",
    "classical": "Classical",
    "blues": "Blues",
    "folk": "Folk",
    "country": "Country",
    "reggae": "Reggae",
    "indie": "Indie",
    "soul": "Soul",
    "funk": "Funk",
    "disco": "Dance",
    "punk": "Punk",
    "metal": "Metal",
    "k-pop": "K-Pop",
    "korean": "K-Pop",
    "j-pop": "J-Pop",
    "cantopop": "Pop",
    "mandopop": "Pop",
    "afrobeats": "Afrobeats",
    "world": "World",
    "arabic": "World",
    "brazilian": "World",
    "indian": "World",
    "turkish": "World",
    "gospel": "Soul",
    "soca": "World",
}

# Curated genres to include from low_popularity_spotify_data.csv
CURATED_LOW_POP_GENRES: Final[set[str]] = {
    "electronic",
    "lofi",
    "ambient",
    "wellness",
    "pop",
    "rock",
    "hip-hop",
    "r&b",
    "jazz",
    "classical",
    "blues",
    "soul",
    "folk",
    "funk",
    "indie",
    "disco",
    "country",
    "reggae",
    "punk",
    "metal",
    "j-pop",
    "k-pop",
    "korean",
    "cantopop",
    "mandopop",
    "gaming",
    "latin",
    "afrobeats",
}

# Theatrical/specialty genres in SpotifyFeatures.csv that should not overwrite mainstream genre labels on duplicate track_ids
SECONDARY_DEDUP_GENRES: Final[set[str]] = {
    "Children's Music",
    "Children’s Music",
    "Movie",
    "Opera",
    "Soundtrack",
    "A Capella",
}


def _normalize_supplementary_df(
    df: pd.DataFrame,
    filter_genres: set[str] | None = None,
) -> pd.DataFrame:
    """Normalize schema of high_popularity or low_popularity CSV to match SpotifyFeatures schema."""
    out = df.copy()
    rename_map = {
        "track_artist": "artist_name",
        "track_album_name": "album_name",
        "playlist_genre": "genre",
        "track_popularity": "popularity",
    }
    out = out.rename(columns={k: v for k, v in rename_map.items() if k in out.columns})

    if "genre" in out.columns:
        raw_genre = out["genre"].fillna("").astype(str).str.strip().str.lower()
        if filter_genres is not None:
            out = out[raw_genre.isin(filter_genres)].copy()
            raw_genre = out["genre"].fillna("").astype(str).str.strip().str.lower()
        out["genre"] = raw_genre.map(lambda g: GENRE_NORMALIZATION_MAP.get(g, g.title() if g else "Pop"))

    if "album_name" not in out.columns:
        out["album_name"] = None

    # Remove Comedy if any
    if "genre" in out.columns:
        out = out[out["genre"].astype(str).str.strip().str.lower() != "comedy"].copy()

    # Drop nulls in required columns
    out = out.dropna(subset=REQUIRED_COLUMNS).copy()
    out = out.drop_duplicates(subset=["track_id"], keep="first").copy()
    out = out[out["popularity"] >= 25].copy()
    return out


def clean_spotify_dataset(
    input_path: Path,
    output_path: Path,
    sample_size: int = 15000,
    random_state: int = 42,
    deliver_to_backend: bool = True,
    backend_data_dir: Path | None = None,
    high_pop_path: Path | None = None,
    low_pop_path: Path | None = None,
) -> pd.DataFrame:
    """Clean and merge the Spotify datasets according to project rules.

    Args:
        input_path: Path to the raw SpotifyFeatures.csv file.
        output_path: Destination path for the cleaned CSV file.
        sample_size: Number of tracks to sample (default: 15,000).
        random_state: Seed for reproducible random sampling.
        deliver_to_backend: Whether to copy the cleaned CSV to apps/core-api.
        backend_data_dir: Optional custom directory path for backend seed data.
        high_pop_path: Optional path to high_popularity_spotify_data.csv.
        low_pop_path: Optional path to low_popularity_spotify_data.csv.

    Returns:
        Cleaned, merged, and sampled pandas DataFrame.
    """
    if not input_path.exists():
        raise FileNotFoundError(f"Raw dataset not found at: {input_path}")

    # Auto-detect supplementary datasets when running on the main SpotifyFeatures.csv file
    if input_path.name == "SpotifyFeatures.csv":
        if high_pop_path is None:
            candidate_high = input_path.parent / "high_popularity_spotify_data.csv"
            if candidate_high.exists():
                high_pop_path = candidate_high
        if low_pop_path is None:
            candidate_low = input_path.parent / "low_popularity_spotify_data.csv"
            if candidate_low.exists():
                low_pop_path = candidate_low

    logger.info("Loading primary dataset from %s ...", input_path)
    df = pd.read_csv(input_path)
    initial_count = len(df)
    logger.info("Total rows loaded from primary dataset: %d", initial_count)

    # 1. Filter out genre == 'Comedy' (Keep Movie, Opera, Children's Music, Soundtrack)
    df = df[df["genre"].astype(str).str.strip().str.lower() != "comedy"].copy()
    after_comedy_count = len(df)
    logger.info(
        "After removing 'Comedy' genre: %d (removed %d)",
        after_comedy_count,
        initial_count - after_comedy_count,
    )

    # 2. Deduplicate by track_id (using stable sort so mainstream genres aren't overwritten by secondary labels)
    df["_dedup_priority"] = df["genre"].isin(SECONDARY_DEDUP_GENRES).astype(int)
    df = df.sort_values("_dedup_priority", kind="mergesort").drop(columns=["_dedup_priority"])
    df = df.drop_duplicates(subset=["track_id"], keep="first").copy()
    after_dedup_count = len(df)
    logger.info(
        "After deduplicating by track_id: %d (removed %d duplicates)",
        after_dedup_count,
        after_comedy_count - after_dedup_count,
    )

    # 3. Filter out tracks with low popularity (popularity < 25)
    df = df[df["popularity"] >= 25].copy()
    after_pop_count = len(df)
    logger.info(
        "After filtering popularity >= 25: %d (removed %d low-popularity tracks)",
        after_pop_count,
        after_dedup_count - after_pop_count,
    )

    # Drop any nulls in required audio features or track_id
    df = df.dropna(subset=REQUIRED_COLUMNS).copy()
    if "album_name" not in df.columns:
        df["album_name"] = None
    logger.info("After removing nulls in required columns: %d", len(df))

    # 4. Load and normalize supplementary datasets (high_popularity & low_popularity) if available
    supplementary_frames: list[pd.DataFrame] = []
    if high_pop_path is not None and high_pop_path.exists():
        raw_high = pd.read_csv(high_pop_path)
        clean_high = _normalize_supplementary_df(raw_high, filter_genres=None)
        supplementary_frames.append(clean_high)
        logger.info(
            "Loaded %d unique high-popularity tracks from %s",
            len(clean_high),
            high_pop_path.name,
        )

    if low_pop_path is not None and low_pop_path.exists():
        raw_low = pd.read_csv(low_pop_path)
        clean_low = _normalize_supplementary_df(raw_low, filter_genres=CURATED_LOW_POP_GENRES)
        supplementary_frames.append(clean_low)
        logger.info(
            "Loaded %d curated tracks (Lo-Fi/Ambient/Chill/Mainstream, pop >= 25) from %s",
            len(clean_low),
            low_pop_path.name,
        )

    if supplementary_frames:
        supp_df = pd.concat(supplementary_frames, ignore_index=True)
        supp_df = supp_df.drop_duplicates(subset=["track_id"], keep="first").copy()
        logger.info("Combined unique supplementary tracks (High + Low): %d", len(supp_df))

        # Exclude tracks already in supplementary_frames from primary SpotifyFeatures.csv
        supp_ids = set(supp_df["track_id"].astype(str))
        df_primary_remaining = df[~df["track_id"].astype(str).isin(supp_ids)].copy()

        if len(supp_df) >= sample_size:
            df_sampled = supp_df.sample(n=sample_size, random_state=random_state).copy()
        else:
            needed_from_primary = min(sample_size - len(supp_df), len(df_primary_remaining))
            df_primary_sampled = df_primary_remaining.sample(
                n=needed_from_primary, random_state=random_state
            ).copy()
            df_sampled = pd.concat([supp_df, df_primary_sampled], ignore_index=True)

        # Keep consistent column set
        available_cols = [c for c in EXPORT_COLUMNS if c in df_sampled.columns]
        extra_cols = [c for c in REQUIRED_COLUMNS if c not in available_cols]
        df_sampled = df_sampled[available_cols + extra_cols].copy()
    else:
        target_sample = min(sample_size, len(df))
        df_sampled = df.sample(n=target_sample, random_state=random_state).copy()

    df_sampled = df_sampled.reset_index(drop=True)
    logger.info(
        "Final hybrid dataset prepared: %d tracks (random_state=%d)",
        len(df_sampled),
        random_state,
    )

    # 5. Export cleaned CSV
    output_path.parent.mkdir(parents=True, exist_ok=True)
    df_sampled.to_csv(output_path, index=False, encoding="utf-8")
    logger.info("Exported cleaned dataset to: %s", output_path)

    # 6. Deliver copy to backend for Prisma seed
    if deliver_to_backend:
        if backend_data_dir is None:
            project_root = Path(__file__).resolve().parents[3]
            backend_data_dir = project_root / "apps" / "core-api" / "prisma" / "data"

        backend_data_dir.mkdir(parents=True, exist_ok=True)
        backend_file = backend_data_dir / output_path.name
        shutil.copyfile(output_path, backend_file)
        logger.info("Delivered cleaned dataset to Backend for Prisma seed: %s", backend_file)

    return df_sampled


def main() -> None:
    """CLI entrypoint for clean_dataset script."""
    parser = argparse.ArgumentParser(
        description="Clean and merge SpotifyFeatures.csv, high_popularity_spotify_data.csv, and low_popularity_spotify_data.csv."
    )
    parser.add_argument(
        "--input",
        "-i",
        type=Path,
        default=Path("SpotifyFeatures.csv"),
        help="Path to primary input SpotifyFeatures.csv",
    )
    parser.add_argument(
        "--high-pop",
        type=Path,
        default=None,
        help="Optional path to high_popularity_spotify_data.csv",
    )
    parser.add_argument(
        "--low-pop",
        type=Path,
        default=None,
        help="Optional path to low_popularity_spotify_data.csv",
    )
    parser.add_argument(
        "--output",
        "-o",
        type=Path,
        default=Path("apps/ml-service/data/spotify_tracks_cleaned.csv"),
        help="Path for output cleaned CSV file",
    )
    parser.add_argument(
        "--sample-size",
        "-s",
        type=int,
        default=15000,
        help="Sample size (default: 15000, recommended: 10000-20000)",
    )
    parser.add_argument(
        "--random-state",
        "-r",
        type=int,
        default=42,
        help="Random state seed (default: 42)",
    )

    args = parser.parse_args()

    project_root = Path(__file__).resolve().parents[3]

    input_path = args.input
    if not input_path.exists():
        candidate = project_root / args.input
        if candidate.exists():
            input_path = candidate

    output_path = args.output
    if not output_path.is_absolute():
        output_path = project_root / args.output

    clean_spotify_dataset(
        input_path=input_path,
        output_path=output_path,
        sample_size=args.sample_size,
        random_state=args.random_state,
        high_pop_path=args.high_pop,
        low_pop_path=args.low_pop,
    )


if __name__ == "__main__":
    main()
