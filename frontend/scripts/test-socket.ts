import { io } from "socket.io-client";

const SOCKET_URL = "http://localhost:5003";
const USER_ID = "user_38c567W20K4tmNnrfrNUQUlShoL";
const ROOM_ID = 1;

console.log(`Connecting to ${SOCKET_URL} as ${USER_ID}...`);

const socket = io(SOCKET_URL, {
  auth: { userId: USER_ID },
  transports: ["websocket"] 
});

socket.on("connect", () => {
  console.log("Connected! Socket ID:", socket.id);
  
  console.log("Sending ping...");
  socket.emit("test:ping");

  console.log(`Joining room ${ROOM_ID}...`);
  socket.emit("room:join", ROOM_ID);
});

socket.on("test:pong", (data) => {
    console.log("Received PONG:", data);
});

socket.on("room:participant_update", (data) => {
    console.log("Participant Update:", data);
});

socket.on("room:message", (msg) => {
    console.log("Received Message:", msg);
    if (msg.content === "Test from script") {
        console.log("SUCCESS: Self-message received!");
        process.exit(0);
    }
});

socket.on("room:error", (err) => {
    console.error("Room Error:", err);
    process.exit(1);
});

socket.on("connect_error", (err) => {
    console.error("Connection Error:", err.message);
    process.exit(1);
});

// Send a test message after a delay
setTimeout(() => {
    if (socket.connected) {
        console.log("Sending test message...");
        socket.emit("room:message", { roomId: ROOM_ID, content: "Test from script" });
    } else {
        console.log("Socket not connected, cannot send message.");
    }
}, 2000);

// Timeout
setTimeout(() => {
    console.log("Timeout reached. Exiting.");
    process.exit(1);
}, 10000);
