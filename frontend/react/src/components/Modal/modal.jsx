import React, { useState } from 'react';
import { X, Upload } from 'lucide-react';
import axiosInstance from '../../Utils/axiosInstance';
import { API_PATH } from '../../Utils/api_path';

const Modal = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    subjectCode: '',
    subjectTitle: '',
    description: '',
    syllabus: null,         // Syllabus PDF
    notes: null,            // Notes PDF
    questionPaper: null     // Question Paper PDF
  });

  // Separate error state for each file field
  const [fileErrors, setFileErrors] = useState({ syllabus: '', notes: '', questionPaper: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fileFields = [
    { name: 'syllabus', label: 'Syllabus (PDF)' },
    { name: 'notes', label: 'Notes (PDF)' },
    { name: 'questionPaper', label: 'Question Paper (PDF)' }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Unified file change handler for each file input
  const handleFileChange = (e, fieldName) => {
    const file = e.target.files[0];
    setFileErrors(prev => ({ ...prev, [fieldName]: '' }));

    if (file) {
      if (file.type !== 'application/pdf') {
        setFileErrors(prev => ({ ...prev, [fieldName]: 'Please select a PDF file only' }));
        e.target.value = '';
        return;
      }
      const maxSize = 10 * 1024 * 1024;
      if (file.size > maxSize) {
        setFileErrors(prev => ({ ...prev, [fieldName]: 'File size must be less than 10MB' }));
        e.target.value = '';
        return;
      }
      setFormData(prev => ({
        ...prev,
        [fieldName]: file
      }));
    }
  };

  // Helper for file click (open dialog)
  const handleFileClick = (fieldName) => {
    document.getElementById(`${fieldName}File`).click();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.subjectCode && formData.subjectTitle) {
      setIsSubmitting(true);
      try {
        const submitData = new FormData();
        submitData.append('title', formData.subjectTitle);
        submitData.append('description', formData.description);
        submitData.append('syllabus', formData.subjectCode);

        // Append all three files if present
        if (formData.syllabus) submitData.append('syllabusFile', formData.syllabus);
        if (formData.notes) submitData.append('notesFile', formData.notes);
        if (formData.questionPaper) submitData.append('questionPaperFile', formData.questionPaper);

        const response = await axiosInstance.post(API_PATH.SUBJECT.CREATE_SUBJECT, submitData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        onSubmit(response.data);
        setFormData({
          subjectCode: '',
          subjectTitle: '',
          description: '',
          syllabus: null,
          notes: null,
          questionPaper: null
        });
        setFileErrors({ syllabus: '', notes: '', questionPaper: '' });
        onClose();
      } catch (error) {
        let errorMessage = 'Failed to create subject. Please try again.';
        if (error.response?.status === 400) errorMessage = error.response.data?.message || 'Invalid data provided.';
        else if (error.response?.status === 401) errorMessage = 'Authentication failed. Please login again.';
        else if (error.response?.status === 409) errorMessage = 'Subject with this code already exists.';
        else if (error.response?.status === 413) errorMessage = 'File size too large. Please upload a smaller file.';
        else if (error.code === 'NETWORK_ERROR') errorMessage = 'Network error. Please check your connection.';

        // General error
        setFileErrors(prev => ({ ...prev, syllabus: errorMessage }));
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm"></div>
      <div className="relative bg-white/90 backdrop-blur-md border border-white/20 rounded-lg shadow-2xl p-6 w-[90%] max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Add Subject</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
            disabled={isSubmitting}
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="subjectCode" className="block text-sm font-medium text-gray-700 mb-1">
              Subject Code *
            </label>
            <input
              type="text"
              id="subjectCode"
              name="subjectCode"
              value={formData.subjectCode}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#730FFF] focus:border-transparent bg-white/70 backdrop-blur-sm"
              placeholder="Enter subject code (e.g., CS101)"
              required
              disabled={isSubmitting}
            />
          </div>
          <div>
            <label htmlFor="subjectTitle" className="block text-sm font-medium text-gray-700 mb-1">
              Subject Title *
            </label>
            <input
              type="text"
              id="subjectTitle"
              name="subjectTitle"
              value={formData.subjectTitle}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#730FFF] focus:border-transparent bg-white/70 backdrop-blur-sm"
              placeholder="Enter subject title"
              required
              disabled={isSubmitting}
            />
          </div>
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
              placeholder="Enter subject description"
              disabled={isSubmitting}
            />
          </div>

          {fileFields.map(({index, name, label }) => (
            <div key={index}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
              <div
                onClick={() => handleFileClick(name)}
                className={`w-full px-3 py-2 border-2 border-dashed border-gray-300 rounded-md cursor-pointer hover:border-[#730FFF] transition-colors bg-white/50 backdrop-blur-sm ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className="flex items-center justify-center space-x-2 text-gray-600">
                  <Upload size={20} />
                  <span>
                    {formData[name]
                      ? `Selected: ${formData[name].name}`
                      : `Click to upload PDF`}
                  </span>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-1">PDF files only • Max size: 10MB</p>
              {fileErrors[name] && (
                <p className="text-sm text-red-400 mt-1">{fileErrors[name]}</p>
              )}
              <input
                type="file"
                id={`${name}File`}
                accept=".pdf"
                onChange={e => handleFileChange(e, name)}
                className="hidden"
                disabled={isSubmitting}
              />
            </div>
          ))}

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
              {isSubmitting ? 'Adding...' : 'Add Subject'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Modal;
