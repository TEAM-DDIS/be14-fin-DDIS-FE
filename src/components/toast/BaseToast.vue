<!-- components/BaseToast.vue -->
<template>
  <transition name="fade">
    <div v-if="visible" class="toast-bar">
      {{ message }}
    </div>
  </transition>
</template>

<script setup>
import { ref } from 'vue'

const visible = ref(false)
const message = ref('')

// 부모가 이 함수를 호출해 토스트를 띄움
function show(msg, duration = 3000) {
  message.value = msg
  visible.value = true
  setTimeout(() => {
    visible.value = false
  }, duration)
}

// 이 함수를 외부에서 쓸 수 있도록 노출
defineExpose({ show })
</script>

<style scoped>
.toast-bar {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: var(--bg-box);
  border: 2px solid var(--primary);
  color: var(--primary);
  padding: 20px 30px;
  border-radius: 12px;
  font-weight: bold;
  font-size: 1.0rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  z-index: 1000;
}
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
