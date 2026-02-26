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
        # Match dict in case it returned {"mcqs": [...]}
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

def validate_mcq_list(data):
    """
    Ensure we get a list of MCQs. Handles:
    - List of dicts
    - Dict with "mcqs" or "questions" key containing list
    """
    mcqs = []
    
    if isinstance(data, list):
        mcqs = data
    elif isinstance(data, dict):
        # Scan values for a list
        for k, v in data.items():
            if isinstance(v, list):
                if v and isinstance(v[0], dict):
                    mcqs = v
                    break
        if not mcqs:
            # Fallback if specific key expected
            mcqs = data.get("mcqs", []) or data.get("questions", [])

    if not mcqs:
        return []

    cleaned = []
    seen_questions = set()

    for item in mcqs:
        if not isinstance(item, dict):
            continue
            
        # Flexible key access
        question = item.get("question") or item.get("Question")
        options = item.get("options") or item.get("Options") or item.get("choices")
        correct = item.get("correct_option") or item.get("answer") or item.get("Correct") or item.get("correct")

        if not question or not options:
            continue
            
        # Ensure options is a list of strings
        if not isinstance(options, list) or len(options) < 2:
            continue
            
        # Ensure max 4 options for consistency
        final_options = [str(o) for o in options[:4]]

        normalized_correct = str(correct).strip()
        
        # Try to map correct answer to index 0-3 then to A-B-C-D
        mapped_correct = None
        
        # If it's a single letter A-D
        if len(normalized_correct) == 1 and normalized_correct.upper() in "ABCD":
            mapped_correct = normalized_correct.upper()
        # If it's a number 0-3
        elif normalized_correct in ["0", "1", "2", "3"]:
            mapped_correct = "ABCD"[int(normalized_correct)]
        # If it matches one of the options text
        else:
            # Case insensitive match
            for idx, opt in enumerate(final_options):
                if normalized_correct.lower() == str(opt).lower():
                    mapped_correct = "ABCD"[idx]
                    break
        
        if not mapped_correct:
            # If we can't determine correct answer, skip or default to A? 
            # Better to skip invalid MCQs
            continue

        q_text = str(question).strip()
        if q_text in seen_questions:
            continue
            
        seen_questions.add(q_text)
        cleaned.append({
            "question": q_text,
            "options": final_options,
            "correct_option": mapped_correct
        })

    return cleaned

def generate_mcqs(student_info: dict, context: list | dict | str, num_mcqs: int = 5):
    """
    Generate clean MCQ list from context.
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
        print("[DEBUG] Empty context provided to generate_mcqs")
        return []

    if len(ctx_str) > MAX_CONTEXT_CHARS:
        ctx_str = ctx_str[:MAX_CONTEXT_CHARS]

    # 2. Construct Prompt
    # Explicitly asking for a JSON object with a specific key structure is safer.
    prompt = dedent(f"""
    You are an expert exam creator.
    Create exactly {num_mcqs} multiple choice questions (MCQs) based on the text.
    
    Output Format:
    Return a single valid JSON object.
    The object must have a key "mcqs" containing an array.
    Each item in the array must be an object with:
    - "question": string
    - "options": array of 4 strings
    - "correct_option": string (must be "A", "B", "C", or "D")
    
    Example:
    {{
      "mcqs": [
        {{
            "question": "What is 2+2?",
            "options": ["3", "4", "5", "6"],
            "correct_option": "B"
        }}
      ]
    }}

    Student Info: {student_info}
    Context:
    {ctx_str}
    
    Do not include any Markdown formatting (no ```json blocks). Just the raw JSON.
    """)

    # 3. Call Ollama
    print(f"[DEBUG] Calling Ollama ({OLLAMA_MODEL}) for MCQs...")
    
    try:
        payload = {
            "model": OLLAMA_MODEL,
            "prompt": prompt,
            "stream": False,
            "format": "json",
            "options": {
                "temperature": 0.2  # Lower temp = more deterministic JSON
            }
        }
        
        response = requests.post("http://localhost:11434/api/generate", json=payload, timeout=120)
        
        if response.status_code != 200:
            print(f"[ERROR] Ollama API error: {response.text}")
            return []
            
        result = response.json()
        raw_output = result.get("response", "")
        # print(f"[DEBUG] Ollama raw output length: {len(raw_output)}")

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
                
        final_mcqs = validate_mcq_list(parsed)
        print(f"[DEBUG] Generated {len(final_mcqs)} valid MCQs")
        return final_mcqs

    except Exception as e:
        print(f"[CRITICAL] Exception in generate_mcqs: {e}")
        return []
