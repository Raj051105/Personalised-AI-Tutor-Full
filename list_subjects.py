import pymongo

def list_all():
    mongo_uri = "mongodb+srv://AdminDB:admindb123@cluster0.sdacyha.mongodb.net/aldb?retryWrites=true&w=majority&appName=Cluster0"
    client = pymongo.MongoClient(mongo_uri)
    db = client.get_default_database()
    subjects = list(db.subjects.find({}, {"title": 1, "subject_code": 1, "createdBy": 1}))
    for s in subjects:
        print(f"ID: {s.get('_id')} | Title: {s.get('title')} | Code: {s.get('subject_code')} | Creator: {s.get('createdBy')}")

if __name__ == "__main__":
    list_all()
