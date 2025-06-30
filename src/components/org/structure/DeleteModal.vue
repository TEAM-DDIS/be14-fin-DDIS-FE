<template>
  <div class="modal-overlay">
    <div class="modal-content">
      <h3 class="modal-title">조직 삭제</h3>

      <label class="modal-label" for="delete-org-type">삭제할 조직 종류</label>
      <select
        id="delete-org-type"
        v-model="localType"
        class="modal-select"
      >
        <option disabled value="">조직 종류 선택</option>
        <option
          v-for="org in orgOptions"
          :key="org.id"
          :value="org.id"
        >
          {{ org.name }}
        </option>
      </select>

      <div v-if="filteredDeleteList.length" class="delete-list">
        <label v-for="item in filteredDeleteList" :key="item.value" class="delete-list-item">
          <input type="checkbox" :value="item.value" v-model="localSelectedIds" />
          {{ item.label }}
        </label>
      </div>
      <div v-else class="no-data">
        <span v-if="!localType">먼저 조직 종류를 선택해 주세요.</span>
        <span v-else>선택된 조직이 없습니다.</span>
      </div>

      <div class="modal-buttons">
        <button class="modal-btn-cancel" @click="$emit('close')">취소</button>
        <button class="modal-btn-confirm" @click="onConfirm" :disabled="!localSelectedIds.length">
          확인
        </button>
      </div>
    </div>
  </div>
  <BaseToast ref="toastRef" />
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import BaseToast from '@/components/toast/BaseToast.vue'

const toastRef = ref(null)

  function showToast(msg) {
    toastRef.value?.show(msg)
  }

const props = defineProps({
  orgOptions:    Array,
  deleteListAll: Object
})
const emit = defineEmits(['close', 'confirm'])

const localType        = ref('')
const localSelectedIds = ref([])

const router = useRouter()
const userStore = useUserStore()
const token = userStore.accessToken

function parseJwtPayload(token) {
  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => `%${('00' + c.charCodeAt(0).toString(16)).slice(-2)}`)
        .join('')
    )
    return JSON.parse(jsonPayload)
  } catch (e) {
    return null
  }
}

const payload = parseJwtPayload(token)
const isHR = payload?.role?.includes('ROLE_HR') || payload?.auth?.includes('ROLE_HR')

if (!isHR) {
  showToast('접근 권한이 없습니다.')
  router.push('/error403')
}

const filteredDeleteList = computed(() => {
  return props.deleteListAll[localType.value] || []
})

function onConfirm() {
  if (!localType.value) {
    showToast('조직 종류를 선택해 주세요.')
    return
  }
  if (!localSelectedIds.value.length) {
    showToast('삭제할 조직을 하나 이상 선택해 주세요.')
    return
  }
  emit('confirm', { type: localType.value, ids: localSelectedIds.value })
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}
.modal-content {
  background: var(--modal-bg);
  border-radius: 10px;
  padding: 24px 32px;
  width: 450px;
  max-width: 90%;
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
}
.modal-title {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 20px;
  text-align: center;
}
.modal-label {
  display: block;
  font-weight: 500;
  margin-top: 12px;
  margin-bottom: 6px;
}
.modal-select {
  width: 100%;
  padding: 8px 12px;
  font-size: 14px;
  border: 1px solid #ddd;
  border-radius: 8px;
  margin-bottom: 16px;
  box-sizing: border-box;
  background: var(--modal-bg);
  color: var(--text-main);
}

.delete-list {
  max-height: 200px;
  overflow-y: auto;
  border: 1px solid var(--border-color);
  padding: 8px;
  border-radius: 8px;
  margin-bottom: 16px;
}
.delete-list-item {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  font-size: 14px;
}
.delete-list-item input {
  margin-right: 8px;
}
.no-data {
  text-align: center;
  color: #888;
  margin-bottom: 16px;
}
.modal-buttons {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 20px;
}

.modal-btn-confirm {
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

.modal-btn-confirm:hover {
  background-color: var(--bg-main);
  color: var(--primary);
  border-color: var(--primary);
}

.modal-btn-cancel {
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
.modal-btn-cancel:hover {
  background-color: #000;
  color: #fff;
}
</style>
