import axios from "axios";
import { createContext, useEffect, useState } from "react";

export const AuthContext = createContext();

export const AuthContextProvider = (props) => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userData, setUserData] = useState(null);
    const [token, setToken] = useState(null); // Added token state

    const getAuthState = async () => {
        try {
            const res = await axios.get(backendUrl + '/api/auth/is-auth', { withCredentials: true });
            setIsLoggedIn(true);
            
            console.log("Auth check response:", res.data);
            
            // Extract token from response if available
            if (res.data?.token) {
                setToken(res.data.token);
                localStorage.setItem('token', res.data.token);
            }

            await getUserData();
        } catch (error) {
            console.log(error.response?.data?.message);
            setIsLoggedIn(false);
            setToken(null);
            localStorage.removeItem('token');
        }
    };

    const getUserData = async () => {
        try {
            const res = await axios.get(backendUrl + '/api/user/user-data', { withCredentials: true });
            setUserData(res.data?.userData);
            
            // If token is in response, store it
            if (res.data?.token) {
                setToken(res.data.token);
                localStorage.setItem('token', res.data.token);
            }
        
            console.log("Fetched userData:", res.data?.userData);

        } catch (error) {
            console.log(error.response?.data?.message);
            setUserData(null);
        }
    };

    // Function to manually set token (useful for login)
    const setAuthToken = (newToken) => {
        setToken(newToken);
        if (newToken) {
            localStorage.setItem('token', newToken);
        } else {
            localStorage.removeItem('token');
        }
    };

    // Function to logout
    const logout = () => {
        setIsLoggedIn(false);
        setUserData(null);
        setToken(null);
        localStorage.removeItem('token');
    };

    useEffect(() => {
        getAuthState();
        
        // Check localStorage for token on mount
        const storedToken = localStorage.getItem('token');
        if (storedToken) {
            setToken(storedToken);
        }
    }, []);

    const value = {
        backendUrl,
        isLoggedIn,
        setIsLoggedIn,
        userData,
        setUserData,
        getUserData,
        token, // Added token to context
        setToken: setAuthToken, // Added setToken function
        logout // Added logout function
    };

    return (
        <AuthContext.Provider value={value}>
            {props.children}
        </AuthContext.Provider>
    );
};