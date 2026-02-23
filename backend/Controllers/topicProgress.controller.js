import TopicProgress from '../Models/TopicProgress.model.js';
import Subject from '../Models/Subject.model.js';
import { updateTopicProgress } from '../Services/TopicProgress.service.js';

/**
 * Controller for managing topic-level mastery.
 */

// 1. Manually trigger a refresh of topic progress (useful for recalculating after batch actions)
export const calculateTopicMastery = async (req, res) => {
    try {
        const { subject_id, topic, results } = req.body; // results: [true, false, ...]

        if (!subject_id || !topic || !Array.isArray(results)) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const stats = await updateTopicProgress(req.user._id, subject_id, topic, results);
        res.json(stats);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 2. Get progress stats for all topics in a subject
export const getSubjectProgress = async (req, res) => {
    try {
        const { subject_id } = req.params;
        const progress = await TopicProgress.find({ 
            user: req.user._id, 
            subject: subject_id 
        }).populate('subject', 'title subject_code');
        
        res.json(progress);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 3. Get progress for a specific topic
export const getTopicProgress = async (req, res) => {
    try {
        const { subject_id, topic } = req.params;
        const progress = await TopicProgress.findOne({
            user: req.user._id,
            subject: subject_id,
            topic: topic
        });

        if (!progress) {
            return res.status(404).json({ message: "No progress found for this topic" });
        }

        res.json(progress);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
