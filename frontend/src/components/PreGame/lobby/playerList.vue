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
            <div class="estat" v-bind:class="player.state === 'ready' ? 'ready' : 'notReady'"></div>
        </li>
    </ul>
		<!-- Llista per jugador / espectador -->
    <ul v-else>
        <li v-for="player in jugadors" :key="player.id">
            {{ player.name }}
            <div class="estat" v-bind:class="player.state === 'ready' ? 'ready' : 'notReady'"></div>
        </li>
    </ul>
</template>
<script setup>
defineProps(['socketC', 'llistaJug', 'isAdmin'])

//Variables
const adminRol = this.props.isAdmin;
const llistaJugadors = this.props.llistaJugadors;
const socket = this.props.socketC;

//Functions
function setAdmin(id){
    socket.emit('transferirAdmin', id);
  }

  function deletePlayer(id){
    socket.emit('expulsarJug', id);
  }
</script>