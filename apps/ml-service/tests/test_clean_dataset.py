"""Unit tests for the data cleaning pipeline script."""

import os
from pathlib import Path
import pandas as pd
import pytest

from scripts.clean_dataset import clean_spotify_dataset, REQUIRED_COLUMNS


class TestCleanDataset:
    """Test suite for clean_dataset.py pipeline functions."""

    @pytest.fixture
    def raw_csv_file(self, tmp_path: Path) -> Path:
        """Create a temporary CSV file mimicking SpotifyFeatures.csv."""
        data = [
            # Comedy track (should be filtered out)
            {
                "genre": "Comedy",
                "artist_name": "Standup Comic",
                "track_name": "Jokes Vol 1",
                "track_id": "comedy_1",
                "popularity": 50,
                "duration_ms": 120000,
                "danceability": 0.5,
                "valence": 0.5,
                "energy": 0.5,
                "acousticness": 0.5,
                "instrumentalness": 0.0,
                "liveness": 0.9,
                "speechiness": 0.9,
            },
            # Low popularity track (should be filtered out: < 25)
            {
                "genre": "Pop",
                "artist_name": "Unknown",
                "track_name": "Obscure Song",
                "track_id": "low_pop_1",
                "popularity": 15,
                "duration_ms": 180000,
                "danceability": 0.6,
                "valence": 0.6,
                "energy": 0.6,
                "acousticness": 0.2,
                "instrumentalness": 0.0,
                "liveness": 0.1,
                "speechiness": 0.05,
            },
            # Duplicate track (track_id = dup_1, first entry)
            {
                "genre": "Rock",
                "artist_name": "Rock Band",
                "track_name": "Classic Song",
                "track_id": "dup_1",
                "popularity": 70,
                "duration_ms": 200000,
                "danceability": 0.7,
                "valence": 0.8,
                "energy": 0.8,
                "acousticness": 0.1,
                "instrumentalness": 0.1,
                "liveness": 0.2,
                "speechiness": 0.04,
            },
            # Duplicate track (track_id = dup_1, second entry - should be dropped)
            {
                "genre": "Rock",
                "artist_name": "Rock Band",
                "track_name": "Classic Song (Remaster)",
                "track_id": "dup_1",
                "popularity": 65,
                "duration_ms": 200000,
                "danceability": 0.7,
                "valence": 0.8,
                "energy": 0.8,
                "acousticness": 0.1,
                "instrumentalness": 0.1,
                "liveness": 0.2,
                "speechiness": 0.04,
            },
            # Valid track 2
            {
                "genre": "Dance",
                "artist_name": "Club DJ",
                "track_name": "Club Hit",
                "track_id": "valid_2",
                "popularity": 80,
                "duration_ms": 220000,
                "danceability": 0.85,
                "valence": 0.9,
                "energy": 0.95,
                "acousticness": 0.05,
                "instrumentalness": 0.02,
                "liveness": 0.15,
                "speechiness": 0.08,
            },
        ]
        csv_path = tmp_path / "test_raw_features.csv"
        pd.DataFrame(data).to_csv(csv_path, index=False)
        return csv_path

    def test_clean_dataset_filters_and_deduplicates(
        self, raw_csv_file: Path, tmp_path: Path
    ) -> None:
        """Test clean_dataset removes Comedy, duplicates, and low popularity."""
        out_csv = tmp_path / "cleaned.csv"
        backend_dir = tmp_path / "backend_data"

        cleaned_df = clean_spotify_dataset(
            input_path=raw_csv_file,
            output_path=out_csv,
            sample_size=10,
            deliver_to_backend=True,
            backend_data_dir=backend_dir,
        )

        # Expected remaining: dup_1 (first entry) and valid_2 (total 2 tracks)
        assert len(cleaned_df) == 2
        remaining_ids = cleaned_df["track_id"].tolist()
        assert "comedy_1" not in remaining_ids
        assert "low_pop_1" not in remaining_ids
        assert set(remaining_ids) == {"dup_1", "valid_2"}

        # Check export files exist
        assert out_csv.exists()
        assert (backend_dir / out_csv.name).exists()

    def test_clean_dataset_nonexistent_file_raises_error(self, tmp_path: Path) -> None:
        """Test clean_dataset raises FileNotFoundError on missing file."""
        with pytest.raises(FileNotFoundError):
            clean_spotify_dataset(
                input_path=tmp_path / "does_not_exist.csv",
                output_path=tmp_path / "out.csv",
            )
