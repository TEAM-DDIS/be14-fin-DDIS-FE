<!-- 조직 및 직무 > 조직 및 직무 소개 (> 부서 소개 편집) -->
<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal">
      <h3>부서 소개 내용 편집</h3>
      <div class="modal-content">
        <label>부서명</label>
        <input
          v-model="local.name"
          type="text"
          disabled
        />
        <label>부서 소개 내용</label>
        <textarea
          v-model="local.introduction_context"
          rows="5"
        ></textarea>
      </div>
      <div class="modal-actions">
        <button class="btn-cancel" @click="$emit('close')">취소</button>
        <button class="btn-save" @click="onSave">등록</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, watch, toRefs } from 'vue'

const props = defineProps({
  initial: {
    type: Object,
    required: true
  }
})
const emit = defineEmits(['close', 'save'])

// 로컬 상태 복사
const local = reactive({
  introduction_id: props.initial.introduction_id,
  name: props.initial.introduction_name,
  introduction_context: props.initial.introduction_context
})

// 부모 prop이 변경되면 동기화
watch(
  () => props.initial,
  (val) => {
    local.introduction_id = val.introduction_id
    local.name = val.introduction_name
    local.introduction_context = val.introduction_context
  }
)

function onSave() {
  // 부모에게 변경된 내용 전달
  emit('save', {
    introduction_id: local.introduction_id,
    introduction_context: local.introduction_context
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
  background: #fff;
  padding: 24px;
  border-radius: 8px;
  width: 400px;
  max-width: 90%;
  box-shadow: 0 8px 20px rgba(0,0,0,0.2);
}
.modal-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  margin: 16px 0;
}
.modal-content label {
  font-size: 14px;
  color: #424242;
  width: 100%;
  text-align: left;
}
.modal-content input,
.modal-content textarea {
  width: 80%;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 14px;
}
.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.btn-cancel,
.btn-save {
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  font-family: inherit;
  background-color: #00a8e8;
  color: white;
  border: 1px solid transparent;
  border-radius: 10px;
  padding: 10px 30px;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: background-color 0.2s, box-shadow 0.2s;
  box-sizing: border-box;
}

.btn-save:hover {
  background-color: white;
  color: #00a8e8;
  border-color: #00a8e8;
  box-shadow:
  inset 1px 1px 10px rgba(0, 0, 0, 0.25);
}

.btn-cancel {
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
.btn-cancel:hover {
  background-color: #000;
  color: #fff;
}

/* 모달 전체에 같은 서체 적용 */
.modal,
.modal h3,
.modal-content label,
.modal-content input,
.modal-content textarea {
  font-family: 'inter';
  color: #333;
}

/* 제목 스타일 */
.modal h3 {
  font-size: 20px;
  margin-bottom: 12px;
  letter-spacing: 0.5px;
}

/* 레이블 스타일 */
.modal-content label {
  font-size: 15px;
  font-weight: 500;
}

/* 입력창·텍스트영역 스타일 */
.modal-content input,
.modal-content textarea {
  font-size: 15px;
  line-height: 1.4;
}
.modal-content textarea:focus {
    outline: none;
    border: 1px solid black;
}
</style>
