<template>
  <div class="modal-overlay">
    <div class="modal-content">
      <!-- 헤더 -->
      <div class="modal-header">
        <h3>결재하기</h3>
        <button class="close-btn" @click="$emit('close')">✕</button>
      </div>
      <hr />

      <!-- 결재 상태 -->
      <div class="approval-row">
        <div class="label-cell">결재 상태</div>
        <div class="input-cell">
          <label><input type="radio" value="승인" v-model="status" /> 승인</label>
          <label><input type="radio" value="반려" v-model="status" /> 반려</label>
        </div>
      </div>

      <!-- 결재 의견 -->
      <div class="approval-row">
        <div class="label-cell">결재 의견</div>
        <div class="input-cell textarea-wrap">
          <textarea
            v-model="opinion"
            maxlength="200"
            placeholder="결재 의견을 입력하세요"
          ></textarea>
          <div class="approval-count">{{ opinion.length }}/200</div>
        </div>
      </div>

      <hr />

      <!-- 버튼 -->
      <div class="modal-footer">
        <button class="btn-cancel" @click="$emit('close')">취소</button>
        <button class="btn-submit" @click="submitApproval">등록</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

// 부모로부터 lineId를 props로 전달받음
const props = defineProps({
  lineId: {
    type: [String, Number],
    required: true
  },
  rankName: {
    type: String,
    required: false
  },
  // 결재선 정보를 받기 위한 prop 추가
  approvalLine: {
    type: Object,
    required: true
  }
})

// close, submit 이벤트 정의
const emit = defineEmits(['close','submit'])

// 내부 상태
const status = ref('승인')
const opinion = ref('')

// 제출 이벤트
function submitApproval() {
  const text = opinion.value.trim()
  emit('submit', { 
    lineId: props.lineId,
    status: status.value, 
    opinion: text, 
    rankName: props.rankName 
  })
  emit('close')
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.3);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 3000;
}
.modal-content {
  width: 480px;
  background: var(--modal-box-bg);
  color: var(--text-main, #222);
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.2);
  padding: 24px;
  box-sizing: border-box;
}
.modal-header {
  position: relative;        /* close-btn 절대 위치 기준 */
  display: flex;
  justify-content: center;   
  align-items: center;
  padding-right: 32px;       /* 버튼 위치 여유 주기 */
}

.close-btn {
  position: absolute;
  right: 0;                  /* header 우측 끝에 배치 */
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  line-height: 1;
}

.modal-header h3 {
  margin: 0;
  font-size: 20px;
  font-weight: bold;
  margin-left: 50px;
  color: var(--text-main, #222);
}

hr {
  border: none;
  border-top: 1px solid #e1e7ee;
  margin: 16px 0;
}

/* 2-col grid for label/input */
.approval-row {
  display: grid;
  grid-template-columns: 100px 1fr;
  align-items: start;
  margin-bottom: 16px;
  color: var(--text-main, #222);
}
.label-cell {
  font-weight: bold;
  line-height: 32px;
}
.input-cell label {
  margin-right: 16px;
  font-size: 14px;
}
.textarea-wrap {
  position: relative;
}
.textarea-wrap textarea {
  width: 100%;
  min-height: 100px;
  padding: 10px;
  border: 1px solid var(--ag-row-border-color, #ccc);
  border-radius: 6px;
  font-size: 14px;
  resize: none;
  outline: none;              /* 브라우저 기본 focus outline 제거 */
  box-sizing: border-box;
  background: var(--bg-box, #fff);
  color: var(--text-main, #222);
}
.approval-count {
  position: absolute;
  bottom: 8px;
  right: 12px;
  font-size: 12px;
  color: #888;
}

.modal-footer {
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: center; 

}

.btn-cancel {
  font-size: 14px;
  font-weight: bold;
  background-color: #D3D3D3;
  color: #000;
  border: none;
  border-radius: 10px;
  padding: 10px 30px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: background-color 0.2s, box-shadow 0.2s;
  box-sizing: border-box;
}
.btn-submit {
  font-size: 14px;
  font-weight: bold;
  background-color: var(--primary, );
  color: var(--text-on-primary);
  border: 1px solid transparent;
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
.btn-submit:hover {
  background-color: var(--bg-main, #fff);
  color: var(--primary);
  border-color: var(--primary);
  box-shadow:
  inset 1px 1px 10px rgba(0, 0, 0, 0.25);
}
</style>
