<template>
  <div class="modal-overlay">
    <div class="modal">
      <h3>부서 소개 내용 편집</h3>
      <div class="modal-content">
        <label for="department-select">부서</label>
        <select
          id="department-select"
          v-model="local.departmentId"
          @change="onDepartmentChange"
          class="department-select"
        >
          <option value="" disabled>부서를 선택하세요</option>
          <option
            v-for="dept in departments"
            :key="dept.departmentId"
            :value="dept.departmentId"
          >
            {{ dept.departmentName }}
          </option>
        </select>

        <label>현재 소개 내용</label>
        <div class="preview-box" v-if="local.introductionContext">
          {{ local.introductionContext }}
        </div>
        <div class="preview-box no-preview" v-else>
          아직 부서가 선택되지 않았거나 소개 내용이 없습니다.
        </div>

        <label>수정할 소개 내용</label>
        <textarea
          v-model="local.introductionContext"
          rows="5"
          class="content-box"
          placeholder="여기에 수정할 소개 내용을 입력하세요"
        ></textarea>
      </div>

      <div class="modal-actions">
        <button class="btn-cancel" @click="$emit('close')">취소</button>
        <button class="btn-save"
          @click="onSave" 
          :disabled="!local.departmentId || !local.introductionContext.trim()">
          저장
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue'

const props = defineProps({
  initial: {
    type: Object,
    required: true
  }
})
const emit = defineEmits(['close', 'save'])

const departments = ref([])

// 원래 내용 저장
const local = reactive({
  departmentId: props.initial.departmentId || '',
  introductionContext: props.initial.introductionContext || ''
})

watch(
  () => props.initial,
  (val) => {
    local.departmentId = val.departmentId || ''
    local.introductionContext = val.introductionContext || ''
  }
)

onMounted(async () => {
  try {
    const res = await fetch('http://localhost:5000/introduction/department')
    if (!res.ok) throw new Error(res.statusText)
    const data = await res.json()
    departments.value = data

    if (local.departmentId) {
      const found = departments.value.find(
        d => d.departmentId === local.departmentId
      )
      if (found) {
        local.introductionContext = found.introductionContext || ''
      }
    }
  } catch (e) {
    console.error('❌ 부서 목록 로드 실패:', e)
  }
})

function onDepartmentChange() {
  const found = departments.value.find(
    d => d.departmentId === local.departmentId
  )
  if (found) {
    local.introductionContext = found.introductionContext || ''
  } else {
    local.introductionContext = ''
  }
}

function onSave() {
  emit('save', {
    departmentId: local.departmentId,
    introductionContext: local.introductionContext
  })
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}
.modal {
  background: var(--modal-box-bg);
  padding: 30px;
  border-radius: 12px;
  width: 420px;
  max-width: 90%;
  box-shadow: 0 8px 20px rgba(0,0,0,0.2);
}
h3 {
  text-align: center;
}

.department-select {
    width: 99%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  font-family: inherit;
  background: var(--modal-box-bg);
  color: var(--modal-text);
}
.modal-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin: 16px 10px;
}
.modal-content label {
  font-size: 14px;
  color: var(--modal-text);
  width: 100%;
  text-align: left;
}

.modal-content textarea {
  width: 95%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  font-family: inherit;
  background: var(--modal-box-bg);
}
/* .modal-content select:focus,
.modal-content textarea:focus {
  outline: none;
  border: 1px solid #000;
} */

.preview-box {
  width: 95%;
  min-height: 60px;
  padding: 8px;
  background: var(--modal-box-bg);
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
}
.no-preview {
  color: #888;
  font-style: italic;
}

.modal-actions {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 30px;
}
.btn-cancel,
.btn-save {
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  font-family: inherit;
  border: 1px solid transparent;
  border-radius: 10px;
  padding: 10px 30px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: background-color 0.2s, box-shadow 0.2s;
}
.btn-cancel {
  background-color: #D3D3D3;
  color: #000;
}
.btn-cancel:hover {
  background-color: #000;
  color: #fff;
}
.btn-save {
  background-color: var(--primary);
  color: var(--text-on-primary);
}
.btn-save:disabled {
  background-color: #aaa;
  cursor: not-allowed;
}
.btn-save:hover:enabled {
  background-color: var(--bg-main);
  color: var(--primary);
  border-color: var(--primary);
}

.modal,
.modal h3,
.modal-content label,
.modal-content select,
.modal-content textarea {
  font-family: 'inter';
  color: var(--modal-text);
}

.modal h3 {
  font-size: 20px;
  margin-bottom: 12px;
  letter-spacing: 0.5px;
}

.modal-content label {
  font-size: 15px;
  font-weight: 500;
}

.modal-content select,
.modal-content textarea {
  font-size: 15px;
  line-height: 1.4;
}
</style>
