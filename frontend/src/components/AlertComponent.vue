<template>
  <div v-if="messageList && messageList.length" class="alerts">
    <div
      v-for="(msg, index) in messageList"
      :key="index"
      :class="{ disabled: disabled }"
    >
      <p>{{ msg }}</p>
    </div>
  </div>
</template>

<script setup>

const props = defineProps({
  messageList: { type: Array, default: () => [] },
  disabled: { type: Boolean, default: false }
})

console.log(props)


</script>

<style scoped>
.disabled { display: none; }
</style>