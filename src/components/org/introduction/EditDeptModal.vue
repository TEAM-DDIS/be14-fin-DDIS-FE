<!-- src/components/org/introduction/EditDeptModal.vue -->
<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal">
      <h3>부서 소개 내용 편집</h3>
      <div class="modal-content">
        <!-- 드롭다운으로 부서 선택 -->
        <label for="department-select">부서</label>
        <select
          id="department-select"
          v-model="local.departmentId"
          @change="onDepartmentChange"
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

        <!-- 선택된 부서의 현재 소개 내용 미리보기 -->
        <label>현재 소개 내용</label>
        <div class="preview-box" v-if="local.introductionContext">
          {{ local.introductionContext }}
        </div>
        <div class="preview-box no-preview" v-else>
          아직 부서가 선택되지 않았거나 소개 내용이 없습니다.
        </div>

        <!-- 수정할 소개 내용 -->
        <label>수정할 소개 내용</label>
        <textarea
          v-model="local.introductionContext"
          rows="5"
          placeholder="여기에 수정할 소개 내용을 입력하세요"
        ></textarea>
      </div>

      <div class="modal-actions">
        <button class="btn-cancel" @click="$emit('close')">취소</button>
        <button class="btn-save" @click="onSave" :disabled="!local.departmentId">
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

// 전체 부서 목록을 담을 상태
const departments = ref([])

// 로컬 상태: departmentId와 소개 내용을 복사해서 사용
const local = reactive({
  departmentId: props.initial.departmentId || '',
  introductionContext: props.initial.introductionContext || ''
})

// 부모 prop이 변경되면 로컬 상태 동기화
watch(
  () => props.initial,
  (val) => {
    local.departmentId = val.departmentId || ''
    local.introductionContext = val.introductionContext || ''
  }
)

// 컴포넌트 마운트 시 전체 부서 목록 호출
onMounted(async () => {
  try {
    const res = await fetch('https://api.isddishr.site/introduction/department')
    if (!res.ok) throw new Error(res.statusText)
    const data = await res.json()
    departments.value = data

    // 초기 선택된 부서 ID가 있으면, 해당 부서의 소개 내용을 로컬에 반영
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

// 드롭다운에서 부서를 바꿀 때, 해당 부서의 소개 내용을 보여주기 위해 호출
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

// 저장 버튼 클릭 시 부모에게 변경된 값을 전달
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
  background: #fff;
  padding: 24px;
  border-radius: 8px;
  width: 420px;
  max-width: 90%;
  box-shadow: 0 8px 20px rgba(0,0,0,0.2);
}
h3 {
  text-align: center;
}
.modal-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin: 16px 0;
}
.modal-content label {
  font-size: 14px;
  color: #424242;
  width: 100%;
  text-align: left;
}
.modal-content select,
.modal-content textarea {
  width: 100%;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 14px;
  font-family: inherit;
}
.modal-content select:focus,
.modal-content textarea:focus {
  outline: none;
  border: 1px solid #00a8e8;
}

/* 미리보기 박스 */
.preview-box {
  width: 100%;
  min-height: 60px;
  padding: 8px;
  background: #f9f9f9;
  border: 1px solid #ddd;
  border-radius: 4px;
  color: #333;
  font-size: 14px;
}
.no-preview {
  color: #888;
  font-style: italic;
}

/* 버튼 영역 */
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
  border: none;
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
  background-color: #00a8e8;
  color: #fff;
}
.btn-save:disabled {
  background-color: #aaa;
  cursor: not-allowed;
}
.btn-save:hover:enabled {
  background-color: white;
  color: #00a8e8;
  border: 1px solid #00a8e8;
}

/* 모달 전체에 같은 서체 적용 */
.modal,
.modal h3,
.modal-content label,
.modal-content select,
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
/* 뷰 및 input/textarea 글씨 크기 */
.modal-content select,
.modal-content textarea {
  font-size: 15px;
  line-height: 1.4;
}
</style>
