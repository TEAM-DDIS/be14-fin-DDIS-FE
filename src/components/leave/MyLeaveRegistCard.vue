<template>
  <div>
    <div class="section leave-regist-section">
      <AgGrid
        class="ag-theme-alpine custom-theme"
        :gridOptions="{ theme: 'legacy' }"
        :columnDefs="columnDefs"
        :rowData="leaveRegistData"
        height="280px"
        :pagination="true"
        :paginationPageSize="20"
        :style="{ width: '100%' }"
      />
      <div class="btn-area">
        <button class="apply-btn">신청하기</button>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref, onMounted } from 'vue'
  import AgGrid from '@/components/grid/BaseGrid.vue'
  import { useUserStore } from '@/stores/user'

  const leaveRegistData = ref([])

  const columnDefs = [
    {
      headerName: '번호',
      valueGetter: (params) => leaveRegistData.value.length - params.node.rowIndex,
      sortable: false,
      filter: false
    },
    { headerName: '구분', field: 'type' },
    { headerName: '처리상태', field: 'status' },
    { headerName: '신청일', field: 'request_date' },
    { headerName: '시작일', field: 'start_date' },
    { headerName: '종료일', field: 'end_date' },
    { headerName: '사용일수', field: 'days' },
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
      const res = await fetch('http://localhost:8000/attendance/leave/history/request/me', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      if (!res.ok) throw new Error('연차 신청 내역 조회 실패')

      const raw = await res.json()

      leaveRegistData.value = raw.map(item => ({
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
  .section {
    display: flex;
    justify-content: space-between;
    background: #fff;
    padding: 30px;
    border-radius: 0px 12px 12px 12px;
    box-shadow: 1px 1px 20px 1px rgba(0, 0, 0, 0.05);
    flex-wrap: wrap;
  }

  .btn-area {
    width: 100%;
    display: flex;
    justify-content: flex-end;
    margin-top: 20px;
  }

  .apply-btn {
    display: block;
    background-color: #00a8e8;
    color: white;
    font-weight: bold;
    border: 1px solid transparent;
    border-radius: 10px;
    padding: 10px 30px;
    cursor: pointer;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    transition: background-color 0.2s, box-shadow 0.2s;
    box-sizing: border-box;
  }

  .apply-btn:hover {
    background-color: white;
    color: #00a8e8;
    border-color: #00a8e8;
    box-shadow:
    inset 1px 1px 10px rgba(0, 0, 0, 0.25);
  }
</style>
