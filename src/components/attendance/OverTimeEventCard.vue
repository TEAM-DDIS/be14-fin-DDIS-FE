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
        --el-color-primary: #000;
    }

    .btn-area {
        display: flex;
        justify-content: flex-end;
        margin-top: 30px;
    }

    .submit-btn {
        width: 96px;
        height: 40px;
        font-size: 14px;
        font-weight: bold;
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

    .submit-btn:hover {
        background-color: white;
        color: #00a8e8;
        border-color: #00a8e8;
        box-shadow:
        inset 1px 1px 10px rgba(0, 0, 0, 0.25);
    }

    .cancle-btn {
        width: 96px;
        height: 40px;
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
    .cancle-btn:hover {
        background-color: #000;
        color: #fff;
    }

    .time-input-wrapper {
        display: flex;
        align-items: center;
        gap: 8px;
    }

    .duration-input {
        width: 120px;
    }

    .unit-label {
        font-size: 14px;
        color: black;
        white-space: nowrap;
    }

    :deep(.overtime-datepicker) {
        z-index: 99999 !important;
        position: relative !important;
    }

    :deep(.el-picker__popper.overtime-datepicker) {
        z-index: 20000 !important;
        position: fixed !important;
    }

    :deep(.el-form-item__label) {
        color: #000;
        font-size: 18px;
    }
</style>
