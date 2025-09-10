import React, { createContext, useEffect, useState, useCallback } from 'react'
import axiosInstance from '../Utils/axiosInstance';
import { API_PATH } from '../Utils/api_path';

export const UserContext = createContext({
    user: null,
    updateUser: () => {},
    clearUser: () => {},
    loading: true
});

const UserProvider = ({ children }) => {

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Memoize clearUser to prevent unnecessary re-renders
    const clearUser = useCallback(() => {
        setUser(null);
        localStorage.removeItem('token');
        delete axiosInstance.defaults.headers.common['Authorization'];
    }, []);

    useEffect(() => {
        const fetchUserProfile = async () => {
            const accessToken = localStorage.getItem("token");
        
            // If no token exists, stop loading immediately and don't make API call
            if(!accessToken){
                setLoading(false);
                return;
            }

            try {
                // Set the token in axios headers
                axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
                
                // Make API call to get user details
                const response = await axiosInstance.get(API_PATH.AUTH.GET_USER);
                
                const userData = {
                    ...response.data,
                    token: accessToken
                };
                
                setUser(userData);
            } catch (error) {
                // Clear invalid token and user data
                clearUser();
            } finally {
                // Always stop loading after API call (success or failure)
                setLoading(false);
            }
        };

        fetchUserProfile();
    }, [clearUser]);

    const updateUser = useCallback((userData) => {
        console.log('updateUser called with:', userData);
        setUser(userData);
        if (userData?.token) {
            localStorage.setItem('token', userData.token);
            axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${userData.token}`;
        }
        setLoading(false);
    }, []);
    
    return (
        <UserContext.Provider value={{user, updateUser, clearUser, loading}}>
            {children}
        </UserContext.Provider>
    )
}

export default UserProvider