import React, { useState } from 'react';
import { formatTitle, getInitials } from '../../Utils/helper';
import Flipcards from '../../Pages/Flipcards';
import Quiz from '../../Pages/Quiz';
import axiosInstance from '../../Utils/axiosInstance';
import { API_PATH } from '../../Utils/api_path';

const Cards = ({ id, title, description, syllabus, onDelete }) => {
  const [showFlip, setShowFlip] = useState(false);
  const [showQuiz, setshowQuiz] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const truncateToWords = (text, wordCount) => {
    const words = text.trim().split(/\s+/);
    if (words.length <= wordCount) return text;
    return words.slice(0, wordCount).join(' ') + '...';
  };

  const handleDeleteClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (!id) {
      alert('Subject ID is missing');
      setShowDeleteConfirm(false);
      return;
    }

    setIsDeleting(true);
    try {
      const response = await axiosInstance.delete(API_PATH.SUBJECT.DELETE_SUBJECT(id));
      console.log('Subject deleted successfully:', response.data);
      
      // Close the confirmation modal
      setShowDeleteConfirm(false);
      
      // Call the parent's onDelete callback to refresh the list
      if (onDelete) {
        onDelete(id);
      }
      
      // Optional: Show success message
      // alert('Subject deleted successfully!');
      
    } catch (error) {
      console.error('Error deleting subject:', error);
      
      // Handle different error types
      let errorMessage = 'Failed to delete subject. Please try again.';
      
      if (error.response?.status === 401) {
        errorMessage = 'Authentication failed. Please login again.';
      } else if (error.response?.status === 403) {
        errorMessage = 'You do not have permission to delete this subject.';
      } else if (error.response?.status === 404) {
        errorMessage = 'Subject not found. It may have been already deleted.';
      } else if (error.code === 'NETWORK_ERROR') {
        errorMessage = 'Network error. Please check your connection.';
      }
      
      alert(errorMessage);
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
  };
  
  return (
    <>
      <div className="card-container bg-white p-5 rounded-lg shadow-sm">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-12 h-12 rounded-full mr-2 border border-gray-200 flex items-center justify-center text-lg font-bold bg-gray-100">
              {getInitials(title)}
            </div>
            <h2 className="font-bold text-xl">{formatTitle(title)}</h2>
          </div>
          <button 
            className="text-gray-400 hover:text-red-600 transition"
            onClick={handleDeleteClick}
            disabled={isDeleting}
            title="Delete Subject"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>
        <div className="flex-grow">
          <p className='text-[#767676] font-bold w-[70%] mx-auto'>{syllabus}</p>
          <div className="relative">
            <p className="text-gray-600 mt-2 mb-4 text-sm transition-all duration-200">
              {isExpanded ? description : truncateToWords(description, 20)}
            </p>
            {description.split(/\s+/).length > 20 && (
              <button 
                className="text-blue-500 text-xs hover:underline font-medium mb-2 block"
                onClick={(e) => {
                  e.preventDefault();
                  setIsExpanded(!isExpanded);
                }}
              >
                {isExpanded ? 'Show less' : 'View more'}
              </button>
            )}
          </div>
          <div className="flex gap-2 mt-2">
            <button
              className="flex-1 py-2 border border-purple-400 text-purple-600 rounded hover:bg-purple-50 transition text-sm font-medium cursor-pointer"
              onClick={() => setshowQuiz(true)}
            >
              Quiz
            </button>
            <button
              className="flex-1 py-2 border border-purple-400 text-purple-600 rounded hover:bg-purple-50 transition text-sm font-medium cursor-pointer"
              onClick={() => setShowFlip(true)}
            >
              Flipped Card
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-transparent backdrop-blur-2xl bg-opacity-60">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm mx-4">
            <div className="text-center">
              <div className="mb-4">
                <svg
                  className="mx-auto h-12 w-12 text-red-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Delete Subject
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                Are you sure you want to permanently delete "<strong>{formatTitle(title)}</strong>"? 
                This action cannot be undone and will also delete the associated file.
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={handleConfirmDelete}
                  disabled={isDeleting}
                  className={`px-4 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition ${
                    isDeleting ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {isDeleting ? 'Deleting...' : 'Yes, Delete'}
                </button>
                <button
                  onClick={handleCancelDelete}
                  disabled={isDeleting}
                  className="px-4 py-2 bg-gray-300 text-gray-700 text-sm rounded hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Existing Flip and Quiz Modals remain the same... */}
      {showFlip && (
        <div className="fixed inset-0 z-50 backdrop-blur bg-white flex items-center justify-center bg-opacity-60">
          <div
            className="absolute inset-0"
            onClick={() => setShowFlip(false)}
          />
          <div className="relative z-10 w-full h-full max-w-none p-4">
            <Flipcards />
            <button
              className="absolute top-6 right-6 text-red-600 bg-white rounded-full p-2 shadow hover:bg-red-50 cursor-pointer z-20"
              onClick={() => setShowFlip(false)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      )}

      {showQuiz && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black bg-opacity-60">
            <div className="relative z-10 w-full h-full max-w-none overflow-auto">
              <Quiz />
              <button
                className="fixed top-6 right-6 text-red-600 bg-white rounded-full p-2 shadow hover:bg-red-50 cursor-pointer z-20"
                onClick={() => setshowQuiz(false)}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
                </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Cards;
