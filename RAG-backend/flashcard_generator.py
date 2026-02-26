import os
import json
import re
import requests
from textwrap import dedent

try:
    from config import OLLAMA_MODEL
except ImportError:
    OLLAMA_MODEL = "qwen2.5:7b" 

MAX_CONTEXT_CHARS = 12000

def repair_json_string(bad_json: str) -> str:
    """Extract and repair common JSON issues from LLM output."""
    match = re.search(r"(\[.*\])", bad_json, re.DOTALL)
    if match:
        json_part = match.group(1)
    else:
        # Match dict in case it returned {"flashcards": [...]}
        match_obj = re.search(r"(\{.*\})", bad_json, re.DOTALL)
        if match_obj:
            json_part = match_obj.group(1)
        else:
            json_part = bad_json

    # Control chars removal
    json_part = re.sub(r"[\x00-\x1F\x7F]", " ", json_part)
    # Remove trailing commas
    json_part = re.sub(r",\s*(\]|\})", r"\1", json_part)
    
    return json_part.strip()

def validate_flashcard_list(data):
    """
    Ensure we get a list of flashcards. Handles:
    - List of dicts
    - Dict with "flashcards" or "cards" key containing list
    """
    cards = []
    
    if isinstance(data, list):
        cards = data
    elif isinstance(data, dict):
        # Scan values for a list
        for k, v in data.items():
            if isinstance(v, list):
                if v and isinstance(v[0], dict) and ("front" in v[0] or "term" in v[0]):
                    cards = v
                    break
        if not cards:
            print(f"[DEBUG] Dictionary returned but no flashcard list found. Keys: {list(data.keys())}")
            # As a fallback, maybe the dict itself is a card? unlikely.
            return []
    else:
        print(f"[DEBUG] Invalid data type from LLM: {type(data)}")
        return []

    cleaned = []
    seen_fronts = set()

    for item in cards:
        if not isinstance(item, dict):
            continue
            
        # Flexible key access
        front = item.get("front") or item.get("question") or item.get("term") or item.get("Front")
        back = item.get("back") or item.get("answer") or item.get("definition") or item.get("Back")
        
        if not front or not back:
            continue
            
        f_text = str(front).strip()
        b_text = str(back).strip()
        
        if not f_text or not b_text:
            continue
            
        if f_text in seen_fronts:
            continue
            
        seen_fronts.add(f_text)
        cleaned.append({"front": f_text, "back": b_text})

    return cleaned

def generate_flashcards(student_info: dict, context: list | dict | str, num_cards: int = 10):
    """
    Generate clean flashcards list from context.
    Using strictly JSON format and robust parsing.
    """
    # 1. Process Context
    ctx_str = ""
    if isinstance(context, str):
        ctx_str = context
    elif isinstance(context, dict):
        ctx_str = context.get("page_content") or context.get("text", "")
    elif isinstance(context, list):
        parts = []
        for item in context:
            if isinstance(item, str):
                parts.append(item)
            elif isinstance(item, dict):
                parts.append(item.get("page_content") or item.get("text", ""))
            elif hasattr(item, "page_content"):
                parts.append(item.page_content)
        ctx_str = "\n\n".join(parts)

    if not ctx_str.strip():
        print("[DEBUG] Empty context provided to generate_flashcards")
        return []

    if len(ctx_str) > MAX_CONTEXT_CHARS:
        ctx_str = ctx_str[:MAX_CONTEXT_CHARS]

    # 2. Construct Prompt
    # Explicitly asking for a JSON object with a specific key structure is safer.
    prompt = dedent(f"""
    You are an expert tutor.
    Create exactly {num_cards} flashcards based on the provided text.
    
    Output Format:
    Return a single valid JSON object.
    The object must have a key "flashcards" containing an array.
    Each item in the array must be an object with "front" and "back" keys.
    
    Example:
    {{
      "flashcards": [
        {{"front": "Question 1", "back": "Answer 1"}},
        {{"front": "Question 2", "back": "Answer 2"}}
      ]
    }}

    Student Info: {student_info}
    Context:
    {ctx_str}
    
    Do not include any Markdown formatting (no ```json blocks). Just the raw JSON.
    """)

    # 3. Call Ollama
    print(f"[DEBUG] Calling Ollama ({OLLAMA_MODEL}) for flashcards...")
    
    try:
        response = requests.post(
            "http://localhost:11434/api/generate",
            json={
                "model": OLLAMA_MODEL,
                "prompt": prompt,
                "stream": False,
                "format": "json",
                "options": {
                    "temperature": 0.2  # Lower temp = more deterministic JSON
                }
            },
            timeout=120
        )
        
        if response.status_code != 200:
            print(f"[ERROR] Ollama API error: {response.text}")
            return []
            
        result = response.json()
        raw_output = result.get("response", "")
        # print(f"[DEBUG] Ollama raw output snippet: {raw_output[:100]}...")

        if not raw_output.strip():
            print("[ERROR] Empty response from Ollama")
            return []

        # 4. Parse & Validate
        json_str = repair_json_string(raw_output)
        
        parsed = None
        try:
            parsed = json.loads(json_str)
        except json.JSONDecodeError as e:
            # Fallback: try finding the first array in the string if object parsing failed
            # Sometimes models return [ ... ] despite instructions
            match = re.search(r"\[.*\]", raw_output, re.DOTALL)
            if match:
                try:
                    parsed = json.loads(match.group(0))
                except:
                    pass
            
            if parsed is None:
                # Try finding { ... } again?
                match_obj = re.search(r"\{.*\}", raw_output, re.DOTALL)
                if match_obj:
                    try:
                        parsed = json.loads(match_obj.group(0))
                    except:
                        pass

            if parsed is None:
                print(f"[ERROR] JSON decode failed: {e}")
                print(f"Bad JSON snippet: {raw_output[:200]}...")
                return []
                
        final_cards = validate_flashcard_list(parsed)
        print(f"[DEBUG] Generated {len(final_cards)} valid flashcards")
        return final_cards

    except Exception as e:
        print(f"[CRITICAL] Exception in generate_flashcards: {e}")
        return []
