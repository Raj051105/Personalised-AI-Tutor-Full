import pymongo

def update_db():
    mongo_uri = "mongodb+srv://AdminDB:admindb123@cluster0.sdacyha.mongodb.net/aldb?retryWrites=true&w=majority&appName=Cluster0"
    client = pymongo.MongoClient(mongo_uri)
    db = client.get_default_database()
    
    # Get the userId from the CS3491 record
    ref = db.subjects.find_one({"subject_code": "CS3491"})
    if ref and ref.get("createdBy"):
        user_id = ref["createdBy"]
        res = db.subjects.update_one(
            {"subject_code": "MA3251"},
            {"$set": {"createdBy": user_id}}
        )
        print(f"Updated MA3251 ownership: {res.modified_count}")
    else:
        print("Could not find reference user from CS3491")

if __name__ == "__main__":
    update_db()
