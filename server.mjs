import { createServer } from "node:http";
import next from "next";
import { Server } from "socket.io";
import { networkInterfaces } from 'os';
const dev = process.env.NODE_ENV !== "production";
// Use 0.0.0.0 to listen on all network interfaces (needed for cross-device access)
const hostname = "localhost";
const port = 9930;
// when using middleware `hostname` and `port` must be provided below
const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

// Get the local IPV4 address ignoring internal addresses 
function getLocalIP() {
  const networks = networkInterfaces();
  const IPResults = Object.create(null); 

  for (const name of Object.keys(networks)) {
    for (const net of networks[name]) {
     
      if (net.family === 'IPv4' && !net.internal) {
        if (!IPResults[name]) {
          IPResults[name] = [];
        }
        IPResults[name].push(net.address);
      }
    }
  }
    //Return the first IPv4 address found, if any
    for (const interfaceName in IPResults) {
        if (Object.hasOwnProperty.bind(interfaceName) && IPResults[interfaceName].length > 0) {
            return IPResults[interfaceName][0];
        }
    }

  return null; // or undefined, or an empty array, etc.
}

app.prepare().then(() => {
  const httpServer = createServer(handler);
  const ipAddress = getLocalIP();


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
      if (ipAddress) {
        console.log(`> Access on another device at: http://${ipAddress}:${port}/setup or http://${ipAddress}:${port}/live`);
      } else {
        console.log('Could not retrieve local IP address.');
      }
    });
});