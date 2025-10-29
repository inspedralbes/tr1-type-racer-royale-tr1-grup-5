const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
require("dotenv").config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.get("/", (req, res) => res.send("Backend Type Racer Royale listo 🏁"));

let jugadors = [];
let configuracioPartida = {
  idioma: "cat",
  temps: 60,
};

function broadcastPlayerList() {
  io.emit("updatePlayerList", jugadors);
}

//Començen amb la connexió del servidor
io.on("connection", (socket) => {
  console.log("Jugador conectat:", socket.id);

  // Desconnexió de l'usuari
  socket.on("disconnect", () => {
    console.log("Jugador desconectat:", socket.id);
    jugadors = jugadors.filter((f) => f.id !== socket.id);
    broadcastPlayerList(); // Informem a la resta que algú ha marxat
  });

  // Quan un usuari ens envia el seu nom
  socket.on("setPlayerName", (name) => {
    if (!name) return;

    const admin = jugadors.some((j) => j.admin);

    const jugador = {
      id: socket.id,
      name: name,
      preparat: false,
      admin: !admin, // el primero en unirse será admin
    };

    jugadors.push(jugador);

    console.log(`L'usuari ${name}  s'ha unit`);
    broadcastPlayerList(); // Enviem la llista actualitzada a tothom
  });

  //escoltem l'ordre de quan l'usuari li dona a preparat
  socket.on("usuariPreparat", () => {
    const jugador = jugadors.find((j) => j.id === socket.id);
    if (!jugador) return;

    jugador.preparat = !jugador.preparat;

    console.log(`Jugador ${jugador.name} preparat: ${jugador.preparat}`);
    broadcastPlayerList();
  });

  //Admin pot escollir la configuració de la partidaa al lobby
  socket.on("configurarPartida", (novaConfig) => {
    const admin = jugadors.find((j) => j.id === socket.id && j.admin);
    if (!admin) return;

    /*operador Spread para fusionar cambios que se realizen sino alternativas:
    configuracioPartida.temps = novaConfig.temps;
    configuracioPartida.idioma = novaConfig.idioma;

    */
    configuracioPartida = { ...configuracioPartida, ...novaConfig };
  });

  //Escolta quan expulsem al jugador que te el idJugador
  socket.on("expulsarJugador", (idJugador) => {
    const admin = jugadors.find((j) => j.id === socket.id && j.admin);
    if (!admin) return;

    const expulsat = jugadors.find((j) => j.id === idJugador);
    if (!expulsat) return;

    io.to(idJugador).emit("expulsat");
    jugadors = jugadors.filter((j) => j.id !== idJugador);
    console.log(`Jugador ${expulsat.name} ha estat expulsat per l'admin`);
    broadcastPlayerList();
  });

  //Transferir l'admin a l'usuari escollit
  socket.on("transferirAdmin", (idNuevoAdmin) => {
    const adminActual = jugadors.find((j) => j.id === socket.id && j.admin);
    const adminNuevo = jugadors.find((j) => j.id === idNuevoAdmin);

    if (!adminActual || !adminNuevo) return;

    adminActual.admin = false;

    adminNuevo.admin = true;

    console.log(
      `${adminActual.name} ha transferit l'admin a ${adminNuevo.name}`
    );
    broadcastPlayerList();
  });

  socket.on("IniciarJoc", () => {
    const admin = jugadors.find((j) => j.id === socket.id && j.admin);
    if (!admin) return;
    io.emit("JocIniciat");
  });

  socket.on("JocIniciat", () => {
    //En aquest apartat canviarem la vista
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`http://localhost:${PORT}`));
