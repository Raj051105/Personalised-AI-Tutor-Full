import React, { useContext, useState, useEffect } from "react";
import { UserContext } from "../Context/userContext";
import BaseLayout from "../components/Layouts/BaseLayout";
import UnitModal from "../components/Modal/UnitModal";
import { CircleFadingPlus, Search } from "lucide-react";
import Cards from "../components/Cards/Cards";
import { API_PATH } from "../Utils/api_path";
import axiosInstance from "../Utils/axiosInstance";

const Subject = () => {
  console.log("Subject component rendering");
  
  const { user } = useContext(UserContext);
  console.log("UserContext value:", { user });
  
  const [query, setQuery] = useState("");
  const [subjects, setSubjects] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Component lifecycle and state changes
  useEffect(() => {
    console.log("Subject component mounted or updated");
    console.log("Current state:", {
      user,
      subjects,
      loading,
      error,
      isModalOpen
    });
  });

  const handleAddUnit = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  const handleSubmitUnit = async () => {
    try {
      await fetchSubjects();
      setIsModalOpen(false);
    } catch (err) {
      setError("Failed to add unit. Please try again.");
    }
  };

  const fetchSubjects = async () => {
    console.log("fetchSubjects called");
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      console.log("Authentication token present:", !!token);
      console.log("API endpoint:", API_PATH.SUBJECT.GET_ALL);
      console.log("Base URL:", axiosInstance.defaults.baseURL);
      
      const response = await axiosInstance.get(API_PATH.SUBJECT.GET_ALL);
      console.log("Raw API response:", {
        status: response.status,
        statusText: response.statusText,
        data: response.data,
        headers: response.headers
      });
      
      let subjectsArr = [];

      if (response.data) {
        console.log("Response data structure:", {
          isArray: Array.isArray(response.data),
          hasSubjects: Boolean(response.data.subjects),
          type: typeof response.data
        });

        if (Array.isArray(response.data.subjects)) {
          subjectsArr = response.data.subjects;
        } else if (Array.isArray(response.data)) {
          subjectsArr = response.data;
        } else if (
          response.data.subjects &&
          typeof response.data.subjects === "object"
        ) {
          subjectsArr = [response.data.subjects];
        }
      }

      console.log("Processed subjects array:", subjectsArr);
      setSubjects(subjectsArr);
    } catch (err) {
      console.error("Fetch subjects error:", err);
      if (err.response?.status === 401) {
        setError("Authentication failed. Please login again.");
      } else if (err.response?.status === 403) {
        setError("Access denied. You don’t have permission to view subjects.");
      } else if (err.response?.status === 404) {
        setError("Subjects endpoint not found. Please check the API.");
      } else if (err.code === "NETWORK_ERROR") {
        setError("Network error. Please check your internet connection.");
      } else {
        setError(
          `Failed to load subjects: ${
            err.response?.data?.message || err.message
          }`
        );
      }
      setSubjects([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSubject = (deletedId) => {
    setSubjects((prev) => prev.filter((subject) => subject._id !== deletedId));
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    console.log("Token:", token ? "Present" : "Missing");
    console.log("User context:", user);
    
    if (!token || !user) {
      setError("No authentication found. Please login.");
      return;
    }
    
    fetchSubjects();
  }, [user]);

  const filteredSubjects = subjects.filter((subject) => {
    // Ensure we have a valid subject object
    if (!subject) return false;

    // Convert query to lowercase once
    const queryLower = query.toLowerCase();
    
    // Safely handle each field, ensuring they're strings before calling toLowerCase()
    const title = typeof subject.title === 'string' ? subject.title.toLowerCase() : '';
    const description = typeof subject.description === 'string' ? subject.description.toLowerCase() : '';
    
    // Handle syllabus specifically since it might be an object or file
    const syllabus = typeof subject.subject_code === 'string' ? subject.subject_code.toLowerCase() : 
                     typeof subject.syllabus === 'string' ? subject.syllabus.toLowerCase() : '';

    // Log the search data for debugging
    console.log('Filtering subject:', {
      id: subject._id,
      title,
      description,
      syllabus,
      originalSubject: subject
    });

    return (
      title.includes(queryLower) ||
      description.includes(queryLower) ||
      syllabus.includes(queryLower)
    );
  });

  return (
    <BaseLayout user={user} active={"subject"}>
      <div className="mt-5 w-[95%] mx-auto">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <h1 className="font-bold text-2xl sm:text-3xl">Subject</h1>
          <div className="relative w-full md:w-1/3">
            <input
              type="text"
              placeholder="Search the Subject"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="px-3 py-2 border border-gray-400 rounded-[5px] w-full focus:outline-none focus:ring-2 focus:ring-[#730FFF] text-sm sm:text-base"
            />
            <Search
              className="absolute top-2 right-2 text-gray-500"
              size={18}
            />
          </div>
        </div>

        {/* Add Unit Button */}
        <button
          onClick={handleAddUnit}
          className="mt-8 bg-white p-4 sm:p-5 rounded-[10px] shadow-md border-2 border-dashed border-[#767676] cursor-pointer w-full hover:border-[#730FFF] hover:bg-gray-50 transition-all duration-300"
        >
          <div className="flex flex-col items-center justify-center text-center">
            <CircleFadingPlus
              size={60}
              className="sm:w-20 sm:h-20"
              strokeWidth={0.5}
              color="#767676"
            />
            <p className="text-[#767676] font-medium sm:font-semibold mt-2 text-sm sm:text-base">
              Add the notes for a subject
            </p>
          </div>
        </button>

        {/* Cards Grid */}
        <div className="mt-6 py-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
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
            filteredSubjects.map((subject, idx) => {
              console.log("Rendering subject card:", subject);
              return (
                <Cards
                  key={subject._id || idx}
                  id={subject._id || idx}
                  title={subject.title || "Untitled Subject"}
                  description={subject.description || "No description available"}
                  syllabus={subject.subject_code || 
                          (typeof subject.syllabus === 'string' ? subject.syllabus : "No syllabus code available")}
                  notes={Array.isArray(subject.notes) ? subject.notes : []}
                  createdAt={subject.createdAt || new Date().toISOString()}
                  onDelete={handleDeleteSubject}
                />
              );
            })
          ) : subjects.length === 0 ? (
            <div className="col-span-full text-center py-10">
              <p className="text-gray-500">
                No subjects found. Add your first subject!
              </p>
            </div>
          ) : (
            <div className="col-span-full text-center py-10">
              <p className="text-gray-500">No subjects match your search.</p>
            </div>
          )}
        </div>
      </div>

      {/* Unit Modal */}
      {isModalOpen && (
        <UnitModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSubmit={handleSubmitUnit}
        />
      )}
    </BaseLayout>
  );
};

export default Subject;
