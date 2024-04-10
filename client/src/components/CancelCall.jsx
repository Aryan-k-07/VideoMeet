import React, { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

function CancelCall() {
    const navigate=useNavigate();

    const backToLobby=useCallback(()=>{
        navigate(`/lobby`);
    },[navigate])

    return (
        <>
            <div className="bg-gradient-to-r from-cyan-500 to-blue-500 h-screen text-center">
                <h1 className="text-4xl font-body mb-8">CALL DISCONNECTED</h1>
                <button className="border-2 border-gray-700 px-2 py-1 rounded bg-gray-300 text-center" onClick={backToLobby}>Lobby</button>
            </div>
        </>
    )
}

export default (CancelCall)
