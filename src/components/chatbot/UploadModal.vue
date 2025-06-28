<template>
  <div class="upload-modal-overlay" @click.self="$emit('close')">
    <div class="upload-modal-box">
      <div class="upload-header">
        <h2>PDF 업로드</h2>
        <button class="close-btn" @click="$emit('close')">✕</button>
      </div>
      <input type="file" accept="application/pdf" @change="onFileChange" />
      <button class="upload-btn" :disabled="!file" @click="uploadFile">
        업로드
      </button>
    </div>
    <BaseToast ref="toastRef" />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import axios from 'axios'
import BaseToast from '@/components/toast/BaseToast.vue'

const file = ref(null)
const toastRef = ref(null)

function onFileChange(e) {
  file.value = e.target.files[0]
}

async function uploadFile() {
  if (!file.value) return

  const contentType = file.value.type || 'application/pdf'
  const s3Key = `company-policy/${file.value.name}`

  try {
    const res = await axios.get('http://localhost:5000/s3/upload-pdf', {
      params: { filename: s3Key, contentType }
    })

    await axios.put(res.data.url, file.value, {
      headers: { 'Content-Type': contentType }
    })

    toastRef.value?.show('업로드 성공')
  } catch (err) {
    console.error(err)
    toastRef.value?.show('업로드 실패')
  }
}
</script>

<style scoped>
.upload-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 3000;
}

.upload-modal-box {
  background: var(--modal-bg2);
  padding: 30px;
  border-radius: 12px;
  width: 400px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  gap: 16px;
  position: relative;
}

.upload-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: -20px;
}

.close-btn {
  background: transparent;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: var(--primary);
  font-weight: 800;
}
.close-btn:hover {
  color: #000;
}

input[type='file'] {
  font-size: 14px;
}

.upload-btn {
  background-color: var(--primary);
  color: var(--text-on-primary);
  font-weight: bold;
  border: 1px solid transparent;
  border-radius: 10px;
  padding: 10px 30px;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: background-color 0.2s, box-shadow 0.2s;
  box-sizing: border-box;
}
.upload-btn:hover {
  background-color: var(--bg-main);
  color: var(--primary);
  border: 1px solid var(--primary);
  box-shadow: inset 1px 1px 10px rgba(0, 0, 0, 0.25);
}
.upload-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}
</style>
