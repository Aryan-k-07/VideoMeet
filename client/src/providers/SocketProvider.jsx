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
        const socket = io("https://video-meet-server-brown.vercel.app", {
            transports: ["websocket"],
            upgrade: false,
            autoConnect: true,
            reconnectionAttempts: 3,
            timeout: 10000,
        });

        socket.on("connect_error", (error) => {
            console.log("WebSocket connection error:", error);
        });

        return socket;
    }, []);
    

    return(
        <socketContext.Provider value={socket}>
            {props.children}
        </socketContext.Provider>
    )
}