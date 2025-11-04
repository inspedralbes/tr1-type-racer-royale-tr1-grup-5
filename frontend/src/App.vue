<template>
  <!-- Si aún no hemos entrado en una sala -->
  <div v-if="!joinedRoom">
    <h2>Selecciona o crea una sala</h2>
    <input v-model="roomInput" placeholder="Nombre de la sala" />
    <button @click="createOrJoinRoom">Entrar a sala</button>
  </div>

  <!-- vista de lobby -->
  <div v-else-if="vista === 'preGame'">
    <div v-if="!isConnected">
      <input type="text" v-model="jugador.name" placeholder="Introduce tu nombre" />
      <button @click="sendNickname(jugador.name)">Entrar</button>
      <p>Type Racer Royale — Sala: {{ currentRoom }}</p>
    </div>

    <div v-else>
      <viewLobby
        :socket-c="socket"
        :llista-jug="jugadors"
        :jug="jugador"
        :room-id="currentRoom"
      />
    </div>
  </div>

  <!-- vista de juego -->
  <div v-else-if="vista === 'game'">
    <div id="jugador" v-if="!isSpectator">
      <div id="partida">
        <GameEngine
          :socket="socket"
          :jugador="jugador"
          :es-espectador="isSpectator"
          :room-id="currentRoom"
        />
      </div>
      <div id="tempsRestant">
        <TempsRestant :tempsInicial="tempsRestant" :socket="socket" :room-id="currentRoom" />
      </div>
      <div id="ranquing">
        <RankingComponent :llista-jug="jugadors" />
      </div>
    </div>
  </div>

  <!-- vista de endgame -->
  <div v-else-if="vista === 'endGame'">
    <RankingComponent :llista-jug="jugadors" />
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

const vista = ref('preGame')
const isConnected = ref(false)
const jugador = ref({ name: '', id: null, status: '', role: '' })
const jugadors = ref([])
const tempsRestant = ref(-1)
const isSpectator = ref(false)

const currentRoom = ref('')
const joinedRoom = ref(false)
const roomInput = ref('')

function createOrJoinRoom() {
  if (!roomInput.value.trim()) return
  currentRoom.value = roomInput.value.trim()
  joinedRoom.value = true
  tryConn(currentRoom.value)
}

function tryConn(roomId) {
  if (socket && socket.connected) return

  socket = io('http://localhost:3001')

  socket.on('connect', () => {
    console.log('Socket conectado ✅')
    if (roomId) {
      socket.emit('joinRoom', { roomId }, (res) => {
        if (res?.ok) console.log('Unido a la sala', roomId)
        else console.error(res?.message)
      })
    }
  })

  socket.on('setPlayerList', (playerList) => {
    jugadors.value = Array.isArray(playerList) ? [...playerList] : []
    const updated = jugadors.value.find((j) => j.id === jugador.value.id)
    if (updated) Object.assign(jugador.value, updated)
    isSpectator.value = jugador.value.role === 'spectator'
    if (!isConnected.value && jugador.value.id && jugador.value.name) isConnected.value = true
  })

  socket.on('gameStarted', (data) => {
    vista.value = 'game'
    if (data.time) iniciarComptador(data.time)
  })

  socket.on('playerKicked', ({ id }) => {
    if (id === jugador.value.id) {
      alert('Has sido expulsado de la sala.')
      resetState()
    }
  })

  socket.on('gameFinished', () => {
    vista.value = 'endGame'
  })
}

function resetState() {
  isConnected.value = false
  jugador.value = { name: '', id: null, status: '', role: '' }
  jugadors.value = []
  joinedRoom.value = false
  currentRoom.value = ''
  vista.value = 'preGame'
  if (socket) socket.disconnect()
  socket = null
}

function sendNickname(nickname) {
  if (!nickname.trim()) return
  const playerId = jugador.value.id || Date.now()
  jugador.value.id = playerId
  jugador.value.name = nickname.trim()

  if (!socket || !socket.connected) {
    tryConn(currentRoom.value)
    socket.once('connect', () => {
      socket.emit('setPlayerName', { name: nickname.trim(), id: playerId, roomId: currentRoom.value })
    })
  } else {
    socket.emit('setPlayerName', { name: nickname.trim(), id: playerId, roomId: currentRoom.value })
  }
}

function iniciarComptador(tempsInici) {
  tempsRestant.value = tempsInici
  const interval = setInterval(() => {
    if (tempsRestant.value > 0) {
      tempsRestant.value--
    } else {
      clearInterval(interval)
      socket.emit('gameEnded', { roomId: currentRoom.value })
      vista.value = 'endGame'
    }
  }, 1000)
}
</script>

<style scoped>
.ready {
  background-color: greenyellow;
}
.notReady {
  background-color: red;
}
</style>
  