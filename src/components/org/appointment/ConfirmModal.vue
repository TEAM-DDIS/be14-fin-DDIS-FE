<template>
  <div class="modal-overlay">
    <div class="modal-content">
      <p class="modal-title">인사발령 이력 삭제</p>
      <p class="modal-message">{{ message }}</p>
      <div class="modal-actions">
          <button class="btn cancel" @click="$emit('cancel')">취소</button>
          <button class="btn confirm" @click="$emit('confirm')">확인</button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  message: {
    type: String,
    required: true
  }
})
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background-color: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: var(--modal-box-bg);
  padding: 20px;
  border-radius: 12px;
  width: 300px;
  text-align: center;
}

.modal-title {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 30px;
}

.modal-message {
  font-size: 18px;
  margin-bottom: 40px;
}

.modal-actions {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-bottom: 10px;
}

.btn {
  padding: 8px 24px;
  border-radius: 6px;
  font-weight: bold;
  font-size: 14px;
  cursor: pointer;
}

.btn.confirm {
  font-size: 14px;
  font-weight: bold;
  background-color: var(--primary);
  color: var(--text-on-primary);
  border: 1px solid transparent;
  border-radius: 10px;
  padding: 10px 30px;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: background-color 0.2s, box-shadow 0.2s;
}
.btn.confirm:hover {
  background-color: var(--bg-main);
  color: var(--primary);
  border-color: var(--primary);
  box-shadow: inset 1px 1px 10px rgba(0, 0, 0, 0.25);
}

.btn.cancel {
  font-size: 14px;
  font-weight: bold;
  background-color: #D3D3D3;
  color: #000;
  border: none;
  border-radius: 10px;
  padding: 10px 30px;
  font-weight: bold;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: background-color 0.2s, box-shadow 0.2s;
  box-sizing: border-box;

}
.btn.cancel:hover {
  background-color: #000;
  color: #fff;
}
</style>
