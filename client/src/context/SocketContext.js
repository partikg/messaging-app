"use client";

import { createContext, useState, useEffect, useContext } from "react"; import { io } from "socket.io-client";

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const [token, setToken] = useState(null);

    useEffect(() => {
        if (typeof window !== "undefined") {
            setToken(localStorage.getItem("token"));
        }
    }, []);

    useEffect(() => {

        if (!token) return;

        if (socket) {
            socket.disconnect();
        }

        const newSocket = io("http://localhost:5000", {
            auth: { token },
        });

        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
        };
    }, [token]);

    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>);
};

export const useSocket = () => useContext(SocketContext);