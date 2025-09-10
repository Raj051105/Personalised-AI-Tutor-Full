import React, { useState } from 'react';
import { X, Upload } from 'lucide-react';
import axiosInstance from '../../Utils/axiosInstance';
import { API_PATH } from '../../Utils/api_path';

const UnitModal = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    subject_code: '',  // Changed from 'syllabus' to 'subject_code' for clarity
    title: '',
    description: '',
    notes: null,
    syllabus: null,      // Changed from 'syllabusFile' to 'syllabus'
    past_paper: null     // Changed from 'questionPaper' to 'past_paper'
  });
  
  // Updated error states to match new field names
  const [fileErrors, setFileErrors] = useState({
    notes: '',
    syllabus: '',
    past_paper: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Unified file change handler for all file inputs
  const handleFileChange = (e, fieldName) => {
    const file = e.target.files[0];
    setFileErrors(prev => ({ ...prev, [fieldName]: '' })); // Clear previous errors
    
    if (file) {
      // Check file type
      if (file.type !== 'application/pdf') {
        setFileErrors(prev => ({ ...prev, [fieldName]: 'Please select a PDF file only' }));
        e.target.value = '';
        return;
      }
      
      // Check file size (10MB = 10 * 1024 * 1024 bytes)
      const maxSize = 10 * 1024 * 1024;
      if (file.size > maxSize) {
        setFileErrors(prev => ({ ...prev, [fieldName]: 'File size must be less than 10MB' }));
        e.target.value = '';
        return;
      }
      
      // File is valid
      setFormData(prev => ({
        ...prev,
        [fieldName]: file
      }));
    }
  };

  // Helper for file click (open dialog)
  const handleFileClick = (fieldName) => {
    if (!isSubmitting) {
      document.getElementById(`${fieldName}File`).click();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.subject_code && formData.title && formData.notes) {
      setIsSubmitting(true);
      
      try {
        // Create FormData for multipart/form-data
        const submitData = new FormData();
        submitData.append('subject_code', formData.subject_code);  // Changed key name
        submitData.append('title', formData.title);
        submitData.append('description', formData.description);
        
        // CORRECTED: Append files with exact field names expected by backend
        if (formData.notes) submitData.append('notes', formData.notes);
        if (formData.syllabus) submitData.append('syllabus', formData.syllabus);  // Changed key
        if (formData.past_paper) submitData.append('past_paper', formData.past_paper);  // Changed key

        console.log('Submitting unit data...');
        console.log('Form data values:', formData);
        
        // Make API call to create unit
        const response = await axiosInstance.post(API_PATH.SUBJECT.CREATE_SUBJECT, submitData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          timeout: 30000, // 30 second timeout for file uploads
        });

        console.log('Unit created successfully:', response.data);
        
        // Call parent's onSubmit with the response data
        onSubmit(response.data);
        
        // Reset form
        setFormData({
          subject_code: '',
          title: '',
          description: '',
          notes: null,
          syllabus: null,
          past_paper: null
        });
        setFileErrors({ notes: '', syllabus: '', past_paper: '' });
        
        // Close modal
        onClose();
        
      } catch (error) {
        console.error('Error creating unit:', error);
        
        // Handle different error types
        let errorMessage = 'Failed to create unit. Please try again.';
        
        if (error.response?.status === 400) {
          errorMessage = error.response.data?.message || 'Invalid data provided. Check if all required fields are filled and file is valid.';
        } else if (error.response?.status === 401) {
          errorMessage = 'Authentication failed. Please login again.';
        } else if (error.response?.status === 404) {
          errorMessage = 'Subject not found. Please check the subject code.';
        } else if (error.response?.status === 409) {
          errorMessage = 'Unit with this name already exists for this subject.';
        } else if (error.response?.status === 413) {
          errorMessage = 'File size too large. Please upload a smaller file.';
        } else if (error.response?.status === 422) {
          errorMessage = 'File validation failed. Ensure you are uploading a valid PDF file.';
        } else if (error.code === 'NETWORK_ERROR') {
          errorMessage = 'Network error. Please check your connection.';
        } else if (error.code === 'ECONNABORTED') {
          errorMessage = 'Request timeout. Please try again with a smaller file.';
        }
        
        setFileErrors(prev => ({ ...prev, notes: errorMessage }));
      } finally {
        setIsSubmitting(false);
      }
    } else {
      setFileErrors(prev => ({ ...prev, notes: 'Please fill in all required fields and upload a PDF file' }));
    }
  };

  if (!isOpen) return null;

  // CORRECTED: File upload fields configuration to match backend expectations
  const fileFields = [
    { name: 'notes', label: 'Unit Notes (PDF) *', required: true },
    { name: 'syllabus', label: 'Syllabus (PDF)', required: false },
    { name: 'past_paper', label: 'Past Paper (PDF)', required: false }  // Fixed field name
  ];  

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      {/* Glassmorphism Background */}
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm"></div>
      
      {/* Modal Content */}
      <div className="relative bg-white/90 backdrop-blur-md border border-white/20 rounded-lg shadow-2xl p-6 w-[90%] max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Add Unit Notes</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
            disabled={isSubmitting}
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Subject Code */}
          <div>
            <label htmlFor="subject_code" className="block text-sm font-medium text-gray-700 mb-1">
              Subject Code *
            </label>
            <input
              type="text"
              id="subject_code"
              name="subject_code"  // Changed name attribute
              value={formData.subject_code}  // Changed value reference
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#730FFF] focus:border-transparent bg-white/70 backdrop-blur-sm"
              placeholder="Enter subject code (e.g., CS101)"
              required
              disabled={isSubmitting}
            />
          </div>

          {/* Unit Name */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Unit Name *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#730FFF] focus:border-transparent bg-white/70 backdrop-blur-sm"
              placeholder="Enter unit name (e.g., Unit 1: Introduction)"
              required
              disabled={isSubmitting}
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#730FFF] focus:border-transparent resize-vertical bg-white/70 backdrop-blur-sm"
              placeholder="Enter unit description or topics covered"
              disabled={isSubmitting}
            />
          </div>

          {/* File Upload Fields */}
          {fileFields.map(({ name, label, required }) => (
            <div key={name}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {label}
              </label>
              <div
                onClick={() => handleFileClick(name)}
                className={`w-full px-3 py-2 border-2 border-dashed border-gray-300 rounded-md cursor-pointer hover:border-[#730FFF] transition-colors bg-white/50 backdrop-blur-sm ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className="flex items-center justify-center space-x-2 text-gray-600">
                  <Upload size={20} />
                  <span>
                    {formData[name] 
                      ? `Selected: ${formData[name].name}` 
                      : 'Click to upload PDF'
                    }
                  </span>
                </div>
              </div>
              
              {/* File size placeholder */}
              <p className="text-xs text-gray-500 mt-1">PDF files only • Max size: 10MB</p>
              
              {/* Error message */}
              {fileErrors[name] && (
                <p className="text-sm text-red-400 mt-1">{fileErrors[name]}</p>
              )}
              
              <input
                type="file"
                id={`${name}File`}
                accept=".pdf"
                onChange={(e) => handleFileChange(e, name)}
                className="hidden"
                disabled={isSubmitting}
              />
            </div>
          ))}

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50/70 transition-colors bg-white/50 backdrop-blur-sm cursor-pointer"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-[#730FFF]/90 text-white rounded-md hover:bg-[#5a00b3] transition-colors backdrop-blur-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Adding...' : 'Add Unit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UnitModal;
