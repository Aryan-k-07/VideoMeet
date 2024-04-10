import React, { useEffect, useState, useCallback } from "react";
import { useSocket } from "../providers/SocketProvider.jsx"
import ReactPlayer from "react-player"
import peer from "../services/Service.js"
import { emailFromLobby } from "./Lobby.jsx";
import { useNavigate } from "react-router-dom";

function Room() {
    const [remoteSocketId, setRemoteSocketId] = useState(null);
    const [myStream, setMyStream] = useState(null);
    const [remoteStream, setRemoteStream] = useState(null);
    const [joiner, setJoiner] = useState(null);
    const [creator, setCreator] = useState(null);
    const [remoteStreamStarted, setRemoteStreamStarted] = useState(null);
    const [creatorName, setCreatorName] = useState("");
    const [joinerName, setJoinerName] = useState("");
    const [creatorNameNew, setCreatorNameNew] = useState("");
    const [joinerNameNew, setJoinerNameNew] = useState("");
    const [muteIcon, setMuteIcon] = useState(false);
    const [cameraIcon, setCameraIcon] = useState(false);
    const navigate = useNavigate();

    const socket = useSocket();


    const handleCallUser = useCallback(async () => {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
        const offer = await peer.newOffer();
        const emailFromLobbyNew = emailFromLobby;
        socket.emit("user:call", { to: remoteSocketId, offer, emailFromLobbyNew });
        setMyStream(stream);
        // console.log("handleCallUser");
        // console.log("SOCKET",socket);
        // console.log("myStreamFirst",myStream);
    }, [remoteSocketId, socket])

    const handleRoomJoin = useCallback((data) => {
        const { email, id } = data;
        // console.log("name", email);
        setJoinerName(email);
        setCreatorNameNew(emailFromLobby);
        //console.log("id",id);
        setCreator(id);
        //console.log("creator",creator);
        setRemoteSocketId(id);
        // console.log("SOCKET",socket);
        //console.log("remoteSocketId",remoteSocketId);
        // console.log("Another user joined",data);
    }, [])

    const handleIncomingCall = useCallback(async (data) => {
        const { from, offer, emailFromLobbyNew } = data;
        setCreatorName(emailFromLobbyNew);
        setJoinerNameNew(emailFromLobby);
        // console.log("emailFromLobbyName",emailFromLobbyNew);
        setJoiner(from);
        setRemoteSocketId(from);
        // console.log(`from:${from} and offer:${offer}`);
        if(!myStream) {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: true,
                video: true,
            });
            setMyStream(stream);
        }
        
        
        // setCreatorName(emailFromLobby);
        // console.log("emailFromLobby",emailFromLobby);
        // console.log("stream",stream);
        // console.log(`Incoming Call`, from, offer);
        const ans = await peer.newAnswer(offer);
        // console.log("SOCKET",socket);
        socket.emit("call:accepted", { to: from, ans });
    }, [socket])

    const sendStreams = useCallback(() => {
        for (const track of myStream.getTracks()) {
            peer.peer.addTrack(track, myStream);
        }
        setRemoteStreamStarted(1);
        // console.log("SOCKET",socket);
        // console.log("myStream",myStream);
    }, [myStream])

    // peer.peer.addEventListener("track",async(ev)=>{
    //     const remoteStream=ev.streams;
    //     setRemoteStream(remoteStream[0]);
    //     console.log("myStream",myStream);
    // })

    const handleCallAccepted = useCallback(async (data) => {
        const { from, ans } = data;
        // console.log("myStream",myStream);
        await peer.setLocalDescription(ans);
        // console.log("Call Accepted!!!");

        sendStreams();
    }, [sendStreams])

    const handleNegoNeeded = useCallback(async () => {
        const offer = await peer.newOffer();
        socket.emit("peer:nego:needed", { to: remoteSocketId, offer });
    }, [remoteSocketId, socket])

    useEffect(() => {
        peer.peer.addEventListener("negotiationneeded", handleNegoNeeded);
        return () => {
            peer.peer.removeEventListener("negotiationneeded", handleNegoNeeded);
        }
    }, [handleNegoNeeded])

    // useEffect(()=>{
    //     peer.peer.addEventListener("track",async(ev)=>{
    //         const remoteNewStream=ev.streams;
    //         setRemoteStream(remoteNewStream[0]);
    //         console.log("recieverStream",remoteNewStream);
    //         console.log("remoteStream",remoteStream);
    //         // console.log("myStream",myStream);
    //     })
    // },[])


    useEffect(() => {
        const handleTrackEvent = async (ev) => {
            const remoteNewStream = ev.streams;
            setRemoteStream(remoteNewStream[0]);
            // console.log("recieverStream", remoteNewStream);
            // console.log("remoteStream", remoteNewStream);
            // console.log("myStream", myStream);
        };

        peer.peer.addEventListener("track", handleTrackEvent);

        return () => {
            peer.peer.removeEventListener("track", handleTrackEvent);
        };
    }, [peer]);



    const handleNegoNeedIncoming = useCallback(async ({ from, offer }) => {
        const ans = await peer.newAnswer(offer);
        socket.emit("peer:nego:done", { to: from, ans });
        // console.log("peer:nego:done",ans);
    }, [socket])

    const handleNegoNeedFinal = useCallback(async ({ from, ans }) => {
        await peer.setLocalDescription(ans);
        // console.log("finalNego",ans);
    }, [])

    const cancelCall = useCallback(async () => {
        // await navigator.mediaDevices.getUserMedia({
        //     audio: false,
        //     video: false,
        // });
        if(myStream) {
            const videoTracks = await myStream.getVideoTracks();
            await videoTracks[0].stop();
            const audioTracks = await myStream.getAudioTracks();
            await audioTracks[0].stop();
            socket.emit("cancelCall", { to: remoteSocketId });
            // console.log(remoteSocketId);
            // console.log(socket.id);
            navigate(`/cancelCall`)
        }
        
    }, [myStream, socket, remoteSocketId])

    const muteCall = useCallback(async () => {
        if (myStream) {
            const audioTracks = await myStream.getAudioTracks();
            audioTracks[0].enabled = false;
            setMuteIcon(true);
        }
    }, [myStream])

    const unMuteCall = useCallback(async () => {
        if(myStream) {
            const audioTracks = await myStream.getAudioTracks();
            audioTracks[0].enabled = true;
            setMuteIcon(false);
        }
    }, [myStream])

    const offCamera = useCallback(async () => {
        if(myStream) {
            const videoTracks = await myStream.getVideoTracks();
            videoTracks[0].enabled = false; // Disable the video track
            setCameraIcon(true);
        }
    }, [myStream]);

    const onCamera = useCallback(async () => {
        if(myStream) {
            const videoTracks = await myStream.getVideoTracks();
            videoTracks[0].enabled = true; // Enable the video track
            setCameraIcon(false);
        }
    }, [myStream]);

    const handleCancelCall = useCallback(async ({ from, msg }) => {
        const videoTracks = await myStream.getVideoTracks();
        await videoTracks[0].stop();
        const audioTracks = await myStream.getAudioTracks();
        await audioTracks[0].stop();
        // console.log(msg);
        navigate(`/cancelCall`);
    }, [myStream])

    useEffect(() => {
        socket.on("user:joined", handleRoomJoin);
        socket.on("incomming:call", handleIncomingCall);
        socket.on("call:accepted", handleCallAccepted);
        socket.on("peer:nego:needed", handleNegoNeedIncoming);
        socket.on("peer:nego:final", handleNegoNeedFinal);
        socket.on("cancelCall", handleCancelCall);
        return () => {
            socket.off("user:joined", handleRoomJoin);
            socket.off("incomming:call", handleIncomingCall);
            socket.off("call:accepted", handleCallAccepted);
            socket.off("peer:nego:needed", handleNegoNeedIncoming);
            socket.off("peer:nego:final", handleNegoNeedFinal);
            socket.off("cancelCall", handleCancelCall);
        }
    }, [socket, handleRoomJoin, handleIncomingCall, handleCallAccepted, handleNegoNeedIncoming, handleNegoNeedFinal, handleCancelCall])

    return (
        <>
            {



                <div className="bg-gradient-to-r from-cyan-500 to-blue-500 h-screen">
                    <h1 className="text-center text-4xl font-body">VIDEO CALL</h1>
                    <h4 className="text-center font-body text-xl">{remoteSocketId ? `connected to ${joinerName ? joinerName : creatorName}` : "no one in room"}</h4>
                    <br></br>
                    <div className="text-center">
                        {joiner && myStream &&

                            <div className="flex space-x-8 justify-center ">

                                <button className="border-2 border-gray-700 px-2 py-1 rounded bg-green-300" onClick={sendStreams}>
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.25 9.75v-4.5m0 4.5h4.5m-4.5 0 6-6m-3 18c-8.284 0-15-6.716-15-15V4.5A2.25 2.25 0 0 1 4.5 2.25h1.372c.516 0 .966.351 1.091.852l1.106 4.423c.11.44-.054.902-.417 1.173l-1.293.97a1.062 1.062 0 0 0-.38 1.21 12.035 12.035 0 0 0 7.143 7.143c.441.162.928-.004 1.21-.38l.97-1.293a1.125 1.125 0 0 1 1.173-.417l4.423 1.106c.5.125.852.575.852 1.091V19.5a2.25 2.25 0 0 1-2.25 2.25h-2.25Z" />
                                    </svg>

                                </button>



                                <button className="border-2 border-gray-700 px-2 py-1 rounded bg-red-300" onClick={cancelCall} >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 3.75 18 6m0 0 2.25 2.25M18 6l2.25-2.25M18 6l-2.25 2.25m1.5 13.5c-8.284 0-15-6.716-15-15V4.5A2.25 2.25 0 0 1 4.5 2.25h1.372c.516 0 .966.351 1.091.852l1.106 4.423c.11.44-.054.902-.417 1.173l-1.293.97a1.062 1.062 0 0 0-.38 1.21 12.035 12.035 0 0 0 7.143 7.143c.441.162.928-.004 1.21-.38l.97-1.293a1.125 1.125 0 0 1 1.173-.417l4.423 1.106c.5.125.852.575.852 1.091V19.5a2.25 2.25 0 0 1-2.25 2.25h-2.25Z" />
                                    </svg>

                                </button>

                                {
                                    !muteIcon && <button className="border-2 border-gray-700 px-2 py-1 rounded bg-gray-300" onClick={muteCall}>
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 9.75 19.5 12m0 0 2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25m-10.5-6 4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" />
                                        </svg>


                                    </button>
                                }

                                {
                                    muteIcon && <button className="border-2 border-gray-700 px-2 py-1 rounded bg-gray-300" onClick={unMuteCall}>
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 0 1 0 12.728M16.463 8.288a5.25 5.25 0 0 1 0 7.424M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" />
                                        </svg>



                                    </button>
                                }

                                {
                                    !cameraIcon && <button className="border-2 border-gray-700 px-2 py-1 rounded bg-blue-300" onClick={offCamera} >
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M12 18.75H4.5a2.25 2.25 0 0 1-2.25-2.25V9m12.841 9.091L16.5 19.5m-1.409-1.409c.407-.407.659-.97.659-1.591v-9a2.25 2.25 0 0 0-2.25-2.25h-9c-.621 0-1.184.252-1.591.659m12.182 12.182L2.909 5.909M1.5 4.5l1.409 1.409" />
                                        </svg>


                                    </button>
                                }

                                {
                                    cameraIcon && <button className="border-2 border-gray-700 px-2 py-1 rounded bg-blue-300" onClick={onCamera} >
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
                                        </svg>



                                    </button>
                                }



                            </div>
                        }
                        {/* <br></br> */}
                        {creator && remoteSocketId &&
                            <div className="flex space-x-8 justify-center ">

                                <button className="border-2 border-gray-700 px-2 py-1 rounded bg-green-300" onClick={handleCallUser}>
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 3.75v4.5m0-4.5h-4.5m4.5 0-6 6m3 12c-8.284 0-15-6.716-15-15V4.5A2.25 2.25 0 0 1 4.5 2.25h1.372c.516 0 .966.351 1.091.852l1.106 4.423c.11.44-.054.902-.417 1.173l-1.293.97a1.062 1.062 0 0 0-.38 1.21 12.035 12.035 0 0 0 7.143 7.143c.441.162.928-.004 1.21-.38l.97-1.293a1.125 1.125 0 0 1 1.173-.417l4.423 1.106c.5.125.852.575.852 1.091V19.5a2.25 2.25 0 0 1-2.25 2.25h-2.25Z" />
                                    </svg>

                                </button>



                                <button className="border-2 border-gray-700 px-2 py-1 rounded bg-red-300" onClick={cancelCall}>
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 3.75 18 6m0 0 2.25 2.25M18 6l2.25-2.25M18 6l-2.25 2.25m1.5 13.5c-8.284 0-15-6.716-15-15V4.5A2.25 2.25 0 0 1 4.5 2.25h1.372c.516 0 .966.351 1.091.852l1.106 4.423c.11.44-.054.902-.417 1.173l-1.293.97a1.062 1.062 0 0 0-.38 1.21 12.035 12.035 0 0 0 7.143 7.143c.441.162.928-.004 1.21-.38l.97-1.293a1.125 1.125 0 0 1 1.173-.417l4.423 1.106c.5.125.852.575.852 1.091V19.5a2.25 2.25 0 0 1-2.25 2.25h-2.25Z" />
                                    </svg>

                                </button>

                                {
                                    !muteIcon && <button className="border-2 border-gray-700 px-2 py-1 rounded bg-gray-300" onClick={muteCall}>
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 9.75 19.5 12m0 0 2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25m-10.5-6 4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" />
                                        </svg>


                                    </button>
                                }

                                {
                                    muteIcon && <button className="border-2 border-gray-700 px-2 py-1 rounded bg-gray-300" onClick={unMuteCall}>
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 0 1 0 12.728M16.463 8.288a5.25 5.25 0 0 1 0 7.424M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" />
                                        </svg>



                                    </button>
                                }

                                {
                                    !cameraIcon && <button className="border-2 border-gray-700 px-2 py-1 rounded bg-blue-300" onClick={offCamera} >
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M12 18.75H4.5a2.25 2.25 0 0 1-2.25-2.25V9m12.841 9.091L16.5 19.5m-1.409-1.409c.407-.407.659-.97.659-1.591v-9a2.25 2.25 0 0 0-2.25-2.25h-9c-.621 0-1.184.252-1.591.659m12.182 12.182L2.909 5.909M1.5 4.5l1.409 1.409" />
                                        </svg>


                                    </button>
                                }

                                {
                                    cameraIcon && <button className="border-2 border-gray-700 px-2 py-1 rounded bg-blue-300" onClick={onCamera} >
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
                                        </svg>



                                    </button>
                                }



                            </div>
                        }
                    </div>
                    <br></br>
                    <br></br>
                    <div className="grid grid:cols:1 lg:grid-cols-2 md:grid-cols-2 sm:grid-cols-2 gap-4">
                        <div className="text-center">
                            {myStream && <h1 className="font-body text-2xl">{creatorNameNew ? `${creatorNameNew}` : `${joinerNameNew}`}</h1>}
                            {myStream &&
                                <div className="border-8 border-gray-700">
                                    <ReactPlayer playing volume={1} url={myStream} width="100%" height="auto" />
                                </div>
                            }
                        </div>
                        <div className="text-center">
                            {remoteStreamStarted && remoteStream && <h1 className="font-body text-2xl">{joinerName ? `${joinerName}` : `${creatorName}`}</h1>}
                            {remoteStreamStarted && remoteStream &&
                                <div className="border-8 border-gray-700">
                                    <ReactPlayer playing volume={1} url={remoteStream} width="100%" height="auto" />
                                </div>
                            }
                        </div>
                    </div>
                </div>



            }


        </>
    )
}

export default Room;











