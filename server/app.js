import express from "express";
import { Server } from "socket.io";
import { createServer } from "http";
import cors from "cors";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";

const port = 3000;
const secretKeyJwt = "nskafdnkdawer";

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  })
);

app.get("/", (req, res) => {
  res.send("hello world....");
});

app.get("/login", (req, res) => {
  const token = jwt.sign({ _id: "asdfgfdsaaasds" }, secretKeyJwt);

  res
    .cookie("token", token, { httpOnly: true, secure: true, sameSite: "none" })
    .json({
      message: "Login Success",
    });
});

const user = false;
io.use((socket, next) => {
  cookieParser()(socket.request, socket.request.res, (err) => {
    if (err) return next(err);

    const token = socket.request.cookies.token;

    if (!token) return next(new Error("Authentication Error"));

    const decoded = jwt.verify(token, secretKeyJwt);

    next();
  });
});

io.on("connection", (socket) => {
  console.log("user connected", socket.id);

  socket.on("message", ({ room, message }) => {
    console.log({ room, message });

    io.to(room).emit("receive-message", message);
    // socket.broadcast.emit("receive-message", data);

    // io.emit("receive-message",data);
  });
  //   console.log("Id", socket.id);
  //   socket.emit("welcome",`Welcome to the server,${socket.id}`);
  //   socket.broadcast.emit("welcome",`${socket.id} joined the server`);

  socket.on("join-room", (room) => {
    socket.join(room);
  });

  socket.on("disconnect", () => {
    console.log("User Disconnected", socket.id);
  });
});

server.listen(port, () => {
  console.log(`server is running on port ${port}`);
});
