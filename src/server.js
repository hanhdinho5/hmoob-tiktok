import { giftCatalog } from './lib/giftCatalog.js';
import giftCatalogService from './services/GiftCatalogService.js';
import { validControlRoom, displayCount, publishDisplayStatus } from './lib/displayControl.js';
/**
 * server.js
 * Main entry point - Express + Socket.io Server
 *
 * MULTI-TENANT ARCHITECTURE:
 * - Each streamer = 1 isolated Socket.io Room
 * - Room ID = TikTok username
 * - Data isolation: Streamer A cannot see Streamer B's data
 *
 * @module server
 */

import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import tiktokService from "./services/TikTokService.js";

// ES Module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ==========================================
// SERVER INITIALIZATION
// ==========================================
const app = express();
const server = createServer(app);

// Socket.io with CORS enabled for development
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

const PORT = process.env.PORT || 3000;
const virtualCrowdSettings = new Map();

// ==========================================
// MIDDLEWARE & STATIC FILES
// ==========================================

// Old overlay/control links (pre-cleanup) keep working and keep their query string.
app.get(["/games/virtual-crowd/index.html", "/games/virtual-crowd/", "/games/horse-racing/", "/games/horse-racing/index.html"], (req, res) => {
  const query = req.url.includes("?") ? req.url.slice(req.url.indexOf("?")) : "";
  res.redirect(`/games/hmong-3d/index.html${query}`);
});
app.get("/games/virtual-crowd/dashboard.html", (req, res) => {
  const query = req.url.includes("?") ? req.url.slice(req.url.indexOf("?")) : "";
  res.redirect(`/games/hmong-3d/dashboard.html${query}`);
});

// Serve static files from public directory
app.use(express.static(join(__dirname, "../public")));
// Local Three.js modules for the opt-in 3D overlay; existing games keep their routes.
app.use("/vendor/three/build", express.static(join(__dirname, "../node_modules/three/build")));
app.use("/vendor/three/addons", express.static(join(__dirname, "../node_modules/three/examples/jsm")));

// Parse JSON body
app.use(express.json());

// ==========================================
// API ROUTES
// ==========================================

/**
 * Health check endpoint
 * @route GET /api/health
 */
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    stats: tiktokService.getStats(),
  });
});

/**
 * Get connection statistics
 * @route GET /api/stats
 */
// The existing live connection already holds gift names, prices and CDN images.
async function serveGiftCatalog(req,res){
 const username=String(req.params.username||'').trim().toLowerCase().replace(/^@/,'');
 if(username&&!/^[a-z0-9_.]{1,64}$/.test(username))return res.status(400).json({error:'Username không hợp lệ'});
 const connection=tiktokService.connections.get(username)?.connection;
 try{const existing=giftCatalog(connection?.availableGifts),gifts=existing.length?existing:await giftCatalogService.get();res.json({username,gifts});}
 catch{res.status(503).json({error:'Chưa tải được danh sách quà từ TikTok. Hãy thử lại sau.'});}
}
app.get('/api/gifts',serveGiftCatalog);
app.get('/api/gifts/:username',serveGiftCatalog);

app.get("/api/stats", (req, res) => {
  res.json(tiktokService.getStats());
});

// ==========================================
// SOCKET.IO - REALTIME CONNECTION HANDLING
// ==========================================

io.on("connection", (socket) => {
  console.log(`[Socket] Client connected: ${socket.id}`);

  /**
   * JOIN ROOM HANDLER
   *
   * IMPORTANT - DATA ISOLATION:
   * - Each client joins a room based on streamer's username
   * - Client only receives events from their subscribed streamer
   * - Ensures data isolation between different streamers
   */
  socket.on("join-room", async (username, acknowledge) => {
    // Validate username
    if (!username || typeof username !== "string") {
      socket.emit("error", { message: "Invalid username" });
      if(typeof acknowledge==='function')acknowledge({ok:false,message:'Username không hợp lệ'});
      return;
    }

    // Normalize username (lowercase, trimmed)
    const normalizedUsername = username.toLowerCase().trim().replace(/^@/,'');
    if(!/^[a-z0-9_.]{1,64}$/.test(normalizedUsername)){if(typeof acknowledge==='function')acknowledge({ok:false,message:'Username không hợp lệ'});return;}
    const previousUsername=socket.tiktokUsername;
    if(previousUsername&&previousUsername!==normalizedUsername){socket.leave(previousUsername);tiktokService.removeClientFromRoom(previousUsername);}

    // Store username in socket instance for disconnect handling
    socket.tiktokUsername = normalizedUsername;

    // Join Socket.io room
    socket.join(normalizedUsername);
    console.log(`[Socket] ${socket.id} joined room: ${normalizedUsername}`);

    // Update room client tracking
		if(previousUsername!==normalizedUsername)tiktokService.addClientToRoom(normalizedUsername);

		const savedCrowdSettings = virtualCrowdSettings.get(normalizedUsername);
		if (savedCrowdSettings) {
			socket.emit("virtual_crowd_control", {
				action: "settings",
				payload: savedCrowdSettings,
				timestamp: Date.now(),
			});
		}

    // Connect to TikTok Live (reuses existing connection if available)
    try {
      const connected = await tiktokService.connect(normalizedUsername, io);
      if(!socket.connected||socket.tiktokUsername!==normalizedUsername){if(typeof acknowledge==='function')acknowledge({ok:false,username:normalizedUsername,message:'Yêu cầu đã được thay đổi'});return;}
      if (connected) {
        socket.emit("room-joined", {
          room: normalizedUsername,
          message: `Joined room: ${normalizedUsername}`,
        });
        if(typeof acknowledge==='function')acknowledge({ok:true,username:normalizedUsername});
      } else {
        socket.emit("connection-error", {
          message: `Cannot connect to ${normalizedUsername}'s live. Make sure they are currently streaming!`,
        });
        if(typeof acknowledge==='function')acknowledge({ok:false,username:normalizedUsername,message:`Không kết nối được @${normalizedUsername}. Kiểm tra tài khoản đang LIVE rồi bấm thử lại.`});
      }
    } catch (error) {
      console.error(`[Socket] Error connecting to TikTok: ${error.message}`);
      socket.emit("connection-error", {
        message: error.message,
      });
      if(typeof acknowledge==='function')acknowledge({ok:false,username:normalizedUsername,message:error.message});
    }
  });

  /**
   * LEAVE ROOM HANDLER
   */
  socket.on("leave-room", (username) => {
    if (username) {
      const normalizedUsername = username.toLowerCase().trim();
      if(socket.tiktokUsername===normalizedUsername){socket.leave(normalizedUsername);tiktokService.removeClientFromRoom(normalizedUsername);socket.tiktokUsername=null;}
      console.log(`[Socket] ${socket.id} left room: ${normalizedUsername}`);
    }
  });

  /**
   * DISCONNECT HANDLER
   *
   * When client disconnects, update room count.
   * If room is empty for too long, TikTokService will auto-disconnect.
   */
  socket.on("disconnect", () => {
    console.log(`[Socket] Client disconnected: ${socket.id}`);

    if (socket.tiktokUsername) {
      tiktokService.removeClientFromRoom(socket.tiktokUsername);
    }
    publishDisplayStatus(io,socket.data.displayControlRoom);
  });

  /**
   * Debug: Ping-pong for connection testing
   */
	socket.on("ping", () => {
		socket.emit("pong", { timestamp: Date.now() });
	});

	/** Local control dashboard → Virtual Crowd overlay */
	// Private local display rooms do not create a TikTok connection.
	socket.on('join-control-room',(room,acknowledge)=>{
		if(typeof room!=='string'||!/^local_[a-f0-9]{32}$/.test(room)){
			if(typeof acknowledge==='function')acknowledge({ok:false});return;
		}
		socket.join(room);
		const saved=virtualCrowdSettings.get(room);
		if(saved)socket.emit('virtual_crowd_control',{action:'settings',payload:saved,timestamp:Date.now()});
		io.to(room).emit('control-room-ready',{room,socketId:socket.id});
		publishDisplayStatus(io,room);
		for(const client of io.sockets.sockets.values())if(client.data.displayControlRoom===room&&client.data.tiktokDisplayStatus)socket.emit('tiktok-display-status',client.data.tiktokDisplayStatus);
		if(typeof acknowledge==='function')acknowledge({ok:true});
	});
	socket.on('display-control-ready',(room)=>{
		if(!validControlRoom(room)||!socket.rooms.has(room))return;
		socket.data.displayControlRoom=room;publishDisplayStatus(io,room);
	});
	socket.on('display-tiktok-status',message=>{
		const room=socket.data.displayControlRoom;
		if(!room||message?.room!==room||!['connecting','connected','disconnected','reconnecting','error','local'].includes(message.type)||typeof message.message!=='string')return;
		const state={room,type:message.type,username:String(message.username||'').slice(0,64).trim().toLowerCase(),message:message.message.slice(0,400)};
		socket.data.tiktokDisplayStatus=state;io.to(room).emit('tiktok-display-status',state);
	});
	socket.on("virtual-crowd-control", (message, acknowledge) => {
		const username = String(message?.username || "").toLowerCase().trim();
		const allowedActions = new Set(["settings", "test", "clear"]);
		if (!username || !allowedActions.has(message?.action)) {
			if (typeof acknowledge === "function") acknowledge({ ok: false, message: "Invalid control message" });
			return;
		}
		if (message.action === "settings") virtualCrowdSettings.set(username, message.payload || {});
		io.to(username).emit("virtual_crowd_control", {
			action: message.action,
			payload: message.payload || {},
			timestamp: Date.now(),
			controlId: typeof message.controlId==='string'?message.controlId.slice(0,80):undefined,
		});
		if (typeof acknowledge === "function") acknowledge({ ok: true, displays:validControlRoom(username)?displayCount(io,username):undefined });
	});
});

// ==========================================
// START SERVER
// ==========================================

server.listen(PORT, () => {
  console.log(`
    TikTok Live Games - Open Source Platform
    Server running at: → http://localhost:${PORT}
    `);
});

// Graceful shutdown handler
process.on("SIGINT", () => {
  console.log("\n[Server] Shutting down...");

  // Disconnect all TikTok connections
	tiktokService.shutdown();

  server.close(() => {
    console.log("[Server] Goodbye!");
    process.exit(0);
  });
});
