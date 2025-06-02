<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content">
      <h3 class="modal-title">신규 조직 등록</h3>

      <!-- 조직 종류 선택 -->
      <label class="modal-label" for="modal-org-type">조직 종류</label>
      <select
        id="modal-org-type"
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

      <!-- 신규 조직 이름 입력 -->
      <label class="modal-label" for="modal-org-name">조직 이름</label>
      <input
        id="modal-org-name"
        v-model="localName"
        type="text"
        placeholder="새 조직 이름을 입력하세요"
        class="modal-input"
      />

      <div class="modal-buttons">
        <button class="modal-btn-cancel" @click="$emit('close')">
          취소
        </button>
        <button class="modal-btn-submit" @click="onSubmit">
          등록
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, toRefs } from 'vue'
import { defineProps, defineEmits } from 'vue'

const props = defineProps({
  show: Boolean,
  orgOptions: {
    type: Array,
    required: true
  },
  initialType: {
    type: String,
    default: ''
  }
})
const emit = defineEmits(['close', 'submit'])

// 로컬 상태: 부모로부터 넘겨주는 initialType을 복사해서 사용
const localType = ref(props.initialType || '')
const localName = ref('')

// 만약 부모가 initialType을 바꾼다면 로컬에도 반영
watch(() => props.initialType, val => {
  localType.value = val || ''
})

// “등록” 버튼 클릭 시, 부모에게 제출 데이터 전달
function onSubmit() {
  if (!localType.value) {
    alert('조직 종류를 선택해 주세요.')
    return
  }
  if (!localName.value.trim()) {
    alert('조직 이름을 입력해 주세요.')
    return
  }
  emit('submit', {
    type: localType.value,
    name: localName.value.trim()
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
  width: 400px;
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
.modal-select,
.modal-input {
  width: 100%;
  padding: 8px 12px;
  font-size: 14px;
  border: 1px solid #ddd;
  border-radius: 6px;
  margin-bottom: 16px;
  box-sizing: border-box;
}

.modal-select:focus,
.modal-input:focus {
    outline: none;
    border: 1px solid black;
}

.modal-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 20px;
}
.modal-btn-cancel,
.modal-btn-submit {
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
.modal-btn-submit:hover {
  background-color: #fff;
  color: #00a8e8;
  border: 1px solid #00a8e8;
}
</style>
