"""AudioVibe Recommendation ML Microservice FastAPI application."""

from __future__ import annotations

from contextlib import asynccontextmanager
from datetime import datetime, timezone
import logging
from typing import AsyncGenerator

from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware

from src.config import settings
from src.models.schemas import (
    HealthResponse,
    RecommendRequest,
    RecommendResponse,
    RefineRequest,
    RefineResponse,
)
from src.services.llm_extractor import llm_extractor
from src.services.vector_store import vector_store

logging.basicConfig(
    level=logging.INFO,
    format="[%(asctime)s] %(levelname)s [%(name)s] - %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger("main")


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Lifespan event handler: loads 10k-20k cleaned dataset into RAM on startup."""
    logger.info("Initializing %s v%s ...", settings.APP_NAME, settings.APP_VERSION)
    dataset_path = settings.DATA_PATH

    if dataset_path.exists():
        try:
            vector_store.load_from_csv(dataset_path)
            logger.info(
                "Successfully loaded %d tracks into In-Memory Vector Store from %s",
                vector_store.count,
                dataset_path,
            )
        except Exception as exc:
            logger.error("Failed to load dataset from %s: %s", dataset_path, exc)
    else:
        logger.warning(
            "Cleaned dataset not found at %s. Please run scripts/clean_dataset.py",
            dataset_path,
        )

    yield

    logger.info("Shutting down %s ...", settings.APP_NAME)


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Fast In-Memory Cosine Similarity & GLM-5.3-Flash 7D Vector Recommendation Engine",
    lifespan=lifespan,
)

# Enable CORS for frontend and core-api communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health", response_model=HealthResponse, tags=["Monitoring"])
async def health_check() -> HealthResponse:
    """Return health status, loaded tracks count, and configured LLM model name."""
    return HealthResponse(
        status="ok",
        tracks_in_memory=vector_store.count,
        model_name=settings.OPENROUTER_MODEL,
        version=settings.APP_VERSION,
        timestamp=datetime.now(timezone.utc).isoformat(),
    )


@app.post(
    "/api/v1/recommend",
    response_model=RecommendResponse,
    status_code=status.HTTP_200_OK,
    tags=["Recommendation"],
)
async def recommend(request: RecommendRequest) -> RecommendResponse:
    """Recommend Top-15 tracks matching natural language prompt or mood preset.

    1. Extracts a 7D audio feature target vector via GLM-5.3-Flash.
    2. Computes Cosine Similarity against the normalized in-memory matrix.
    3. Returns candidates with highest similarity scores.
    """
    if not vector_store.is_loaded or vector_store.count == 0:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="In-memory vector store is not ready. Please ensure dataset is cleaned and loaded.",
        )

    try:
        # Extract 7D target vector
        target_vector = await llm_extractor.extract_vector(
            prompt=request.prompt,
            preset_name=request.preset_name,
        )

        # In-memory matrix dot product search + genre/magnitude alignment
        combined_query = f"{request.prompt or ''} {request.preset_name or ''}".strip()
        tracks = vector_store.search(
            target_vector=target_vector.to_list(),
            limit=request.limit,
            query_text=combined_query,
        )

        query_type = "preset" if request.preset_name and not request.prompt else "prompt"

        return RecommendResponse(
            target_vector=target_vector,
            total_candidates=len(tracks),
            tracks=tracks,
            query_type=query_type,
        )
    except Exception as exc:
        logger.exception("Error processing recommendation request: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Recommendation failed: {str(exc)}",
        )


@app.post(
    "/api/v1/refine",
    response_model=RefineResponse,
    status_code=status.HTTP_200_OK,
    tags=["Recommendation"],
)
async def refine(request: RefineRequest) -> RefineResponse:
    """Refine an existing playlist based on user feedback instructions.

    1. Adjusts the 7D target vector according to refinement instructions.
    2. Excludes existing track IDs to guarantee fresh recommendations.
    3. Returns newly recommended candidate tracks.
    """
    if not vector_store.is_loaded or vector_store.count == 0:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="In-memory vector store is not ready. Please ensure dataset is cleaned and loaded.",
        )

    try:
        refined_vector = await llm_extractor.refine_vector(
            instruction=request.instruction,
            current_vector=request.current_vector,
        )

        tracks = vector_store.search(
            target_vector=refined_vector.to_list(),
            limit=request.limit,
            exclude_ids=request.current_track_ids,
            query_text=request.instruction,
        )

        return RefineResponse(
            refined_vector=refined_vector,
            tracks=tracks,
            instruction=request.instruction,
        )
    except Exception as exc:
        logger.exception("Error processing refinement request: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Refinement failed: {str(exc)}",
        )
