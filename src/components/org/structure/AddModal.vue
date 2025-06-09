<template>
  <div v-if="show" class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content">
      <h3 class="modal-title">신규 조직 등록</h3>

      <!-- 1) 조직 종류 선택 -->
      <label class="modal-label" for="modal-org-type">조직 종류</label>
      <select
        id="modal-org-type"
        v-model="localType"
        class="modal-select"
      >
        <option disabled value="">조직 종류 선택</option>
        <option v-for="org in orgOptions" :key="org.id" :value="org.id">
          {{ org.name }}
        </option>
      </select>

      <!-- 2) 부모 조직 선택: 부서일 때 본부, 팀일 때 부서 -->
      <div v-if="localType==='department'">
        <label class="modal-label" for="parent-head">상위 본부 선택</label>
        <select
          id="parent-head"
          v-model="parentId"
          class="modal-select"
        >
          <option disabled value="">본부 선택</option>
          <option
            v-for="h in headOptions"
            :key="h.headId"
            :value="h.headId"
          >{{ h.headName }}</option>
        </select>
      </div>
      <div v-if="localType==='team'">
        <label class="modal-label" for="parent-dept">상위 부서 선택</label>
        <select
          id="parent-dept"
          v-model="parentId"
          class="modal-select"
        >
          <option disabled value="">부서 선택</option>
          <option
            v-for="d in deptOptions"
            :key="d.departmentId"
            :value="d.departmentId"
          >{{ d.departmentName }}</option>
        </select>
      </div>

      <!-- 3) 신규 조직 이름 입력 -->
      <label class="modal-label" for="modal-org-name">조직 이름</label>
      <input
        id="modal-org-name"
        v-model="localName"
        type="text"
        placeholder="새 조직 이름을 입력하세요"
        class="modal-input"
      />

      <!-- 4) 버튼 -->
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
import { ref, watch } from 'vue'

const props = defineProps({
  show: Boolean,
  orgOptions: { type: Array, required: true },     // [{id:'head'...},...]
  headOptions: { type: Array, default: () => [] },  // HeadQueryDTO[]
  deptOptions: { type: Array, default: () => [] }   // DepartmentQueryDTO[]
})
const emit = defineEmits(['close','submit'])

const localType = ref('')
const parentId  = ref(null)
const localName = ref('')

// 모달이 열릴 때 초기화
watch(() => props.show, val => {
  if (val) {
    localType.value = ''
    parentId.value  = null
    localName.value = ''
  }
})

function onSubmit() {
  if (!localType.value) {
    return alert('조직 종류를 선택해 주세요.')
  }
  // head일 땐 parentId 필요 없음
  if (localType.value==='department' && !parentId.value) {
    return alert('상위 본부를 선택해 주세요.')
  }
  if (localType.value==='team' && !parentId.value) {
    return alert('상위 부서를 선택해 주세요.')
  }
  if (!localName.value.trim()) {
    return alert('조직 이름을 입력해 주세요.')
  }

  emit('submit', {
    type:     localType.value,        // 'head' | 'department' | 'team'
    name:     localName.value.trim(),
    parentId: parentId.value          // headId or departmentId
  })
  emit('close')
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

.modal-btn-submit:hover {
  background-color: #fff;
  color: #00a8e8;
  border: 1px solid #00a8e8;
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