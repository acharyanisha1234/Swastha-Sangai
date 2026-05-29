import { useState, useEffect, createContext } from "react";
import { io } from 'socket.io-client';

export const SocketContext = createContext(null);

export const SocketContextProvider = (props) => {
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        // Get token from localStorage directly
        const token = localStorage.getItem('token');
        
        console.log('Socket connecting with token:', token ? 'Yes' : 'No');
        
        const newSocket = io("http://localhost:5000", {
            auth: { token: token },
            transports: ['websocket']
        });

        newSocket.on('connect', () => {
            console.log('Socket connected');
        });

        newSocket.on('connect_error', (error) => {
            console.error('Socket connection error:', error);
        });

        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
        };
    }, []);

    return (
        <SocketContext.Provider value={socket}>
            {props.children}
        </SocketContext.Provider>
    );
};