import React, { useContext, useState, useEffect } from "react";
import { UserContext } from "../Context/userContext";
import BaseLayout from "../components/Layouts/BaseLayout";
import UnitModal from "../components/Modal/UnitModal";
import { CircleFadingPlus, Search } from "lucide-react";
import Cards from "../components/Cards/Cards";
import { API_PATH } from "../Utils/api_path";
import axiosInstance from "../Utils/axiosInstance";

const Subject = () => {
  const { user } = useContext(UserContext);
  const [query, setQuery] = useState("");
  const [subjects, setSubjects] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
    try {
      setLoading(true);
      setError(null);

      const response = await axiosInstance.get(API_PATH.SUBJECT.GET_ALL);
      let subjectsArr = [];

      if (response.data) {
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
    if (token) {
      fetchSubjects();
    } else {
      setError("No authentication token found. Please login.");
    }
  }, []);

  const filteredSubjects = subjects.filter((subject) => {
    const title = subject?.title?.toLowerCase() || "";
    const description = subject?.description?.toLowerCase() || "";
    const syllabus = subject?.syllabus?.toLowerCase() || "";

    return (
      title.includes(query.toLowerCase()) ||
      description.includes(query.toLowerCase()) ||
      syllabus.includes(query.toLowerCase())
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
            filteredSubjects.map((subject, idx) => (
              <Cards
                key={subject._id || idx}
                id={subject._id || idx}
                title={subject.title || ""}
                description={subject.description || ""}
                syllabus={subject.syllabus || ""}
                notes={subject.notes || []}
                createdAt={subject.createdAt || ""}
                onDelete={handleDeleteSubject}
              />
            ))
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
