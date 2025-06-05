<template>
    <div class="personal-event-card">
        <!-- 입력 폼 -->
        <el-form :model="form" label-width="60px" class="event-form">
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
            <!-- 일정명 입력 -->
            <el-form-item 
                label="일정 명"
                label-position="top"
                >
                <el-input
                    v-model="form.title"
                    placeholder="일정 명 입력"
                />
            </el-form-item>
            <!-- 시간 선택 -->
            <el-form-item 
                label="시간"
                label-position="top"
                >
                <el-time-picker
                    v-model="form.time"
                    placeholder="시간 선택"
                    format="HH:mm"
                    value-format="HH:mm"
                    :picker-options="{ start: '00:00', step: '00:30', end: '23:30' }"
                    style="width: 100%;"
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
            <!-- 등록 버튼 -->
            <el-button
                type="primary"
                class="submit-btn"
                @click="onSubmit"
                >
                등록
            </el-button>
        </div>
    </div>
</template>

<script setup>
    import { reactive } from 'vue'
    import { ElForm, ElFormItem, ElDatePicker, ElInput, ElTimePicker, ElButton } from 'element-plus'

    const emit = defineEmits(['add', 'cancel'])

    const form = reactive({
        date: '',
        title: '',
        time: ''
    })

    function onSubmit() {
        // 모든 필드가 채워졌을 때만 emit
        if (!form.date || !form.title || !form.time) return
        emit('add', {
            date:  form.date,
            title: form.title,
            time:  form.time
        })
        // 폼 초기화
        form.date = ''
        form.title = ''
        form.time = ''
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

    .personal-event-card {
        /* 기본 primary 색(파랑)을 검정으로 덮어씁니다 */
        --el-color-primary: #000 !important;
    }

    :deep(.el-form-item__label) {
        color: #000;
        font-size: 18px;
    }
</style>
