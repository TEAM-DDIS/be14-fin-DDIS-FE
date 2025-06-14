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
  import { computed } from 'vue'

  const props = defineProps({
    commuteList: {
      type: Array,
      required: true
    },
    dateRange: {
      type: Object,
      default: () => ({ start: '', end: '' })
    }
  })

  // 1. 필터링된 데이터 계산
  const filteredCommuteList = computed(() => {
    return props.commuteList.filter(item => {
      const date = item.workDate?.slice(0, 7)
      return (!props.dateRange.start || date >= props.dateRange.start) &&
            (!props.dateRange.end || date <= props.dateRange.end)
    })
  })

  // 2. 상태별 뱃지 색상 정의
  const baseList = [
    { label: '연차', color: '#8C9FFF' },
    { label: '반차', color: '#8CC2FF' },
    { label: '출장', color: '#C5E695' },
    { label: '외근', color: '#D0F0B0' },
    { label: '초과', color: '#FAD1F9' },
    { label: '지각', color: '#FFD38C' },
    { label: '결근', color: '#F7B4B4' }
  ]

  // 3. 상태 매핑
  const statusMap = {
    연차: '연차',
    반차: '반차',
    출장: '출장',
    외근: '외근',
    초과: '초과',
    지각: '지각',
    결근: '결근'
  }

  // 4. 요약 계산
  const summaryList = computed(() => {
    const counts = {}
    baseList.forEach(item => (counts[item.label] = 0))

    filteredCommuteList.value.forEach(entry => {
      const label = statusMap[entry.workStatus]
      if (counts[label] !== undefined) {
        counts[label]++
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
      border-radius: 20px;
      font-weight: bold;
      font-size: 20px;
      color: #ffffff;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }
</style>
