<!-- 조직 및 직무 > 인사발령 > 인사발령 상세 -->
<template>
  <div class="detail-page">
    <h1 class="page-title">
      <img src="@/assets/icons/back_btn.svg"
           alt="back"
           class="back-btn"
           @click="goBack" />
      인사발령 상세
    </h1>
    <p class="desc">이력 상세 조회</p>
        
    <div v-if="appointmentDetail" class="content-box">
      <table class="header-table">
        <tr>
          <th>사원번호</th>
          <td>{{ appointmentDetail.employeeId }}</td>
        </tr>
        <tr>
          <th>사원명</th>
          <td>{{ appointmentDetail.employeeName }}</td>
        </tr>
        <tr>
          <th>제목</th>
          <td>{{ appointmentDetail.appointmentReason }}</td>
        </tr>
        <tr>
          <th>발령유형</th>
          <td>{{ appointmentDetail.appointmentType }}</td>
        </tr>
      </table>

      <div class="grid-wrapper">
        <BaseGrid
          class="ag-theme-alpine custom-theme"
          :gridOptions="{ theme: 'legacy' }"
          :columnDefs="detailColumnDefs"
          :rowData="rowDataDetail"
          :pagination="false"
          height="180px"
        />
      </div>
    </div>

    <div v-else class="loading">로딩 중...</div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community'
import BaseGrid from '@/components/grid/BaseGrid.vue'
import { useUserStore } from '@/stores/user'

ModuleRegistry.registerModules([AllCommunityModule])

const route  = useRoute()
const router = useRouter()
const appointmentHistoryId = Number(route.params.appointmentHistoryId)
const token = useUserStore().accessToken

const appointmentDetail = ref(null)
const rowDataDetail    = ref([])

function goBack() {
  router.back()
}


async function loadDetail() {
  const url = `https://api.isddishr.site/appointment-history/history/${appointmentHistoryId}`
  try {
    const res = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    if (!res.ok) throw new Error(res.statusText)

    const dto = await res.json()
    appointmentDetail.value = Array.isArray(dto) ? dto[0] : dto
    rowDataDetail.value     = Array.isArray(dto) ? dto : [dto]
  } catch (e) {
    console.error('상세 데이터 로드 실패', e)
  }
}

onMounted(loadDetail)

const detailColumnDefs = [
  { headerName: '사원번호',     field: 'employeeId',               width:180 },
  { headerName: '사원명',       field: 'employeeName',             flex: 1 },
  { headerName: '발령유형',     field: 'appointmentType',          flex: 1 },
  { headerName: '발령사유',     field: 'appointmentReason',        width:250 },
  { headerName: '발령일자',     field: 'appointmentEffectiveDate', flex: 1 },
  { headerName: '등록일자',     field: 'appointmentHistoryCreatedAt', flex: 1 },
]
</script>

<style scoped>
.page-title {
  margin-left: 20px;
  margin-bottom: 30px;
  color: var(--primary); 
}
.back-btn {
  width: 24px;
  height: 24px;
  margin-right: -10px;
  cursor: pointer;
  color: var(--primary); 
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
}
.header-table {
  width: 60%;
  border-collapse: collapse;
  margin: 30px auto 40px;
}
.header-table th,
.header-table td {
  border: 1px solid #c8c8c8;
  padding: 8px 12px;
}
.header-table th {
  background-color: var(--bg-label-cell);
  width: 160px;
  text-align: left;
}
.grid-wrapper {
  width: 60%;
  margin: 40px auto;
}
.loading {
  text-align: center;
  padding: 40px;
  color: #666;
}
</style>
