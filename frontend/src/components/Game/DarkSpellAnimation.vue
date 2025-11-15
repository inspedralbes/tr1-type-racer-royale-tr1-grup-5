<template>
  <div class="dark-spell-overlay">
    <div class="shadow-tendril" v-for="i in 10" :key="i" :style="getTendrilStyle(i)"></div>
  </div>
</template>

<script setup>
const getTendrilStyle = (i) => {
  return {
    '--i': i,
    '--width': `${Math.random() * 200 + 100}px`,
    '--duration': `${Math.random() * 0.5 + 0.8}s`,
    '--delay': `${Math.random() * 0.5}s`,
    '--origin-y': `${Math.random() * 50 + 25}%`,
  };
};
</script>

<style scoped>
.dark-spell-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  overflow: hidden;
  z-index: 100;
  background: radial-gradient(circle, rgba(75, 0, 130, 0.5) 0%, transparent 70%);
  opacity: 0;
  animation: fade-in-out 1.3s ease-out forwards;
}

.shadow-tendril {
  position: absolute;
  top: var(--origin-y);
  left: -200px;
  width: var(--width);
  height: 5px;
  background: linear-gradient(90deg, #4b0082, #8a2be2, #9400d3);
  border-radius: 5px;
  opacity: 0.7;
  filter: blur(3px);
  transform-origin: left center;
  animation: whip-across var(--duration) var(--delay) ease-in-out forwards;
}

@keyframes fade-in-out {
  0%, 100% {
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
}

@keyframes whip-across {
  0% {
    transform: scaleX(0);
    left: 0%;
  }
  50% {
    transform: scaleX(1);
    left: 50%;
  }
  100% {
    transform: scaleX(0);
    left: 100%;
  }
}
</style>
