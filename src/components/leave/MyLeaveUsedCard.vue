<template>
  <div class="leave-used-wrapper">
    <div class="section">
      <AgGrid
        class="ag-theme-alpine custom-theme"
        :gridOptions="{ theme: 'legacy' }"
        :columnDefs="columnDefs"
        :rowData="leaveUsedData"
        height="400px"
        :pagination="true"
        :paginationPageSize="10"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import AgGrid from '@/components/grid/BaseGrid.vue'

const leaveUsedData = ref([])

const columnDefs = [
  { headerName: '번호', field: 'id', sort: 'desc'},
  { headerName: '구분', field: 'type'},
  { headerName: '처리상태', field: 'status'},
  { headerName: '신청일', field: 'request_date'},
  { headerName: '시작일', field: 'start_date'},
  { headerName: '종료일', field: 'end_date'},
  { headerName: '사용일수', field: 'days'},
  { headerName: '사유', field: 'reason'},
  { headerName: '반려사유', field: 'rejection_reason'}
]

onMounted(async () => {
  const res = await fetch('/attendance.json')
  const json = await res.json()
  leaveUsedData.value = json.leave_used
})
</script>

<style scoped>
.leave-used-wrapper {
  display: flex;
  justify-content: space-between;
  background: #fff;
  padding: 30px;
  border-radius: 20px;
  box-shadow: 1px 1px 20px 1px rgba(0, 0, 0, 0.05);
  flex-wrap: wrap;
}

.section {
  width: 100%;
}
</style>
