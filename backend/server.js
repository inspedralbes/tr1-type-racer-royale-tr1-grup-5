const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
require("dotenv").config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.get("/", (req, res) => res.send("Backend Type Racer Royale listo 🏁"));

/*només guarda l'ID com a clau i despres posem un objecte com valor aquesta seria l'estructura 
"abc123" : {id: "abc123" , name:"Tony", preparat: false, admin:false  }*/
const jugadors = {};

function broadcastPlayerList() {
  io.emit("updatePlayerList", Object.values(jugadors));
}

//Començen amb la connexió del servidor
io.on("connection", (socket) => {
  console.log("Jugador conectat:", socket.id);

  // Desconnexió de l'usuari
  socket.on("disconnect", () => {
    console.log("Jugador desconectat:", socket.id);
    delete jugadors[socket.id];
    broadcastPlayerList(); // Informem a la resta que algú ha marxat
  });

  // Quan un usuari ens envia el seu nom
  socket.on("setPlayerName", (name) => {
    if (!name) return;

    const admin = Object.values(jugadors).some((j) => j.admin);

    jugadors[socket.id] = {
      id: socket.id,
      name: name,
      preparat: false,
      admin: !admin, // el primero en unirse será admin
    };
    console.log(`L'usuari ${name}  s'ha unit`);
    broadcastPlayerList(); // Enviem la llista actualitzada a tothom
  });

  //escoltem l'ordre de quan l'usuari li dona a preparat
  socket.on("usuariPreparat", () => {
    jugadors[socket.id].preparat = !jugadors[socket.id].preparat;

    console.log(
      `Jugador ${jugadors[socket.id].name} preparat: ${
        jugadors[socket.id].preparat
      }`
    );
    broadcastPlayerList();
  });

  //Escolta quan expulsem al jugador que te el idJugador
  socket.on("expulsarJugador", (idJugador) => {
    if (!jugadors[socket.id] || !jugadors[socket.id].admin) return;

    if (jugadors[idJugador]) {
      io.to(idJugador).emit("expulsat");
      delete jugadors[idJugador];
      console.log(`Jugador ${idJugador} ha estat expulsat per l'admin`);
      broadcastPlayerList();
    }
  });

  socket.on("transferirAdmin", (idNuevoAdmin) => {
    if (!jugadors[socket.id] || !jugadors[socket.id].admin) return;

    if (jugadors[idNuevoAdmin]) {
      jugadors[socket.id] = false;
      jugadors[idNuevoAdmin] = true;

      broadcastPlayerList();
    }
  });

  socket.on("IniciarJoc", () => {
    if (!jugadors[socket.id] || !jugadors[socket.id].admin) return;

    io.emit("JocIniciat");
  });

  socket.on("JocIniciat", () => {
    //En aquest apartat canviarem la vista
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`http://localhost:${PORT}`));
