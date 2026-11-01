"""In-Memory Vector Matrix and fast Cosine Similarity store."""

from __future__ import annotations

from collections import deque
import logging
from pathlib import Path
from typing import Sequence

import numpy as np
import pandas as pd

from src.config import settings
from src.models.schemas import AudioFeatures7D, RecommendedTrack

logger = logging.getLogger("vector_store")

# Explicit genre keywords when user specifically asks for a distinct style
EXPLICIT_GENRE_KEYWORDS: dict[str, set[str]] = {
    "Lo-Fi": {"lofi", "lo-fi", "โลไฟ"},
    "Ambient": {"ambient", "แอมเบียนท์", "meditation", "สมาธิ", "ทำสมาธิ"},
    "Jazz": {"jazz", "แจ๊ส", "bossa", "saxophone"},
    "Hip-Hop": {"hip-hop", "hiphop", "ฮิปฮอป"},
    "Rap": {"rap", "แร็พ", "แร็ป"},
    "R&B": {"r&b", "rnb", "อาร์แอนด์บี"},
    "Rock": {"rock", "ร็อค", "ร็อก"},
    "Metal": {"metal", "เมทัล", "จังหวะหนัก"},
    "Punk": {"punk", "พังก์"},
    "Blues": {"blues", "บลูส์"},
    "Country": {"country", "คันทรี", "ลูกทุ่ง"},
    "Classical": {"classical", "orchestra", "คลาสสิก", "ออเคสตรา"},
    "Anime": {"anime", "อนิเมะ", "การ์ตูน"},
    "J-Pop": {"j-pop", "jpop", "เจป็อป", "เพลงญี่ปุ่น"},
    "K-Pop": {"k-pop", "kpop", "เคป็อป", "เพลงเกาหลี", "เกาหลี"},
    "Latin": {"latin", "ลาติน"},
    "Reggae": {"reggae", "เรกเก้"},
    "Reggaeton": {"reggaeton", "เรเกตอง"},
    "Ska": {"ska", "สกา"},
    "Soundtrack": {"soundtrack", "ost", "ประกอบหนัง"},
    "Movie": {"movie", "film"},
    "Opera": {"opera", "โอเปร่า"},
    "Children's Music": {"children", "kids", "เพลงเด็ก"},
    "Children’s Music": {"children", "kids", "เพลงเด็ก"},
}

# Non-mainstream / theatrical genres excluded by default unless explicitly requested
NON_MAINSTREAM_GENRES: set[str] = {
    "Children's Music",
    "Children’s Music",
    "Opera",
    "Movie",
    "Soundtrack",
    "Classical",
}


class VectorStore:
    """Manages in-memory metadata and normalized 7D audio feature vectors."""

    def __init__(self, history_rounds: int = 3) -> None:
        self.df: pd.DataFrame = pd.DataFrame()
        self.raw_matrix: np.ndarray = np.empty((0, 7), dtype=np.float32)
        self.normalized_matrix: np.ndarray = np.empty((0, 7), dtype=np.float32)
        self.track_ids: list[str] = []
        self.genres: list[str] = []
        self._is_loaded: bool = False
        # Sliding window remembering track IDs from the last N rounds (default: 3 rounds)
        self._recent_rounds: deque[set[str]] = deque(maxlen=history_rounds)
        self._rng = np.random.default_rng()

    @property
    def is_loaded(self) -> bool:
        """Return True if dataset and matrix are loaded into memory."""
        return self._is_loaded

    @property
    def count(self) -> int:
        """Return number of tracks stored in memory."""
        return len(self.df)

    def clear_history(self) -> None:
        """Clear the recent rounds cooldown history."""
        self._recent_rounds.clear()

    def load_from_dataframe(self, df: pd.DataFrame) -> None:
        """Load dataset from a pandas DataFrame and prepare the vector matrix.

        Args:
            df: DataFrame containing track metadata and 7 audio feature columns.
        """
        for feature in settings.AUDIO_FEATURES_7D:
            if feature not in df.columns:
                raise ValueError(f"Required audio feature column '{feature}' is missing from dataset.")

        self.df = df.copy().reset_index(drop=True)
        self.track_ids = self.df["track_id"].astype(str).tolist()
        if "genre" in self.df.columns:
            self.genres = self.df["genre"].fillna("").astype(str).tolist()
        else:
            self.genres = [""] * len(self.df)

        # Extract 7D audio features matrix (float32 for speed and compact memory)
        raw_vals = self.df[settings.AUDIO_FEATURES_7D].to_numpy(dtype=np.float32)
        self.raw_matrix = raw_vals

        # L2 Normalize the matrix: v_norm = v / ||v||_2
        norms = np.linalg.norm(raw_vals, axis=1, keepdims=True)
        # Avoid division by zero with small epsilon
        norms[norms == 0.0] = 1e-9
        self.normalized_matrix = raw_vals / norms
        self._is_loaded = True
        self._recent_rounds.clear()

        logger.info(
            "VectorStore initialized with %d tracks. Matrix shape: %s",
            len(self.df),
            self.normalized_matrix.shape,
        )

    def load_from_csv(self, file_path: Path | str) -> None:
        """Load cleaned dataset from CSV file.

        Args:
            file_path: Path to the cleaned CSV file.
        """
        path = Path(file_path)
        if not path.exists():
            raise FileNotFoundError(f"Cleaned dataset CSV not found at: {path}")

        logger.info("Loading cleaned dataset from %s ...", path)
        df = pd.read_csv(path)
        self.load_from_dataframe(df)

    def _detect_explicit_genres(self, query_text: str | None) -> set[str]:
        """Detect only explicitly requested specialty genres from prompt."""
        if not query_text:
            return set()
        lower = query_text.lower()
        matched: set[str] = set()
        for genre, keywords in EXPLICIT_GENRE_KEYWORDS.items():
            if any(kw in lower for kw in keywords):
                matched.add(genre)
        return matched

    def search(
        self,
        target_vector: Sequence[float] | np.ndarray,
        limit: int = 15,
        exclude_ids: set[str] | list[str] | None = None,
        query_text: str | None = None,
        diversify: bool = True,
    ) -> list[RecommendedTrack]:
        """Search top K nearest tracks using cosine similarity, cooldown history, and top-pool sampling.

        Args:
            target_vector: 7D float array/list representing desired audio features.
            limit: Maximum number of tracks to return.
            exclude_ids: Optional set/list of track IDs to ignore (e.g. for refinement).
            query_text: Optional user prompt or preset name for genre filtering.
            diversify: Whether to apply top-pool weighted sampling and 3-round cooldown on full datasets.

        Returns:
            List of RecommendedTrack models sorted descending by similarity.
        """
        if not self._is_loaded or len(self.df) == 0:
            raise RuntimeError("VectorStore is empty or not loaded yet.")

        target = np.asarray(target_vector, dtype=np.float32).reshape(-1)
        if target.shape[0] != 7:
            raise ValueError(f"Target vector must have exactly 7 dimensions, got {target.shape[0]}")

        # L2 Normalize query vector
        norm = np.linalg.norm(target)
        if norm == 0.0:
            norm = 1e-9
        normalized_target = target / norm

        # 1. Cosine similarity via dot product with pre-normalized matrix: (N, 7) @ (7,) -> (N,)
        cosine_sims = np.dot(self.normalized_matrix, normalized_target)

        # 2. Feature magnitude closeness so [0.2, 0.2, ...] doesn't match [0.8, 0.8, ...]
        feature_weights = np.array([1.2, 1.5, 1.5, 1.2, 1.3, 0.5, 0.8], dtype=np.float32)
        feature_weights = feature_weights / np.sum(feature_weights)
        weighted_abs_diff = np.sum(np.abs(self.raw_matrix - target) * feature_weights, axis=1)
        closeness = np.clip(1.0 - weighted_abs_diff, 0.0, 1.0)

        # Blend: 75% Cosine Similarity + 25% Feature Magnitude Closeness
        similarities = (0.75 * cosine_sims) + (0.25 * closeness)

        # Use full dataset diversification when loaded with the real catalog (> 100 tracks)
        use_catalog_diversification = diversify and len(self.df) > 100

        if use_catalog_diversification and any(self.genres):
            explicit_genres = self._detect_explicit_genres(query_text)
            genre_series = self.df["genre"].fillna("")
            # Filter out non-mainstream genres (Soundtrack, Classical, Opera, Movie, Children's Music)
            # unless the user specifically asked for them or asked for high-instrumentalness focus/study music
            unwanted = set(NON_MAINSTREAM_GENRES) - explicit_genres
            if float(target[4]) >= 0.65:  # High instrumentalness (e.g., focus/study/piano) allows Classical
                unwanted.discard("Classical")

            unwanted_mask = genre_series.isin(unwanted).to_numpy()
            similarities = np.where(unwanted_mask, similarities * 0.75, similarities)

            # Slight boost only if user explicitly named a specialty genre (e.g. Jazz, Anime, Rap)
            if explicit_genres:
                explicit_mask = genre_series.isin(explicit_genres).to_numpy()
                similarities = np.where(~explicit_mask, similarities * 0.94, similarities)

        # Build exclusion set: explicit exclude_ids + 3-round sliding window cooldown
        explicit_exclude = set(exclude_ids) if exclude_ids else set()
        cooldown_exclude: set[str] = set()
        if use_catalog_diversification:
            for round_ids in self._recent_rounds:
                cooldown_exclude.update(round_ids)

        combined_exclude = explicit_exclude | cooldown_exclude

        if combined_exclude:
            indices_to_mask = [
                idx for idx, tid in enumerate(self.track_ids) if tid in combined_exclude
            ]
            # Safety check: ensure we still have enough unmasked tracks
            if len(self.df) - len(indices_to_mask) >= limit:
                similarities = similarities.copy()
                similarities[indices_to_mask] = -1.0
            elif explicit_exclude:
                # Fallback to masking only explicit_exclude if cooldown exhausted small dataset
                explicit_mask_indices = [
                    idx for idx, tid in enumerate(self.track_ids) if tid in explicit_exclude
                ]
                if explicit_mask_indices:
                    similarities = similarities.copy()
                    similarities[explicit_mask_indices] = -1.0

        available_count = len(self.df) - len(explicit_exclude)
        candidate_count = min(limit, available_count)
        if candidate_count <= 0:
            return []

        if use_catalog_diversification:
            # Top-K Candidate Pool (e.g. Top 90 tracks) -> Artist Deduplication -> Weighted Sampling
            pool_size = min(max(candidate_count * 6, 75), len(similarities))
            pool_indices = np.argpartition(-similarities, pool_size - 1)[:pool_size]
            pool_indices = pool_indices[np.argsort(-similarities[pool_indices])]

            # Deduplicate artists inside the candidate pool so 1 artist doesn't dominate
            dedup_pool: list[int] = []
            seen_artists: set[str] = set()
            for idx in pool_indices:
                if similarities[idx] < 0.0:
                    continue
                artist = str(self.df.iloc[idx].get("artist_name", "")).strip().lower()
                if artist and artist in seen_artists:
                    continue
                seen_artists.add(artist)
                dedup_pool.append(int(idx))
                if len(dedup_pool) >= max(candidate_count * 4, 50):
                    break

            # If artist deduplication left fewer than candidate_count, top up from remaining pool
            if len(dedup_pool) < candidate_count:
                for idx in pool_indices:
                    if int(idx) not in dedup_pool and similarities[idx] >= 0.0:
                        dedup_pool.append(int(idx))
                    if len(dedup_pool) >= candidate_count:
                        break

            if len(dedup_pool) > candidate_count:
                pool_arr = np.array(dedup_pool, dtype=np.int64)
                pool_scores = np.clip(similarities[pool_arr], 1e-4, 1.0)
                # Softmax with sharp temperature so higher-scoring tracks have higher probability
                shifted = (pool_scores - np.max(pool_scores)) / 0.035
                weights = np.exp(shifted)
                weights = weights / np.sum(weights)
                chosen_indices = self._rng.choice(
                    pool_arr, size=candidate_count, replace=False, p=weights
                )
                # Sort chosen tracks descending by similarity score
                top_indices = chosen_indices[np.argsort(-similarities[chosen_indices])]
            else:
                top_indices = np.array(dedup_pool[:candidate_count], dtype=np.int64)
        else:
            # Deterministic exact top-K for small test fixtures
            if candidate_count < len(similarities):
                top_indices = np.argpartition(-similarities, candidate_count)[:candidate_count]
                top_indices = top_indices[np.argsort(-similarities[top_indices])]
            else:
                top_indices = np.argsort(-similarities)[:candidate_count]

        results: list[RecommendedTrack] = []
        selected_round_ids: set[str] = set()

        for idx in top_indices:
            score = float(similarities[idx])
            track_id_str = self.track_ids[idx]
            if score < 0.0 and track_id_str in explicit_exclude:
                continue

            row = self.df.iloc[idx]
            track_features = AudioFeatures7D(
                danceability=float(row["danceability"]),
                valence=float(row["valence"]),
                energy=float(row["energy"]),
                acousticness=float(row["acousticness"]),
                instrumentalness=float(row["instrumentalness"]),
                liveness=float(row["liveness"]),
                speechiness=float(row["speechiness"]),
            )

            album_name = str(row["album_name"]) if "album_name" in row and pd.notna(row["album_name"]) else None
            genre = str(row["genre"]) if "genre" in row and pd.notna(row["genre"]) else None

            results.append(
                RecommendedTrack(
                    track_id=track_id_str,
                    title=str(row["track_name"]),
                    artist_name=str(row["artist_name"]),
                    album_name=album_name,
                    genre=genre,
                    popularity=int(row.get("popularity", 0)),
                    similarity_score=round(min(1.0, max(0.0, score)), 4),
                    audio_features=track_features,
                )
            )
            selected_round_ids.add(track_id_str)

        # Record this round's selected tracks into the 3-round sliding window
        if use_catalog_diversification and selected_round_ids:
            self._recent_rounds.append(selected_round_ids)
            logger.info(
                "Recorded %d tracks into cooldown window (active rounds: %d/3, total cooldown tracks: %d)",
                len(selected_round_ids),
                len(self._recent_rounds),
                sum(len(r) for r in self._recent_rounds),
            )

        return results


# Global singleton instance
vector_store = VectorStore(history_rounds=3)
