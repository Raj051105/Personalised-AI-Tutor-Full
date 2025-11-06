import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
    question: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['radio', 'checkbox', 'paragraph'],
        required: true
    },
    options: [{
        type: String
    }],
    correctAnswer: {
        type: mongoose.Schema.Types.Mixed, // Can be string or array depending on type
        required: function() {
            return this.type !== 'paragraph'; // Only required for radio/checkbox
        }
    }
});

const quizSchema = new mongoose.Schema({
    subject_code: {
        type: String,
        required: true,
        ref: 'Subject'
    },
    topic: {
        type: String,
        required: true
    },
    questions: [questionSchema],
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    difficulty: {
        type: String,
        enum: ['easy', 'medium', 'hard'],
        default: 'medium'
    },
    isAIGenerated: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Index for faster lookups by subject and user
quizSchema.index({ subject_code: 1, createdBy: 1 });

const Quiz = mongoose.model('Quiz', quizSchema);
export default Quiz;