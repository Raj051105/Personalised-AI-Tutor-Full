import os
import re
import json
import requests
from pathlib import Path
from pypdf import PdfReader
from textwrap import dedent
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_chroma import Chroma
from config import DATA_DIR, CHROMA_DIR, CHUNK_SIZE, CHUNK_OVERLAP, EMBEDDING_MODEL, OLLAMA_MODEL
from utils.text_utils import is_junk, extract_text
from syllabus_extractor import extract_structured_syllabus

def load_folder(folder: Path, tag: str):
    docs = []
    if not folder.exists():
        return docs
    for fname in os.listdir(folder):
        if fname.lower().endswith(".pdf"):
            fpath = folder / fname
            print(f"📄 {tag.upper():11} | {fname}")
            text = extract_text(fpath)
            docs.append({"text": text, "source": fname, "source_type": tag})
    print(f"Loaded {len(docs)} documents from {tag}")
    return docs

def tag_chunks_with_syllabus(chunks, syllabus_json, model_name):
    """
    Uses LLM to assign unit and topic metadata to each chunk based on the syllabus.
    """
    if not syllabus_json:
        return [{"unit": "General", "topic": "General", "subtopic": ""}] * len(chunks)

    # Prepare a compact syllabus summary for the LLM
    syllabus_summary = []
    for unit in syllabus_json:
        unit_info = f"- {unit['unitName']}\n"
        for topic in unit.get('topics', []):
            unit_info += f"  * {topic['topicName']}\n"
        syllabus_summary.append(unit_info)
    syllabus_text = "\n".join(syllabus_summary)

    tagged_metas = []
    print(f"🏷️ Tagging {len(chunks)} chunks using {model_name}...")
    
    for i, chunk in enumerate(chunks):
        if i % 10 == 0:
            print(f"Processing chunk {i}/{len(chunks)}...")
        
        prompt = dedent(f"""
        Categorize the following text chunk into the correct Unit and Topic from the provided syllabus.
        
        Syllabus Structure:
        {syllabus_text}

        Text Chunk:
        \"\"\"{chunk[:500]}...\"\"\"

        Output ONLY valid JSON with keys: "unit", "topic", "subtopic".
        If it belongs to multiple or none, choose the best fit or "General".
        """)

        try:
            response = requests.post(
                "http://localhost:11434/api/generate",
                json={
                    "model": model_name,
                    "prompt": prompt,
                    "stream": False,
                    "format": "json"
                },
                timeout=30
            )
            data = response.json()
            tags = json.loads(data.get("response", "{}"))
            tagged_metas.append({
                "unit": tags.get("unit", "General"),
                "topic": tags.get("topic", "General"),
                "subtopic": tags.get("subtopic", "")
            })
        except:
            tagged_metas.append({"unit": "General", "topic": "General", "subtopic": ""})

    return tagged_metas

def ingest_all(subject_code: str):
    subject_dir = DATA_DIR / subject_code
    subject_dir.mkdir(parents=True, exist_ok=True)

    # 1. First, find and extract structured syllabus if available
    syllabus_path = None
    syllabus_dir = subject_dir / "syllabus"
    if syllabus_dir.exists():
        pdfs = list(syllabus_dir.glob("*.pdf"))
        if pdfs:
            syllabus_path = pdfs[0]
    
    structured_syllabus = []
    if syllabus_path:
        print(f"📜 Extracting syllabus structure for tagging...")
        try:
            structured_syllabus = extract_structured_syllabus(syllabus_path)
        except Exception as e:
            print(f"Failed to extract syllabus: {e}")

    # 2. Load all docs
    all_docs = []
    all_docs += load_folder(subject_dir / "syllabus", "syllabus")
    all_docs += load_folder(subject_dir / "notes", "notes")
    all_docs += load_folder(subject_dir / "past_papers", "past_papers")

    # 3. Split into chunks
    splitter = RecursiveCharacterTextSplitter(chunk_size=CHUNK_SIZE, chunk_overlap=CHUNK_OVERLAP)
    raw_chunks, metas = [], []
    for d in all_docs:
        file_chunks = splitter.split_text(d["text"])
        for chunk in file_chunks:
            if chunk.strip():
                raw_chunks.append(chunk)
                metas.append({
                    "subject_code": subject_code,
                    "source": d["source"],
                    "source_type": d["source_type"]
                })

    # 4. Tag chunks if syllabus is available
    if structured_syllabus:
        tags = tag_chunks_with_syllabus(raw_chunks, structured_syllabus, OLLAMA_MODEL)
        for i, tag_data in enumerate(tags):
            if i < len(metas):
                metas[i].update(tag_data)
    else:
        for m in metas:
            m.update({"unit": "General", "topic": "General", "subtopic": ""})



    persist_dir = CHROMA_DIR / subject_code
    if persist_dir.exists():
        import shutil
        shutil.rmtree(persist_dir)
    persist_dir.mkdir(parents=True, exist_ok=True)

    embeddings = HuggingFaceEmbeddings(model_name=EMBEDDING_MODEL)
    db = Chroma.from_texts(raw_chunks, embeddings, metadatas=metas, persist_directory=str(persist_dir))
    print(f"✅ {len(raw_chunks)} chunks stored with topic tagging for {subject_code}")
    return db