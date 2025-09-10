
import express from 'express';
import { handleUploadError, uploadUnitFiles } from '../Middleware/uploadMiddleware.js';
import { createSubject, deleteSubject, getAllSubjects, getRecentSubject } from '../Controllers/user.controller.js';
import { protect } from '../Middleware/AuthMiddleware.js';

const subjectRoute = express.Router();

subjectRoute.post('/create-subject',protect, uploadUnitFiles, handleUploadError, createSubject);
subjectRoute.get('/get-all-subject', protect, getAllSubjects);
subjectRoute.get('/get-recent', protect, getRecentSubject);
subjectRoute.delete('/delete-subject/:id', protect, deleteSubject);

export default subjectRoute;