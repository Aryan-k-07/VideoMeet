import React, { useEffect } from "react";
import { useState } from "react";
import { useSocket } from "../providers/SocketProvider.jsx"
import { useNavigate } from "react-router-dom";

export let emailFromLobby;


function Lobby() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("")
    const [room, setRoom] = useState("")
    const socket = useSocket();

    const handleJoinRoom = (data) => {
        const { email, room } = data;
        // console.log(email,room);   
        if(room.length>=6) navigate(`/room/${room}`);
    }

    useEffect(() => {
        // socket.on("connect",()=>{
        // console.log("socket connected at client side",socket.id);
        // })
        socket.on("room:join", handleJoinRoom)
        return () => {
            socket.off("room:join", handleJoinRoom)
        }
    }, [handleJoinRoom, socket, navigate])

    

    function Submit(e) {
        e.preventDefault();
        socket.emit("room:join", { email, room });
        // console.log(email,room);
        // if(!tried) emailFromLobby=email;
        // tried=true;
        emailFromLobby = email;
        // console.log("emailFromLobby",emailFromLobby);
        setEmail("")
        setRoom("")
    }

    function generateRandomId() {
        // console.log(randomId);
        const randomRoomNumber=Math.floor(100000 + Math.random() * 900000);
        const randomRoomNumberString=randomRoomNumber.toString();
        // setRoom(randomId);
        setRoom(randomRoomNumberString);
        // console.log(randomRoomNumberString.length);
    }

    return (
        <div className="bg-gradient-to-r from-cyan-500 to-blue-500">
            <div className="w-1/2 mx-auto flex h-screen justify-center items-center">
                <form className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4" >
                    <div className="mb-4">
                        <label className="block text-gray-700 text-lg font-bold mb-2 font-body" htmlFor="email">
                            Username
                        </label>
                        <input
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" placeholder="Username"
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div className="mb-6">
                        <label className="block text-gray-700 text-lg font-bold mb-2 font-body" htmlFor="room">
                            Room Id
                            <label>(length &gt;= 6)</label>

                        </label>
                        <input
                            className="shadow appearance-none border  rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline" 
                            placeholder="********"
                            type="text"
                            id="room"
                            value={room}
                            // readOnly={true}
                            onChange={(e) => setRoom(e.target.value)}
                        />

                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <button
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                            type="button"
                            onClick={generateRandomId}
                        >
                            Room Id
                        </button>
                        <button
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                            type="button"
                            onClick={Submit}
                        >
                            Join Room
                        </button>
                    </div>
                </form>
            </div>
        </div>

    )
}

export default Lobby;





