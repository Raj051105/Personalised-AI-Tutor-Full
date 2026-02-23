import express from 'express';
import { 
    calculateTopicMastery, 
    getSubjectProgress, 
    getTopicProgress 
} from '../Controllers/topicProgress.controller.js';
import { protect as authMiddleware } from '../Middleware/AuthMiddleware.js';

const router = express.Router();

/**
 * Route defining for Topic Mastery Tracking
 */

// Route to manually update/recalculate topic progress stats
router.post('/calculate', authMiddleware, calculateTopicMastery);

// Route to fetch progress for a specific subject (all topics)
router.get('/subject/:subject_id', authMiddleware, getSubjectProgress);

// Route to fetch progress for a specific topic in a subject
router.get('/topic/:subject_id/:topic', authMiddleware, getTopicProgress);

export default router;
