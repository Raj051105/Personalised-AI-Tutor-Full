export const BASE_URL = "http://localhost:3001/";
// RAG backend (FastAPI) used for LLM & generation endpoints
export const RAG_URL = "http://localhost:8000/";

export const API_PATH ={
    AUTH:{
        LOGIN:'auth/login',
        GET_USER:'auth/getUser',
    },
    SUBJECT:{
        GET_ALL:'subject/get-all-subject',
        GET_NAME:(name) => `subject/get-subject/${name}`,
        CREATE_SUBJECT:'subject/create-subject',
        GET_RECENT:'subject/get-recent',
        DELETE_SUBJECT:(id) => `subject/delete-subject/${id}`,
    },
    QUIZ: {
        GET_BY_SUBJECT: (subject_code) => `quiz/subject/${subject_code}`,
        SAVE_QUIZ: 'quiz/save',
        SUBMIT_ATTEMPT: (quizId) => `quiz/attempt/${quizId}`,
        GET_ATTEMPTS: 'quiz/attempts',
        GET_QUIZ: (quizId) => `quiz/${quizId}`,
    }
}