<template>
    <div class="overtime-request-card">
        <el-form :model="form" label-width="80px">
        <!-- 근무 유형 선택 -->
        <el-form-item label="유형" label-position="top">
            <el-radio-group v-model="form.type">
            <el-radio label="시간 외 근무" />
            <el-radio label="야간 근무" />
            <el-radio label="휴일 근무" />
            </el-radio-group>
        </el-form-item>

        <!-- 시간 입력 -->
        <el-form-item
            v-if="form.type === '시간 외 근무' || form.type === '야간 근무'"
            label="시간"
            label-position="top"
            class="fixed-input-area"
        >
            <div class="time-input-wrapper">
            <el-input
                v-model="form.duration"
                placeholder="숫자만 입력"
                type="number"
                min="1"
                max="12"
                class="duration-input"
            />
            <span class="unit-label">시간</span>
            </div>
        </el-form-item>

        <!-- 날짜 선택 -->
        <el-form-item
            v-if="form.type === '휴일 근무'"
            label="날짜"
            label-position="top"
            class="fixed-input-area"
        >
            <el-date-picker
            v-model="form.date"
            type="date"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            placeholder="날짜 선택"
            popper-class="overtime-datepicker"
            :append-to-body="false"
            :teleported="false"
            style="width: 130px"
            />
        </el-form-item>
        </el-form>

        <div class="btn-area">
        <el-button class="cancle-btn" @click="emit('cancel')">취소</el-button>
        <el-button class="submit-btn" type="primary" @click="submit">신청</el-button>
        </div>
    </div>
    <BaseToast ref="toastRef" />
</template>

<script setup>
    import { ref, reactive } from 'vue'
    import BaseToast from '@/components/toast/BaseToast.vue'

    const toastRef = ref(null)

    function showToast(msg) {
    toastRef.value?.show(msg)
    }

    const emit = defineEmits(['cancel', 'submit'])

    const form = reactive({
        type: '시간 외 근무',
        duration: '',
        date: ''
    })

    const submit = () => {
    if (
        (form.type === '휴일 근무' && !form.date) ||
        ((form.type === '시간 외 근무' || form.type === '야간 근무') && !form.duration)
    ) {
        showToast('모든 항목을 입력하세요.')
        return
    }

    const typeMap = {
        '시간 외 근무': '시간외근무',
        '야간 근무': '야간근무',
        '휴일 근무': '휴일근무'
    }

    emit('submit', {
        type: typeMap[form.type],
        duration: form.type === '휴일 근무' ? null : Number(form.duration),
        date: form.date || null
    })
    }
</script>

<style scoped>
.overtime-request-card {
  --el-color-primary: var(--primary);
  /* background-color: var(--bg-box); */
  color: var(--text-main);
  padding: 20px;
  border-radius: 12px;
  /* box-shadow: 0 1px 10px rgba(0, 0, 0, 0.05); */
}

/* 버튼 영역 */
.btn-area {
  display: flex;
  justify-content: center;
  margin-top: 30px;
}

/* 기본 버튼 스타일 */
.submit-btn,
.cancle-btn {
  width: 96px;
  height: 40px;
  font-size: 14px;
  font-weight: bold;
  border-radius: 10px;
  padding: 10px 30px;
  box-sizing: border-box;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: background-color 0.2s, box-shadow 0.2s, color 0.2s;
}

/* 신청 버튼 (primary) */
.submit-btn {
  background-color: var(--primary);
  color: var(--text-on-primary);
  border: 1px solid transparent;
}
.submit-btn:hover {
background-color: var(--bg-main);
  color: var(--primary);
  border-color: var(--primary);
  box-shadow: inset 1px 1px 10px rgba(0, 0, 0, 0.25);
}

/* 취소 버튼 (gray) */
.cancle-btn {
  background-color: #d3d3d3;
  color: #000;
  border: none;
}
.cancle-btn:hover {
  background-color: #000;
  color: #fff;
}

/* 시간 입력 래퍼 */
.time-input-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
}

.duration-input {
  width: 130px;
}

/* 단위 라벨 */
.unit-label {
  font-size: 14px;
  color: var(--text-main);
  white-space: nowrap;
}

/* Element Plus 데이트 피커 위치 대응 */
:deep(.overtime-datepicker) {
  z-index: 99999 !important;
  position: relative !important;
}

:deep(.el-picker__popper.overtime-datepicker) {
  z-index: 20000 !important;
  position: fixed !important;
}

/* 엘라벨 색상 */
:deep(.el-form-item__label) {
  color: var(--text-main);
  font-size: 18px;
}

:deep(.el-radio__label) {
  color: var(--text-main);
  font-size: 14px;
}

:deep(.el-radio__input.is-checked + .el-radio__label) {
  font-weight: bold;
  color: var(--primary);
}
:deep(.el-input__inner) {
  color: var(--text-main);
  font-size: 14px;
  padding: 5px;
}
:deep(.el-input__wrapper),
:deep(.el-date-editor.el-input__wrapper),
:deep(.el-time-editor.el-input__wrapper) {
  background-color: var(--bg-main);       /* 입력 배경 */
  border: 1px solid var(--border-color);  /* 테두리 */
  border-radius: 8px;
  color: var(--text-main);                /* 텍스트 색 */
  transition: border 0.3s, box-shadow 0.3s;
}

/* 폼 아이템 높이 고정 */
:deep(.fixed-input-area) {
  min-height: 72px; /* 또는 height: 72px 로 고정 */
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
}

:deep(.el-date-editor.el-input) {
  height: 34px; /* el-input과 동일하게 */
}

:deep(.el-date-editor .el-input__wrapper) {
  height: 34px;
  padding: 0 11px;
  display: flex;
  align-items: center;
  box-sizing: border-box;
}

</style>

