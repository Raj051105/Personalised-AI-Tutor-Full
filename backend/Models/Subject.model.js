import mongoose from 'mongoose';

// File metadata schema - make it a proper Mongoose schema
const fileMetadataSchema = new mongoose.Schema({
  filename: { type: String, required: true },
  originalName: { type: String, required: true },
  size: { type: Number, required: true },
  contentType: { type: String, required: true }
}, { _id: false });

const subjectSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
  subject_code: { type: String, required: true, trim: true, unique: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  // Required files
  syllabus: { type: fileMetadataSchema, required: true },
  notes: { type: fileMetadataSchema, required: true },
  
  // Optional file - IMPORTANT: don't define if not provided
  pastpaper: { type: fileMetadataSchema, required: false },

  // Structured syllabus extracted from PDF
  units: [{
    unitName: { type: String, required: true },
    topics: [{
      topicName: { type: String, required: true },
      subtopics: [String]
    }]
  }]
}, { 
  timestamps: true,
  // This prevents empty objects from being saved
  minimize: false 
});

subjectSchema.index({ createdBy: 1, subject_code: 1 });

const Subject = mongoose.model('Subject', subjectSchema);
export default Subject;
