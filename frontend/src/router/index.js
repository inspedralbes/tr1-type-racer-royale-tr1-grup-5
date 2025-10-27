import { createRouter, createWebHistory } from 'vue-router'
import Lobby from '../components/Lobby.vue'
import GameEngine from '../components/GameEngine.vue'

const routes = [
  {
    path: '/',
    name: 'Lobby',
    component: Lobby
  },
  {
    path: '/game',
    name: 'GameEngine',
    component: GameEngine
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router
