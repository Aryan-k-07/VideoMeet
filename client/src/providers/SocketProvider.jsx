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
        const socket = io("https://video-meet-server-qj1mxjprp-aryan-kshirsagars-projects.vercel.app", {
            transports: ["websocket"],
        });

        socket.on("connect_error", (error) => {
            console.error("WebSocket connection error:", error);
            // Log the error object directly
            console.error("WebSocket connection error details:", error);
        });

        return socket;
    }, []);
    

    return(
        <socketContext.Provider value={socket}>
            {props.children}
        </socketContext.Provider>
    )
}