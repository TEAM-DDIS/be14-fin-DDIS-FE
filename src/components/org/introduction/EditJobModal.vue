<!-- src/components/EditJobModal.vue -->
<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal">
      <h3>직무 정보 편집</h3>
      <div class="modal-content">
        <label>팀명</label>
        <input v-model="local.team_name" type="text" disabled />

        <label>직무명</label>
        <input v-model="local.job_name" type="text" />

        <label>주요 역할 (줄바꿈 구분)</label>
        <textarea v-model="local.job_role_text" rows="4" />

        <label>필요 역량 (줄바꿈 구분)</label>
        <textarea v-model="local.job_need_text" rows="4" />

        <label>필수 조건 (줄바꿈 구분)</label>
        <textarea v-model="local.job_necessary_text" rows="4" />

        <label>우대 사항 (줄바꿈 구분)</label>
        <textarea v-model="local.job_preference_text" rows="4" />
      </div>
      <div class="modal-actions">
        <button class="btn-cancel" @click="$emit('close')">취소</button>
        <button class="btn-save" @click="onSave">저장</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, watch } from 'vue'

const props = defineProps({
  initial: {
    type: Object,
    required: true
  }
})
const emit = defineEmits(['close', 'save'])

// 로컬 복사 + textarea 편집용 문자열으로 변환
const local = reactive({
  job_id: props.initial.jobId,
  team_name: props.initial.teamName || '',
  job_name: props.initial.jobName || '',
  job_role_text: (props.initial.jobRole || []).join('\n'),
  job_need_text: (props.initial.jobNeed || []).join('\n'),
  job_necessary_text: (props.initial.jobNecessary || []).join('\n'),
  job_preference_text: (props.initial.jobPreference || []).join('\n'),
})

// 부모 prop 바뀌면 동기화
watch(
  () => props.initial,
  val => {
    local.job_id = val.jobId
    local.team_name = val.teamName || ''
    local.job_name = val.jobName || ''
    local.job_role_text = (val.jobRole || []).join('\n')
    local.job_need_text = (val.jobNeed || []).join('\n')
    local.job_necessary_text = (val.jobNecessary || []).join('\n')
    local.job_preference_text = (val.jobPreference || []).join('\n')
  }
)

function onSave() {
  emit('save', {
    jobId: local.job_id,
    jobName: local.job_name,
    jobRole: local.job_role_text
      .split('\n')
      .map(l => l.trim())
      .filter(l => l),
    jobNeed: local.job_need_text
      .split('\n')
      .map(l => l.trim())
      .filter(l => l),
    jobNecessary: local.job_necessary_text
      .split('\n')
      .map(l => l.trim())
      .filter(l => l),
    jobPreference: local.job_preference_text
      .split('\n')
      .map(l => l.trim())
      .filter(l => l),
  })
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}
.modal {
  background: #fff;
  padding: 24px;
  border-radius: 8px;
  width: 480px;
  max-width: 90%;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
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
  font-family: inherit;
}
.modal-content input:focus,
.modal-content textarea:focus {
  outline: none;
  border: 1px solid black;
}
.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

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
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: background-color 0.2s, box-shadow 0.2s;
  box-sizing: border-box;
}
.btn-save:hover {
  background-color: white;
  color: #00a8e8;
  border-color: #00a8e8;
  box-shadow: inset 1px 1px 10px rgba(0, 0, 0, 0.25);
}

.btn-cancel {
  font-size: 14px;
  font-weight: bold;
  background-color: #D3D3D3;
  color: #000;
  border: none;
  border-radius: 10px;
  padding: 10px 30px;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: background-color 0.2s, box-shadow 0.2s;
  box-sizing: border-box;
}
.btn-cancel:hover {
  background-color: #000;
  color: #fff;
}

.modal h3 {
  font-size: 20px;
  margin-bottom: 12px;
  letter-spacing: 0.5px;
}
</style>
