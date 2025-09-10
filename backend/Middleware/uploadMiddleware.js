import fs from 'fs';
import path from 'path';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';

const uploadDir = 'uploads/subjects';

const ensureUploadDirExists = () => {
    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
    }
};

ensureUploadDirExists();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        ensureUploadDirExists();
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueName = `${uuidv4()}-${Date.now()}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
        cb(null, true);
    } else {
        cb(new Error('Only PDF files are allowed'), false);
    }
};

const upload = multer({
    storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    },
    fileFilter
});

// STANDARDIZED: No underscores, consistent naming
const uploadSubjectFiles = upload.fields([
  { name: 'notes', maxCount: 1 },      // Required
  { name: 'syllabus', maxCount: 1 },   // Required
  { name: 'pastpaper', maxCount: 1 }   // Optional
]);

export const handleUploadError = (error, req, res, next) => {
    console.log('Multer error details:', {
        code: error.code,
        field: error.field,
        message: error.message
    });
    
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                message: 'File too large. Maximum size allowed is 10MB.'
            });
        }
        if (error.code === 'LIMIT_UNEXPECTED_FILE') {
            return res.status(400).json({
                message: `Unexpected field: "${error.field}". Expected fields are: notes, syllabus, pastpaper`,
                allowedFields: ['notes', 'syllabus', 'pastpaper']
            });
        }
    }
    
    if (error.message === 'Only PDF files are allowed') {
        return res.status(400).json({
            message: 'Only PDF files are allowed.'
        });
    }

    next(error);
};

export const cleanupUploadedFile = (filePath) => {
    if (filePath && fs.existsSync(filePath)) {
        fs.unlink(filePath, (err) => {
            if (err) console.error('Error deleting file:', err);
        });
    }
};

export { 
    uploadSubjectFiles,
    uploadSubjectFiles as uploadUnitFiles,  // Alias for backwards compatibility
    uploadDir 
};