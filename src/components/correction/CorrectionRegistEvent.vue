<template>
    <div class="correction-event-card">
        <el-form :model="form" label-width="100px" class="event-form">
            <!-- 날짜 선택 -->
            <el-form-item 
                label="날짜"
                label-position="top"
                >
                <el-date-picker
                    v-model="form.date"
                    type="date"
                    format="YYYY-MM-DD"
                    value-format="YYYY-MM-DD"
                    placeholder="날짜 선택"
                    style="width: 100%;"
                />
                </el-form-item>
            <!-- 변경요청 시각 -->
            <el-form-item 
                label="변경 요청 시각"
                label-position="top"
                >
                <el-time-picker
                    v-model="form.time"
                    type="time"
                    placeholder="시간 선택"
                    format="HH:mm"
                    value-format="HH:mm"
                    style="width: 100%;"
                    :editable="true"
                    :teleported="false"
                />
            </el-form-item>
            <!-- 사유 입력 -->
            <el-form-item 
                label="사유"
                label-position="top"
                >
                <el-input
                    type="textarea"
                    v-model="form.reason"
                    placeholder="사유를 입력하세요"
                    :rows="4"
                />
            </el-form-item>
        </el-form>
        <div class="btn-area">
            <!-- 취소 버튼 -->
            <el-button
                type="primary"
                class="cancle-btn"
                @click="closeModal"
                >
                취소
            </el-button>
            <!-- 제출 버튼 -->
            <el-button
                type="primary"
                class="submit-btn"
                @click="onSubmit"
                >
                확인
            </el-button>
        </div>
    </div>
</template>

<script setup>
    import { reactive } from 'vue'
    import { ElForm, ElFormItem, ElInput, ElTimePicker,ElDatePicker, ElButton } from 'element-plus'

    const emit = defineEmits(['submit', 'cancel'])

    const form = reactive({
        date: '',
        time: '',
        reason: ''
    })

    function onSubmit() {
        if (!form.date || !form.time || !form.reason) return
        emit('submit', { date: form.date, time: form.time, reason: form.reason })
        form.date = ''
        form.time = ''
        form.reason = ''
    }

    function closeModal() {
        emit('cancel')
    }
</script>

<style scoped>
    .event-form {
        flex: 1;
    }

    .btn-area {
        display: flex;
        justify-content: center;
        margin-top: 30px;
    }

    .submit-btn {
        width: 96px;
        height: 40px;
        font-size: 14px;
        font-weight: bold;
        background-color: var(--primary);
        color: var(--text-on-primary);
        border: 1px solid transparent;
        border-radius: 10px;
        padding: 10px 30px;
        cursor: pointer;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        transition: background-color 0.2s, box-shadow 0.2s;
        box-sizing: border-box;
    }

    .submit-btn:hover {
        background-color: var(--bg-main);
        color: var(--primary);
        border-color: var(--primary);
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
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
        transition: background-color 0.2s, box-shadow 0.2s;
        box-sizing: border-box;
    }
    .cancle-btn:hover {
        background-color: #000;
        color: #fff;
    }

    :deep(.el-input__wrapper.is-focus) {
        border-color: #000 !important;
        box-shadow: 0 0 0 1px #000 !important;
    }

    :deep(.el-textarea__inner:focus) {
        border-color: #000 !important;
        box-shadow: 0 0 0 1px #000 !important;
    }

    :deep(.el-form-item__label) {
        color: var(--text-main);
        font-size: 18px;
    }
    :deep(.el-input__wrapper),
:deep(.el-date-editor.el-input__wrapper),
:deep(.el-time-editor.el-input__wrapper) {
  background-color: var(--bg-main);       /* 입력 배경 */
  border: 1px solid var(--border-color);  /* 테두리 */
  border-radius: 10px;
  color: var(--text-main);                /* 텍스트 색 */
  transition: border 0.3s, box-shadow 0.3s;
}

/* 포커스 상태일 때 */
/* :deep(.el-input__wrapper.is-focus),
:deep(.el-input__wrapper:hover) {
  border-color: var(--primary);
  box-shadow: 0 0 0 1px var(--primary);
} */

/* 내부 텍스트 색 */
:deep(.el-input__inner ) {
  color: var(--text-main);
  font-size: 16px;
}
:deep(.el-textarea__inner ) {
  background-color: var(--bg-main); 
  color: var(--text-main);
  font-size: 16px;
}
/* placeholder 색 */
:deep(.el-input__inner::placeholder) {
  color: var(--text-muted);
}

/* date/time picker 아이콘 색상 */
:deep(.el-input__inner) {
  filter: var(--arrow-filter);
}

</style>
