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
      <button @click="downloadCSV" class="download-btn">CSV 다운로드</button>
    </div>
  </div>
  <BaseToast ref="toastRef" />
</template>

<script setup>
  import { ref, computed } from 'vue'
  import AgGrid from '@/components/grid/BaseGrid.vue'
  import BaseToast from '@/components/toast/BaseToast.vue'

  const toastRef = ref(null)

  function showToast(msg) {
    toastRef.value?.show(msg)
  }

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

  function downloadCSV() {
    if (!filteredCommuteList.value.length) {
      showToast('출퇴근 내역이 없습니다.')
      return
    }

    const headers = [
      '날짜', '근무상태', '출근시간', '퇴근시간',
      '근무시간', '시간외근무시간', '야간근무시간',
      '휴일근무시간', '총 근무시간'
    ]

    const rows = filteredCommuteList.value.map(item => [
      item.workDate ?? '',
      item.workStatus ?? '',
      formatTime(item.checkInTime),
      formatTime(item.checkOutTime),
      convertMinutesToHours(item.workDuration),
      convertMinutesToHours(item.overtimeExtra),
      convertMinutesToHours(item.overtimeNight),
      convertMinutesToHours(item.overtimeHoliday),
      convertMinutesToHours(item.totalWorkTime)
    ])

    const csvContent = [headers, ...rows]
      .map(row => row.map(v => `"${v}"`).join(','))
      .join('\n')

    const blob = new Blob(['\uFEFF' + csvContent], {
      type: 'text/csv;charset=utf-8;'
    })

    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', '출퇴근_내역.csv')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
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

  .download-btn {
    font-size: 14px;
    font-weight: bold;
    background-color: #00a8e8;
    color: white;
    border: 1px solid transparent;
    border-radius: 10px;
    padding: 10px 30px;
    margin-top: 20px;
    cursor: pointer;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    transition: background-color 0.2s, box-shadow 0.2s;
    box-sizing: border-box;
    white-space: nowrap;
  }

  .download-btn:hover {
    background-color: white;
    color: #00a8e8;
    border-color: #00a8e8;
    box-shadow:
    inset 1px 1px 10px rgba(0, 0, 0, 0.25);
  }
</style>
