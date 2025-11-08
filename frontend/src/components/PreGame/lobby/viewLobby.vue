<template>
  <p>
    Benvingut {{ jugadorClient.name }} en aquesta partida tens el rol de {{ jugadorClient.role }}
  </p>
  <!-- Llista pel admin-->
  <div>
    <playerList :llista-jug="llistaJugadors" :is-admin="isAdmin" :jugador="jugadorClient" />
    <button v-if="isAdmin" @click="changeTime">Temps: {{ tempsEstablert }}s</button>
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
import { socket } from '@/socket' // Importamos el socket
import playerList from './playerList.vue'

//props
const props = defineProps(['llistaJug', 'jug'])
const llistaJugadors = computed(() => props.llistaJug)
const jugadorClient = computed(() => props.jug || {})

const tempsEstablert = ref(60)
const imReady = ref(false)

// Computed per actualitzar-se quan canviïn les dades
const isMajority = computed(() => {
  if (!llistaJugadors.value || !Array.isArray(llistaJugadors.value)) return false
  return (
    llistaJugadors.value.filter((player) => player.isReady === true).length >=
    Math.round(llistaJugadors.value.length / 2)
  )
})

const isAdmin = computed(() => {
  return jugadorClient.value?.role === 'admin'
})

function changeTime() {
  switch (tempsEstablert.value) {
    case 60:
      tempsEstablert.value = 90
      break
    case 90:
      tempsEstablert.value = 120
      break
    case 120:
      tempsEstablert.value = 30
      break
    case 30:
      tempsEstablert.value = 60
      break
    default:
      tempsEstablert.value = 60
  }
}

//funcions
function startGame() {
  if (jugadorClient.value?.id) {
    socket.emit('startGame', {
      id: jugadorClient.value.id,
      tempsEstablert: tempsEstablert.value,
    })
  }
}

function toggleReady(id) {
  if (id) {
    socket.emit('setIsReady', { id })
  }
}
</script>

<style scoped></style>
