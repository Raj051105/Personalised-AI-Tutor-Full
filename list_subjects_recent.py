import pymongo

def list_recent():
    mongo_uri = "mongodb+srv://AdminDB:admindb123@cluster0.sdacyha.mongodb.net/aldb?retryWrites=true&w=majority&appName=Cluster0"
    client = pymongo.MongoClient(mongo_uri)
    db = client.get_default_database()
    subjects = list(db.subjects.find({}, {"title": 1, "subject_code": 1, "createdAt": 1}).sort("createdAt", -1).limit(5))
    for s in subjects:
        print(f"Title: {s.get('title')} | Code: {s.get('subject_code')} | Date: {s.get('createdAt')}")

if __name__ == "__main__":
    list_recent()
