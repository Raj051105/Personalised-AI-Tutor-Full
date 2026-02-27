import React, { useContext, useState, useEffect } from "react";
import { UserContext } from "../Context/userContext";
import BaseLayout from "../components/Layouts/BaseLayout";
import UnitModal from "../components/Modal/UnitModal";
import { CircleFadingPlus, Search, BarChart3, Radar } from "lucide-react";
import Cards from "../components/Cards/Cards";
import { API_PATH } from "../Utils/api_path";
import axiosInstance from "../Utils/axiosInstance";
import MasteryRadarChart from "../components/Analytics/MasteryRadarChart";
import TopicBarChart from "../components/Analytics/TopicBarChart";
import { MOCK_MASTERY_DATA } from "../Utils/mockMasteryData";

const Subject = () => {
  const { user } = useContext(UserContext);
  
  const [query, setQuery] = useState("");
  const [subjects, setSubjects] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // NEW: State for Analytics
  const [selectedSubjectId, setSelectedSubjectId] = useState("CS3491");
  const [selectedUnit, setSelectedUnit] = useState(null);

  const currentMasteryData = MOCK_MASTERY_DATA[selectedSubjectId] || MOCK_MASTERY_DATA["CS3491"];

  // Component lifecycle and state changes
  useEffect(() => {
    fetchSubjects();
  }, []);

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

        {/* NEW: Mastery Analytics Section */}
        <div className="mt-16 mb-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-purple-100 rounded-2xl text-[#730FFF]">
                        <Radar size={24} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-gray-800 uppercase italic leading-none">Mastery Analytics</h2>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Laminar Flow Intelligence Layer</p>
                    </div>
                </div>

                {/* Subject Selector */}
                <div className="flex items-center gap-3 bg-white p-2 pl-4 rounded-2xl border-2 border-gray-100 shadow-sm">
                    <span className="text-[10px] font-black uppercase text-gray-400">Viewing Data For:</span>
                    <select 
                        value={selectedSubjectId}
                        onChange={(e) => {
                            setSelectedSubjectId(e.target.value);
                            setSelectedUnit(null); // Reset drill-down
                        }}
                        className="bg-gray-50 border-none text-sm font-black text-[#730FFF] focus:ring-0 cursor-pointer rounded-xl px-4 py-2 uppercase italic"
                    >
                        {Object.keys(MOCK_MASTERY_DATA).map(id => (
                            <option key={id} value={id}>{id} - {MOCK_MASTERY_DATA[id].subjectName}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* Radar Chart Card */}
                <div className="bg-white p-8 rounded-[32px] border-2 border-gray-100 shadow-xl">
                    <div className="flex justify-between items-start mb-6">
                        <h3 className="text-lg font-black text-gray-800 uppercase tracking-tight">Unit Overview</h3>
                        <span className="text-[10px] font-black bg-gray-100 px-3 py-1 rounded-full text-gray-500">{selectedSubjectId} - ANALYTICS</span>
                    </div>
                    <MasteryRadarChart 
                        data={currentMasteryData} 
                        onUnitClick={(unit) => setSelectedUnit(unit)} 
                    />
                    <p className="mt-6 text-center text-xs font-bold text-gray-400 italic">
                        * Click on a label to drill down into specific topic mastery
                    </p>
                </div>

                {/* Topic Bar Chart Card */}
                <div className="bg-white p-8 rounded-[32px] border-2 border-gray-100 shadow-xl overflow-hidden relative">
                    {selectedUnit ? (
                        <>
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h3 className="text-lg font-black text-gray-800 uppercase tracking-tight">{selectedUnit.unitName.split(':')[0]} Topics</h3>
                                    <p className="text-[10px] font-bold text-[#730FFF] uppercase">Granular Performance Analysis</p>
                                </div>
                                <button 
                                    onClick={() => setSelectedUnit(null)}
                                    className="text-[10px] font-black text-gray-400 hover:text-red-500 uppercase tracking-tighter"
                                >
                                    CLEAR SELECTION ✕
                                </button>
                            </div>
                            <div className="h-[300px]">
                                <TopicBarChart unit={selectedUnit} />
                            </div>
                        </>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-center p-10">
                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 text-gray-300">
                                <BarChart3 size={32} />
                            </div>
                            <h3 className="text-gray-400 font-black uppercase text-sm">Select a Unit to view Details</h3>
                            <p className="text-[11px] text-gray-300 font-bold mt-2 leading-relaxed">
                                Our AI calculates mastery based on your <br/> Quiz attempts and Flashcard recall history.
                            </p>
                        </div>
                    )}
                </div>
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
