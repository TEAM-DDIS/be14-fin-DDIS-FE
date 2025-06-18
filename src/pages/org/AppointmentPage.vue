<!-- 조직 및 직무 > 인사발령 -->
<template>
  <h1 class="page-title">인사발령</h1>
  <p class="desc">인사발령 이력 조회</p>

  <div class="content-box">
    <!-- 필터 & 액션 바 -->
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
    <div class="actions">
      <!-- selectedCount가 0이면 등록, 아니면 삭제 -->
      <button
        :class="['action-btn', selectedCount > 0 ? 'delete' : 'register']"
        @click="selectedCount > 0 ? onDelete() : goToRegister()"
      >
        <i :class="selectedCount > 0 ? 'fa fa-trash' : 'fa fa-plus'"></i>
        {{ selectedCount > 0 ? '삭제' : '등록' }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community'
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import BaseGrid from '@/components/grid/BaseGrid.vue'
import detailIconUrl from '@/assets/icons/detail_appointment.svg'

ModuleRegistry.registerModules([AllCommunityModule])

const API_BASE        = 'http://localhost:8000/appointment-history'
const selectedType    = ref('')
const filterEmployee  = ref('')
const rowData         = ref([])
const selectedCount   = ref(0)
let gridApi           = null
const router          = useRouter()

// 그리드 옵션 (checkbox 포함)
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

async function loadData(endpoint = 'approved') {
  try {
    const res = await fetch(`${API_BASE}/${endpoint}`)
    if (!res.ok) throw new Error(res.statusText)
    rowData.value = await res.json()
  } catch (err) {
    console.error('데이터 로딩 실패', err)
  }
}

onMounted(loadData)

// 필터링
const filteredData = computed(() =>
  rowData.value.filter(item =>
    (!selectedType.value || item.appointmentType === selectedType.value) &&
    (!filterEmployee.value || item.employeeId.toString().includes(filterEmployee.value))
  )
)

// 그리드 준비 시 API 저장 및 selectionChanged 이벤트 등록
function onGridReady(params) {
  gridApi = params.api
  gridApi.addEventListener('selectionChanged', () => {
    selectedCount.value = gridApi.getSelectedRows().length
  })
}

// 삭제
function onDelete() {
  const count = gridApi.getSelectedRows().length
  alert(`${count}건 삭제 예정`)
}

// 등록 페이지로 이동
function goToRegister() {
  router.push('/org/appointment/register')
}

// 상세 버튼 클릭
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
    background: #fff;
    border-radius: 12px;
    padding: 20px 32px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.05);
    margin: 24px;
    position: relative;
    padding-bottom: 100px;
  }
  .filter-box {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 12px;
    margin-bottom: 16px;
    padding: 16px 24px;
  }
  .filters {
    display: flex;
    align-items: end;
    align-items: center;
    gap: 20px;
  }
.actions {
  position: absolute;
  bottom: 30px;
  right: 32px;
  display: flex;
  gap: 8px;
}
  .filters label {
    font-weight: 500;
    color: #513737;
  }
  .filters select,
  .filters input {
    border: 1px solid #c8c8c8;
    border-radius: 8px;
    padding: 6px 8px;
    font-size: 14px;
    color: #000000;
  }
  .filters input {
    width: 250px;
  }
  .filters select {
    width: 160px;
  }

  .filters select:focus,
  .filters input:focus {
    outline: none;
    border: 1px solid black;
  }

  .action-btn.register {
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  font-family: inherit;
  background-color: #00a8e8;
  color: white;
  border: 1px solid transparent;
  border-radius: 10px;
  padding: 10px 30px;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: background-color 0.2s, box-shadow 0.2s;
  box-sizing: border-box;
}

  .action-btn.register:hover {
  background-color: white;
  color: #00a8e8;
  border-color: #00a8e8;
  box-shadow:
  inset 1px 1px 10px rgba(0, 0, 0, 0.25);
}
  .action-btn.delete {
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
  .action-btn.delete:hover {
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
