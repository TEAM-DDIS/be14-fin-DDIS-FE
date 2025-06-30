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
            <!-- 일정명 입력 -->
            <el-form-item label="일정 명" label-position="top">
                <el-input
                v-model="form.title"
                placeholder="일정 명 입력"
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
  justify-content: center;
  gap: 8px;
  margin-top: 30px;
}

/* 확인 버튼 (기본 primary) */
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
  box-shadow: 0 2px 8px var(--hover-shadow);
  transition: background-color 0.2s, box-shadow 0.2s;
  box-sizing: border-box;
}
.submit-btn:hover {
background-color: var(--bg-main);
  color: var(--primary);
  border-color: var(--primary);
  box-shadow: inset 1px 1px 10px rgba(0, 0, 0, 0.25);
}

/* 삭제 버튼 (secondary) */
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
  border-color: var(--primary);

}

/* 카드 전체 */
.personal-event-card {
  --el-color-primary: var(--primary) !important;
  /* background-color: var(--bg-box); */
  padding: 20px;
  border-radius: 12px;
  /* box-shadow: 1px 1px 20px var(--hover-shadow); */
  color: var(--text-main);
}

/* 라벨 폰트 */
:deep(.el-form-item__label) {
  color: var(--text-main);
  font-size: 16px;
  font-weight: 500;
}
:deep(.el-input__wrapper.is-focus),
:deep(.el-input__wrapper:hover) {
  border-color: var(--border-color) !important;
  box-shadow: none !important;
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
</style>