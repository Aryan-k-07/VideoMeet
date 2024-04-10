import React from "react";
import { useContext } from "react";
import { createContext,useMemo } from "react";
import {io} from "socket.io-client"

const socketContext=createContext(null);

export const useSocket=()=>{
    const socket=useContext(socketContext);
    return socket;
}

export const SocketProvider=(props)=>{
    const socket = useMemo(() => {
        const options = {
          // Explicitly set the version to match server-side (if known)
          // or remove if version compatibility is uncertain
          // version: '4', // Adjust based on server version
          transports: ['websocket'], // Ensure only websocket transport is used
          reconnection: true, // Enable reconnection attempts
          reconnectionDelay: 1000, // Set reconnection delay in milliseconds
          reconnectionAttempts: Infinity, // Attempt reconnection indefinitely
        };
        return io("https://video-meet-server-brown.vercel.app", options);
      }, []);
    

    return(
        <socketContext.Provider value={socket}>
            {props.children}
        </socketContext.Provider>
    )
}