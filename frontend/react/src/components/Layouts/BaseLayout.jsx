import React, { useEffect, useState } from 'react'
import Navbar from '../Common/Navbar'
import Modal from '../Modal/modal';
import { FileText } from 'lucide-react';
import axiosInstance from '../../Utils/axiosInstance';
import { API_PATH } from '../../Utils/api_path';

const BaseLayout = ({ user, children, active }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [recentFiles, setRecentFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleAddSubject = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSubmitSubject = async (subjectData) => {
    try {
      
      // Add API call to create subject
      const response = await axiosInstance.post(API_PATH.SUBJECT.CREATE_SUBJECT, subjectData);
      
      if (response.data) {
        // Refresh recent files after creating a new subject
        await getRecentFiles();
      }
      
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error creating subject:', error);
      setError('Failed to create subject. Please try again.');
      
      // Show error for 3 seconds
      setTimeout(() => setError(null), 3000);
    }
  };

  const getRecentFiles = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axiosInstance.get(API_PATH.SUBJECT.GET_RECENT);
      
      // Handle different possible response structures
      if (response.data && response.data.subject) {
        setRecentFiles(response.data.subject);
      } else if (response.data && Array.isArray(response.data)) {
        setRecentFiles(response.data);
      } else if (response.data && response.data.subjects) {
        setRecentFiles(response.data.subjects);
      } else {
        setRecentFiles([]);
      }
      
    } catch (error) {
      console.error('Error fetching recent files:', error);
      
      // Handle different types of errors
      if (error.response?.status === 401) {
        setError('Authentication failed. Please login again.');
      } else if (error.response?.status === 404) {
        setError('Recent files endpoint not found.');
      } else if (error.code === 'NETWORK_ERROR') {
        setError('Network error. Please check your connection.');
      } else {
        setError(`Failed to load recent files: ${error.response?.data?.message || error.message}`);
      }
      
      setRecentFiles([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // Only fetch if user is authenticated
    const token = localStorage.getItem('token');
    if (token) {
      getRecentFiles();
    } else {
      console.warn('No token found, skipping recent files fetch');
    }
  }, []);


  // Function to safely get file name
  const getFileName = (file) => {
    // Handle different possible data structures
    if (file?.subjects?.notes?.originalName) {
      return file.subjects.notes.originalName;
    } else if (file?.notes?.originalName) {
      return file.notes.originalName;
    } else if (file?.originalName) {
      return file.originalName;
    } else if (file?.title) {
      return file.title;
    } else if (file?.name) {
      return file.name;
    } else {
      return 'Unnamed File';
    }
  };

  return (
    <div>
      <Navbar user={user} active={active} />
      
      {/* Error display */}
      {error && (
        <div className='fixed top-20 right-5 z-50 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded'>
          {error}
        </div>
      )}
      
      <div className='flex'>
        <div className='w-[20%] pt-20'>
          <div className='w-full px-5'>
            <h2 className='font-semibold text-xl'>Recent Files:</h2>
            
            {/* Loading state */}
            {loading ? (
              <div className='text-gray-500 text-sm my-5'>
                Loading recent files...
              </div>
            ) : recentFiles.length > 0 ? (
              // Display recent files
              recentFiles.map((file, index) => (
                <div key={file._id || index} className='text-gray-600 text-sm my-5 w-[80%] mx-auto flex items-center gap-2'>
                  <FileText size={16} color='#730FFF' /> 
                  <span className='truncate' title={getFileName(file)}>
                    {getFileName(file)}
                  </span>
                </div>
              ))
            ) : (
              // No files state
              <div className='text-gray-500 text-sm my-5'>
                No recent files found
              </div>
            )}
            
            <button
              onClick={handleAddSubject}
              className='mt-5 mx-auto w-[90%] rounded-[7px] bg-[#730FFF] text-white py-2.5 hover:bg-[#5a00b3] transition-colors duration-300 cursor-pointer'>
              Add Subjects
            </button>
          </div>
        </div>
        
        <div className='w-[80%] bg-[#F2F2F2] rounded-tl-[30px] min-h-[calc(100vh-80px)] p-3'>
          {children}
        </div>
      </div>

      {/* Modal Component */}
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSubmit={handleSubmitSubject}
        />
      )}
    </div>
  )
}

export default BaseLayout