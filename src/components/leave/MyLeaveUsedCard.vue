<template>
  <div class="leave-used-wrapper">
    <div class="section">
      <AgGrid
        class="ag-theme-alpine custom-theme"
        :gridOptions="{ theme: 'legacy' }"
        :columnDefs="columnDefs"
        :rowData="leaveUsedData"
        height="340px"
        :pagination="true"
        :paginationPageSize="20"
      />
    </div>
  </div>
</template>

<script setup>
  import { ref, onMounted } from 'vue'
  import AgGrid from '@/components/grid/BaseGrid.vue'
  import { useUserStore } from '@/stores/user'

  const leaveUsedData = ref([])

  const columnDefs = [
    { headerName: '번호', valueGetter: (params) => leaveUsedData.value.length - params.node.rowIndex, sortable: false, filter: false, width: 100 },
    { headerName: '구분', field: 'type', width: 150 },
    { headerName: '처리상태', field: 'status', width: 150 },
    { headerName: '신청일', field: 'request_date' },
    { headerName: '시작일', field: 'start_date' },
    { headerName: '종료일', field: 'end_date' },
    { headerName: '사용일수', field: 'days', width: 150 },
    { headerName: '사유', field: 'reason' },
    { headerName: '반려사유', field: 'rejection_reason' }
  ]

  onMounted(async () => {
    const userStore = useUserStore()
    const token = userStore.accessToken

    if (!token) {
      console.error('로그인이 필요합니다.')
      return
    }

    try {
      const res = await fetch('http://localhost:5000/attendance/leave/history/used/me', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      if (!res.ok) {
        throw new Error('연차 사용 내역 조회 실패')
      }

      const raw = await res.json()

      // 매핑
      leaveUsedData.value = raw.map(item => ({
        id: item.historyId,
        type: item.leaveType,
        status: item.approvalStatus,
        request_date: item.requestDate,
        start_date: item.startDate,
        end_date: item.endDate,
        days: item.leaveDays,
        reason: item.reason,
        rejection_reason: item.rejectReason
      }))
    } catch (err) {
      console.error('API 오류:', err)
    }
  })
</script>


<style scoped>
  .leave-used-wrapper {
    display: flex;
    justify-content: space-between;
    background: var(--bg-box);
    padding: 30px;
    border-radius: 0px 12px 12px 12px;
    box-shadow: 1px 1px 20px 1px rgba(0, 0, 0, 0.05);
    flex-wrap: wrap;
  }

  .section {
    width: 100%;
  }
</style>
