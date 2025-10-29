const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
require("dotenv").config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.get("/", (req, res) => res.send("Backend Type Racer Royale listo 🏁"));

let jugadors = [];
let partidaEnCurs = false;
let configuracioPartida = {
  idioma: "cat",
  temps: 60,
};
let temporitzador = null;

function broadcastPlayerList() {
  io.emit("setPlayerList", jugadors);
}

function eliminarJugador(idJugador) {
  if (!partidaEnCurs) return;

  const jugador = jugadors.find((j) => j.id === idJugador);
  if (!jugador) return;

  jugador.rol = "espectador";
  broadcastPlayerList();
}

function acabarPartida() {
  partidaEnCurs = false;

  const classificacio = [...jugadors]
    .filter((j) => j.rol === "jugador")
    .sort((a, b) => b.puntuacio - a.puntuacio);

  io.emit("PartidaFinalitzada", { classificacio });
  clearTimeout(temporitzador);
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

    const jugadorsActius = jugadors.filter((j) => j.rol === "espectador");
    if (jugadorsActius.length >= 6) {
      socket.emit("lobbyLleno", { mensaje: "El lobby ya está lleno." });
      return;
    }

    const admin = jugadors.some((j) => j.admin);

    const jugador = {
      id: socket.id,
      name: name,
      preparat: false,
      admin: !admin, // el primero en unirse será admin
      rol: partidaEnCurs ? "espectador" : "jugador",
      puntuacio: 0,
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

    jugador.rol = jugador.preparat && !partidaEnCurs ? "jugador" : "espectador";

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
    io.emit("configuracioActualizada", configuracioPartida);
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

  // Escolta quan l'admin comença el joc i posa als usuaris no preparats com espectadors
  socket.on("IniciarJoc", () => {
    const admin = jugadors.find((j) => j.id === socket.id && j.admin);
    if (!admin) return;

    partidaEnCurs = true;

    jugadors.forEach((j) => {
      if (!j.preparat) {
        j.rol = "espectador";
      }
    });
    io.emit("JocIniciat", {
      jugadores: jugadors,
      temps: configuracioPartida.temps,
    });

    temporitzador = setTimeout(() => {
      acabarPartida();
    }, configuracioPartida.temps * 1000);
  });

  //socket que escolta els punts sumats al jugador
  socket.on("sumarPunts", (punts) => {
    const jugador = jugadors.find((j) => j.id === socket.id);
    if (!jugador || jugador.rol !== "jugador") return;

    jugador.puntuacio += punts;
  });

  socket.on("sortir", () => {
    jugadors = jugadors.filter((j) => j.id !== socket.id);
    socket.disconnect();

    broadcastPlayerList();
  });

  socket.on("tornarAJugar", () => {
    const jugador = jugadors.find((j) => j.id === socket.id);
    if (!jugador) return;

    jugador.preparat = false;
    jugador.puntuacio = 0;
    jugador.rol = "jugador";
    broadcastPlayerList();
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`http://localhost:${PORT}`));
