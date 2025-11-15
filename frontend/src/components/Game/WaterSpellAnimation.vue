<template>
  <div class="water-spell-overlay">
    <div class="wave-container">
      <div class="wave"></div>
    </div>
  </div>
</template>

<style scoped>
.water-spell-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  overflow: hidden;
  z-index: 100;
}

.wave-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  animation: slide-in 1.2s ease-out forwards;
}

.wave {
  position: absolute;
  bottom: 0;
  left: -50%;
  width: 200%;
  height: 150%;
  background: radial-gradient(circle, rgba(0, 191, 255, 0.7) 0%, rgba(30, 144, 255, 0.5) 70%);
  border-radius: 45%;
  animation: wave-motion 1.2s ease-out forwards;
}

@keyframes slide-in {
  0% {
    transform: translateY(100%);
  }
  100% {
    transform: translateY(0);
  }
}

@keyframes wave-motion {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
