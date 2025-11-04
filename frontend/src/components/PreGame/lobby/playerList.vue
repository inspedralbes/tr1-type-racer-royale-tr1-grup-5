<template>
    <ul v-if="adminRol">
        <li v-for="player in llistaJugadors" :key="player.id">
            <button v-if="player.id > 0" @click="setAdmin(player.id)">
                <!--Logo estrella buit-->
            </button>
            {{ player.name }}
            <button v-if="player.id > 0" @click="deletePlayer(player.id)">
                <!--Logo creu-->
            </button>
            <div class="estat" v-bind:class="player.isReady === true ? 'ready' : 'notReady'"></div>
        </li>
    </ul>
		<!-- Llista per jugador / espectador -->
    <ul v-else>
        <li v-for="player in llistaJugadors" :key="player.id">
            {{ player.name }}
            <div class="estat" v-bind:class="player.isReady === true ? 'ready' : 'notReady'"></div>
        </li>
    </ul>
</template>

<script setup>
import { computed } from 'vue';
const props = defineProps(['socketC', 'llistaJug', 'isAdmin', 'jugador'])

const adminRol = computed(() => props.isAdmin);
const llistaJugadors = computed(() => props.llistaJug);
const socket = computed(() => props.socketC);
const jugadorClient = computed(() => props.jugador || {});


//Functions
function setAdmin(id){
  if (socket && props.isAdmin && jugadorClient?.id) {
    socket.emit('transferAdmin', { adminId: jugadorClient.id, newAdminId: id });
  }
}

function deletePlayer(id){
  if (socket && props.isAdmin && jugadorClient?.id) {
    socket.emit('kickPlayer', { adminId: jugadorClient.id, playerId: id });
  }
}
</script>
