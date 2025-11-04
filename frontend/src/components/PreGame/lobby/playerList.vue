<template>
  <ul>
    <li v-for="player in props.llistaJug" :key="player.id">
      {{ player.name }}
      <span v-if="player.id === props.jugador.id">(Tú)</span>
      <span v-if="player.role === 'admin'">⭐</span>

      <!-- Solo el admin ve los botones y nunca sobre sí mismo -->
      <template v-if="props.isAdmin && player.id !== props.jugador.id">
        <button @click="setAdmin(player.id)">Convertir en administrador</button>
        <button @click="deletePlayer(player.id)">Expulsar jugador</button>
      </template>

      <div class="estat" :class="player.isReady ? 'ready' : 'notReady'"></div>
    </li>
  </ul>
</template>

<script setup>
const props = defineProps(['socketC', 'llistaJug', 'isAdmin', 'jugador'])

// ES BORRA ELS COMPUTED NO FAN FALTA PODEM INDICARLO DIRECTAMENT DESDE props del pare viewLobby

//Functions
function setAdmin(id) {
  if (props.socketC && props.isAdmin && props.jugador?.id) {
    props.socketC.emit('transferAdmin', { adminId: props.jugador.id, newAdminId: id })
  }
}

function deletePlayer(id) {
  if (props.socketC && props.isAdmin && props.jugador?.id) {
    props.socketC.emit('kickPlayer', { adminId: props.jugador.id, playerId: id })
  }
}
</script>
