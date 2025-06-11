<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content">
      <!-- ◆ 모달 제목 -->
      <h3 class="modal-title">결재하기</h3>

      <!-- ◆ 결재 상태 선택 영역 -->
      <div class="approval-row">
        <div class="approval-label">결재 상태</div>
        <div class="approval-radio-group">
          <label>
            <input type="radio" value="승인" v-model="status" /> 승인
          </label>
          <label>
            <input type="radio" value="반려" v-model="status" /> 반려
          </label>
        </div>
      </div>

      <!-- ◆ 결재 의견 작성 영역 -->
      <div class="approval-row">
        <div class="approval-label">결재 의견</div>
        <div class="approval-content">
          <textarea
            v-model="opinion"
            class="approval-textarea"
            placeholder="결재 의견을 입력하세요"
            maxlength="200"
          ></textarea>
          <div class="approval-count">{{ opinion.length }}/200</div>
        </div>
      </div>

      <!-- ◆ 하단 버튼 영역 -->
      <div class="approval-footer">
        <div></div>
        <div class="approval-btn-group">
          <button class="modal-btn-cancel" @click="$emit('close')">취소</button>
          <button class="modal-btn-submit" @click="submitApproval">결재</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

// 결재 상태 및 의견 상태
const status = ref('승인')
const opinion = ref('승인합니다.')

const emit = defineEmits(['submit', 'close'])

function submitApproval() {
  emit('submit', {
    status: status.value,
    opinion: opinion.value.trim()
  })
}
</script>

<style scoped>
/* 본문 라벨 영역 스타일 */
.editor-label {
  font-size: 15px;
  font-weight: bold;
  white-space: nowrap;
  background-color: #0080ff;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 48px;
  margin: 0;
  padding: 0;
  border: none;
  border-radius: 0;
  line-height: 1;
  box-sizing: border-box;
}

/* 결재 모달 내부 스타일 구성 (결재 상태, 결재 의견, 버튼) */
.approval-modal {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.approval-row {
  display: flex;
  align-items: flex-start;
  gap: 16px;
}

.approval-label {
  width: 100px;
  font-weight: bold;
  line-height: 32px;
}

.approval-radio-group {
  display: flex;
  gap: 16px;
  align-items: center;
}

.approval-textarea {
  width: 100%;
  min-height: 100px;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 14px;
  resize: none;
  box-sizing: border-box;
}

.approval-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.approval-btn-group {
  display: flex;
  gap: 12px;
}

.approval-count {
  font-size: 12px;
  color: #888;
  margin-top: 4px;
  text-align: right;
}
</style>
