import pymongo
import json
import requests
import time

def check_and_fix_subjects():
    mongo_uri = "mongodb+srv://AdminDB:admindb123@cluster0.sdacyha.mongodb.net/aldb?retryWrites=true&w=majority&appName=Cluster0"
    client = pymongo.MongoClient(mongo_uri)
    db = client.get_default_database()
    subjects = list(db.subjects.find({}, {"subject_code": 1, "title": 1}))
    
    print(f"Found {len(subjects)} subjects in DB.")
    
    for s in subjects:
        subject_code = s.get('subject_code')
        title = s.get('title')
        print(f"DEBUG: Title={title}, Code={subject_code}")
        if not subject_code:
            continue

        print(f"Checking {title} ({subject_code})...")
        
        # Always try to refresh with AI now that Ollama is up
        print(f"Fetching units for {subject_code} from AI RAG backend...")
        try:
            response = requests.get(f"http://127.0.0.1:8000/extract-syllabus/{subject_code}", timeout=120)
            if response.status_code == 200:
                data = response.json()
                units = data.get('units', [])
                if units:
                    db.subjects.update_one(
                        {"subject_code": subject_code},
                        {"$set": {"units": units}}
                    )
                    print(f"Successfully updated units for {subject_code} with AI data")
                    for u in units:
                        print(f"  Unit: {u.get('unitName')}")
                else:
                    print(f"RAG backend returned empty units for {subject_code}")
            else:
                print(f"Failed to fetch for {subject_code}: HTTP {response.status_code}")
        except Exception as e:
            print(f"Error fetching for {subject_code}: {e}")

if __name__ == "__main__":
    check_and_fix_subjects()
