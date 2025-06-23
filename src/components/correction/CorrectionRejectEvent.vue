<template>
    <div class="correction-event-card">
        <el-form :model="form" label-width="100px" class="event-form">
            <!-- 사유 입력 -->
            <el-form-item 
                label="반려 사유"
                label-position="top"
                >
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
    import { ElForm, ElFormItem, ElDatePicker, ElInput, ElTimePicker, ElButton } from 'element-plus'

    const emit = defineEmits(['submit', 'cancel'])

    const form = reactive({
        reason: ''
    })

    function onSubmit() {
        if (!form.reason) return
        emit('submit', { reason: form.reason })
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

    :deep(.el-input__wrapper.is-focus) {
        border-color: #000 !important;
        box-shadow: 0 0 0 1px #000 !important;
    }

    :deep(.el-textarea__inner:focus) {
        border-color: #000 !important;
        box-shadow: 0 0 0 1px #000 !important;
    }

    :deep(.el-form-item__label) {
        color: #000;
        font-size: 18px;
    }
</style>
