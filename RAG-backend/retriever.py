from langchain_chroma import Chroma
from langchain_huggingface import HuggingFaceEmbeddings
from config import CHROMA_DIR, EMBEDDING_MODEL
from pathlib import Path

# Cache this to save load time each request
_EMBEDDINGS = None

def get_embeddings():
    global _EMBEDDINGS
    if _EMBEDDINGS is None:
        print("[DEBUG] Initializing HuggingFace Embeddings...")
        _EMBEDDINGS = HuggingFaceEmbeddings(model_name=EMBEDDING_MODEL)
    return _EMBEDDINGS

def get_context_scoped(query: str, subject_code: str, k: int = 5, sources: list = None):
    """
    Retrieve context from ChromaDB specifically for one subject.
    Optional: filter by source_type (e.g. 'syllabus' vs 'notes').
    """
    persist_dir = CHROMA_DIR / subject_code
    print(f"[DEBUG] Retriever searching in: {persist_dir}")
    
    if not persist_dir.exists():
        print(f"[ERROR] Persist directory missing: {persist_dir}")
        return ""

    try:
        embeddings = get_embeddings()
        db = Chroma(persist_directory=str(persist_dir), embedding_function=embeddings)
        
        # Searching more candidates first
        print(f"[DEBUG] Searching for '{query}'...")
        results = db.similarity_search(query, k=k*2)
        print(f"[DEBUG] Found {len(results)} raw docs")
        
        if not results:
            print("[WARN] No documents found for query.")
            return ""

        context_parts = []
        count = 0
        for doc in results:
            if count >= k:
                break
                
            src = doc.metadata.get("source_type", "unknown")
            if sources and src not in sources:
                continue
                
            context_parts.append(doc.page_content)
            count += 1
            
        print(f"[DEBUG] Returning {len(context_parts)} documents in context.")
        return "\n\n".join(context_parts)
            
    except Exception as e:
        print(f"[CRITICAL] Error in retrieval: {e}")
        import traceback
        traceback.print_exc()
        return ""
