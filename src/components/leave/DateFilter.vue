<template>
    <div class="date-filter-box">
        <div class="inputs">
            <label class="date-label"><strong>조회기간</strong></label>
            <input type="month" v-model="localRange.start" :placeholder="startPlaceholder" />
            <span>~</span>
            <input type="month" v-model="localRange.end" :placeholder="endPlaceholder" />
        </div>
        <div class="btn-area">
            <button class="search-btn" @click="onSearch">조회</button>
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

    const emit = defineEmits(['search'])

    const localRange = reactive({
        start: '',
        end: ''
    })

    // Placeholder-like 텍스트는 type="month"에서 실제 지원하지 않음
    // 필요 시 라벨에서 설명하거나 선택 유도 가능
    const startPlaceholder = '----년 --월'
    const endPlaceholder = '----년 --월'

    function onSearch() {
        if (!localRange.start || !localRange.end) {
            showToast('조회기간을 입력해주세요.')
            return
        }
        emit('search', { ...localRange })
    }
</script>

<style scoped>
    .date-filter-box {
        display: flex;
        justify-content: space-between;
        align-items: center;
        background: var(--bg-box);
        box-shadow: 1px 1px 20px 1px rgba(0, 0, 0, 0.05);
        padding: 30px;
        border-radius: 12px;
        flex-wrap: wrap;
        gap: 13px;
    }

    .inputs {
        display: flex;
        align-items: center;
        gap: 13px;
    }

    .date-label {
        margin-right: 4px;
    }

    input[type="month"] {
        border: 1px solid #ccc;
        border-radius: 8px;
        padding: 6px 8px;
        height: 22px;
        color: var(--text-main);
        background: var(--modal-bg);
    }

    /* 빈 값일 때 회색 텍스트처럼 보이게 */
    input[type="month"]:not(:valid)::before {
        content: attr(placeholder);
        color: #aaa;
    }
    .date-filter-box input[type="month"]::-webkit-calendar-picker-indicator {
    filter: var(--icon-filter);
    }
    input[type="month"]:not(:valid) {
        color: transparent;
    }

    .btn-area {
        display: flex;
        justify-content: flex-end;
    }

    .search-btn {
        background-color: var(--primary);
        color: var(--text-on-primary);  
        font-weight: bold;
        border: 1px solid transparent;
        border-radius: 10px;
        padding: 10px 30px;
        cursor: pointer;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        transition: background-color 0.2s, box-shadow 0.2s;
    }

    .search-btn:hover {
        background-color: var(--bg-main);
        color: var(--primary);
        border-color: var(--primary);
        box-shadow: inset 1px 1px 10px rgba(0, 0, 0, 0.25);
    }
</style>
