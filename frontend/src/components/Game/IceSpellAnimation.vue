<template>
  <div class="ice-spell-overlay">
    <div class="frost-overlay"></div>
    <div class="ice-crystal" v-for="i in 20" :key="i" :style="getCrystalStyle(i)"></div>
  </div>
</template>

<script setup>
const getCrystalStyle = (i) => {
  const size = Math.random() * 40 + 10;
  return {
    '--i': i,
    '--size': `${size}px`,
    '--left': `${Math.random() * 100}%`,
    '--top-start': `${Math.random() * 100}%`,
    '--top-end': `${Math.random() * 100}%`,
    '--anim-duration': `${Math.random() * 0.5 + 0.5}s`,
    '--anim-delay': `${Math.random() * 0.3}s`,
  };
};
</script>

<style scoped>
.ice-spell-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  overflow: hidden;
  z-index: 100;
}

.frost-overlay {
  width: 100%;
  height: 100%;
  background: rgba(173, 216, 230, 0.5);
  opacity: 0;
  animation: frost-appear 1s ease-out forwards;
  backdrop-filter: blur(2px);
}

.ice-crystal {
  position: absolute;
  top: var(--top-start);
  left: var(--left);
  width: var(--size);
  height: var(--size);
  background: linear-gradient(135deg, #ffffff, #e0f7ff);
  clip-path: polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%);
  opacity: 0;
  animation: grow-and-shatter var(--anim-duration) var(--anim-delay) ease-out forwards;
}

@keyframes frost-appear {
  0% {
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}

@keyframes grow-and-shatter {
  0% {
    transform: scale(0);
    opacity: 0;
  }
  50% {
    transform: scale(1.2);
    opacity: 0.9;
  }
  100% {
    transform: scale(0.5) rotate(180deg);
    opacity: 0;
    top: var(--top-end);
  }
}
</style>
