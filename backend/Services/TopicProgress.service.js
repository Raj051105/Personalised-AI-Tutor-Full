import TopicProgress from '../Models/TopicProgress.model.js';
import Subject from '../Models/Subject.model.js';

/**
 * Service to update topic-level mastery for a student after a quiz attempt.
 */
export const updateTopicProgress = async (userId, subjectRef, topic, questionsResults) => {
  try {
    // 0. Ensure we have the Subject's ObjectId (in case a string code was passed)
    let subjectId = subjectRef;
    if (typeof subjectRef === 'string') {
      const subjectDoc = await Subject.findOne({ subject_code: subjectRef });
      if (subjectDoc) {
        subjectId = subjectDoc._id;
      } else {
        throw new Error(`Subject with code ${subjectRef} not found`);
      }
    }

    // 1. Find or create the progress record
    let progress = await TopicProgress.findOne({ 
      user: userId, 
      subject: subjectId, 
      topic: topic 
    });

    if (!progress) {
      progress = new TopicProgress({
        user: userId,
        subject: subjectId,
        topic: topic,
        totalQuestions: 0,
        correctQuestions: 0,
        recentAttempts: [],
        masteryScore: 0.5,
        currentDifficulty: 'medium'
      });
    }

    // 2. Add question results [true, true, false, ...] to history
    // We assume questionsResults is an array of booleans indicating correctness
    progress.recentAttempts.push(...questionsResults);

    // Keep only the last 10 attempts
    if (progress.recentAttempts.length > 10) {
      progress.recentAttempts = progress.recentAttempts.slice(-10);
    }

    // 3. Update lifetime counters
    progress.totalQuestions += questionsResults.length;
    progress.correctQuestions += questionsResults.filter(q => q === true).length;

    // 4. Calculate core metrics as requested
    const overallAccuracy = progress.totalQuestions > 0 
      ? (progress.correctQuestions / progress.totalQuestions) 
      : 0;

    const recentAccuracy = progress.recentAttempts.length > 0
      ? (progress.recentAttempts.filter(q => q === true).length / progress.recentAttempts.length)
      : 0;

    // masteryScore = (recentAccuracy * 0.6) + (overallAccuracy * 0.4)
    const masteryScore = (recentAccuracy * 0.6) + (overallAccuracy * 0.4);

    // 5. Update difficulty based on mastery threshold
    let difficulty = 'medium';
    if (masteryScore < 0.5) {
      difficulty = 'easy';
    } else if (masteryScore >= 0.8) {
      difficulty = 'hard';
    } else {
      difficulty = 'medium';
    }

    // 6. Persist results
    progress.recentAccuracy = recentAccuracy;
    progress.masteryScore = masteryScore;
    progress.currentDifficulty = difficulty;
    progress.lastPracticed = new Date();

    await progress.save();
    return progress;

  } catch (error) {
    console.error("Error updating topic progress:", error);
    throw error;
  }
};
