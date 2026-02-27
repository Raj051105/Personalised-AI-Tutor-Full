// Mock data for hierarchical mastery visualizations and adaptive elements

export const MOCK_MASTERY_DATA = {
  "CS3491": {
    subjectName: "Artificial Intelligence and Machine Learning",
    subjectCode: "CS3491",
    overallMastery: 72,
    lastPracticed: "2023-11-20",
    units: [
      {
        unitName: "Unit I: Problems, State Space Search",
        mastery: 85,
        topics: [
          { topicName: "Problem solving agents", mastery: 90, difficulty: "Easy", lastPracticed: "2023-11-15" },
          { topicName: "Informed Search Strategies", mastery: 80, difficulty: "Medium", lastPracticed: "2023-11-16" },
          { topicName: "Adversarial Search", mastery: 85, difficulty: "Hard", lastPracticed: "2023-11-17" }
        ]
      },
      {
        unitName: "Unit II: Probabilistic Reasoning",
        mastery: 55,
        topics: [
          { topicName: "Probability as degree of belief", mastery: 60, difficulty: "Easy", lastPracticed: "2023-11-18" },
          { topicName: "Bayesian networks", mastery: 45, difficulty: "Hard", lastPracticed: "2023-11-19" },
          { topicName: "Temporal Models", mastery: 60, difficulty: "Medium", lastPracticed: "2023-11-20" }
        ]
      },
      {
        unitName: "Unit III: Machine Learning",
        mastery: 65,
        topics: [
          { topicName: "Learning from examples", mastery: 70, difficulty: "Easy", lastPracticed: "2023-11-10" },
          { topicName: "Decision Trees", mastery: 75, difficulty: "Medium", lastPracticed: "2023-11-11" },
          { topicName: "Neural Networks", mastery: 50, difficulty: "Hard", lastPracticed: "2023-11-12" }
        ]
      },
      {
        unitName: "Unit IV: Reinforcement Learning",
        mastery: 40,
        topics: [
          { topicName: "Passive RL", mastery: 45, difficulty: "Medium", lastPracticed: "2023-11-05" },
          { topicName: "Active RL", mastery: 35, difficulty: "Hard", lastPracticed: "2023-11-06" }
        ]
      },
      {
        unitName: "Unit V: NLP",
        mastery: 78,
        topics: [
          { topicName: "Language models", mastery: 85, difficulty: "Easy", lastPracticed: "2023-11-22" },
          { topicName: "N-gram Models", mastery: 70, difficulty: "Medium", lastPracticed: "2023-11-23" }
        ]
      }
    ]
  },
  "MA3251": {
    subjectName: "Statistics and Numerical Methods",
    subjectCode: "MA3251",
    overallMastery: 45,
    lastPracticed: "2023-11-18",
    units: [
      { unitName: "Testing of Hypothesis", mastery: 60, topics: [{ topicName: "Z-test", mastery: 65, difficulty: "Medium", lastPracticed: "2023-11-15" }] },
      { unitName: "Design of Experiments", mastery: 30, topics: [{ topicName: "ANOVA", mastery: 30, difficulty: "Hard", lastPracticed: "2023-11-16" }] }
    ]
  }
};

export const MOCK_DASHBOARD_STATS = {
  overallMastery: 68,
  subjectsEnrolled: 3,
  weakestTopic: "Bayesian networks",
  questionsAttempted: 142
};

export const MOCK_PAST_QUIZZES = [
  { id: 1, date: "2023-11-20", topic: "Bayesian networks", score: 40, difficulty: "Hard", timeSpent: "15m 30s", answers: [
    { question: "What is a DAG?", userAnswer: "Directed Acyclic Graph", correctAnswer: "Directed Acyclic Graph", isCorrect: true },
    { question: "Are Bayesian networks stochastic?", userAnswer: "No", correctAnswer: "Yes", isCorrect: false }
  ]},
  { id: 2, date: "2023-11-15", topic: "Informed Search", score: 85, difficulty: "Medium", timeSpent: "10m 12s", answers: [
    { question: "What is A* search?", userAnswer: "Best-first search using heuristic", correctAnswer: "Best-first search using g(n) + h(n)", isCorrect: true }
  ]}
];

export const MOCK_FLASHCARDS = {
  "Bayesian networks": [
    { front: "What is the primary representation of a Bayesian Network?", back: "A Directed Acyclic Graph (DAG) representing conditional dependencies.", difficulty: "Medium" },
    { front: "What does a node in a BN represent?", back: "A random variable.", difficulty: "Easy" }
  ],
  "Decision Trees": [
    { front: "What is entropy in a DT?", back: "A measure of the randomness or impurity in the dataset.", difficulty: "Hard" }
  ]
};
