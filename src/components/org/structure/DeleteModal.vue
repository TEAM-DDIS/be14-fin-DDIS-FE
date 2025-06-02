<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content">
      <h3 class="modal-title">조직 삭제</h3>

      <!-- 1) 조직 종류 선택 -->
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

      <!-- 2) 선택된 조직 종류에 따라 체크박스 목록 필터링 -->
      <div v-if="filteredDeleteList.length > 0" class="delete-list">
        <label
          v-for="item in filteredDeleteList"
          :key="item.value"
          class="delete-list-item"
        >
          <input
            type="checkbox"
            :value="item.value"
            v-model="localSelectedIds"
          />
          {{ item.label }}
        </label>
      </div>
      <div v-else class="no-data">
        조직 종류를 선택하면 목록이 여기에 표시됩니다.
      </div>

      <!-- 3) 모달 하단 버튼 -->
      <div class="modal-buttons">
        <button class="modal-btn-cancel" @click="$emit('close')">취소</button>
        <button
          class="modal-btn-delete"
          @click="onConfirm"
          :disabled="localSelectedIds.length === 0"
        >
          확인
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'

// 부모로부터 받는 props
const props = defineProps({
  orgOptions: {
    type: Array,
    required: true
    /* ex: [ { id: 'head', name: '본부' }, { id: 'dept', name: '부서' }, { id: 'team', name: '팀' } ] */
  },
  initialType: {
    type: String,
    default: ''
  },
  /** 
   * deleteListAll 형태: 
   * {
   *   head: [ { value: Number, label: String }, ... ],
   *   dept: [ { value: Number, label: String }, ... ],
   *   team: [ { value: Number, label: String }, ... ]
   * }
   */
  deleteListAll: {
    type: Object,
    required: true
  }
})

// 컴포넌트가 emit할 이벤트
const emit = defineEmits(['close', 'confirm'])

// 로컬 상태
// localType: 지금 모달에서 선택된 조직 종류 (‘head’ | ‘dept’ | ‘team’)
// localSelectedIds: 체크박스로 선택된 ID들
const localType = ref(props.initialType || '')
const localSelectedIds = ref([])

// 부모 측 initialType이 바뀌면 로컬 타입 동기화
watch(
  () => props.initialType,
  (newType) => {
    localType.value = newType || ''
    localSelectedIds.value = []
  }
)

// 선택된 조직 종류(localType)에 따라 deleteListAll에서 알맞은 목록만 필터링
const filteredDeleteList = computed(() => {
  if (!localType.value) {
    return []
  }
  return props.deleteListAll[localType.value] || []
})

// “확인” 클릭 시 부모로 payload 전달
function onConfirm() {
  if (!localType.value) {
    alert('삭제할 조직 종류를 선택해 주세요.')
    return
  }
  if (localSelectedIds.value.length === 0) {
    alert('삭제할 조직을 하나 이상 선택해 주세요.')
    return
  }
  emit('confirm', {
    type: localType.value,
    ids: localSelectedIds.value
  })
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
  background: #fff;
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
  border-radius: 6px;
  margin-bottom: 16px;
  box-sizing: border-box;
}
.modal-select:focus {
    outline: none;
    border: 1px solid black;
}

.delete-list {
  max-height: 200px;
  overflow-y: auto;
  border: 1px solid #ddd;
  padding: 8px;
  border-radius: 6px;
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
  justify-content: flex-end;
  gap: 12px;
  margin-top: 20px;
}
.modal-btn-cancel,
.modal-btn-delete {
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  font-family: inherit;
  background-color: #00a8e8;
  color: white;
  border: 1px solid transparent;
  border-radius: 10px;
  padding: 10px 30px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: background-color 0.2s, box-shadow 0.2s;
}
.modal-btn-cancel:hover,
.modal-btn-delete:hover {
  background-color: #fff;
  color: #00a8e8;
  border: 1px solid #00a8e8;
}
</style>
