"""LLM 7-Dimensional Audio Feature Vector Extractor using GLM 5.3 Flash via OpenRouter."""

from __future__ import annotations

import json
import logging
import re
from typing import Final

import httpx

from src.config import settings
from src.models.schemas import AudioFeatures7D

logger = logging.getLogger("llm_extractor")

# Curated benchmark vectors for popular mood presets
PRESET_VECTORS: Final[dict[str, AudioFeatures7D]] = {
    "chill": AudioFeatures7D(
        danceability=0.55,
        valence=0.50,
        energy=0.35,
        acousticness=0.65,
        instrumentalness=0.40,
        liveness=0.12,
        speechiness=0.04,
    ),
    "party": AudioFeatures7D(
        danceability=0.85,
        valence=0.80,
        energy=0.88,
        acousticness=0.08,
        instrumentalness=0.02,
        liveness=0.25,
        speechiness=0.08,
    ),
    "workout": AudioFeatures7D(
        danceability=0.75,
        valence=0.70,
        energy=0.92,
        acousticness=0.05,
        instrumentalness=0.05,
        liveness=0.18,
        speechiness=0.07,
    ),
    "focus": AudioFeatures7D(
        danceability=0.40,
        valence=0.45,
        energy=0.38,
        acousticness=0.70,
        instrumentalness=0.85,
        liveness=0.10,
        speechiness=0.03,
    ),
    "lofi": AudioFeatures7D(
        danceability=0.60,
        valence=0.48,
        energy=0.32,
        acousticness=0.75,
        instrumentalness=0.80,
        liveness=0.11,
        speechiness=0.05,
    ),
    "sad": AudioFeatures7D(
        danceability=0.35,
        valence=0.15,
        energy=0.25,
        acousticness=0.80,
        instrumentalness=0.20,
        liveness=0.10,
        speechiness=0.04,
    ),
    "happy": AudioFeatures7D(
        danceability=0.80,
        valence=0.90,
        energy=0.78,
        acousticness=0.20,
        instrumentalness=0.02,
        liveness=0.15,
        speechiness=0.06,
    ),
    "sleep": AudioFeatures7D(
        danceability=0.20,
        valence=0.20,
        energy=0.10,
        acousticness=0.92,
        instrumentalness=0.90,
        liveness=0.08,
        speechiness=0.03,
    ),
}

SYSTEM_PROMPT: Final[str] = """You are an expert audio engineering AI for AudioVibe music recommendation engine.
Convert the given user musical description or mood into a strict 7-dimensional audio feature vector.

You MUST respond ONLY with a raw JSON object containing these 7 float keys, each strictly bounded between 0.0 and 1.0:
- "danceability": Suitability for dancing (0.0=lowest, 1.0=highest)
- "valence": Musical positiveness / cheerfulness (0.0=sad/dark, 1.0=euphoric/happy)
- "energy": Perceptual intensity and activity (0.0=calm/ambient, 1.0=loud/fast/hyper)
- "acousticness": Confidence whether the track is acoustic (0.0=fully electronic, 1.0=pure acoustic)
- "instrumentalness": Likelihood of no vocals (0.0=heavy vocals, 1.0=purely instrumental)
- "liveness": Presence of audience / live setting (0.0=studio produced, 1.0=live performance)
- "speechiness": Presence of spoken words (0.0=pure music, 1.0=talk show/podcast, music is typically < 0.3)

CRITICAL RULES:
1. Return ONLY the JSON object.
2. NO markdown code blocks (NO ``` or ```json).
3. NO conversational intro or outro text.
4. All values MUST be valid numbers in range [0.0, 1.0].

Example output:
{"danceability": 0.72, "valence": 0.65, "energy": 0.81, "acousticness": 0.12, "instrumentalness": 0.02, "liveness": 0.14, "speechiness": 0.05}"""

REFINE_SYSTEM_PROMPT: Final[str] = """You are an expert audio engineering AI for AudioVibe music recommendation engine.
You are given a current 7-dimensional audio feature vector and a user refinement instruction.
Adjust the 7-dimensional vector according to the instruction.

Return ONLY a raw JSON object with the adjusted 7 float values in range [0.0, 1.0]:
- "danceability"
- "valence"
- "energy"
- "acousticness"
- "instrumentalness"
- "liveness"
- "speechiness"

CRITICAL RULES:
1. Return ONLY the JSON object.
2. NO markdown code blocks (NO ``` or ```json).
3. NO conversational intro or outro text.
4. All values MUST be valid numbers in range [0.0, 1.0]."""


class LLMExtractor:
    """Extracts 7D Audio Feature Vectors via OpenRouter (GLM 5.3 Flash)."""

    def __init__(self, http_client: httpx.AsyncClient | None = None) -> None:
        self.http_client = http_client
        self.model_name = settings.OPENROUTER_MODEL
        self.api_key = settings.OPENROUTER_API_KEY
        self.api_url = settings.OPENROUTER_API_URL

    def _parse_and_validate_json(self, raw_text: str) -> AudioFeatures7D:
        """Parse raw LLM response text, stripping markdown and clamping values."""
        clean_text = raw_text.strip()
        # Remove markdown code blocks if model wrapped them
        clean_text = re.sub(r"^```(?:json)?\s*", "", clean_text, flags=re.IGNORECASE)
        clean_text = re.sub(r"\s*```$", "", clean_text)
        clean_text = clean_text.strip()

        # Find first '{' and last '}'
        start = clean_text.find("{")
        end = clean_text.rfind("}")
        if start != -1 and end != -1 and end > start:
            clean_text = clean_text[start : end + 1]

        data = json.loads(clean_text)

        # Extract and clamp values to [0.0, 1.0]
        def clamp(val: float) -> float:
            return max(0.0, min(1.0, float(val)))

        return AudioFeatures7D(
            danceability=clamp(data.get("danceability", 0.5)),
            valence=clamp(data.get("valence", 0.5)),
            energy=clamp(data.get("energy", 0.5)),
            acousticness=clamp(data.get("acousticness", 0.5)),
            instrumentalness=clamp(data.get("instrumentalness", 0.0)),
            liveness=clamp(data.get("liveness", 0.1)),
            speechiness=clamp(data.get("speechiness", 0.05)),
        )

    def _get_preset_vector(self, preset_name: str) -> AudioFeatures7D | None:
        """Find matching preset in predefined dictionary."""
        normalized = preset_name.strip().lower()
        for key, vector in PRESET_VECTORS.items():
            if key in normalized or normalized in key:
                return vector
        return None

    def _heuristic_extract(self, text: str) -> AudioFeatures7D:
        """Deterministic keyword-based heuristic fallback when LLM is unavailable."""
        lower = text.lower()
        preset = self._get_preset_vector(lower)
        if preset:
            return preset

        # Default neutral baseline
        danceability = 0.60
        valence = 0.55
        energy = 0.60
        acousticness = 0.30
        instrumentalness = 0.10
        liveness = 0.15
        speechiness = 0.05

        if any(w in lower for w in ["calm", "relax", "chill", "slow", "ambient", "soft"]):
            energy -= 0.30
            acousticness += 0.35
            danceability -= 0.15
        if any(w in lower for w in ["energetic", "hyper", "fast", "rock", "metal", "bass", "hard"]):
            energy += 0.30
            acousticness -= 0.20
            danceability += 0.15
        if any(w in lower for w in ["happy", "cheerful", "sunny", "joy", "fun"]):
            valence += 0.30
        if any(w in lower for w in ["sad", "depressed", "melancholy", "cry", "lonely"]):
            valence -= 0.35
            energy -= 0.20
        if any(w in lower for w in ["instrumental", "study", "coding", "focus", "piano", "lofi"]):
            instrumentalness += 0.65
            speechiness -= 0.02
        if any(w in lower for w in ["party", "dance", "club", "edm", "disco"]):
            danceability += 0.25
            energy += 0.20

        def clamp(val: float) -> float:
            return round(max(0.0, min(1.0, val)), 3)

        return AudioFeatures7D(
            danceability=clamp(danceability),
            valence=clamp(valence),
            energy=clamp(energy),
            acousticness=clamp(acousticness),
            instrumentalness=clamp(instrumentalness),
            liveness=clamp(liveness),
            speechiness=clamp(speechiness),
        )

    async def extract_vector(
        self, prompt: str | None = None, preset_name: str | None = None
    ) -> AudioFeatures7D:
        """Extract a 7-dimensional target vector using OpenRouter GLM 5.3 Flash."""
        # 1. Check if direct preset match
        if preset_name and not prompt:
            preset_vec = self._get_preset_vector(preset_name)
            if preset_vec is not None:
                return preset_vec

        user_content = (
            f"User Prompt: {prompt}"
            if prompt
            else f"Mood Preset: {preset_name}"
        )

        # 2. If API Key not set, fallback to heuristic
        if not self.api_key or self.api_key == "your_openrouter_api_key_here":
            logger.info("OPENROUTER_API_KEY not configured. Using deterministic heuristic.")
            return self._heuristic_extract(user_content)

        # 3. Call OpenRouter API
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
            "HTTP-Referer": "https://audiovibe.local",
            "X-Title": "AudioVibe ML Service",
        }

        payload = {
            "model": self.model_name,
            "messages": [
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": user_content},
            ],
            "temperature": 0.2,
            "max_tokens": 128,
        }

        client_to_use = self.http_client or httpx.AsyncClient(
            timeout=settings.OPENROUTER_TIMEOUT_SECONDS
        )
        try:
            response = await client_to_use.post(
                self.api_url, headers=headers, json=payload
            )
            response.raise_for_status()
            res_data = response.json()
            raw_text = res_data["choices"][0]["message"]["content"]
            return self._parse_and_validate_json(raw_text)
        except Exception as exc:
            logger.warning(
                "OpenRouter API call failed (%s). Falling back to heuristic extractor.", exc
            )
            return self._heuristic_extract(user_content)
        finally:
            if self.http_client is None:
                await client_to_use.aclose()

    async def refine_vector(
        self,
        instruction: str,
        current_vector: AudioFeatures7D | None = None,
    ) -> AudioFeatures7D:
        """Refine an existing 7D vector based on user refinement instructions."""
        base_vector = current_vector or AudioFeatures7D(
            danceability=0.6,
            valence=0.5,
            energy=0.6,
            acousticness=0.3,
            instrumentalness=0.1,
            liveness=0.15,
            speechiness=0.05,
        )

        if not self.api_key or self.api_key == "your_openrouter_api_key_here":
            # Heuristic delta refinement
            delta = self._heuristic_extract(instruction)
            # Combine current vector with delta direction
            def blend(current: float, target: float) -> float:
                return round(max(0.0, min(1.0, (current + target) / 2.0)), 3)

            return AudioFeatures7D(
                danceability=blend(base_vector.danceability, delta.danceability),
                valence=blend(base_vector.valence, delta.valence),
                energy=blend(base_vector.energy, delta.energy),
                acousticness=blend(base_vector.acousticness, delta.acousticness),
                instrumentalness=blend(base_vector.instrumentalness, delta.instrumentalness),
                liveness=blend(base_vector.liveness, delta.liveness),
                speechiness=blend(base_vector.speechiness, delta.speechiness),
            )

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
            "HTTP-Referer": "https://audiovibe.local",
            "X-Title": "AudioVibe ML Service",
        }

        user_content = (
            f"Current Vector: {base_vector.model_dump_json()}\n"
            f"Refinement Instruction: {instruction}"
        )

        payload = {
            "model": self.model_name,
            "messages": [
                {"role": "system", "content": REFINE_SYSTEM_PROMPT},
                {"role": "user", "content": user_content},
            ],
            "temperature": 0.2,
            "max_tokens": 128,
        }

        client_to_use = self.http_client or httpx.AsyncClient(
            timeout=settings.OPENROUTER_TIMEOUT_SECONDS
        )
        try:
            response = await client_to_use.post(
                self.api_url, headers=headers, json=payload
            )
            response.raise_for_status()
            res_data = response.json()
            raw_text = res_data["choices"][0]["message"]["content"]
            return self._parse_and_validate_json(raw_text)
        except Exception as exc:
            logger.warning(
                "OpenRouter refinement call failed (%s). Using heuristic adjustment.", exc
            )
            delta = self._heuristic_extract(instruction)
            return AudioFeatures7D(
                danceability=round(max(0.0, min(1.0, (base_vector.danceability + delta.danceability) / 2.0)), 3),
                valence=round(max(0.0, min(1.0, (base_vector.valence + delta.valence) / 2.0)), 3),
                energy=round(max(0.0, min(1.0, (base_vector.energy + delta.energy) / 2.0)), 3),
                acousticness=round(max(0.0, min(1.0, (base_vector.acousticness + delta.acousticness) / 2.0)), 3),
                instrumentalness=round(max(0.0, min(1.0, (base_vector.instrumentalness + delta.instrumentalness) / 2.0)), 3),
                liveness=round(max(0.0, min(1.0, (base_vector.liveness + delta.liveness) / 2.0)), 3),
                speechiness=round(max(0.0, min(1.0, (base_vector.speechiness + delta.speechiness) / 2.0)), 3),
            )
        finally:
            if self.http_client is None:
                await client_to_use.aclose()


# Global singleton instance
llm_extractor = LLMExtractor()
