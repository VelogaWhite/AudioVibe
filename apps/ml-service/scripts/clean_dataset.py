"""Data cleaning and preparation pipeline for AudioVibe ML recommendation service.

This script processes SpotifyFeatures.csv:
1. Filters out genre == 'Comedy'
2. Removes duplicate tracks by track_id
3. Filters out tracks with low popularity (< 25)
4. Samples a high-quality subset of 10,000-20,000 tracks (default: 15,000)
5. Exports the cleaned dataset to apps/ml-service/data/spotify_tracks_cleaned.csv
   and delivers a copy to apps/core-api/prisma/data/ for Prisma database seeding.
"""

from __future__ import annotations

import argparse
import logging
import os
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


def clean_spotify_dataset(
    input_path: Path,
    output_path: Path,
    sample_size: int = 15000,
    random_state: int = 42,
    deliver_to_backend: bool = True,
    backend_data_dir: Path | None = None,
) -> pd.DataFrame:
    """Clean and sample the Spotify dataset according to project rules.

    Args:
        input_path: Path to the raw SpotifyFeatures.csv file.
        output_path: Destination path for the cleaned CSV file.
        sample_size: Number of tracks to sample (10,000 - 20,000).
        random_state: Seed for reproducible random sampling.
        deliver_to_backend: Whether to copy the cleaned CSV to apps/core-api.
        backend_data_dir: Optional custom directory path for backend seed data.

    Returns:
        Cleaned and sampled pandas DataFrame.
    """
    if not input_path.exists():
        raise FileNotFoundError(f"Raw dataset not found at: {input_path}")

    logger.info("Loading raw dataset from %s ...", input_path)
    df = pd.read_csv(input_path)
    initial_count = len(df)
    logger.info("Total rows loaded: %d", initial_count)

    # 1. Filter out genre == 'Comedy'
    df = df[df["genre"].str.strip().str.lower() != "comedy"].copy()
    after_comedy_count = len(df)
    logger.info(
        "After removing 'Comedy' genre: %d (removed %d)",
        after_comedy_count,
        initial_count - after_comedy_count,
    )

    # 2. Deduplicate by track_id
    df = df.drop_duplicates(subset=["track_id"]).copy()
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
    logger.info("After removing nulls in required columns: %d", len(df))

    # 4. Sample quality tracks (10,000 to 20,000)
    target_sample = min(sample_size, len(df))
    df_sampled = df.sample(n=target_sample, random_state=random_state).copy()
    # Reset index
    df_sampled = df_sampled.reset_index(drop=True)
    logger.info("Sampled %d high-quality tracks (random_state=%d)", len(df_sampled), random_state)

    # 5. Export cleaned CSV
    output_path.parent.mkdir(parents=True, exist_ok=True)
    df_sampled.to_csv(output_path, index=False, encoding="utf-8")
    logger.info("Exported cleaned dataset to: %s", output_path)

    # 6. Deliver copy to backend for Prisma seed
    if deliver_to_backend:
        if backend_data_dir is None:
            # Derive relative to project root
            project_root = Path(__file__).resolve().parents[3]
            backend_data_dir = project_root / "apps" / "core-api" / "prisma" / "data"

        backend_data_dir.mkdir(parents=True, exist_ok=True)
        backend_file = backend_data_dir / output_path.name
        shutil.copyfile(output_path, backend_file)
        logger.info("Delivered cleaned dataset to Backend for Prisma seed: %s", backend_file)

    return df_sampled


def main() -> None:
    """CLI entrypoint for clean_dataset script."""
    parser = argparse.ArgumentParser(description="Clean SpotifyFeatures.csv dataset.")
    parser.add_argument(
        "--input",
        "-i",
        type=Path,
        default=Path("SpotifyFeatures.csv"),
        help="Path to input SpotifyFeatures.csv",
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

    # If relative path does not exist, resolve relative to project root
    input_path = args.input
    if not input_path.exists():
        project_root = Path(__file__).resolve().parents[3]
        candidate = project_root / args.input
        if candidate.exists():
            input_path = candidate

    output_path = args.output
    if not output_path.is_absolute():
        project_root = Path(__file__).resolve().parents[3]
        output_path = project_root / args.output

    clean_spotify_dataset(
        input_path=input_path,
        output_path=output_path,
        sample_size=args.sample_size,
        random_state=args.random_state,
    )


if __name__ == "__main__":
    main()
