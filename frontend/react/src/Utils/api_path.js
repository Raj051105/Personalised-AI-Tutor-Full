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
    }
}