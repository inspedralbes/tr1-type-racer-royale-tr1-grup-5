<template>
  <div class="light-spell-overlay">
    <div class="light-flash"></div>
    <div class="sparkle" v-for="i in 30" :key="i" :style="getSparkleStyle(i)"></div>
  </div>
</template>

<script setup>
const getSparkleStyle = (i) => {
  const size = Math.random() * 15 + 5;
  return {
    '--i': i,
    '--size': `${size}px`,
    '--left': `${Math.random() * 100}%`,
    '--top': `${Math.random() * 100}%`,
    '--anim-duration': `${Math.random() * 0.4 + 0.4}s`,
    '--anim-delay': `${Math.random() * 0.5}s`,
  };
};
</script>

<style scoped>
.light-spell-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  overflow: hidden;
  z-index: 100;
}

.light-flash {
  width: 100%;
  height: 100%;
  background: #fff;
  opacity: 0;
  animation: flash 0.8s ease-out forwards;
}

.sparkle {
  position: absolute;
  top: var(--top);
  left: var(--left);
  width: var(--size);
  height: var(--size);
  background: #ffd700;
  border-radius: 50%;
  box-shadow: 0 0 15px #ffd700, 0 0 30px #fff;
  opacity: 0;
  animation: twinkle var(--anim-duration) var(--anim-delay) ease-out forwards;
}

@keyframes flash {
  0% {
    opacity: 0;
  }
  50% {
    opacity: 0.7;
  }
  100% {
    opacity: 0;
  }
}

@keyframes twinkle {
  0% {
    transform: scale(0);
    opacity: 0;
  }
  50% {
    transform: scale(1.5);
    opacity: 1;
  }
  100% {
    transform: scale(0);
    opacity: 0;
  }
}
</style>
