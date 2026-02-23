import express from 'express';
import Quiz from '../Models/Quiz.model.js';
import QuizAttempt from '../Models/QuizAttempt.model.js';
import { protect as authMiddleware } from '../Middleware/AuthMiddleware.js';
import { updateTopicProgress } from '../Services/TopicProgress.service.js';

const router = express.Router();

// Get all quizzes for a subject
router.get('/subject/:subject_code', authMiddleware, async (req, res) => {
    try {
        const quizzes = await Quiz.find({ 
            subject_code: req.params.subject_code 
        }).sort('-createdAt');
        res.json(quizzes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Save a new quiz (used after AI generation)
router.post('/save', authMiddleware, async (req, res) => {
    try {
        const { subject_code, topic, questions } = req.body;
        const quiz = new Quiz({
            subject_code,
            topic,
            questions,
            createdBy: req.user._id
        });
        const savedQuiz = await quiz.save();
        res.status(201).json(savedQuiz);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Submit a quiz attempt
router.post('/attempt/:quizId', authMiddleware, async (req, res) => {
    try {
        const { answers, timeSpent } = req.body;
        const quiz = await Quiz.findById(req.params.quizId);
        if (!quiz) {
            return res.status(404).json({ message: 'Quiz not found' });
        }

        // Calculate score
        let score = 0;
        const processedAnswers = answers.map(answer => {
            const question = quiz.questions.id(answer.questionId);
            const isCorrect = Array.isArray(question.correctAnswer) 
                ? JSON.stringify(answer.userAnswer.sort()) === JSON.stringify(question.correctAnswer.sort())
                : answer.userAnswer === question.correctAnswer;
            
            if (isCorrect) score++;
            
            return {
                ...answer,
                isCorrect
            };
        });

        const attempt = new QuizAttempt({
            quiz: quiz._id,
            user: req.user._id,
            answers: processedAnswers,
            score,
            maxScore: quiz.questions.length,
            percentageScore: (score / quiz.questions.length) * 100,
            timeSpent
        });

        const savedAttempt = await attempt.save();

        // New Logic: Update topic-level progress based on this attempt
        // We extract the list of booleans (isCorrect) from processedAnswers
        const questionResults = processedAnswers.map(ans => ans.isCorrect);
        const subjectObj = await Quiz.findById(req.params.quizId).populate('subject_code'); // Try to find the actual subject ID
        
        // Use the quiz's properties to update progress
        await updateTopicProgress(
            req.user._id, 
            quiz.subject_code, // Note: In this route, quiz.subject_code might be a string. 
                               // We need the ObjectId for the Subject record to be fully normalized
            quiz.topic, 
            questionResults
        );

        res.status(201).json(savedAttempt);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Get quiz attempt history for a user
router.get('/attempts', authMiddleware, async (req, res) => {
    try {
        const attempts = await QuizAttempt.find({ 
            user: req.user._id 
        })
        .populate('quiz', 'subject_code topic')
        .sort('-createdAt');
        
        res.json(attempts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get specific quiz with its attempts for the user
router.get('/:quizId', authMiddleware, async (req, res) => {
    try {
        const quiz = await Quiz.findById(req.params.quizId);
        if (!quiz) {
            return res.status(404).json({ message: 'Quiz not found' });
        }

        const attempts = await QuizAttempt.find({
            quiz: req.params.quizId,
            user: req.user._id
        }).sort('-createdAt');

        res.json({
            quiz,
            attempts
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;