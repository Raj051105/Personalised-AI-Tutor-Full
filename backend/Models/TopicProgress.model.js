import mongoose from "mongoose";

const topicProgressSchema = new mongoose.Schema({
    user: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    subject_code: { 
        type: String, 
        required: true 
    },
    topic: { 
        type: String, 
        required: true 
    },
    totalQuestions: { 
        type: Number, 
        default: 0 
    },
    correctQuestions: { 
        type: Number, 
        default: 0 
    },
    recentAccuracy: { 
        type: Number, 
        default: 0 
    },  // last 10
    masteryScore: { 
        type: Number, 
        default: 0.5 
    },  // 0–1 scale
    currentDifficulty: {
        type: String,
        enum: ['easy', 'medium', 'hard'],
        default: 'medium'
    },
    lastPracticed: { 
        type: Date 
    }
}, { timestamps: true });

// Ensure unique combination of user, subject, and topic
topicProgressSchema.index({ user: 1, subject_code: 1, topic: 1 }, { unique: true });

const TopicProgress = mongoose.model("TopicProgress", topicProgressSchema);
export default TopicProgress;
