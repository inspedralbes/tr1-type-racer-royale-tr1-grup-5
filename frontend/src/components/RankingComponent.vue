<template>
  <div class="ranking-container">
    <div class="particles">
      <span
        v-for="(p, i) in particles"
        :key="i"
        class="particle"
        :style="{
          left: `${p.left}%`,
          width: `${p.size}px`,
          height: `${p.size}px`,
          backgroundColor: p.color,
          boxShadow: `0 0 8px ${p.color}aa`,
          animationDuration: `${p.duration}s`,
          animationDelay: `${p.delay}s`,
        }"
      ></span>
    </div>
    <table>
      <thead>
        <tr>
          <th>MAG</th>
          <th>Jugadors</th>
          <th>Errors</th>
          <th>Encerts</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(player, index) in llistatJugadors" :key="player.id">
          <td class="rank-cell">
            <img
              class="mage-avatar"
              :src="getMageImage(player)"
              alt="Mag"
            />
          </td>
          <td class="rank-cell">{{ player.name }}</td>
          <td>{{ player.errors }}</td>
          <td>{{ player.points }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps(['llistaJug'])
const llistatJugadors = computed(() => {
  if (!props.llistaJug) return []

  return (
    props.llistaJug
      .filter((player) => player.role !== 'spectator')
      .sort((a, b) => {
        if (a.points !== b.points) {
          return b.points - a.points
        }
        return a.errors - b.errors
      })
  )
})

//Funció que retorna la imatge del mag segons el nom del mag assinat
const getMageImage = (player) => {
  const defaultAvatar = '/img/Aprendiz_Mago.png'
  if (!player || !player.mage || !player.mage.name) return defaultAvatar
  const mageName = String(player.mage.name).toLowerCase()

  if (mageName.includes('foc')){
    return '/img/magosPartida/MagoFuego.jpg'
  }
  if (mageName.includes('aigua')) {
    return '/img/magosPartida/MagoAgua.jpg'
  }
  if (
    mageName.includes('jungla')
  ) {
    return '/img/magosPartida/MagoTierra.jpg'
  }
  if (mageName.includes('llum')) {
    return '/img/magosPartida/MagoAngelical.jpg'
  }
  if (
    mageName.includes('oscur')
  ) {
    return '/img/magosPartida/MagoObscuro.jpg'
  }
  if (mageName.includes('gel')) {
    return '/img/magosPartida/MagoHielo.jpg'
  }

  return defaultAvatar
}

const particleCount = 40
const colors = ['#00f2ff', '#ffd700', '#c0c0c0', '#f0f0f0'] //

const particles = Array.from({ length: particleCount }).map(() => ({
  duration: Math.random() * 8 + 5,

  delay: Math.random() * 7,
  left: Math.random() * 100,
  size: Math.random() * 2 + 1,
  color: colors[Math.floor(Math.random() * colors.length)],
}))
</script>

<style>
.ranking-container {
  border-radius: 2rem;
  position: relative;
  overflow: hidden; 
  width: 100%;
  margin: 2rem auto;
  background: #ffffff;

  /* --- NOU ESTIL DE VORA LLUMINOSA --- */
  --glow-color: #671dc7;

  border: 1px solid rgba(0, 242, 255, 0.5);

  box-shadow:
    inset 0 0 10px rgba(7, 107, 238, 0.3),
    0 0 15px var(--glow-color),
    0 0 30px var(--glow-color),
    0 0 50px rgba(10, 96, 255, 0.5);
}

.particles {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1; 
  pointer-events: none; 
}

.particle {
  position: absolute;
  bottom: -10px;
  border-radius: 50%;
  opacity: 0;

  animation-name: float-up;
  animation-timing-function: linear;
  animation-iteration-count: infinite;
}

@keyframes float-up {
  0% {
    transform: translateY(0);
    opacity: 0;
  }
  10%,
  90% {
    opacity: 0.9;
  }
  100% {
    transform: translateY(-100vh);
    opacity: 0;
  }
}

table {
  width: 100%;
  margin: 0;
  box-shadow: none;

  position: relative;
  z-index: 2;

  background-color: rgb(23, 3, 39);
  color: #f0f0f0;
  border-collapse: collapse;
  border-radius: 2rem;
}

thead tr {
  background-color: rgb(23, 3, 39);
  border-bottom: 1px solid #ffffff;
}
tbody tr:last-child {
  border-bottom: none;
}

th {
  padding: 1rem 1.5rem;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  color: #ffffffea;
  text-align: left;
}

td {
  padding: 1rem 1.5rem;
  transition: background-color 0.3s ease;
}

tbody tr {
  border-bottom: 1px solid rgba(213, 192, 218, 0.2);
  transition: all 0.2s ease-in-out;
}

tbody tr:hover {
  transform: scale(1.02);
  position: relative;
}

/* --- 6. NOUS ESTILS PER A LA POSICIÓ I EL PODI --- */
.rank-cell {
  vertical-align: middle;
  text-align: center;
  width: 150px; 
}

.mage-avatar {
  width: 64px;
  height: 64px;
  border-radius: 8px;
  object-fit: cover;
  box-shadow: 0 0 6px rgba(255, 255, 255, 0.25);
}

/* --- 7. AJUSTAR 'NTH-CHILD' PERQUÈ COINCIDEIXIN AMB LES NOVES COLUMNES --- */

th:first-child {
  text-align: center;
}

th:nth-child(3),
td:nth-child(3) {
  text-align: center;
}

th:nth-child(4),
td:nth-child(4) {
  text-align: center;
}

td:nth-child(3) {
  font-weight: bold;
  color: #ff4d4d;
  text-shadow: 0 0 8px rgba(255, 77, 77, 0.5);
}

td:nth-child(4) {
  font-weight: bold;
  font-size: 1.1em;
  color: #00f2ff;
  text-shadow: 0 0 10px rgba(0, 242, 255, 0.7);
}

</style>
