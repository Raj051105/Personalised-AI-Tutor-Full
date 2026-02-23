import os
import json
import re
import requests
from textwrap import dedent
from pathlib import Path
from config import OLLAMA_MODEL
from ingest import extract_text

def repair_syllabus_json(bad_json: str) -> list:
    """
    Extract and repair the JSON array from LLM output.
    """
    # Try to find a JSON block [...] or {...}
    match = re.search(r"(\[.*\])", bad_json, re.DOTALL)
    if not match:
        match = re.search(r"(\{.*\})", bad_json, re.DOTALL)
    
    if match:
        json_part = match.group(1)
    else:
        json_part = bad_json

    # Clean control characters
    json_part = re.sub(r"[\x00-\x1F\x7F]", " ", json_part)
    # Fix trailing commas
    json_part = re.sub(r",\s*(\]|\})", r"\1", json_part)

    try:
        data = json.loads(json_part)
        if isinstance(data, dict) and "units" in data:
            return data["units"]
        if isinstance(data, list):
            return data
        return []
    except Exception as e:
        print(f"JSON Parse Error: {e}")
        return []

def extract_structured_syllabus(pdf_path: Path):
    """
    Reads a syllabus PDF and uses LLM to structure it into Units and Topics.
    """
    if not pdf_path.exists():
        return []

    text = extract_text(pdf_path)
    if not text.strip():
        return []

    # Limit text size for the model
    if len(text) > 15000:
        text = text[:15000]

    prompt = dedent(f"""
    You are an academic curriculum coordinator.
    Given the extracted text from a course syllabus PDF, your task is to organize it into a structured JSON format.
    
    The structure must follow this format:
    {{
      "units": [
        {{
          "unitName": "Unit I: [Name]",
          "topics": [
            {{
              "topicName": "[Main Topic Title]",
              "subtopics": ["Optional subtopic 1", "Optional subtopic 2"]
            }}
          ]
        }}
      ]
    }}

    Rules:
    - Identify clear "Units" or "Modules" (usually numbered I, II, III ... or 1, 2, 3 ...).
    - Under each Unit, identify the main topics.
    - If a topic has clear bullet points or sub-items, list them as "subtopics".
    - Output ONLY valid JSON. No conversational text.
    - If no subtopics are found, leave the array empty [].

    Syllabus Text:
    \"\"\"{text}\"\"\"

    Output JSON:
    """)

    try:
        # Using HTTP API for better cross-bridge (WSL <-> Windows) and reliability
        response = requests.post(
            "http://localhost:11434/api/generate",
            json={
                "model": OLLAMA_MODEL,
                "prompt": prompt,
                "stream": False,
                "format": "json"
            },
            timeout=120
        )
        
        if response.status_code != 200:
            print(f"Error calling ollama API: {response.text}")
            return []

        result = response.json()
        return repair_syllabus_json(result.get("response", ""))

    except Exception as e:
        print(f"Failed to process syllabus via Ollama API: {str(e)}")
        return []
