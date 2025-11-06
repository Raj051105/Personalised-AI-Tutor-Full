import mongoose from 'mongoose';

const answerSchema = new mongoose.Schema({
    questionId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    userAnswer: {
        type: mongoose.Schema.Types.Mixed, // Can be string or array
        required: true
    },
    isCorrect: {
        type: Boolean,
        required: true
    }
});

const quizAttemptSchema = new mongoose.Schema({
    quiz: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Quiz',
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    answers: [answerSchema],
    score: {
        type: Number,
        required: true
    },
    maxScore: {
        type: Number,
        required: true
    },
    percentageScore: {
        type: Number,
        required: true
    },
    timeSpent: {
        type: Number, // in seconds
        required: true
    },
    completed: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Indexes for performance queries
quizAttemptSchema.index({ quiz: 1, user: 1 });
quizAttemptSchema.index({ user: 1, createdAt: -1 });

const QuizAttempt = mongoose.model('QuizAttempt', quizAttemptSchema);
export default QuizAttempt;