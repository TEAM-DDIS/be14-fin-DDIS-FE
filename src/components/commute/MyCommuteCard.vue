<template>
  <div class="leave-used-wrapper">
    <div class="section">
      <AgGrid
        class="ag-theme-alpine custom-theme"
        :gridOptions="{ theme: 'legacy' }"
        :columnDefs="columnDefs"
        :rowData="filteredCommuteList"
        height="600px"
        :pagination="true"
        :paginationPageSize="20"
      />
    </div>
  </div>
</template>

<script setup>
  import { computed } from 'vue'
  import AgGrid from '@/components/grid/BaseGrid.vue'

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

  // 시간 포맷터
  const formatTime = (raw) => raw ? raw.split('.')[0] : '-'
  const convertMinutesToHours = (mins) => mins ? Math.floor(mins / 60) : 0

  // 날짜 필터링
  const filteredCommuteList = computed(() => {
    return props.commuteList.filter(item => {
      const date = item.workDate?.slice(0, 7)
      return (!props.dateRange.start || date >= props.dateRange.start) &&
            (!props.dateRange.end || date <= props.dateRange.end)
    })
  })

  const columnDefs = [
    { headerName: '날짜', field: 'workDate', sort: 'desc' },
    { headerName: '근무상태', field: 'workStatus' },
    { headerName: '출근시간', field: 'checkInTime', valueFormatter: p => formatTime(p.value) },
    { headerName: '퇴근시간', field: 'checkOutTime', valueFormatter: p => formatTime(p.value) },
    { headerName: '근무시간', field: 'workDuration', valueFormatter: p => convertMinutesToHours(p.value) },
    { headerName: '시간외근무시간', field: 'overtimeExtra', valueFormatter: p => convertMinutesToHours(p.value) },
    { headerName: '야간근무시간', field: 'overtimeNight', valueFormatter: p => convertMinutesToHours(p.value) },
    { headerName: '휴일근무시간', field: 'overtimeHoliday', valueFormatter: p => convertMinutesToHours(p.value) },
    { headerName: '총 근무시간', field: 'totalWorkTime', valueFormatter: p => convertMinutesToHours(p.value) }
  ]


</script>

<style scoped>
  .leave-used-wrapper {
    display: flex;
    justify-content: space-between;
    background: #fff;
    padding: 30px;
    border-radius: 12px;
    box-shadow: 1px 1px 20px 1px rgba(0, 0, 0, 0.05);
    flex-wrap: wrap;
  }

  .section {
    width: 100%;
  }
</style>
