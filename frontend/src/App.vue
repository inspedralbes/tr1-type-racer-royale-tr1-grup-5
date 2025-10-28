<template>
  <router-view />
  <!-- vista de lobby -->
  <div v-if="vista === 'lobby'">
    <div v-if="isConnected === false">
      <input type="text" v-model="jugador" placeholder="Introdueix nom"/>
      <button @click="tryConn">Entra</button>
      <p>Type Racer Royale</p>
    </div>
    <div v-else>
      <p>Benvingut {{ jugador.value.name }} en aquesta partida tens el rol de {{ jugador.value.rol }} <!--El rol--></p>
      <!-- Llista pel admin-->
      <ul v-if="isAdmin">
        <li v-for="player in jugadors" :key="player.id">
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
      <!--Botons-->
      <button v-if="isAdmin" v-bind:class="isMajority ? '' : 'disabled'" @click="startGame">
        { }
      </button>
    </div>
  </div>
  <!-- vista de joc -->
   <div v-else-if="vista === 'game'">

   </div>
  <!-- vista de endgame-->
   <div v-else-if="vista === 'endGame'">

   </div>

</template>

<script setup>
//imports
  import { ref } from 'vue';
  //import GameEngine from './components/Game/GameEngine.vue';

//variables
  const vista = ref('lobby');
  const isConnected = ref(false);
  const isMajority = ref(jugadors.value.filter(player => player.state === 'ready').length >= Math.round(jugadors.value.length/2))
  const isAdmin = ref((jugador.value.rol === 'admin'))
  const jugador = ref({name: '', rol: '', state: 'notReady'}) //rol: 'ready' | 'notReady'
  const jugadors = ref([]);

  var socket = null;
  
//funcions
  /*la idea es que intenti fer la connexio per socket i si funciona, especificar
    la variable jugador com a objecte sencer i jugadors en general també amb obj*/
  function tryConn(){
    //socket intenta connectar amb el server i rep el llistat actual de jugadors
    var objJugador = {...jugador, id: 0, err: 0, frases: 0, rol:''};
    jugadors.value.push(objJugador);
    jugador.value = jugadors.value.filter((jug) => jug.name === jugador.value.name);
    isConnected.value = true;
    //sino alert
  }

  function setAdmin(id){
    /*socket intenta canviar rol admin actiu per jugador i jugador especific per admin
    i sobreescriu al servidor intercanviant l'id d'ambdos jugadors*/
    console.log(id)
  }

  function deletePlayer(id){
    /*socket intenta eliminar jugador forçant-li desconnection i s'actualitza la llista de
    jugadors al servidor*/
    console.log(id)
  }

  function startGame(){
    /*compte enrrere de 5 segons, si es compleix sense interrupcions, envia comença el joc */
  }

</script>

<style scoped>
  .estat{
    max-width: 60%;
    width: 30px;
    height: auto;
  }
  .ready{
    background-color: greenyellow;
  }

  .notReady{
    background-color: red;
  }
</style>
