<!-- 조직 및 직무 > 인사발령 (> 인사발령 상세 조회) -->
<template>
  <div class="detail-page">
    <h1 class="page-title">
        <img src="@/assets/icons/back_btn.svg" alt="back" class="back-btn" @click="goBack"/>
        인사발령
    </h1>
    <p class="desc">인사발령 이력 상세 조회</p>
        
    <div v-if="appointmentDetail" class="content-box">
      <h2 class="title">인사발령 상세 이력</h2>
      <div class="tables">
        <!-- 상단 기본 정보 (기존 테이블 유지 or 필요시 AG Grid 로 변경 가능) -->
        <table class="header-table">
          <tr>
            <th>등록일자</th>
            <td>{{ appointmentDetail.registration_date }}</td>
          </tr>
          <tr>
            <th>발령일자</th>
            <td>{{ appointmentDetail.appointment_effective_date }}</td>
          </tr>
          <tr>
            <th>발령제목</th>
            <td>{{ appointmentDetail.title }}</td>
          </tr>
        </table>

        <!-- AG Grid 로 대체된 상세 정보 -->
        <div class="grid-wrapper">
          <BaseGrid
            class="ag-theme-alpine custom-theme"
            :gridOptions="{ theme: 'legacy' }"
            :columnDefs="detailColumnDefs"
            :rowData="rowDataDetail"
            width="100%"
            height="300px"
            :pagination="false"
            :pageSize="10"
            @row-click="onRowClick"
            @cell-click="onCellClick"
          />
        </div>
      </div>
    </div>

    <div v-else class="loading">
      로딩 중...
    </div>
  </div>
</template>

<script setup>
    import { ref, onMounted, computed } from 'vue'
    import { useRoute, useRouter } from 'vue-router'

    // AG Grid import
    import { AgGridVue } from 'ag-grid-vue3'
    import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community'
    import BaseGrid from '@/components/grid/BaseGrid.vue'

    // AG Grid 모듈 등록
    ModuleRegistry.registerModules([AllCommunityModule])

    const route = useRoute()
    const router = useRouter()
    const appointmentId     = Number(route.params.appointmentId)
    const appointmentDetail = ref(null)

    function goBack() {
    router.back()
    }

    async function loadDetail() {
    try {
        const res   = await fetch('/org.json')
        const oData = await res.json()
        appointmentDetail.value = (oData.appointmentDetail || [])
        .find(a => a.appointment_id === appointmentId) || null
    } catch (e) {
        console.error('상세 데이터 로드 실패', e)
    }
    }

    onMounted(loadDetail)

    // AG Grid 컬럼 정의 (상세 테이블용)
    const detailColumnDefs = [
      { headerName: '번호',
        valueGetter: 'node.rowIndex + 1',
        width: 100, 
        sortable: true
      },
      { headerName: '발령유형',
        field: 'appointment_type',
        flex: 1, 
        sortable: true, 
        filter: true 
      },
      { headerName: '사원명',
        field: 'employee_name',
        flex: 1, sortable: true, 
        filter: true 
      },
      { headerName: '소속부서', 
        field: 'department_name', 
        flex: 1, 
        sortable: true, 
        filter: true
      },
      { headerName: '소속팀',
        field: 'team_name', 
        flex: 1, 
        sortable: true, 
        filter: true 
      },
      { headerName: '발령 후 직급',
        field: 'new_rank',
        flex: 1, 
        sortable: true, 
        filter: true 
      }
    ]

    // 공통 컬럼 설정
    const defaultColDef = {
    resizable: true,
    minWidth: 100,
    filter: true,
    sortable: true,
    }

    // rowDataDetail: details 가 준비되면 그 배열을 바인딩
    const rowDataDetail = computed(() => appointmentDetail.value?.details || [])

    // 그리드의 이벤트를 받아 처리
    function onRowClick(event) {
      console.log('행 클릭:', event)
    }
    function onCellClick(event) {
      console.log('셀 클릭:', event)
    }
</script>

<style scoped>
    .page-title{
    margin-left: 20px;
    margin-bottom: 30px;
    color: #00a8e8;
    }
    .back-btn {
        width: 24px;
        margin-right: -10px;
        cursor: pointer;
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
    }
    .title {
    text-align: center;
    margin-bottom: 24px;
    }

    .tables {
      width: 60%;
      margin: 0 auto;
      margin-top: 20px;
      margin-bottom: 40px;
    }
    .header-table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 32px;
    }
    .header-table th,
    .header-table td {
    border: 1px solid #c8c8c8;
    padding: 8px 12px;
    }
    .header-table th {
    background: #f8f9fa;
    width: 160px;
    text-align: left;
    }
    /* AG Grid 래퍼 */
    .grid-wrapper {
    width: 100%;
    height: 400px;
    }

    .loading {
    text-align: center;
    padding: 40px;
    color: #666;
    }
</style>
