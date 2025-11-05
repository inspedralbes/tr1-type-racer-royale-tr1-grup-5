// REQUIREMENTS
const { error } = require("console");
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
require("dotenv").config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.get("/", (req, res) => res.send("Type Racer Royale backend ready 🏁"));

let rooms = [];

// Function to send the player list to all connected clients
function broadcastPlayerList() {
  io.emit("setPlayerList", players);
}

// Trobar la Room per el seu nom
function findRoom(roomName) {
  return rooms.find((r) => r.name === roomName);
}

// Enviar l'estat actualitzar de la sala a tots en la sala
function broadcastRoomState(roomName) {
  const room = findRoom(roomName);
  if (room) {
    io.to(roomName).emit("updateRoomState", room);
  }
}

function broadcastRoomList() {
  const roomList = rooms.map((r) => ({
    name: r.name,
    playerCount: r.players.length,
    beingPlayed: r.beingPlayed,
  }));
  io.emit("roomList", roomList);
}

// Function to end the game and send the final ranking
// TODO: Add error-based ranking
function endGame(roomName) {
  const room = findRoom(roomName);
  beingPlayed = false;

  const ranking = [...room.players]
    .filter((player) => player.role === "player")
    .sort((a, b) => b.points - a.points);

  io.to(roomName).emit("gameFinished", { ranking });
  if (room.timer) {
    clearTimeout(room.timer);
    room.timer = null;
  } //TODO: Escuchar tambien el evento timeEnded que envia el frontendpara terminar la partida, si los dos se ejecutan, se termina la partida
  broadcastRoomState(roomName);
}

// Start listening for server connections
io.on("connection", (socket) => {
  console.log("Player connected");

  // L'usuari demana la lista de salas acutals
  socket.on("getRoomList", () => {
    const roomList = rooms.map((r) => ({
      name: r.name,
      playerCount: r.players.length,
      beingPlayed: r.beingPlayed,
    }));
    socket.emit("roomList", roomList);
  });
  // Un jugador crea una nova sala

  // When a user sends their name and ID
  socket.on("setPlayerName", ({ name, id }) => {
    if (!name || id === undefined) return;

    if (players.length >= 6) {
      socket.emit("gameFull", { message: "The lobby is already full." });
      return;
    }

    let role = "player";
    if (players.length === 0) {
      role = "admin";
    }

    const player = {
      // Player Info
      id: id,
      socketId: socket.id,
      name: name,
      role: role, // enum: 'admin', 'player', 'spectator'
      // States
      isReady: false,
      // Game Stats
      points: 0,
      errors: 0,
    };

    players.push(player);
    players.sort((a, b) => b.id - a.id);

    console.log(`User ${player.name} joined with id ${player.id}`);
    broadcastPlayerList(); // Send updated list to everyone
  });

  // Listen when the user marks themselves as ready
  socket.on("setIsReady", ({ id }) => {
    const changingPlayer = players.find((player) => player.id === id);
    if (!changingPlayer) return;

    changingPlayer.isReady = !changingPlayer.isReady;
    players = players.filter((player) => player.id !== changingPlayer.id);
    players.push(changingPlayer);
    players.sort((a, b) => b.id - a.id);

    console.log(
      `Player ${changingPlayer.name} ready: ${changingPlayer.isReady}`
    );
    broadcastPlayerList();
  });

  // Admin can configure the game in the lobby
  socket.on("configGame", ({ id, newConfig }) => {
    const admin = players.find(
      (player) => player.id === id && player.role === "admin"
    );
    if (!admin) return;

    gameConfig = newConfig;
    io.emit("gameConfigured", gameConfig);
  });

  // Listen when a player is expelled by their playerId
  socket.on("kickPlayer", ({ adminId, playerId }) => {
    const admin = players.find((p) => p.id === adminId && p.role === "admin");
    if (!admin) return;

    const kickedPlayer = players.find((p) => p.id === playerId);
    if (!kickedPlayer) return;

    // Notify the frontend that the player has been kicked
    io.to(kickedPlayer.socketId).emit("kicked");

    players = players.filter((p) => p.id !== playerId);
    console.log(`Player ${kickedPlayer.name} has been kicked by the admin`);
    broadcastPlayerList();
  });

  // Transfer admin rights to a selected user
  socket.on("transferAdmin", ({ adminId, newAdminId }) => {
    const currentAdmin = players.find(
      (p) => p.id === adminId && p.role === "admin"
    );
    const newAdmin = players.find((p) => p.id === newAdminId);

    if (!currentAdmin || !newAdmin) return;

    currentAdmin.role = "player";
    newAdmin.role = "admin";

    io.to(newAdmin.socketId).emit("youAreNowAdmin");

    console.log(
      `${currentAdmin.name} has transferred admin rights to ${newAdmin.name}`
    );
    broadcastPlayerList();
  });

  // Listen when the admin starts the game and set unready users as spectators
  socket.on("startGame", ({ id }) => {
    const admin = players.find((p) => p.id === id && p.role === "admin");
    if (!admin) return;

    beingPlayed = true;

    players.forEach((p) => {
      if (!p.isReady) {
        p.role = "spectator";
      }
    });

    io.emit("gameStarted", {
      //QUITO LOS PLAYERS DEBIDO A QUE DEMOMENTO NO UTILIZAMOS ESTA VARIABLE: players,
      time: gameConfig.time,
    });
    broadcastPlayerList();

    timer = setTimeout(() => {
      endGame();
    }, gameConfig.time * 1000);
  });

  // Listen when points are added to a player
  socket.on("addPoints", ({ id }) => {
    console.log("sumemCorrecte");
    const player = players.find((p) => p.id === id);
    if (!player || player.role === "spectator") return;
    players = players.filter((p) => p !== player);
    player.points++;
    players.push(player);
    enviarLlistatJugadors();
  });

  // Listen when errors are added to a player
  socket.on("addErrors", ({ id }) => {
    console.log("sumemError");
    const player = players.find((p) => p.id === id);
    if (!player || player.role === "spectator") return;
    players = players.filter((p) => p !== player);
    player.errors++;
    players.push(player);
    enviarLlistatJugadors();
  });

  socket.on("disconnect", () => {
    const player = players.find((p) => p.socketId === socket.id);
    if (!player) return;

    console.log(`Player ${player.name} disconnected`);

    if (player.role === "admin") {
      const newAdmin = players.find((p) => p.id !== player.id);
      if (newAdmin) {
        newAdmin.role = "admin";
        io.to(newAdmin.socketId).emit("youAreNowAdmin"); // opcional

        console.log(`new admin ${newAdmin.name}`);
      }
    }
    // Lógica de reasignar admin y eliminar jugador
    players = players.filter((p) => p.socketId !== socket.id);
    broadcastPlayerList();
  });

  // Listen when a user wants to play again after a match
  socket.on("playAgain", ({ id }) => {
    const player = players.find((p) => p.id === id);
    if (!player) return;

    player.isReady = false;
    player.points = 0;
    player.role = "player";
    broadcastPlayerList();
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`http://localhost:${PORT}`));
