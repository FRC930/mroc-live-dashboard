import { createServer } from "node:http";
import next from "next";
import { Server } from "socket.io";

const dev = process.env.NODE_ENV !== "production";
// Use 0.0.0.0 to listen on all network interfaces (needed for cross-device access)
const hostname = "0.0.0.0";
const port = 9930;
// when using middleware `hostname` and `port` must be provided below
const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(handler);

  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  io.on("connection", (socket) => {
    console.log('A client connected:', socket.id);
    
    // Handle match messaging events
    socket.on('MATCH_DATA_UPDATE', (payload) => {
      console.log('MATCH_DATA_UPDATE received:', payload);
      // Broadcast to all clients except sender
      socket.broadcast.emit('MATCH_DATA_UPDATE', payload);
    });

    socket.on('VIEW_MODE_CHANGE', (payload) => {
      console.log('VIEW_MODE_CHANGE received:', payload);
      socket.broadcast.emit('VIEW_MODE_CHANGE', payload);
    });

    socket.on('ALLIANCE_SELECTION', (payload) => {
      console.log('ALLIANCE_SELECTION received:', payload);
      socket.broadcast.emit('ALLIANCE_SELECTION', payload);
    });

    socket.on('ROBOT_SELECTION', (payload) => {
      console.log('ROBOT_SELECTION received:', payload);
      socket.broadcast.emit('ROBOT_SELECTION', payload);
    });

    socket.on('disconnect', () => {
      console.log('A client disconnected:', socket.id);
    });
  });

  httpServer
    .once("error", (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
    });
});