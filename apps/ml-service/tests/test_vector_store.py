"""Unit tests for In-Memory VectorStore and Cosine Similarity calculation."""

import numpy as np
import pandas as pd
import pytest

from src.models.schemas import AudioFeatures7D
from src.services.vector_store import VectorStore


class TestVectorStore:
    """Test suite for VectorStore matrix operations and cosine search."""

    def test_load_from_dataframe_success(self, sample_tracks_df: pd.DataFrame) -> None:
        """Test successful initialization and L2 normalization of the feature matrix."""
        vs = VectorStore()
        assert not vs.is_loaded
        assert vs.count == 0

        vs.load_from_dataframe(sample_tracks_df)
        assert vs.is_loaded
        assert vs.count == 4
        assert vs.normalized_matrix.shape == (4, 7)

        # Verify L2 normalization: ||v||_2 should be 1.0 for each row
        norms = np.linalg.norm(vs.normalized_matrix, axis=1)
        np.testing.assert_allclose(norms, 1.0, atol=1e-5)

    def test_load_missing_feature_column_raises_error(self) -> None:
        """Test loading DataFrame missing required audio feature raises ValueError."""
        vs = VectorStore()
        invalid_df = pd.DataFrame(
            [
                {
                    "track_id": "t1",
                    "danceability": 0.5,
                    # missing valence, energy, etc.
                }
            ]
        )
        with pytest.raises(ValueError, match="Required audio feature column"):
            vs.load_from_dataframe(invalid_df)

    def test_load_from_csv_file_not_found(self) -> None:
        """Test loading from non-existent CSV file raises FileNotFoundError."""
        vs = VectorStore()
        with pytest.raises(FileNotFoundError):
            vs.load_from_csv("non_existent_file_path.csv")

    def test_search_not_loaded_raises_runtime_error(self) -> None:
        """Test searching on uninitialized store raises RuntimeError."""
        vs = VectorStore()
        with pytest.raises(RuntimeError, match="VectorStore is empty or not loaded yet"):
            vs.search([0.5] * 7)

    def test_search_invalid_dimension_raises_value_error(
        self, test_vector_store: VectorStore
    ) -> None:
        """Test searching with vector not having 7 dimensions raises ValueError."""
        with pytest.raises(ValueError, match="must have exactly 7 dimensions"):
            test_vector_store.search([0.5, 0.5, 0.5])  # only 3 dimensions

    def test_cosine_similarity_accuracy_high_energy(
        self, test_vector_store: VectorStore
    ) -> None:
        """Query for high-energy party music should rank track_1 ('High Energy Banger') at #1."""
        # Query: High danceability & energy, low acousticness
        party_query = [0.95, 0.90, 0.95, 0.05, 0.01, 0.20, 0.05]
        results = test_vector_store.search(party_query, limit=2)

        assert len(results) == 2
        assert results[0].track_id == "track_1"
        assert results[0].title == "High Energy Banger"
        assert results[0].similarity_score > 0.95
        # Verify descending order of similarity
        assert results[0].similarity_score >= results[1].similarity_score

    def test_cosine_similarity_accuracy_acoustic_folk(
        self, test_vector_store: VectorStore
    ) -> None:
        """Query for acoustic ballad music should rank track_3 ('Acoustic Ballad') at #1."""
        # Query: High acousticness, low energy, low danceability
        acoustic_query = [0.35, 0.25, 0.20, 0.95, 0.05, 0.10, 0.02]
        results = test_vector_store.search(acoustic_query, limit=2)

        assert len(results) >= 1
        assert results[0].track_id == "track_3"
        assert results[0].title == "Acoustic Ballad"
        assert results[0].similarity_score > 0.95

    def test_search_with_exclude_ids(self, test_vector_store: VectorStore) -> None:
        """Test search excludes specified track IDs from returned results."""
        party_query = [0.95, 0.90, 0.95, 0.05, 0.01, 0.20, 0.05]
        # Exclude track_1 (which would have been the top match)
        results = test_vector_store.search(
            party_query, limit=2, exclude_ids=["track_1"]
        )

        assert all(t.track_id != "track_1" for t in results)
        # Next best high-energy track should be track_4 (Workout Synthwave)
        assert results[0].track_id == "track_4"

    def test_search_all_excluded_returns_empty(
        self, test_vector_store: VectorStore
    ) -> None:
        """Test search returns empty list when all candidate tracks are excluded."""
        all_ids = ["track_1", "track_2", "track_3", "track_4"]
        results = test_vector_store.search([0.5] * 7, limit=4, exclude_ids=all_ids)
        assert results == []

    def test_search_all_zeros_query_vector(
        self, test_vector_store: VectorStore
    ) -> None:
        """Test search handles all-zeros query vector safely without division by zero."""
        zero_vector = [0.0] * 7
        results = test_vector_store.search(zero_vector, limit=2)
        assert len(results) == 2
        # Should not crash and similarity scores should be finite floats
        for track in results:
            assert isinstance(track.similarity_score, float)
