<template>
  <div v-if="!isConnected">
    <h2>Introduce tu nombre</h2>
    <input type="text" v-model="jugador.name" placeholder="Tu nombre" />
    <button @click="sendNickname(jugador.name)">Continuar</button>
  </div>

  <div v-else-if="!joinedRoom">
    <h2>Salas disponibles (Públicas)</h2>

    <button @click="loadRooms">🔄 Actualizar lista</button>

    <ul class="room-list">
      <li v-for="room in rooms" :key="room.name" class="room-item">
        <div class="room-info">
          <strong>{{ room.name }}</strong>
          <span>👥 {{ room.playerCount }} jugadores</span>
          <span v-if="room.beingPlayed" class="status-playing"> | 🎮 En partida</span>
        </div>
        <button 
          @click="joinExistingRoom(room.name)" 
          :disabled="room.beingPlayed"
        >
          Unirse
        </button>
      </li>
    </ul>

    <hr />

    <h3>Crear nueva sala</h3>
    <input v-model="roomInput" placeholder="Nombre de la sala" />
    <label>
      <input type="checkbox" v-model="isPrivateCreation" /> Sala Privada 🔒
    </label>
    <button @click="createRoom">Crear sala</button>

    <hr />

    <h3>Unirse a Sala Privada con Código</h3>
    <input v-model="privateCodeInput" placeholder="Código de Acceso (6 digitos)" maxlength="6" />
    <button @click="joinPrivateRoom">Unirse</button>

    </div>

  <div v-else-if="vista === 'preGame'">
    <h2>Sala: {{ currentRoom }}</h2>
    <viewLobby
      :socket-c="socket"
      :llista-jug="jugadors"
      :is-admin="jugador.role === 'admin'"
      :jugador="jugador"
      :room-name="currentRoom"
      :room-state="roomState" />
  </div>

  <div v-else-if="vista === 'game'">
    <div id="jugador" v-if="!isSpectator">
      <GameEngine
        :socket="socket"
        :jugador="jugador"
        :es-espectador="isSpectator"
        :room-name="currentRoom"
      />
      <TempsRestant :tempsInicial="tempsRestant" />
      <RankingComponent :llista-jug="jugadors" />
    </div>

    <div v-else>
      <h2>Modo espectador</h2>
      <RankingComponent :llista-jug="jugadors" />
    </div>
  </div>

  <div v-else-if="vista === 'endGame'">
    <h2>Partida terminada</h2>
    <RankingComponent :llista-jug="jugadors" />
    <button @click="returnToLobby">Volver al lobby</button>
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
const tempsRestant = ref(-1)
const isSpectator = ref(false)

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
    isSpectator.value = jugador.value.role === 'spectator'
  })

  socket.on('updateRanking', (ranking) => {
    if (vista.value === 'game') {
      jugadors.value = [...ranking]
    }
  })
  
  // ESTO CAMBIA LA VISTA A 'game' CUANDO EL SERVIDOR MANDA EL INICIO
  socket.on('gameStarted', ({ time }) => {
    vista.value = 'game' // <--- PUNTO CLAVE
    iniciarComptador(time)
  })

  socket.on('gameFinished', ({ ranking }) => {
    jugadors.value = [...ranking]
    vista.value = 'endGame'
  })

  socket.on('kicked', () => {
    alert('Has sido expulsado de la sala.')
    resetToRoomList()
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
}

// --- ACCIONES DEL USUARIO ---

function sendNickname(nickname) {
  if (!nickname.trim()) return

  jugador.value.id = jugador.value.id || Date.now()
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
  if (!socket || !socket.connected) return alert("Socket no conectado. Inténtalo de nuevo.");
  
  socket.emit('joinRoom', { roomName })
  currentRoom.value = roomName 
  joinedRoom.value = true
  vista.value = 'preGame'
}

function joinPrivateRoom() {
    if (!socket || !socket.connected) return alert("Socket no conectado. Inténtalo de nuevo.");
    
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
  if (!socket || !socket.connected) return alert("Socket no conectado. Inténtalo de nuevo.");
    
  const name = roomInput.value.trim()
  if (!name) return

  socket.emit('createRoom', { 
    roomName: name, 
    isPrivate: isPrivateCreation.value 
  })
  currentRoom.value = name
  joinedRoom.value = true
  vista.value = 'preGame'
}

function iniciarComptador(t) {
  tempsRestant.value = t
  const interval = setInterval(() => {
    if (tempsRestant.value > 0) tempsRestant.value--
    else clearInterval(interval)
  }, 1000)
}

function returnToLobby() {
  if (!socket || !socket.connected) return alert("Socket no conectado. Recarga la página.");
  socket.emit('playAgain', { roomName: currentRoom.value, id: jugador.value.id })
  vista.value = 'preGame'
  isSpectator.value = false
  tempsRestant.value = -1
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

<style scoped>
.ready { background-color: greenyellow; }
.notReady { background-color: red; }
.room-list { list-style: none; padding: 0; max-width: 500px; margin: 20px auto; }
.room-item { display: flex; justify-content: space-between; align-items: center; gap: 10px; padding: 10px 15px; margin-bottom: 8px; border: 1px solid #ccc; border-radius: 5px; background-color: #f9f9f9; }
.room-info { display: flex; gap: 15px; align-items: center; }
.room-info strong { font-size: 1.1em; }
.status-playing { color: orange; font-style: italic; }
.room-item button { padding: 5px 10px; background-color: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; }
.room-item button:hover:not(:disabled) { background-color: #0056b3; }
.room-item button:disabled { background-color: #cccccc; cursor: not-allowed; }
hr { margin: 30px 0; border: 0; border-top: 1px solid #eee; }
</style>