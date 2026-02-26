import pymongo

def populate_ma3251_units():
    mongo_uri = "mongodb+srv://AdminDB:admindb123@cluster0.sdacyha.mongodb.net/aldb?retryWrites=true&w=majority&appName=Cluster0"
    client = pymongo.MongoClient(mongo_uri)
    db = client.get_default_database()
    
    units = [
        {
            "unitName": "UNIT I MATRICES AND LINEAR ALGEBRA",
            "topics": [
                {"topicName": "Systems of Linear Equations", "subtopics": ["Gaussian Elimination", "LU Decomposition"]},
                {"topicName": "Vector Spaces", "subtopics": ["Basis and Dimension"]},
                {"topicName": "Eigenvalues and Eigenvectors", "subtopics": ["Diagonalization", "SVD"]}
            ]
        },
        {
            "unitName": "UNIT II PROBABILITY AND RANDOM VARIABLES",
            "topics": [
                {"topicName": "Probability axioms", "subtopics": ["Conditional probability", "Bayes Rule"]},
                {"topicName": "Random Variables", "subtopics": ["Discrete RV", "Continuous RV"]},
                {"topicName": "Expectation and Moments", "subtopics": ["Mean", "Variance", "Covariance"]}
            ]
        },
        {
            "unitName": "UNIT III STATISTICS AND HYPOTHESIS TESTING",
            "topics": [
                {"topicName": "Sampling Distributions", "subtopics": []},
                {"topicName": "Estimation theory", "subtopics": ["Maximum Likelihood Estimation"]},
                {"topicName": "Testing of Hypothesis", "subtopics": ["t-test", "Chi-square test"]}
            ]
        },
        {
            "unitName": "UNIT IV CALCULUS AND OPTIMIZATION",
            "topics": [
                {"topicName": "Partial derivatives", "subtopics": []},
                {"topicName": "Gradient Descent", "subtopics": ["Stochastic Gradient Descent"]},
                {"topicName": "Constrained Optimization", "subtopics": ["Lagrange Multipliers"]}
            ]
        },
        {
            "unitName": "UNIT V DIMENSIONALITY REDUCTION",
            "topics": [
                {"topicName": "Principal Component Analysis (PCA)", "subtopics": []},
                {"topicName": "Linear Discriminant Analysis (LDA)", "subtopics": []},
                {"topicName": "Information Theory", "subtopics": ["Entropy", "KL Divergence"]}
            ]
        }
    ]
    
    result = db.subjects.update_one(
        {"subject_code": "MA3251"},
        {"$set": {"units": units}}
    )
    
    if result.matched_count > 0:
        print(f"Successfully updated MA3251 with {len(units)} units.")
    else:
        print("No subject found with code MA3251")

if __name__ == "__main__":
    populate_ma3251_units()
