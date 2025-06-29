<template>
  <div class="correction-used-wrapper">
    <div class="section">
      <AgGrid
        class="ag-theme-alpine custom-theme"
        :gridOptions="{ theme: 'legacy' }"
        :columnDefs="columnDefs"
        :rowData="leaveUsedData"
        height="500px"
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
  const loading = ref(false)

  const columnDefs = [
    { headerName: '번호', valueGetter: params => params.api.getDisplayedRowCount() - params.node.rowIndex, sortable: false, width: 100 },
    { headerName: '처리상태', field: 'approvalStatus', width: 150 },
    { headerName: '신청일', field: 'requestTime' },
    { headerName: '정정요청일', field: 'workDate'},
    { headerName: '출근시각', field: 'beforeCheckInTime', valueFormatter: ({ value }) => value ? value.split('.')[0] : '' },
    { headerName: '정정요청시각', field: 'requestedTimeChange',
      valueFormatter: ({ value }) => {
        if (!value) return ''
        const time = new Date(value).toTimeString().split(' ')[0]
        return time
      } 
      },
    { headerName: '처리시간', field: 'processedTime' },
    { headerName: '사유', field: 'reason' },
    { headerName: '반려사유', field: 'rejectReason' }
  ]

  onMounted(async () => {
    const userStore = useUserStore()
    const token = userStore.accessToken

    if (!token) {
      console.error('토큰이 없습니다. 로그인 후 다시 시도하세요.')
      return
    }

    try {
      const res = await fetch('https://api.isddishr.site/attendance/correction/history/process/me', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      if (!res.ok) throw new Error('API 오류')

      const data = await res.json()
    leaveUsedData.value = data
    } catch (err) {
      console.error('내 출근정정 내역 불러오기 실패:', err)
      statuses.value = []
    } finally {
      loading.value = false
    }
  })
</script>

<style scoped>
  .correction-used-wrapper {
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
