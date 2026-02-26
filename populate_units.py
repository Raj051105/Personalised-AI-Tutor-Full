import pymongo

def populate_cs3491_units():
    mongo_uri = "mongodb+srv://AdminDB:admindb123@cluster0.sdacyha.mongodb.net/aldb?retryWrites=true&w=majority&appName=Cluster0"
    client = pymongo.MongoClient(mongo_uri)
    db = client.get_default_database()
    
    units = [
        {
            "unitName": "UNIT I PROBLEM SOLVING",
            "topics": [
                {"topicName": "Introduction to AI", "subtopics": ["AI Applications"]},
                {"topicName": "Problem solving agents", "subtopics": []},
                {"topicName": "Search algorithms", "subtopics": ["uninformed search strategies", "Heuristic search strategies"]},
                {"topicName": "Local search and optimization problems", "subtopics": []},
                {"topicName": "Adversarial search", "subtopics": []},
                {"topicName": "Constraint satisfaction problems (CSP)", "subtopics": []}
            ]
        },
        {
            "unitName": "UNIT II PROBABILISTIC REASONING",
            "topics": [
                {"topicName": "Acting under uncertainty", "subtopics": ["Bayesian inference", "naïve bayes models"]},
                {"topicName": "Probabilistic reasoning", "subtopics": ["Bayesian networks", "exact inference in BN", "approximate inference in BN", "causal networks"]}
            ]
        },
        {
            "unitName": "UNIT III SUPERVISED LEARNING",
            "topics": [
                {"topicName": "Introduction to machine learning", "subtopics": []},
                {"topicName": "Linear Regression Models", "subtopics": ["Least squares", "Bayesian linear regression", "gradient descent"]},
                {"topicName": "Linear Classification Models", "subtopics": ["Discriminant function", "Probabilistic discriminative model", "Logistic regression", "Probabilistic generative model", "Naive Bayes"]},
                {"topicName": "Maximum margin classifier", "subtopics": ["Support vector machine"]},
                {"topicName": "Decision Tree", "subtopics": []},
                {"topicName": "Random forests", "subtopics": []}
            ]
        },
        {
            "unitName": "UNIT IV ENSEMBLE TECHNIQUES AND UNSUPERVISED LEARNING",
            "topics": [
                {"topicName": "Combining multiple learners", "subtopics": ["Model combination schemes", "Voting"]},
                {"topicName": "Ensemble Learning", "subtopics": ["bagging", "boosting", "stacking"]},
                {"topicName": "Unsupervised learning", "subtopics": ["K-means"]},
                {"topicName": "Instance Based Learning", "subtopics": ["KNN", "Gaussian mixture models", "Expectation maximization"]}
            ]
        },
        {
            "unitName": "UNIT V NEURAL NETWORKS",
            "topics": [
                {"topicName": "Perceptron", "subtopics": ["Multilayer perceptron"]},
                {"topicName": "Activation functions", "subtopics": []},
                {"topicName": "Network training", "subtopics": ["gradient descent optimization", "stochastic gradient descent", "error backpropagation"]},
                {"topicName": "Deep learning basics", "subtopics": ["Unit saturation", "the vanishing gradient problem", "ReLU", "hyperparameter tuning", "batch normalization", "regularization", "dropout"]}
            ]
        }
    ]
    
    result = db.subjects.update_many(
        {"subject_code": "CS3491"},
        {"$set": {"units": units}}
    )
    
    if result.matched_count > 0:
        print(f"Successfully updated {result.matched_count} subjects for code CS3491 with {len(units)} units each.")
    else:
        print("No subjects found with code CS3491")

if __name__ == "__main__":
    populate_cs3491_units()
