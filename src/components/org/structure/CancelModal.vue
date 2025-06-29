<template>
  <div class="modal-overlay">
    <div class="modal-box">
      <p class="modal-title">조직 구성 편집 취소</p>
      <p class="modal-message">{{ message }}</p>
      <div class="modal-actions">
        <button class="btn-cancel" @click="close">아니오</button>
        <button class="btn-confirm" @click="$emit('confirm')">예</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'
const props = defineProps({
  message: { type: String, default: '정말 취소하시겠습니까?' }
})
const emit = defineEmits(['confirm', 'close'])
function close() {
  emit('close')
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.4);
  display: flex; 
  align-items: center; 
  justify-content: center;
}

.modal-box {
  background: var(--bg-main); 
  padding: 20px; 
  border-radius: 12px;
  width: 300px; 
  text-align: center;
}
.modal-title {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 30px;
  color: var(--text-main);
}

.modal-message { 
  margin-bottom: 35px;
  font-size: 18px;
  color: var(--text-main);
}

.modal-actions {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin: 15px 0px;
}

.btn-confirm {
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  font-family: inherit;
  background-color: var(--primary);
  color: var(--text-on-primary);
  border: 1px solid transparent;
  border-radius: 10px;
  padding: 10px 30px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: background-color 0.2s, box-shadow 0.2s;
}

.btn-confirm:hover {
  background-color: var(--bg-main);
  color: var(--primary);
  border-color: var(--primary);
}

.btn-cancel {
  font-size: 14px;
  font-weight: bold;
  background-color: #D3D3D3;
  color: #000;
  border: none;
  border-radius: 10px;
  padding: 10px 18px;
  font-weight: bold;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: background-color 0.2s, box-shadow 0.2s;
  box-sizing: border-box;
}
.btn-cancel:hover {
  background-color: #000;
  color: #fff;
}
</style>
