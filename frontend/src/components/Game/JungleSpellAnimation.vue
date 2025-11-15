<template>
  <div class="jungle-spell-overlay">
    <div class="vine" v-for="i in 12" :key="`vine-${i}`" :style="getVineStyle(i)"></div>
    <div class="leaf" v-for="i in 25" :key="`leaf-${i}`" :style="getLeafStyle(i)"></div>
  </div>
</template>

<script setup>
const getVineStyle = (i) => {
  return {
    '--i': i,
    '--start-x': `${Math.random() * 100}%`,
    '--duration': `${Math.random() * 0.5 + 0.4}s`,
    '--delay': `${Math.random() * 0.4}s`,
  };
};

const getLeafStyle = (i) => {
  const size = Math.random() * 30 + 15;
  return {
    '--i': i,
    '--size': `${size}px`,
    '--start-x': `${Math.random() * 100}%`,
    '--duration': `${Math.random() * 0.8 + 0.5}s`,
    '--delay': `${Math.random() * 0.8}s`,
    '--rotation': `${Math.random() * 360}deg`,
  };
};
</script>

<style scoped>
.jungle-spell-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  overflow: hidden;
  z-index: 100;
}

.vine {
  position: absolute;
  top: -10%;
  left: var(--start-x);
  width: 8px;
  height: 120%;
  background: linear-gradient(to bottom, #228b22, #32cd32);
  border-radius: 4px;
  transform-origin: top center;
  animation: grow-down var(--duration) var(--delay) ease-in-out forwards;
}

.leaf {
  position: absolute;
  top: -50px;
  left: var(--start-x);
  width: var(--size);
  height: var(--size);
  background: #6b8e23;
  clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%);
  opacity: 0;
  animation: fall-and-fade var(--duration) var(--delay) linear forwards;
}

@keyframes grow-down {
  0% {
    transform: scaleY(0);
  }
  100% {
    transform: scaleY(1);
  }
}

@keyframes fall-and-fade {
  0% {
    transform: translateY(0) rotate(0deg);
    opacity: 1;
  }
  100% {
    transform: translateY(100vh) rotate(var(--rotation));
    opacity: 0;
  }
}
</style>
