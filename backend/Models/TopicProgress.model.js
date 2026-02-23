import mongoose from "mongoose";

const topicProgressSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },

    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: true,
      index: true
    },

    topic: {
      type: String,
      required: true,
      trim: true
    },

    // ---- Performance Counters ----

    totalQuestions: {
      type: Number,
      default: 0,
      min: 0
    },

    correctQuestions: {
      type: Number,
      default: 0,
      min: 0
    },

    // ---- History for Computed Metrics ----
    recentAttempts: {
      type: [Boolean], // Array of true/false for last N questions
      default: []
    },

    // ---- Computed Metrics ----

    masteryScore: {
      type: Number,
      default: 0.5,   // neutral starting baseline
      min: 0,
      max: 1
    },

    recentAccuracy: {
      type: Number,
      default: 0,
      min: 0,
      max: 1
    },

    currentDifficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium'
    },

    lastPracticed: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);


// ---- Compound Unique Index ----
// One progress record per user per subject per topic
topicProgressSchema.index(
  { user: 1, subject: 1, topic: 1 },
  { unique: true }
);

const TopicProgress = mongoose.model("TopicProgress", topicProgressSchema);
export default TopicProgress;
