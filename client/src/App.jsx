import React from "react"
import {Routes,Route} from "react-router-dom"
import Lobby from "./components/Lobby.jsx"
import Room from "./components/Room.jsx"
import CancelCall from "./components/CancelCall.jsx"

function App() {


  return (
    <>
    <div>
      <Routes>
        <Route path="/" element={<Lobby></Lobby>} />
        <Route path="/room/:roomId" element={<Room></Room>} />
        <Route path="/cancelCall" element={<CancelCall></CancelCall>}/>
      </Routes>
    </div>
    </>
  )
}

export default App;
