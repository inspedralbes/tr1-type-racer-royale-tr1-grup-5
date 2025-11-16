<template>
  <!-- Notificacions -->
  <div v-if="notification.visible" :class="['notification', notification.type]">
    <span class="notification-message">{{ notification.message }}</span>
  </div>

  <!-- Animació portal -->
  <div v-if="isPortalActive" class="portal-overlay centrar">
    <div class="portal-frame">
      <div class="portal"></div>
    </div>
  </div>

  <!-- Pàgina d'inici -->
  <div class="fondo" v-if="!isConnected">
    <div class="epic-login-container">
      <div class="magic-particles-login">
        <div class="particle-layer-login particle-layer-login-1"></div>
        <div class="particle-layer-login particle-layer-login-2"></div>
        <div class="particle-layer-login particle-layer-login-3"></div>
        <div class="particle-layer-login particle-layer-login-4"></div>
        <div class="particle-layer-login particle-layer-login-5"></div>
      </div>

      <!--Imatges de mags-->
      <img class="mago mago-fuego" src="/img/MagoFuego-removebg-preview.png" alt="Mag de foc" />
      <img
        class="mago mago-angelical"
        src="/img/MagoAngelical-removebg-preview.png"
        alt="Mag Angelical"
      />
      <img class="mago mago-obscuro" src="/img/MagoObscuro-removebg-preview.png" alt="Mag Obscur" />
      <img class="mago mago-tierra" src="/img/MagoTierra-removebg-preview.png" alt="Mag de Terra" />

      <h1 class="epic-title">MagicTypeRoyale</h1>
      <!--Titol-->

      <!-- Input del nom -->
      <div class="login-form">
        <input
          type="text"
          id="username"
          class="login-input"
          v-model="jugador.name"
          placeholder="Nom de Mag/a"
          @keydown.enter="sendNickname(jugador.name)"
        />

        <button class="login-button" @click="sendNickname(jugador.name)">Entra a la Batalla</button>
      </div>
    </div>
  </div>

  <!-- Selector de rooms -->
  <div class="fondo" v-else-if="!joinedRoom">
    <!-- Partícules màgiques flotants -->
    <div class="magic-particles">
      <div class="particle-layer particle-layer-1"></div>
      <div class="particle-layer particle-layer-2"></div>
      <div class="particle-layer particle-layer-3"></div>
      <div class="particle-layer particle-layer-4"></div>
      <div class="particle-layer particle-layer-5"></div>
    </div>

    <div class="rooms-page-container">
      <!-- Perfil del jugador -->
      <div class="profile-card">
        <div class="profile-avatar-wrapper">
          <img src="/img/Aprendiz_Mago.png" alt="Aprenent de Mag" class="profile-avatar" />
        </div>
        <div class="profile-info">
          <span class="badge">Perfil de l'aprenent</span>
          <span class="profile-label">Nom del mag</span>
          <h3>{{ jugador.name }}</h3>
          <span class="profile-label">Títol del mag</span>
          <h5>Aprenent de màgia</h5>
        </div>
        <p>
          Benvingut, jove <span class="rosa">aprenent de màgia</span>! El teu
          <span class="rosa">viatge</span> cap a la mestria comença ara. Demostra el teu
          <span class="rosa">valor</span> i <span class="rosa">habilitat</span>, i la túnica d'un
          <span class="rosa">mag de veritat</span> t'espera!
        </p>
      </div>

      <!-- Menú de creacions de sales -->
      <div class="actions-container">
        <div class="action-card create-room-card">
          <span class="badge">Obrir un portal</span>
          <input v-model="roomInput" placeholder="Anomena el teu portal..." />
          <label> <input type="checkbox" v-model="isPrivateCreation" />Portal Privat</label>
          <button @click="createRoom">Activar portal</button>
        </div>

        <div class="action-card join-private-card">
          <span class="badge">Unir-se a portal privat</span>
          <input
            v-model="privateCodeInput"
            placeholder="Contrasenya Arcana (6 digits)"
            maxlength="6"
          />
          <button @click="joinPrivateRoom">Entrar al portal privat</button>
        </div>
      </div>

      <!-- Display de rooms creades -->
      <div class="rooms-grid-bottom">
        <h2>Portals detectats</h2>
        <ul class="room-list">
          <li v-for="room in rooms" :key="room.name" class="room-item">
            <div class="room-info">
              <strong>{{ room.name }}</strong>
              <span>👥 {{ room.playerCount }}/6 mags</span>
              <span v-if="room.beingPlayed" class="status-playing"> | 🎮 En partida</span>
            </div>
            <button @click="joinExistingRoom(room.name)">Creuar portal</button>
          </li>
        </ul>
      </div>
    </div>
  </div>

  <!-- Menú de room -->
  <div class="fondoLobby" v-else-if="vista === 'preGame'">
    <!-- Partícules màgiques flotants -->
    <div class="magic-particles-lobby">
      <div class="particle-layer-lobby particle-layer-lobby-1"></div>
      <div class="particle-layer-lobby particle-layer-lobby-2"></div>
      <div class="particle-layer-lobby particle-layer-lobby-3"></div>
      <div class="particle-layer-lobby particle-layer-lobby-4"></div>
      <div class="particle-layer-lobby particle-layer-lobby-5"></div>
    </div>

    <!-- Informació de la room -->
    <div class="lobby-header">
      <span class="lobby-label">Nom portal</span>
      <h1 class="lobby-room-name">{{ currentRoom }}</h1>
      <p class="lobby-subtitle">
        Abraça el teu poder arcà i dirigeix la sala com un autèntic mag. Com més flueixis amb la
        màgia, més llegendari serà el vostre duel.
      </p>
    </div>

    <!-- Jugadors -->
    <viewLobby
      :socket-c="socket"
      :llista-jug="jugadors"
      :is-admin="jugador.role === 'admin'"
      :jugador="jugador"
      :room-name="currentRoom"
      :room-state="roomState"
      @leave="leaveRoom"
    />
  </div>

  <!-- Gameplay -->
  <div class="fondoLobby" v-else-if="vista === 'game'">
    <div class="game-layout">
      <!-- Joc -->
      <div class="game-main">
        <GameEngine
          :socket="socket"
          :jugador="jugador"
          :llista-jug="jugadors"
          :room-name="currentRoom"
          :spell-text="spellText"
          :spell-category="spellCategory"
        />
      </div>

      <aside class="game-sidebar">
        <!-- Temporitzador -->
        <div class="game-timer">
          <TempsRestant :temps-inicial="tempsInicial" :socket="socket" />
        </div>

        <!-- Ranking dinàmic -->
        <div class="game-ranking">
          <RankingComponent :llista-jug="jugadors" />
        </div>
      </aside>
    </div>
  </div>

  <!-- Animació de llibre -->
  <div class="fondoLobby" v-else-if="vista === 'bookAnimation'">
    <BookAnimation :nextView="'game'" @animation-finished="handleAnimationFinished" />
  </div>

  <!-- Pantalla al terminar el joc -->
  <div v-else-if="vista === 'endGame'" class="fondo">
    <div class="ranking">
      <h2>Partida acabada</h2>
      <RankingComponent :llista-jug="jugadors" />
    </div>
    <div class="botonesEndGame">
      <button @click="returnToLobby" class="btn-time">Seguir en el portal</button>
      <button @click="leaveRoom" class="btn salir">Sortir del portal</button>
    </div>
  </div>
</template>

<script setup>
//imports
import { ref } from 'vue'
import { io } from 'socket.io-client'
import RankingComponent from './components/RankingComponent.vue'
import viewLobby from './components/PreGame/lobby/viewLobby.vue'
import BookAnimation from './components/BookAnimation.vue'
import GameEngine from './components/Game/GameEngine.vue'
import TempsRestant from './components/Game/TempsRestant.vue'
import './App.css'

//variables
let socket = null

const rooms = ref([])
const vista = ref('preGame')
const isConnected = ref(false)
const joinedRoom = ref(false)
const jugador = ref({ name: '', id: null, role: 'player' })
const jugadors = ref([])
const tempsInicial = ref(0)
const spellText = ref([])
const spellCategory = ref('')

const currentRoom = ref('')
const roomInput = ref('')

const roomState = ref(null)
const isPrivateCreation = ref(false)
const privateCodeInput = ref('')
const isPortalActive = ref(false)

const notification = ref({ message: '', type: 'info', visible: false })
let notificationTimer = null

// Funció per mostrat les notificacions
function showNotification(message, type = 'info', duration = 3000) {
  // Si ja hi ha una notificació, la neteja per a mostrar la nova
  if (notificationTimer) {
    clearTimeout(notificationTimer)
  }
  notification.value = { message, type, visible: true }

  notificationTimer = setTimeout(() => {
    notification.value.visible = false
  }, duration)
}

// --- CONEXIÓ I EVENTS ---

function tryConn() {
  if (socket && socket.connected) return
  socket = io('http://localhost:3001')

  // Quan es registra el jugador
  socket.on('playerRegistered', (playerData) => {
    Object.assign(jugador.value, playerData)
    isConnected.value = true
    loadRooms()
  })

  // Quan rep la llista de la room
  socket.on('roomList', (list) => {
    rooms.value = list
  })

  // Quan el client s'uneix a la sala
  socket.on('roomJoined', ({ roomName }) => {
    setTimeout(() => {
      isPortalActive.value = false
      currentRoom.value = roomName
      joinedRoom.value = true
      vista.value = 'preGame'
    }, 3000)
  })

  // Quan s'actualitza els jugadors a la sala
  socket.on('updateRoomState', (room) => {
    if (vista.value === 'endGame') return

    roomState.value = room
    jugadors.value = [...room.players]
    const yo = room.players.find((p) => p.id === jugador.value.id)
    if (yo) Object.assign(jugador.value, yo)

    if (room.config && room.config.time) {
      tempsInicial.value = room.config.time
    }

    if (room.beingPlayed && jugador.value.role === 'spectator') {
      vista.value = 'game'
    }
  })

  // Quan s'actualitza el ranking
  socket.on('updateRanking', ({ ranking }) => {
    if (vista.value === 'game') {
      jugadors.value = [...ranking]
    }
  })

  // Quan comença el joc + animació
  socket.on('gameStarted', ({ time, spellText: newSpellText, category }) => {
    vista.value = 'bookAnimation'
    tempsInicial.value = time
    spellText.value = newSpellText || []
    spellCategory.value = category || ''
    showNotification('La partida ha començat', 'success')
  })

  // Quan acaba el joc per temps
  socket.on('gameFinished', ({ ranking }) => {
    jugadors.value = [...ranking]
    vista.value = 'endGame'
    showNotification('Partida acabada!', 'info')
  })

  // Quan succeeix un error
  socket.on('error', ({ message }) => {
    isPortalActive.value = false
    showNotification(message, 'error')
    if (joinedRoom.value) {
      if (currentRoom.value === '' && !roomState.value) {
        joinedRoom.value = false
        currentRoom.value = ''
        vista.value = 'preGame'
        loadRooms()
      }
    }
  })

  // Quan es fa kick
  socket.on('kicked', () => {
    showNotification('Has sigut expulsat del Portal', 'error', 5000)
    resetToRoomList()
  })

  // Quan es crea una sala per primer cop
  socket.on('roomCreated', ({ roomName }) => {
    setTimeout(() => {
      isPortalActive.value = false
      currentRoom.value = roomName
      joinedRoom.value = true
      vista.value = 'preGame'
      showNotification(`Portal ${roomName} activat`, 'info', 3000)
    }, 3000)
  })

  // Quan el admin fa a algun jugador admin
  socket.on('youAreNowAdmin', () => {
    jugador.value.role = 'admin'
    showNotification('Ets el nou administrador!', 'info')
  })

  // Notificació d'afegir-se a una sala
  socket.on('lobbyNotification', ({ message, type }) => {
    showNotification(message, type, 4000) // 4 segundos
  })

  // Advertència de que la sala que vols crear ja té el nom escollit
  socket.on('roomAlreadyCreated', ({ message }) => {
    isPortalActive.value = false
    showNotification(message, 4000)
  })
}

// --- ACCIONS DELS USUARIS ---

function sendNickname(nickname) {
  const trimmedName = nickname.trim()
  if (!trimmedName) {
    showNotification("Has d'introduir un nom", 'error')
    return
  }
  if (trimmedName.length > 15) {
    showNotification('El nom no pot tenir més de 15 caràcters', 'error')
    return
  }
  // Generar un ID únic per al jugador abans de connectar
  const playerId = jugador.value.id || Date.now()
  jugador.value.id = playerId
  jugador.value.name = trimmedName
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
  if (!socket || !socket.connected) return alert('Socket no conectat. Intenta-ho de nou.')
  isPortalActive.value = true
  socket.emit('joinRoom', { roomName })
  currentRoom.value = roomName
}

function joinPrivateRoom() {
  if (!socket || !socket.connected) return alert('Socket no conectat. Intenta-ho de nou.')
  const code = privateCodeInput.value.trim().toUpperCase()
  if (code.length !== 6) {
    showNotification('El codi ha de tenir 6 dígits', 'error')
    return
  }
  isPortalActive.value = true
  socket.emit('joinRoom', { accessCode: code })
  privateCodeInput.value = ''
}

function createRoom() {
  if (!socket || !socket.connected) return alert('Socket no conectat. Intenta-ho de nou.')
  const name = roomInput.value.trim()
  if (!name) {
    showNotification('El portal ha de tenir un nom', 'error')
    return
  }
  if (name.length > 15) {
    showNotification('El nom del portal no pot tenir més de 15 caràcters', 'error')
    return
  }
  isPortalActive.value = true
  socket.emit('createRoom', {
    roomName: name,
    isPrivate: isPrivateCreation.value,
  })
}

function returnToLobby() {
  if (!socket || !socket.connected) return alert('Socket no conectat. Torna a carregar la pàgina.')
  socket.emit('playAgain', { roomName: currentRoom.value, id: jugador.value.id })
  vista.value = 'preGame'
  tempsInicial.value = -1
}

function leaveRoom() {
  if (!socket || !socket.connected) return alert('Socket no conectat. Torna a carregar la pàgina.')
  socket.emit('leaveRoom', { roomName: currentRoom.value, id: jugador.value.id })
  resetToRoomList()
}

function resetToRoomList() {
  joinedRoom.value = false
  currentRoom.value = ''
  vista.value = 'preGame'
  jugadors.value = []
  roomState.value = null
  jugador.value.role = 'player'
  loadRooms()
}

function handleAnimationFinished() {
  vista.value = 'game'
}
</script>