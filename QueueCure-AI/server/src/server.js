const http = require("http");
const { Server } = require("socket.io");

const app = require("./app");

const {
  setSocketInstance,
} = require("./services/socketService");

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

setSocketInstance(io);

io.on("connection", (socket) => {
  console.log("Connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("Disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});