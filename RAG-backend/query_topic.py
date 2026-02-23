import sys
from pathlib import Path
from langchain_chroma import Chroma
from langchain_huggingface import HuggingFaceEmbeddings

# Import project settings
sys.path.append(str(Path(__file__).parent))
from config import CHROMA_DIR, EMBEDDING_MODEL

def query_by_topic(subject_code, topic_name):
    persist_dir = CHROMA_DIR / subject_code
    if not persist_dir.exists():
        print(f"❌ DB for {subject_code} not found.")
        return

    embeddings = HuggingFaceEmbeddings(model_name=EMBEDDING_MODEL)
    db = Chroma(persist_directory=str(persist_dir), embedding_function=embeddings)

    print(f"🔍 Searching for chunks in topic: '{topic_name}'...")
    
    # 1. Retrieve using a filter on the metadata
    # The 'where' dictionary must match the metadata schema we defined in ingest.py
    results = db.get(where={"topic": topic_name})
    
    docs = results['documents']
    metas = results['metadatas']
    ids = results['ids']

    print(f"✅ Found {len(docs)} chunks for topic '{topic_name}'.\n")

    if docs:
        # 2. Print one example chunk and its metadata
        print("--- Example Chunk & Metadata ---")
        print(f"ID: {ids[0]}")
        print(f"Content snippet: {docs[0][:200]}...")
        print("\nMetadata (JSON):")
        import json
        print(json.dumps(metas[0], indent=2))
        print("--------------------------------")
    else:
        print("No chunks found with that exact topic name.")

if __name__ == "__main__":
    # Test with a known topic from CS3491 (from our previous extraction)
    # The topic name must exactly match what the LLM assigned during tagging
    subject = "CS3491"
    # Example topic from unit I we saw in previous test: 
    # 'Problem solving agents – search algorithms'
    test_topic = "Problem solving agents – search algorithms"
    
    query_by_topic(subject, test_topic)
