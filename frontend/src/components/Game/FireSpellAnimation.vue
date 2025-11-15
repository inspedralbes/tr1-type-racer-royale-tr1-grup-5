<template>
  <div class="fire-spell-overlay">
    <div class="flame" v-for="i in 15" :key="i" :style="getFlameStyle(i)"></div>
  </div>
</template>

<script setup>
const getFlameStyle = (i) => {
  const size = Math.random() * 100 + 50;
  return {
    '--i': i,
    '--size': `${size}px`,
    '--left-start': `${Math.random() * 100}%`,
    '--left-end': `${Math.random() * 100}%`,
    '--anim-duration': `${Math.random() * 0.5 + 0.4}s`,
    '--anim-delay': `${Math.random() * 0.2}s`,
  };
};
</script>

<style scoped>
.fire-spell-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  overflow: hidden;
  z-index: 100;
}

.flame {
  position: absolute;
  bottom: -50px;
  left: var(--left-start);
  width: var(--size);
  height: var(--size);
  background-image: radial-gradient(circle, #ffc107 20%, #ff8c00 50%, #ff4500 90%);
  border-radius: 50% 50% 20% 20%;
  filter: blur(15px);
  opacity: 0;
  transform: rotate(45deg);
  animation: rise-and-burn var(--anim-duration) var(--anim-delay) ease-out forwards;
}

@keyframes rise-and-burn {
  0% {
    bottom: -100px;
    opacity: 0;
    transform: scale(0.5) rotate(45deg);
  }
  50% {
    opacity: 0.9;
    transform: scale(1.2) rotate(45deg);
  }
  100% {
    bottom: 100%;
    opacity: 0;
    transform: scale(0.3) rotate(45deg);
    left: var(--left-end);
  }
}
</style>
