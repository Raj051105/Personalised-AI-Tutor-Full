import fs from 'fs';
import FormData from 'form-data';
import axios from 'axios';
import Subject from '../Models/Subject.model.js';
import { cleanupUploadedFile } from '../Middleware/uploadMiddleware.js';

// Extract file metadata
function extractMeta(file) {
    if (!file) return null;
    
    return {
        filename: file.filename,
        originalName: file.originalname,
        size: file.size,
        contentType: file.mimetype
    };
}

// Upload file to FastAPI
async function uploadFile(category, file, subject_code) {
    try {
        console.log(`Uploading ${category} file for subject code: ${subject_code}`);
        
        const formData = new FormData();
        formData.append('category', category);
        formData.append('file', fs.createReadStream(file.path), {
            filename: file.originalname,
            contentType: file.mimetype
        });

        const response = await axios.post(`http://127.0.0.1:8000/upload/${subject_code}`, formData, {
            headers: {
                ...formData.getHeaders(),
            },
            timeout: 30000
        });

        console.log(`Successfully uploaded ${category} for ${subject_code}`);
        return response.data;
        
    } catch (error) {
        console.error(`Error uploading ${category} file:`, error.response?.data || error.message);
        throw new Error(`Failed to upload ${category} file: ${error.message}`);
    }
}

export const createSubject = async (req, res) => {
    try {
        const { title, description, subject_code } = req.body;
        const userId = req.user.id;

        // Basic validation
        if (!title || !description || !subject_code) {
            return res.status(400).json({ 
                message: "Required fields missing: title, description, subject_code" 
            });
        }

        // File validation - notes and syllabus are required
        if (!req.files || !req.files.syllabus || !req.files.notes) {
            return res.status(400).json({ 
                message: "Required files missing: syllabus and notes PDF files are required." 
            });
        }

        // Extract files with consistent naming
        const files = {
            syllabus: req.files.syllabus[0],
            notes: req.files.notes,
            pastpaper: req.files.pastpaper ? req.files.pastpaper : null
        };

        console.log('Files processed:', {
            syllabus: files.syllabus ? '✓' : '✗',
            notes: files.notes ? '✓' : '✗',
            pastpaper: files.pastpaper ? '✓' : '✗'
        });

        // Build subject data - ONLY add pastpaper if it exists
        const subjectData = {
            title,
            description,
            subject_code,
            createdBy: userId,
            syllabus: extractMeta(files.syllabus),
            notes: extractMeta(files.notes)
        };

        // Only add pastpaper if file exists and metadata is valid
        if (files.pastpaper) {
            const pastpaperMeta = extractMeta(files.pastpaper);
            if (pastpaperMeta && pastpaperMeta.filename) {
                subjectData.pastpaper = pastpaperMeta;
            }
        }

        // Save to database
        const subject = new Subject(subjectData);
        await subject.save();

        // Upload files to FastAPI
        await uploadFile('syllabus', files.syllabus, subject_code);
        await uploadFile('notes', files.notes, subject_code);
        if (files.pastpaper) {
            await uploadFile('pastpaper', files.pastpaper, subject_code);
        }

        // Trigger RAG ingestion
        await axios.post(`http://127.0.0.1:8000/ingest/${subject_code}`);

        res.status(201).json({
            message: 'Subject created and files uploaded successfully.',
            subject
        });
        
    } catch (error) {
        console.error('Error in createSubject:', error);
        
        // Cleanup uploaded files on error
        if (req.files) {
            Object.values(req.files).forEach(fileArray => {
                if (Array.isArray(fileArray)) {
                    fileArray.forEach(file => {
                        if (file && file.path) {
                            cleanupUploadedFile(file.path);
                        }
                    });
                }
            });
        }
        
        res.status(500).json({ 
            message: 'Server error', 
            error: error.message
        });
    }
};

// Other functions remain the same...
export const getAllSubjects = async (req, res) => {
    try {
        const userId = req.user.id;
        const subjects = await Subject.find({ createdBy: userId })
            .sort({ createdAt: -1 });

        return res.status(200).json({
            message: "Subjects retrieved successfully",
            count: subjects.length,
            subjects: subjects
        });
    } catch (error) {
        console.error("Error fetching subjects:", error);
        res.status(500).json({
            message: "Server error",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

export const getRecentSubject = async (req, res) => {
    try {
        const userId = req.user.id;
        const recentSubject = await Subject.find({ createdBy: userId })
            .sort({ createdAt: -1 }).limit(5);

        return res.status(200).json({
            message: "Recent subjects retrieved successfully",
            subject: recentSubject
        });
    } catch (error) {
        console.error("Error fetching recent subjects:", error);
        res.status(500).json({
            message: "Server error",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

export const deleteSubject = async (req, res) => {
    try {
        const { id } = req.params;
        const subject = await Subject.findById(id);
        
        if (!subject) {
            return res.status(404).json({ message: "Subject not found" });
        }

        await Subject.findByIdAndDelete(id);
        return res.status(200).json({
            message: "Subject deleted successfully"
        });
    } catch (error) {
        console.error("Error deleting subject:", error);
        res.status(500).json({
            message: "Server error",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};
