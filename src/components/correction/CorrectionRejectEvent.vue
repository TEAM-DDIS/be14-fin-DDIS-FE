<template>
    <div class="correction-event-card">
        <el-form :model="form" label-width="100px" class="event-form">
            <!-- 사유 입력 -->
            <el-form-item label="반려 사유">
                <el-input
                    type="textarea"
                    v-model="form.reason"
                    placeholder="사유를 입력하세요"
                    :rows="4"
                    style="width: 100%;"
                    :editable="true"
                    :teleported="false"
                />
            </el-form-item>
        </el-form>
        <!-- 제출 버튼 -->
        <el-button
            type="primary"
            class="submit-btn"
            @click="onSubmit"
            >
            확인
        </el-button>
    </div>
</template>

<script setup>
    import { reactive } from 'vue'
    import { ElForm, ElFormItem, ElDatePicker, ElInput, ElTimePicker, ElButton } from 'element-plus'

    const emit = defineEmits(['submit'])

    const form = reactive({
        reason: ''
    })

    function onSubmit() {
        if (!form.reason) return
        emit('submit', { reason: form.reason })
        form.reason = ''
    }
</script>

<style scoped>
    .event-form {
        flex: 1;
    }

    .submit-btn {
        display: block;
        width: 93px;
        height: 37px;
        background-color: #00A8E8;
        color: white;
        font-size: 14px;
        font-weight: bold;
        border: 1px solid transparent;
        border-radius: 10px;
        cursor: pointer;
        padding: 10px 30px;
        margin: 16px 0 0 auto;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        transition: background-color 0.2s, box-shadow 0.2s;
    }

    .submit-btn:hover {
        background-color: white;
        color: #00A8E8;
        border: 1px solid #00A8E8;
        box-shadow: inset 1px 1px 10px rgba(0, 0, 0, 0.25);
    }

    :deep(.el-input__wrapper.is-focus) {
        border-color: #000 !important;
        box-shadow: 0 0 0 1px #000 !important;
    }

    :deep(.el-textarea__inner:focus) {
        border-color: #000 !important;
        box-shadow: 0 0 0 1px #000 !important;
    }
</style>
