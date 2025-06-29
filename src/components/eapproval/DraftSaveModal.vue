<!--임시저장 모달 -->

<!-- 기안상신 모달 -->
<template>
  <div class="modal-overlay">
    <div class="modal-content">
      <!-- ◆ 모달 제목 -->
        <div class="model-text">
          <h3 class="modal-title">임시저장</h3>
          <!-- ◆ 모달 본문 안내 문구 -->
          <p class="modal-description">작성하신 기안을 임시저장하시겠습니까??</p>
        </div>
      <!-- ◆ 하단 버튼 영역 -->
      <div class="approval-footer">
        <div class="approval-btn-group">
          <button class="modal-btn-cancel" @click="$emit('close')">취소</button>
          <button class="modal-btn-submit" @click="submitApproval">확인</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const emit = defineEmits(['submit', 'close'])

function submitApproval() {
  emit('submit')
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
  z-index: 3000;
}

.modal-content {
  background: var(--bg-main, #fff);
  border-radius: 10px;
  padding: 24px 32px;
  width: 280px;
  max-width: 90%;
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
  text-align: center;
  color: var(--text-main, #222);
}

.modal-title {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 30px;
  color: var(--text-main, #222);
}

.modal-description {
  font-size: 16px;
  margin-bottom: 50px;
  color: var(--text-main, #222);
}

.approval-footer {
  display: flex;
  justify-content: center; /* 수평 가운데 정렬 */
  align-items: center;
  margin-top: 20px;
}

.approval-btn-group {
  display: flex;
  gap: 12px;
  align-items: center;
}

.modal-btn-submit {
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  font-family: inherit;
  background-color: var(--primary);
  color: var(--text-on-primary, #fff);
  border: 1px solid transparent;
  border-radius: 10px;
  padding: 10px 30px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: background-color 0.2s, box-shadow 0.2s;
}

.modal-btn-submit:hover {
  background-color: var(--bg-main, #fff);
  color: var(--primary, #00a8e8);
  border: 1px solid var(--primary, #00a8e8);
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
