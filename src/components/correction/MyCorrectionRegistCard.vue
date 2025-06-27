<template>
  <div>
    <div class="section leave-regist-section">
      <AgGrid
        class="ag-theme-alpine custom-theme"
        :gridOptions="{ theme: 'legacy' }"
        :columnDefs="columnDefs"
        :rowData="leaveRegistData"
        height="500px"
        :pagination="true"
        :paginationPageSize="20"
        :style="{ width: '100%' }"
      />
      <div class="btn-area">
        <button class="apply-btn" @click="showModal = true">신청하기</button>
      </div>
    </div>
    <Teleport to="body">
      <div v-if="showModal" class="overlay">
        <div class="modal">
          <span class="modal-desc">출근 시각 정정 신청</span>
          <CorrectionRegistEvent @submit="handleSubmit" @cancel="showModal = false" />
        </div>
      </div>
    </Teleport>
  </div>
  <BaseToast ref="toastRef" />
</template>

<script setup>
  import { ref, onMounted } from 'vue'
  import AgGrid from '@/components/grid/BaseGrid.vue'
  import CorrectionRegistEvent from './CorrectionRegistEvent.vue'
  import { useUserStore } from '@/stores/user'
  import BaseToast from '@/components/toast/BaseToast.vue'

  const toastRef = ref(null)

  function showToast(msg) {
    toastRef.value?.show(msg)
  }


  const leaveRegistData = ref([])
  const showModal = ref(false)
  const loading = ref(false)

  async function handleSubmit(data) {
    // console.log('제출된 데이터:', data)
    const userStore = useUserStore()
    const token = userStore.accessToken

    if (!token) {
      showToast('로그인 정보가 없습니다.')
      return
    }

    try {
      const res = await fetch('https://api.isddishr.site/attendance/correction/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          requestedDate: data.date,
          requestedTimeChange: data.time,
          reason: data.reason
        })
      })

      if (!res.ok) throw new Error('출근 정정 신청 실패')

      showToast('출근 정정 신청이 완료되었습니다.')

      // 신청 성공 후 리스트 다시 불러오기
      const reload = await fetch('https://api.isddishr.site/attendance/correction/history/request/me', {
        headers: { Authorization: `Bearer ${token}` }
      })
      leaveRegistData.value = await reload.json()

      showModal.value = false
    } catch (err) {
      showToast('출근 등록을 먼저 진행해주세요.')
    }
  }

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
      const res = await fetch('https://api.isddishr.site/attendance/correction/history/request/me', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      if (!res.ok) throw new Error('API 오류')

      const data = await res.json()
    leaveRegistData.value = data
    } catch (err) {
      console.error('내 출근정정 신청 내역 불러오기 실패:', err)
      statuses.value = []
    } finally {
      loading.value = false
    }
  })
</script>

<style scoped>
  .section {
    background: var(--bg-box);
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
    background-color: var(--primary);
    color: var(--text-on-primary);
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
    background-color: var(--bg-main);
    color: var(--primary);
    border-color: var(--primary);
    box-shadow:
    inset 1px 1px 10px rgba(0, 0, 0, 0.25);
  }

  .overlay {
    position: fixed; top:0; left:0; right:0; bottom:0;
    background: rgba(0,0,0,0.4);
    display: flex; align-items: center; justify-content: center;
    z-index: 2000;
  }

  .modal {
    background: var(--modal-bg2);
    padding: 30px;
    border-radius: 20px;
    width: 420px;
    box-shadow: 0 2px 12px rgba(0,0,0,0.2);
  }

  .modal-desc {
    display: block;
    text-align: center;
    font-weight: bold;
    font-size: 20px;
    margin-bottom: 20px;
  }

  .desc {
    display: block;
    font-size: 18px;
    color: #666;
    line-height: 1.4;
    margin-bottom: 20px;
  }
</style>
