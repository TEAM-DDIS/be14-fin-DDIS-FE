<!-- 조직 및 직무 > 인사발령 이력 -->
<template>
  <h1 class="page-title">인사발령</h1>
  <p class="desc">인사발령 이력 조회</p>

  <div class="content-box">
    <div class="filter-box">
      <div class="filters">
        <label for="type-select">발령유형</label>
        <select id="type-select" v-model="selectedType">
          <option value="">전체</option>
          <option value="승진">승진</option>
          <option value="전보">전보</option>
          <option value="전직">전직</option>
          <option value="직급조정">직급조정</option>
          <option value="직무">직무</option>
        </select>
        <input
          type="text"
          placeholder="사원번호"
          v-model="filterEmployee"
        />
      </div>
    </div>

    <div class="grid-wrapper">
      <BaseGrid
        class="ag-theme-alpine custom-theme"
        :gridOptions="gridOptions"
        :columnDefs="columnDefs"
        :rowData="filteredData"
        width="100%"
        height="600px"
        :pagination="true"
        :pageSize="10"
        @ready="onGridReady"
        @cell-click="onCellClick"
      />
    </div>
    <div class="buttons">
      <button @click="onDelete()" class="btn-delete">삭제</button>
      <button @click="goToRegister()" class="btn-register">등록</button>
    </div>
  </div>

  <ConfirmModal
    v-if="showConfirm"
    :message="confirmMessage"
    @confirm="handleConfirm"
    @cancel="handleCancel"
  />
  <BaseToast ref="toastRef" />
</template>

<script setup>
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community'
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import BaseGrid from '@/components/grid/BaseGrid.vue'
import detailIconUrl from '@/assets/icons/detail_appointment.svg'
import BaseToast from '@/components/toast/BaseToast.vue'
import ConfirmModal from '@/components/org/appointment/ConfirmModal.vue'

ModuleRegistry.registerModules([AllCommunityModule])

const userStore = useUserStore()
const selectedType    = ref('')
const filterEmployee  = ref('')
const rowData         = ref([])
const selectedCount   = ref(0)
let gridApi           = null
const router          = useRouter()
const showConfirm = ref(false)
const confirmMessage = ref('')
let confirmCallback = null
const token = useUserStore().accessToken

const toastRef = ref(null)

function showToast(msg) {
  toastRef.value?.show(msg)
}

function openConfirmModal(message, onConfirm) {
  confirmMessage.value = message
  confirmCallback = onConfirm
  showConfirm.value = true
}

function handleConfirm() {
  showConfirm.value = false
  confirmCallback?.()
}
function handleCancel() {
  showConfirm.value = false
}

const gridOptions = {
  theme: 'legacy',
  rowSelection: 'multiple',
}

const columnDefs = [
  { headerName: '번호',width: 90,
    valueGetter: params => params.node.rowIndex + 1,
    checkboxSelection: true,
    sortable: false,
    suppressMenu: true},
  { headerName: '사원번호', field: 'employeeId',             flex: 1 },
  { headerName: '발령사유', field: 'appointmentReason',      flex: 1 },
  { headerName: '발령유형', field: 'appointmentType',        flex: 1 },
  { headerName: '발령일자', field: 'appointmentEffectiveDate', flex: 1 },
  {
    headerName: '상세',
    field: 'detail',
    width: 100,
    cellRenderer: () => `<img src="${detailIconUrl}" class="detail-btn"/>`
  }
]

async function loadData() {
  const url = 'http://localhost:5000/appointment-history/approved'
  try {
    const res = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    if (!res.ok) throw new Error(res.statusText)
    rowData.value = await res.json()
  } catch (err) {
    console.error('데이터 로딩 실패', err)
  }
}

onMounted(loadData)

const filteredData = computed(() =>
  rowData.value.filter(item =>
    (!selectedType.value || item.appointmentType === selectedType.value) &&
    (!filterEmployee.value || item.employeeId.toString().includes(filterEmployee.value))
  )
)

function onGridReady(params) {
  gridApi = params.api
  gridApi.addEventListener('selectionChanged', () => {
    selectedCount.value = gridApi.getSelectedRows().length
  })
}

async function onDelete() {
  const selectedRows = gridApi.getSelectedRows()
  const idsToDelete = selectedRows.map(row => row.appointmentHistoryId)

  if (idsToDelete.length === 0) {
    showToast('삭제할 항목이 없습니다.')
    return
  }

  openConfirmModal(`${idsToDelete.length}건을 삭제하시겠습니까?`, async () => {
    const token = userStore.accessToken
    try {
      for (const id of idsToDelete) {
        const res = await fetch(`http://localhost:5000/appointment/delete/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        if (!res.ok) throw new Error(`ID ${id} 삭제 실패`)
      }

      showToast(`${idsToDelete.length}건 삭제 완료`)
      await loadData()
    } catch (err) {
      console.error('삭제 오류:', err)
      showToast('삭제 중 오류가 발생했습니다.')
    }
  })
}

function goToRegister() {
  router.push('/org/appointment/register')
}
function onCellClick(e) {
  if (e.colDef.field === 'detail') {
    router.push(`/org/appointment/${e.data.appointmentHistoryId}`)
  }
}
</script>

<style scoped>
  .page-title {
    margin-left: 20px;
    margin-bottom: 30px;
    color: #00a8e8;
  }
  .desc {
    display: block;
    margin-left: 20px;
    margin-bottom: 10px;
    font-size: 18px;
  }
  .content-box {
    background: var(--bg-box);
    border-radius: 12px;
    padding: 20px 32px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.05);
    margin-left: 20px;
    position: relative;
    padding-bottom: 100px;
  }
  .filter-box {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 12px;
    margin-bottom: 16px;
  }
  .filters {
    display: flex;
    align-items: end;
    align-items: center;
    gap: 20px;
  }
  .filters label {
    font-weight: 500;
    color: var(--text-main);;
  }
  .filters select,
  .filters input {
    border: 1px solid #ddd;
    border-radius: 8px;
    padding: 6px 8px;
    font-size: 14px;
    color: var(--text-main);
    background: var(--modal-box-bg);
  }
  .filters input {
    width: 250px;
  }
  .filters select {
    width: 160px;
  }

  .grid-wrapper {
    margin-bottom: 30px;
  }

  .buttons {
  position: absolute;
  bottom: 50px;
  right: 32px;
  display: flex;
  gap: 15px;
}

  .btn-register {
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  font-family: inherit;
  background-color: var(--primary);
  color: var(--text-on-primary);
  border: 1px solid transparent;
  border-radius: 10px;
  padding: 10px 30px;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: background-color 0.2s, box-shadow 0.2s;
  box-sizing: border-box;
}

.btn-register:hover {
  background-color: var(--bg-main);
  color: var(--primary);
  border-color: var(--primary);
  box-shadow: inset 1px 1px 10px rgba(0, 0, 0, 0.25);
}
  .btn-delete {
    background-color: #D3D3D3;
    color: #000;
    font-size: 14px;
    font-weight: bold;
    cursor: pointer;
    font-family: inherit;
    border: 1px solid transparent;
    border-radius: 10px;
    padding: 10px 30px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    transition: background-color 0.2s, box-shadow 0.2s;
    box-sizing: border-box;
  }
  .btn-delete:hover {
    background-color: #000;
    color: #fff;
  }

  .detail-btn {
    background: none;
    border: none;
    padding: 4px;
    cursor: pointer;
    width: 30px;
    height: 30px;
  }
</style>
