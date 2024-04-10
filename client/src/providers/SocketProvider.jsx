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
    const socket=useMemo(()=>io("https://video-meet-server-brown.vercel.app"),[])
    return(
        <socketContext.Provider value={socket}>
            {props.children}
        </socketContext.Provider>
    )
}