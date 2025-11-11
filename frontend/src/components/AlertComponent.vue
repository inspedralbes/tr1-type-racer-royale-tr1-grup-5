<template lang="">
  <div v-for="(message, index) in props.messageList" :key="index" class="alert">
    <p> {{message}} </p>
  </div>
</template>

<script setup>
const props = defineProps(['messageList'])

</script>

<style scoped>
    
</style>