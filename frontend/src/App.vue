<template>
  <div class="fondo" v-if="!isConnected">
    <img class="mago mago-fuego" src="../public/img/MagoFuego-removebg-preview.png" alt="Mago de Fuego">
    <img class="mago mago-angelical" src="../public/img/MagoAngelical-removebg-preview.png" alt="Mago Angelical">
    <img class="mago mago-obscuro" src="../public/img/MagoObscuro-removebg-preview.png" alt="Mago Obscuro">
    <img class="mago mago-tierra" src="../public/img/MagoTierra-removebg-preview.png" alt="Mago de Tierra">
    
    <div class="login-container">
    
      <div class="badge">
        <span>TYPE RACER ROYALE</span>
      </div>

      <h1 class="login-title">
        Desfés la teva màgia. Inicia sessió i continua la teva aventura.
      </h1>

      <div class="login-form">
        <input type="text" id="username" class="login-input" v-model="jugador.name" placeholder="Nom de Mag/a" />
        
        <button class="login-button" @click="sendNickname(jugador.name)">Inicia el teu Viatge</button>
      </div>

    </div>
  </div>

  <div class="fondo" v-else-if="!joinedRoom">
  
    <div class="rooms-page-container">
      
      <div class="profile-card">
        <img
          src="../public/img/Aprendiz_Mago.png"
          alt="Aprenent de Mag"
          class="profile-avatar"
        />
        <div class="profile-info">
          <span class="badge">Perfil de l'Aprenent</span>
          <h3>NomUser</h3>
          <h5>Aprenent de màgia</h5>
        </div>
        <p>
          Benvingut, jove <span class="rosa">aprenent de màgia</span>! El teu <span class="rosa">viatge</span> cap a la mestria comença ara. Demostra el teu <span class="rosa">valor</span> i <span class="rosa">habilitat</span>, i la túnica d'un <span class="rosa">mag de veritat</span> t'espera!
        </p>
      </div>

      <div class="actions-container">
  
        <div class="action-card create-room-card">
          <span class="badge">Crear Sala</span>
          <input v-model="roomInput" placeholder="Nom de la sala" />
          <label>
            <input type="checkbox" v-model="isPrivateCreation" /> Sala Privada
          </label>
          <button @click="createRoom">Crear una nova sala</button>
        </div>

        <div class="action-card join-private-card">
          <span class="badge">Unir-se a sala Privada</span>
          <input
            v-model="privateCodeInput"
            placeholder="Codi d'Accés (6 dígits)"
            maxlength="6"
          />
          <button @click="joinPrivateRoom">Unir-se a Sala Privada amb Codi</button>
        </div>
      </div>

      <div class="rooms-grid-bottom">
        <h2>Sales disponibles (Públiques)</h2>
        <ul class="room-list">
          <li v-for="room in rooms" :key="room.name" class="room-item">
            <div class="room-info">
              <strong>{{ room.name }}</strong>
              <span>👥 {{ room.playerCount }} jugadors</span>
              <span v-if="room.beingPlayed" class="status-playing">
                | 🎮 En partida</span
              >
            </div>
            <button @click="joinExistingRoom(room.name)" :disabled="room.beingPlayed">
              Unir-se
            </button>
          </li>
        </ul>
      </div>

    </div> 
  </div>

  <div v-else-if="vista === 'preGame'">
    <h2>Sala: {{ currentRoom }}</h2>
    <viewLobby
      :socket-c="socket"
      :llista-jug="jugadors"
      :is-admin="jugador.role === 'admin'"
      :jugador="jugador"
      :room-name="currentRoom"
      :room-state="roomState"
    />
  </div>

  <div v-else-if="vista === 'game'">
    <div id="jugador">
      <!-- Div on mostrem la informació de la partida (els textos)-->
      <div id="partida">
        <!--Truquem al game Engine i enviem les props que rebrà aquest component-->
        <GameEngine
          :socket="socket"
          :jugador="jugador"
          :llista-jug="jugadors"
          :room-name="currentRoom"
        />
      </div>
      <!--Div on mostrem el temps restant de la partida-->
      <div id="tempsRestant">
        <TempsRestant :temps-inicial="tempsInicial" :socket="socket" />
      </div>
      <!--Div on llistem els usuaris de la partida i els accerts i errors d'aquests-->
      <div id="ranquing">
        <RankingComponent :llista-jug="jugadors" />
      </div>
    </div>
  </div>

  <div v-else-if="vista === 'endGame'">
    <h2>Partida terminada</h2>
    <RankingComponent :llista-jug="jugadors" />

    <div>
      <button @click="leaveRoom" class="btn-leave">Salir de la sala</button>
      <button @click="returnToLobby">Volver al lobby</button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { io } from 'socket.io-client'
import RankingComponent from './components/RankingComponent.vue'
import viewLobby from './components/PreGame/lobby/viewLobby.vue'
import GameEngine from './components/Game/GameEngine.vue'
import TempsRestant from './components/Game/TempsRestant.vue'

let socket = null

const rooms = ref([])
const vista = ref('preGame')
const isConnected = ref(false)
const joinedRoom = ref(false)
const jugador = ref({ name: '', id: null, role: 'player' })
const jugadors = ref([])
const tempsInicial = ref(0)

const currentRoom = ref('')
const roomInput = ref('')

const roomState = ref(null)
const isPrivateCreation = ref(false)
const privateCodeInput = ref('')

// --- CONEXIÓN Y EVENTOS ---

function tryConn() {
  if (socket && socket.connected) return
  socket = io('http://localhost:3001')

  socket.on('playerRegistered', (playerData) => {
    Object.assign(jugador.value, playerData)
    isConnected.value = true
    loadRooms()
  })

  socket.on('roomList', (list) => {
    rooms.value = list
  })
  socket.on('roomJoined', ({ roomName }) => {
    currentRoom.value = roomName
  })

  socket.on('updateRoomState', (room) => {
    roomState.value = room
    jugadors.value = [...room.players]
    const yo = room.players.find((p) => p.id === jugador.value.id)
    if (yo) Object.assign(jugador.value, yo)

    if (room.config && room.config.time) {
      tempsInicial.value = room.config.time
    }
  })

  socket.on('updateRanking', (ranking) => {
    if (vista.value === 'game') {
      jugadors.value = [...ranking]
    }
  })
  // ESTO CAMBIA LA VISTA A 'game' CUANDO EL SERVIDOR MANDA EL INICIO
  socket.on('gameStarted', ({ time }) => {
    vista.value = 'game' // <--- PUNTO CLAVE
    tempsInicial.value = time
  })

  socket.on('gameFinished', ({ ranking }) => {
    jugadors.value = [...ranking]
    vista.value = 'endGame'
  })

  socket.on('error', ({ message }) => {
    alert(`Error del servidor: ${message}`)
    if (joinedRoom.value) {
      if (currentRoom.value === '' && !roomState.value) {
        joinedRoom.value = false
        currentRoom.value = ''
        vista.value = 'preGame'
        loadRooms()
      }
    }
  })

  //expulsar al jugador i notificar-lo
  socket.on('kicked', () => {
    alert("Expulsat per l'admin")
    socket.disconnect()
    resetToRoomList()
  })
  //Transferim l'admin
  socket.on('youAreNowAdmin', () => {
    jugador.value.role = 'admin'
  })
}

// --- ACCIONES DEL USUARIO ---

function sendNickname(nickname) {
  if (!nickname || nickname.trim() === '') return

  // Generar un ID únic per al jugador abans de connectar
  const playerId = jugador.value.id || Date.now()
  jugador.value.id = playerId
  jugador.value.name = nickname.trim()

  tryConn()

  socket.emit('setPlayerName', {
    name: jugador.value.name,
    id: jugador.value.id,
  })
}

function loadRooms() {
  if (!socket || !socket.connected) tryConn()
  socket.emit('getRoomList')
}

function joinExistingRoom(roomName) {
  if (!socket || !socket.connected) return alert('Socket no conectado. Inténtalo de nuevo.')

  socket.emit('joinRoom', { roomName })
  currentRoom.value = roomName
  joinedRoom.value = true
  vista.value = 'preGame'
}

function joinPrivateRoom() {
  if (!socket || !socket.connected) return alert('Socket no conectado. Inténtalo de nuevo.')
  const code = privateCodeInput.value.trim().toUpperCase()

  if (code.length !== 6) {
    alert('Por favor, introduce el código de 6 dígitos.')
    return
  }

  socket.emit('joinRoom', { accessCode: code })
  joinedRoom.value = true
  vista.value = 'preGame'
  privateCodeInput.value = ''
}

function createRoom() {
  if (!socket || !socket.connected) return alert('Socket no conectado. Inténtalo de nuevo.')
  const name = roomInput.value.trim()
  if (!name) return

  socket.emit('createRoom', {
    roomName: name,
    isPrivate: isPrivateCreation.value,
  })
  currentRoom.value = name
  joinedRoom.value = true
  vista.value = 'preGame'
}

function returnToLobby() {
  if (!socket || !socket.connected) return alert('Socket no conectado. Recarga la página.')
  socket.emit('playAgain', { roomName: currentRoom.value, id: jugador.value.id })
  vista.value = 'preGame'
  tempsInicial.value = -1
}

function leaveRoom() {
  if (!socket || !socket.connected) return alert('Socket no conectado. Recarga la página.')

  // Avisamos al servidor que este jugador abandona la sala
  socket.emit('leaveRoom', { roomName: currentRoom.value, id: jugador.value.id })

  // Volvemos a la lista de salas
  resetToRoomList()
}

function resetToRoomList() {
  joinedRoom.value = false
  currentRoom.value = ''
  vista.value = 'preGame'
  jugadors.value = []
  roomState.value = null
  loadRooms()
}
</script>

<style>
/* 1. CODI PER LA LOGIN PAGE */
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;700&display=swap');

body{
  margin: 0;
}
/* Estil global per centrar el contingut */
#app {
  font-family: 'Poppins', sans-serif;
  margin: 0;
  background-color: #15131e;
  color: #f0f0f0; 
  height: 100vh; 
  display: flex;
  justify-content: center; 
  align-items: center; 
  overflow: hidden;
}

button, 
input {
  font-family: inherit; 
}

/* --- ESTILS DEL CONTENEDOR 'fondo' --- */
.fondo {
  position: relative; /* ¡MUY IMPORTANTE! */
  background: linear-gradient(to bottom, #15131e 32%, #006aff 100%);  
  border-radius: 25px; 
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  box-sizing: border-box;
  padding: 20px;
  width: 98%;
  height: 95%;
  min-width: 98%;
  min-height: 95%;
}

/* --- ESTILS DEL LOGIN CONTAINER --- */
.login-container {
  position: relative; /* Necesario para que z-index funcione */
  z-index: 2;
  width: 50%;
  text-align: center; /* Centra el texto */
  height: 80%;
  display: flex;
  flex-direction: column; 
  align-items: center;    
  justify-content: center; 
  gap: 15px;
}

.login-container .login-title {
  font-weight: 400;
}

.login-container .badge {
  background: linear-gradient(to right, #2c2b53 0%, #6a6aff 100%);
  border-radius: 100px; 
  color: white; 
  padding: 8px 20px; 
  display: inline-flex; 
  align-items: center;
  justify-content: center; 
}

.login-container .login-input {
  background-color: transparent; 
  border: none;                  
  outline: none;                 
  border-bottom: 2px solid #cb95e6; 
  color: #f0f0f0; 
  width: 70%; 
  padding: 10px 0;
  text-align: center;
  font-size: 1.1rem; 
  margin-bottom: 20px; 
}

.login-container .login-input::placeholder {
  color: #cb95e6; 
  opacity: 1; 
}

.login-container .login-button {
  background: linear-gradient(to right, #ffffff 0%, #5866ff 100%);
  color: #15131e;
  border-radius: 100px;
  font-size: 1rem;
  padding: 10px 30px;
  cursor: pointer;
  transition: 0.3s ease-in-out;
  border: solid 1px transparent; 
  background-clip: padding-box; 
}

.login-container .login-button:hover, 
.login-container .login-button:focus {
  background: transparent; 
  border-color: #ffffff;
  color: #ffffff;
  outline: none;
}

/* --- ESTILS DELS MAGS (LOGIN) --- */
.mago {
  position: absolute; 
  width: 20%;         
  height: auto;
  z-index: 1;         
}
.mago-obscuro {
  bottom: -80px;  
  left: -10px;     
  transform: rotate(20deg);
  width: 30%;
}
.mago-tierra {
  bottom: -70px;  
  right: 15px;     
  transform: rotate(-20deg); 
  width: 30%;
}
.mago-fuego {
  top: -130px;      
  left: 20px;      
  transform: rotate(145deg);
  width: 30%;
}
.mago-angelical {
  top: -150px;      
  right: 50px;     
  transform: rotate(-150deg);
  width: 31%;
}

/* --- (NOU CSS) ESTILS PÀGINA DE SALES (!joinedRoom) --- */

.rooms-page-container {
  display: grid;
  grid-template-columns: 1fr 1.5fr;
  grid-template-rows: auto 1fr;
  gap: 25px; /* L'espai entre els 3 blocs */
  width: 100%;
  height: 100%;
  padding: 20px;
  box-sizing: border-box; 
}

/* --- 1. Perfil (Dalt-Esquerra) --- */
.profile-card {
  /* Posició a la graella principal */
  grid-column: 1 / 2; 
  grid-row: 1 / 2;    
  
  /* Estil "Glassmorphism" (Del disseny) */
  background-color: #15131e;
  border: 1px solid #CB95E6; 
  border-radius: 20px; 
  padding: 20px; /* Padding més generós (del disseny) */
  backdrop-filter: blur(8px); 
  -webkit-backdrop-filter: blur(8px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);

  /* Maquetació interna 2x2 (La que has demanat) */
  display: grid;
  grid-template-columns: auto 1fr; /* Col 1 (avatar) auto, Col 2 (text) la resta */
  grid-template-rows: auto auto;   /* Fila 1 (dalt) auto, Fila 2 (text baix) auto */
  gap: 8px; 
  align-items: center; 
}

/* --- 2. Accions (Dalt-Dreta) --- */
.actions-container {
  grid-column: 2 / 3; 
  grid-row: 1 / 2;    
  display: flex;
  flex-direction: column;
  gap: 20px; /* Espai entre les targetes d'acció */
}
.actions-container button{
  background: linear-gradient(to right, #2c2b53 0%, #6a6aff 100%);
  border-radius: 100px; 
  color: white; 
  padding: 8px 20px; 
  display: inline-flex; 
  align-items: center;
  justify-content: center; 
}

/* --- 3. Llista de Sales (Baix) --- */
.rooms-grid-bottom {
  grid-column: 1 / 3; /* Ocupa TOT l'ample de baix */
  grid-row: 2 / 3;    
  overflow-y: auto;
}

/* Estils genèrics per les caixes (HE TRET .profile-card d'aquí) */
.actions-container, .rooms-grid-bottom {
  padding: 15px;
  background-color: #15131e; /* Mateix fons que el profile */
  border: 1px solid #CB95E6; /* Mateixa vora */
  border-radius: 20px;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  box-shadow: 0 4px 12px rgba(203, 149, 230, 0.25);
}

/* --- (NOU) Estils interns del Profile Card --- */

.profile-avatar{
  /* Posició a la graella interna */
  grid-row: 1 / 2;
  grid-column: 1 / 2;
  
  /* Estils de l'avatar (del disseny) */
  width: 90%;
  height: 90%;
  border-radius: 15px; /* Per fer-lo rodó */
  border: 1px solid #a88bff; /* Vora lila */
}

/* Estil pel badge "Perfil de l'Aprenent" */
.profile-card .badge, .actions-container .badge {
  background: linear-gradient(to right, #7b2cff, #a855f7); /* Morat */
  color: white;
  padding: 6px 16px;
  border-radius: 9999px; /* Forma de píndola */
  font-size: 1rem;
  font-weight: 500;
  display: inline-block;
  margin-bottom: 10px; /* Espai sota el badge */
  text-align: center;
  width: 200px;
}

.profile-info {
  /* Posició a la graella interna */
  grid-row: 1 / 2;
  grid-column: 2 / 3;
}

.profile-info h3, 
.profile-info h5 {
  margin: 0; /* Traiem marges per defecte */
  margin-left: 5px;
}

.profile-info h3 {
  font-size: 1.8rem;
  color: #ffffff;
}
.profile-info h5 {
  font-size: 1.1rem;
  font-weight: 400;
  color: #d8cfff; /* Un lila/blanc més suau */
}
.profile-card .rosa{
  color: #CB95E6;
}

/* Seleccionem el paràgraf <p> QUE SIGUI FILL DIRECTE de .profile-card */
.profile-card > p {
  /* Posició a la graella interna */
  grid-row: 2 / 3;    /* Fila 2 (la de baix) */
  grid-column: 1 / 3; /* Ocupa TOT l'ample */
  
  /* Ajustos de text del disseny */
  margin: 0; 
  color: #e0e0e0;
  font-size: 0.95rem;
  line-height: 1.6;
}
.rooms-grid-bottom h2{
  margin: 0;
}

/* --- (CSS ANTIC) ESTILS DE LES LLISTES DE SALES --- */
/* Mantenim els estils originals per la llista de sales públiques */

.ready {
  background-color: greenyellow;
}
.notReady {
  background-color: red;
}
.room-list {
  list-style: none;
  padding: 0;
  max-width: 100%; /* Canviat de 500px a 100% */
  margin: 20px 0; /* Canviat auto per 0 */
}
.room-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  padding: 10px 15px;
  margin-bottom: 8px;
  /* Estil fosc per la llista de sales */
  border: 1px solid rgba(136, 114, 255, 0.2);
  border-radius: 10px;
  background-color: rgba(21, 19, 30, 0.5); 
  color: #f0f0f0;
}
.room-info {
  display: flex;
  gap: 15px;
  align-items: center;
}
.room-info strong {
  font-size: 1.1em;
  color: #ffffff;
}
.status-playing {
  color: #ffaa00; /* Taronja per "En partida" */
  font-style: italic;
}

.room-item button:hover:not(:disabled) {
  opacity: 0.8;
}
.room-item button:disabled {
  background-color: #555;
  background: #555; /* Treu el gradient si està desactivat */
  color: #999;
  cursor: not-allowed;
  opacity: 0.7;
}
hr {
  margin: 30px 0;
  border: 0;
  border-top: 1px solid rgba(136, 114, 255, 0.2); /* Vora lila */
}
</style>
