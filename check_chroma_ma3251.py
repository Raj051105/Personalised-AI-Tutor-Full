import chromadb
import os

def list_collections():
    chroma_path = os.path.join("RAG-backend", "chroma_db", "MA3251")
    if not os.path.exists(chroma_path):
        print(f"Path not found: {chroma_path}")
        return
        
    client = chromadb.PersistentClient(path=chroma_path)
    for c in client.list_collections():
        print(f"Collection: {c.name}")
        coll = client.get_collection(name=c.name)
        peek = coll.get(limit=1)
        if peek['metadatas']:
            print(f"  Metadatas: {peek['metadatas']}")
        # Get count too
        print(f"  Count: {coll.count()}")

if __name__ == "__main__":
    list_collections()
