<template>
    <div class="summary-wrapper">
        <div
            v-for="item in summaryList"
            :key="item.label"
            class="summary-badge"
            :style="{ backgroundColor: item.color }"
            >
            {{ item.label }} {{ item.count }}
        </div>
    </div>
</template>

<script setup>
    import { ref, computed, onMounted } from 'vue'

    // 고정 상태 및 색상
    const baseList = [
        { label: '연차', color: '#8C9FFF' },
        { label: '반차', color: '#8CC2FF' },
        { label: '출장', color: '#C5E695' },
        { label: '외근', color: '#D0F0B0' },
        { label: '초과', color: '#FAD1F9' },
        { label: '지각', color: '#FFD38C' },
        { label: '결근', color: '#F7B4B4' }
    ]

    // 외부 JSON 데이터로 대체
    const commuteList = ref([])

    onMounted(async () => {
        const res = await fetch('/attendance.json')
        const json = await res.json()
        commuteList.value = json.work_status_summary
    })

    const summaryList = computed(() => {
        const counts = {}
        baseList.forEach(item => (counts[item.label] = 0))

        commuteList.value.forEach(entry => {
            const status = entry.work_status_id
            if (counts.hasOwnProperty(status)) {
            counts[status]++
            }
        })

        return baseList.map(item => ({
            label: item.label,
            color: item.color,
            count: counts[item.label]
        }))
    })
</script>

<style scoped>
    .summary-wrapper {
        display: flex;
        flex-wrap: wrap;
        gap: 20px;
        margin-top: 16px;
        margin-bottom: 16px;
        justify-content: center;
    }

    .summary-badge {
        padding: 8px 16px;
        border-radius: 12px;
        font-weight: bold;
        font-size: 20px;
        color: #ffffff;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }
</style>
