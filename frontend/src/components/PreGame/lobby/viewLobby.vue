<template>
  <p>
    Benvingut {{ jugadorClient.name }} en aquesta partida tens el rol de {{ jugadorClient.role }}
  </p>
  <!-- Llista pel admin-->
  <div>
    <playerList
      :socket-c="socket"
      :llista-jug="llistaJugadors"
      :is-admin="isAdmin"
      :jugador="jugadorClient"
    />
    <!--Botons-->
    <button v-if="isAdmin" v-bind:class="isMajority ? '' : 'disabled'" @click="startGame">
      Començar
    </button>
    <button v-bind:class="imReady ? 'ready' : 'notReady'" @click="toggleReady(jugadorClient.id)">
      Preparat
    </button>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import playerList from './playerList.vue'

//props
const props = defineProps(['socketC', 'llistaJug', 'jug'])
const socket = computed(() => props.socketC)
const llistaJugadors = computed(() => props.llistaJug)
const jugadorClient = computed(() => props.jug || {})

const imReady = ref(false)

// Computed per actualitzar-se quan canviïn les dades
const isMajority = computed(() => {
  if (!llistaJugadors || !Array.isArray(llistaJugadors)) return false
  return (
    llistaJugadors.filter((player) => player.isReady === true).length >=
    Math.round(llistaJugadors.length / 2)
  )
})

const isAdmin = computed(() => {
  return jugadorClient?.role === 'admin'
})

//sockets

//funcions
function startGame() {
  if (socket && jugadorClient?.id) {
    socket.emit('startGame', { id: jugadorClient.id })
  }
}

function toggleReady(id) {
  if (socket && id) {
    socket.emit('setIsReady', { id: id })
  }
}
</script>

<style scoped></style>
