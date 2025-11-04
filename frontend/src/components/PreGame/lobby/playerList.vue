<template>
    <ul v-if="props.isAdmin">
        <li v-for="player in props.llistaJug" :key="player.id">
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
        <li v-for="player in props.llistaJug" :key="player.id">
            {{ player.name }}
            <div class="estat" v-bind:class="player.isReady === true ? 'ready' : 'notReady'"></div>
        </li>
    </ul>
</template>

<script setup>
const props = defineProps(['socketC', 'llistaJug', 'isAdmin', 'jugador'])

//Variables
const socket = props.socketC;

//Functions
function setAdmin(id){
  if (socket && props.isAdmin && props.jugador?.id) {
    socket.emit('transferAdmin', { adminId: props.jugador.id, newAdminId: id });
  }
}

function deletePlayer(id){
  if (socket && props.isAdmin && props.jugador?.id) {
    socket.emit('kickPlayer', { adminId: props.jugador.id, playerId: id });
  }
}
</script>
