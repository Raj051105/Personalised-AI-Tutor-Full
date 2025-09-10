import { useContext, useEffect } from "react";
import { UserContext } from "../Context/userContext";
import { useNavigate } from "react-router-dom";

export const useUserAuth = () => {
    const { user, loading, clearUser } = useContext(UserContext);
    const navigate = useNavigate();

    useEffect(() => {
        // Don't do anything while loading
        if (loading) return;
        
        // If user exists, they're authenticated, no need to navigate
        if (user) return;

        // Only navigate if not loading and no user exists
        if (!loading && !user) {
            navigate('/login');
        }
    }, [user, loading, navigate]);

    return { user, loading, clearUser };
}