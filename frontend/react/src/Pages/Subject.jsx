import React, { useContext, useState, useEffect } from 'react'
import { UserContext } from '../Context/userContext';
import BaseLayout from '../components/Layouts/BaseLayout';
import UnitModal from '../components/Modal/UnitModal'; 
import { CircleFadingPlus, Search } from 'lucide-react';
import Cards from '../components/Cards/Cards';
import { API_PATH } from '../Utils/api_path';
import axiosInstance from '../Utils/axiosInstance';

const Subject = () => {
  const { user } = useContext(UserContext);
  const [query, setQuery] = useState('');
  const [subjects, setSubjects] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleAddUnit = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSubmitUnit = async (unitData) => {
    try {
      await fetchSubjects();
      setIsModalOpen(false);
    } catch (error) {
      setError('Failed to add unit. Please try again.');
      console.error('Error adding unit:', error);
    }
  };

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      setError(null);
      
      
      const response = await axiosInstance.get(API_PATH.SUBJECT.GET_ALL);

      // Normalize subjects array regardless of API format
      let subjectsArr = [];
      if (response.data) {
        if (Array.isArray(response.data.subjects)) {
          subjectsArr = response.data.subjects;
        } else if (Array.isArray(response.data)) {
          subjectsArr = response.data;
        } else if (response.data.subjects && typeof response.data.subjects === 'object') {
          subjectsArr = [response.data.subjects];
        }
      }
      setSubjects(subjectsArr);
      if (subjectsArr.length === 0) {
      }
      
    } catch (error) {
      
      if (error.response?.status === 401) {
        setError('Authentication failed. Please login again.');
      } else if (error.response?.status === 403) {
        setError('Access denied. You don\'t have permission to view subjects.');
      } else if (error.response?.status === 404) {
        setError('Subjects endpoint not found. Please check the API.');
      } else if (error.code === 'NETWORK_ERROR') {
        setError('Network error. Please check your internet connection.');
      } else {
        setError(`Failed to load subjects: ${error.response?.data?.message || error.message}`);
      }
      
      setSubjects([]);
    } finally {
      setLoading(false);
    }
  }

  const handleDeleteSubject = async (deletedId) => {
  try {
    // Remove the deleted subject from the state
    setSubjects(prevSubjects => 
      prevSubjects.filter(subject => subject._id !== deletedId)
    );
    
    // Optional: Show success message
    console.log('Subject removed from list');
    
    // Optional: Refetch subjects to ensure data consistency
    // await fetchSubjects();
  } catch (error) {
    console.error('Error handling delete:', error);
    // Refetch subjects on error to ensure UI consistency
    fetchSubjects();
  }
};

  useEffect(() => {
    // Check if user is logged in before fetching
    const token = localStorage.getItem('token');
    if (token) {
      fetchSubjects();
    } else {
      setError('No authentication token found. Please login.');
    }
  }, []);

  const filteredSubjects = subjects.filter(subject =>
    (subject?.title && subject.title.toLowerCase().includes(query.toLowerCase())) ||
    (subject?.description && subject.description.toLowerCase().includes(query.toLowerCase())) ||
    (subject?.syllabus && subject.syllabus.toLowerCase().includes(query.toLowerCase()))
  );

  return (
    <BaseLayout user={user} active={'subject'}>
      <div className='mt-5 w-[90%] mx-auto'>
        <div className='flex items-center justify-between'>
          <h1 className='font-bold text-3xl'>Subject</h1>
          <div className='relative w-1/3'>
            <input
              type="text"
              placeholder='Search the Subject'
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className='px-2 py-2 border border-black rounded-[5px] w-full'
            />
            <Search className='absolute top-2 right-2' size={20} />
          </div>
        </div>

        <button
          onClick={handleAddUnit}
          className='mt-10 bg-white p-5 rounded-[10px] shadow-md border-2 border-dashed border-[#767676] cursor-pointer w-full hover:border-[#730FFF] hover:bg-gray-50 transition-all duration-300'
        >
          <div className='flex flex-col items-center justify-center'>
            <CircleFadingPlus size={80} strokeWidth={0.5} color='#767676' />
            <p className='text-[#767676] font-semibold mt-2'>Add the notes for a subject</p>
          </div>
        </button>

        <div className='mt-5 py-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 w-full'>
          {loading ? (
            <div className="col-span-full text-center py-10">
              <p>Loading subjects...</p>
            </div>
          ) : error ? (
            <div className="col-span-full text-center py-10">
              <p className="text-red-500">Error: {error}</p>
              <button 
                onClick={fetchSubjects}
                className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Retry
              </button>
            </div>
          ) : filteredSubjects.length > 0 ? (
            filteredSubjects.map((subject, idx) => (
              <Cards 
                key={subject._id || idx}
                id={subject._id || idx}
                title={subject.title || ''}
                description={subject.description || ''}
                syllabus={subject.syllabus || ''}
                notes={subject.notes || []}
                createdAt={subject.createdAt || ''}
                onDelete={handleDeleteSubject}
              />
            ))
          ) : subjects.length === 0 ? (
            <div className="col-span-full text-center py-10">
              <p className="text-gray-500">No subjects found. Add your first subject!</p>
            </div>
          ) : (
            <div className="col-span-full text-center py-10">
              <p className="text-gray-500">No subjects match your search.</p>
            </div>
          )}
        </div>
      </div>

      {/* Unit Modal Component */}
      {isModalOpen && (
        <UnitModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSubmit={handleSubmitUnit}
        />
      )}
    </BaseLayout>
  )
}

export default Subject