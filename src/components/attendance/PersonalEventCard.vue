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
.personal-event-card {
  /* background-color: var(--bg-box); */
  border-radius: 12px;
  padding: 20px;
  /* box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05); */
  --el-color-primary: var(--primary);
}

.event-form {
  flex: 1;
}

.btn-area {
  display: flex;
  justify-content: center;
  margin-top: 30px;
}

/* 등록 버튼 */
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
  box-shadow: inset 1px 1px 10px rgba(0, 0, 0, 0.25);
}

/* 취소 버튼 */
.cancle-btn {
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

.cancle-btn:hover {
  background-color: #000;
  color: #fff;
}

/* Element Plus 라벨 스타일 */
/* :deep(.el-form-item__label) {
  color: var(--text-main);
  font-size: 18px;
} */

.personal-event-card {
    /* 기본 primary 색(파랑)을 검정으로 덮어씁니다 */
    --el-color-primary: #000 !important;
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
