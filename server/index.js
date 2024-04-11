import {Server} from "socket.io";
import express from "express";
import cors from "cors";

const app = express();

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true,
}));

const server = app.listen(8000);



const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",
        credentials: true,
        methods: ["GET", "POST"]
    }
});

io.on("connection",(socket)=>{
    console.log("socket connected at server side",socket.id);
    socket.on("room:join",(data)=>{
        const {email,room}=data;
        io.to(room).emit("user:joined",{email,id:socket.id});
        socket.join(room);
        io.to(socket.id).emit("room:join",data);
        
         // io.to(room).emit("room:join",{id:socket.id});
    })


    socket.on("user:call",(data)=>{
        const {to,offer,emailFromLobbyNew}=data;
        io.to(to).emit("incomming:call",{from:socket.id,offer,emailFromLobbyNew});
    })

    socket.on("call:accepted",(data)=>{
        const {to,ans}=data;
        io.to(to).emit("call:accepted",{from:socket.id,ans});
    })

    // socket.on("call:accepted", ({ to, answer }) => {
    //         io.to(to).emit("call:accepted", { from: socket.id, answer });
    //       });

    socket.on("peer:nego:needed",({to,offer})=>{
        io.to(to).emit("peer:nego:needed",{from:socket.id,offer});
    })

    socket.on("peer:nego:done",({to,ans})=>{
        io.to(to).emit("peer:nego:final",({from:socket.id,ans}));
    })

    socket.on("cancelCall",({to})=>{
        const msg="call disconnected";
        io.to(to).emit("cancelCall",{from:socket.id,msg});
    })
})












