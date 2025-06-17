<template>
    <div class="personal-event-card">
        <!-- 입력 폼 -->
        <el-form :model="form" label-width="60px" class="event-form">
            <!-- 날짜 선택 -->
            <el-form-item label="날짜" label-position="top">
                <el-date-picker
                v-model="form.date"
                type="date"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
                placeholder="날짜 선택"
                style="width: 100%;"
                />
            </el-form-item>
            <!-- 회의명 입력 -->
            <el-form-item label="회의 명" label-position="top">
                <el-input
                v-model="form.title"
                placeholder="회의 명 입력"
                />
            </el-form-item>
            <!-- 시간 선택 -->
            <el-form-item label="시간" label-position="top">
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
            <!-- 삭제 버튼 -->
            <el-button
                type="danger"
                class="delete-btn"
                @click="handleDelete"
            >
                삭제
            </el-button>
            <!-- 수정 버튼 -->
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
    import { reactive, onMounted } from 'vue'
    import { ElForm, ElFormItem, ElDatePicker, ElInput, ElTimePicker, ElButton } from 'element-plus'

    const props = defineProps({
        initialData: {
            type: Object,
            default: () => ({})
        }
    })

    const emit = defineEmits(['update', 'delete'])

    const form = reactive({
        date: '',
        title: '',
        time: ''
    })

    onMounted(() => {
        if (props.initialData) {
            form.date = props.initialData.date || ''
            form.title = props.initialData.title || ''
            form.time = props.initialData.time || ''
        }
    })

    function onSubmit() {
        if (!form.date || !form.title || !form.time) return
            emit('update', {
                id: props.initialData.id,
                date: form.date,
                title: form.title,
                time: form.time
        })
    }

    function handleDelete() {
        emit('delete', props.initialData.id)
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
        box-shadow: inset 1px 1px 10px rgba(0, 0, 0, 0.25);
    }

    .delete-btn {
        width: 96px;
        height: 40px;
        font-size: 14px;
        font-weight: bold;
        background-color: #d3d3d3;
        color: #000;
        border: none;
        border-radius: 10px;
        padding: 10px 30px;
        cursor: pointer;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        transition: background-color 0.2s, box-shadow 0.2s;
        box-sizing: border-box;
    }

    .delete-btn:hover {
        background-color: #000;
        color: #fff;
    }

    .personal-event-card {
        --el-color-primary: #000 !important;
    }

    :deep(.el-form-item__label) {
        color: #000;
        font-size: 18px;
    }
</style>
