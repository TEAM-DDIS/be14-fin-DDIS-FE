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
        <button class="action-btn primary" @click="onSearch">
          <i class="fa fa-search"></i> 조회
        </button>
      </div>
      <div class="actions">
        <button class="action-btn secondary" @click="onDelete">
          <i class="fa fa-trash"></i> 삭제
        </button>
        <button class="action-btn primary" @click="goToRegister">
          <i class="fa fa-plus"></i> 등록
        </button>
      </div>
    </div>

    <!-- AG Grid 테이블 -->
    <AgGridVue
      class="ag-theme-alpine custom-theme"
      style="width: 100%; height: 600px"
      :gridOptions="{ theme: 'legacy' }"
      :columnDefs="columnDefs"
      :rowData="filteredData"
      rowSelection="multiple"
      :pagination="true"
      :paginationPageSize="10"
      @grid-ready="onGridReady"
      @cell-clicked="onCellClick"
    />
  </div>
</template>

<script setup>
  // import 'ag-grid-community/styles/ag-grid.css'
  // import 'ag-grid-community/styles/ag-theme-alpine.css'
  import { AgGridVue } from 'ag-grid-vue3'
  import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community'
  import { ref, computed, onMounted } from 'vue'
  import { useRouter } from 'vue-router'


  import detailIconUrl from '@/assets/icons/detail_appointment.svg'

  const router = useRouter()

  // AG Grid 모듈 등록
  ModuleRegistry.registerModules([AllCommunityModule])

  // 필터 상태
  const selectedType = ref('')
  const filterEmployee = ref('')

  // 로우 데이터 저장
  const rowData = ref([])
  let gridApi = null

  // 등록 페이지로 이동
  function goToRegister() {
    router.push('/org/appointment/register')
  }


  // AG Grid 컬럼 정의
  const columnDefs = [
    { headerName: '번호', field: 'appointment_id', width: 90, checkboxSelection: true },
    { headerName: '사원번호', field: 'employee_id', flex: 1 },
    { headerName: '발령유형', field: 'appointment_type', flex: 1 },
    { headerName: '발령일자', field: 'appointment_effective_date', flex: 1 },
    { headerName: '상태', field: 'appointment_status', flex: 1 },
    {
      headerName: '상세',
      field: 'detail',
      width: 80,
      cellRenderer: () => `
        <img src="${detailIconUrl}" class="detail-btn"/>
    `
    }
  ]

  // 필터링된 데이터
  const filteredData = computed(() =>
    rowData.value.filter(item => {
      const matchType = !selectedType.value || item.appointment_type === selectedType.value
      const matchEmp  = !filterEmployee.value || item.employee_id.toString().includes(filterEmployee.value)
      return matchType && matchEmp
    })
  )

  // 그리드 준비 시 API 보관
  function onGridReady(params) {
    gridApi = params.api
  }

  // 행 삭제
  function onDelete() {
    const selected = gridApi.getSelectedRows()
    alert(`${selected.length}건 삭제 예정`)
  }

  // 상세 버튼 클릭
  function onCellClick(e) {
    if (e.colDef.field === 'detail') {
      router.push(`/org/appointment/${e.data.appointment_id}`)
    }
  }

  // org.json 안의 appointment 데이터 로드
  async function loadData() {
    try {
      const res   = await fetch('/org.json')
      const oData = await res.json()
      rowData.value = oData.appointment || []
    } catch (err) {
      console.error('데이터 로딩 실패', err)
    }
  }

  onMounted(loadData)
</script>

<style scoped>
  .page-title {
    margin-left: 20px;
    margin-bottom: 50px;
    color: #00a8e8;
  }
  .desc {
    display: block;
    margin-left: 20px;
    margin-bottom: 10px;
  }
  .content-box {
    background: #fff;
    border-radius: 12px;
    padding: 20px 32px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.05);
    margin: 24px;
  }
  .filter-box {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    margin-bottom: 16px;
    padding: 16px 24px;
  }
  .filters {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .actions {
    display: flex;
    gap: 8px;
    align-self: flex-end;
    margin-top: 8px;
  }
  .filters label {
    font-weight: 500;
    color: #513737;
  }
  .filters select,
  .filters input {
    border: 1px solid #D1D5DB;
    border-radius: 4px;
    padding: 6px 8px;
    font-size: 14px;
    color: #1F2937;
  }
  .action-btn {
    display: inline-flex;
    align-items: center;
  }


  .action-btn.primary {
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

  .action-btn.primary:hover {
  background-color: white;
  color: #00a8e8;
  border-color: #00a8e8;
  box-shadow:
  inset 1px 1px 10px rgba(0, 0, 0, 0.25);
}
  .action-btn.secondary {
    background-color: #D3D3D3;
    color: #000;
    border: none;
    border-radius: 10px;
    padding: 10px 30px;
    font-weight: bold;
    cursor: pointer;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    transition: background-color 0.2s, box-shadow 0.2s;
    box-sizing: border-box;
  }
  .action-btn.secondary:hover {
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
