<!-- src/components/OrgDashboard.vue -->
<template>
  <h1 class="title">조직 구성</h1>
  <div class="content-box">
    <div class="org-dashboard">
      <!-- Left: Org Hierarchy -->
      <div class="left">
        <h2>조직도</h2>
        <OrgHierarchy @team-selected="onTeamSelected" />
      </div>

      <!-- Middle: Team Members List -->
      <div class="team-panel">
        <template v-if="selectedTeam">
          <h3>{{ selectedTeam.team_name }} 팀원</h3>
          <ul class="member-list">
            <li
              v-for="emp in teamMembers"
              :key="emp.employee_id"
              @click="onEmployeeSelected(emp)"
              :class="{ active: emp.employee_id === selectedEmployee?.employee_id }"
            >
              <i class="fa fa-user-circle icon" />
              <div class="member-info">
                <strong>{{ emp.employee_name }}</strong>
                <span>{{ emp.position_name }}</span>
                <small>{{ emp.rank_name }}</small>
              </div>
            </li>
          </ul>
        </template>
        <template v-else>
          <div class="placeholder">왼쪽에서 팀을 선택해주세요.</div>
        </template>
      </div>

      <!-- Right: Employee Profile -->
      <div class="profile-panel">
        <template v-if="selectedEmployee">
          <div class="profile-card">
            <i class="fa fa-user-circle avatar" />
            <h4>{{ selectedEmployee.position_name }} {{ selectedEmployee.employee_name }}</h4>
          </div>

          <!-- 기본 정보 AG Grid -->
          <ag-grid-vue
            class="ag-theme-alpine profile-grid"
            :columnDefs="profileColumnDefs"
            :rowData="profileRowData"
            :domLayout="'autoHeight'"
            :headerHeight="0"
            :rowHeight="32"
          />

          <!-- 상세 정보 -->
          <details class="profile-details">
            <summary>▼ 상세 정보</summary>
            <ag-grid-vue
              class="ag-theme-alpine details-grid"
              :columnDefs="detailsColumnDefs"
              :rowData="detailsRowData"
              :domLayout="'autoHeight'"
              :headerHeight="0"
              :rowHeight="32"
            />
          </details>
        </template>
        <template v-else>
          <div class="placeholder">가운데에서 사원을 선택해주세요.</div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import axios from 'axios'
import OrgHierarchy from '@/components/org/structure/Hierarchy.vue'

// AG Grid 모듈 등록
import { AgGridVue } from 'ag-grid-vue3'
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community'
import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-alpine.css'
ModuleRegistry.registerModules([AllCommunityModule])

// 선택된 팀, 사원
const selectedTeam     = ref(null)
const selectedEmployee = ref(null)
const teamMembers      = ref([])

// 공통 데이터 저장소
const dataStore = reactive({
  employees: [], positions: [], ranks: [],
  departments: [], headquarters: []
})

// 처음 마운트 시 데이터 로드
onMounted(async () => {
  const [eRes, pRes, rRes, dRes, hRes] = await Promise.all([
    axios.get('http://localhost:3000/employees'),
    axios.get('http://localhost:3000/position'),
    axios.get('http://localhost:3000/rank'),
    axios.get('http://localhost:3000/department'),
    axios.get('http://localhost:3000/headquarters'),
  ])
  dataStore.positions    = pRes.data
  dataStore.ranks        = rRes.data
  dataStore.departments  = dRes.data
  dataStore.headquarters = hRes.data
  dataStore.employees    = eRes.data.map(e => ({
    ...e,
    position_name: pRes.data.find(p => p.position_code === e.position_code)?.position_name || '',
    rank_name:     rRes.data.find(r => r.rank_code     === e.rank_code    )?.rank_name     || ''
  }))
})

// OrgHierarchy.vue 로부터 선택된 팀을 받는다
function onTeamSelected(team) {
  selectedTeam.value     = team
  selectedEmployee.value = null
  teamMembers.value      = dataStore.employees.filter(e => e.team_code === team.team_code)
}

// 팀원 클릭
function onEmployeeSelected(emp) {
  selectedEmployee.value = emp
}

// AG Grid 컬럼 정의
const profileColumnDefs = [
  { field: 'label', cellClass: 'label-cell' },
  { field: 'value', cellClass: 'value-cell', flex: 1 }
]
const detailsColumnDefs = profileColumnDefs

// 기본 프로필 데이터
const profileRowData = computed(() => {
  if (!selectedEmployee.value) return []
  const e = selectedEmployee.value
  return [
    { label: '이름',         value: e.employee_name },
    { label: '생년월일',     value: e.birthdate || '-' },
    { label: '직급',         value: e.rank_name },
    { label: '사번',         value: e.employee_id }
  ]
})

// 상세 프로필 데이터
const detailsRowData = computed(() => {
  if (!selectedEmployee.value) return []
  const e = selectedEmployee.value
  const lookup = (arr, codeField, codeValue, nameField) =>
    (dataStore[arr].find(x => x[codeField] === codeValue) || {})[nameField] || ''
  return [
    { label: '소속 본부',    value: lookup('headquarters','head_code',      e.head_code,       'head_name') },
    { label: '소속 부서',    value: lookup('department','department_code', e.department_code, 'department_name') },
    { label: '소속 팀',      value: selectedTeam.value.team_name },
    { label: '직책',        value: e.position_name },
    { label: '직급',        value: e.rank_name },
    { label: '직무',        value: e.job_code },
    { label: '이메일',      value: e.email || '-' }
  ]
})
</script>

<style scoped>
.title {
  margin-left:20px;
  margin-bottom: 50px;
}
.content-box {
  background: #ffffff;
  border-radius: 12px;
  padding: 20px 32px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  margin: 24px;
}
.org-dashboard {
  display: grid;
  grid-template-columns: 240px 1fr 1fr;
  height: 100vh;
}
.left { border-right:1px solid #ddd; overflow-y:auto; }
.team-panel, .profile-panel { padding:16px; overflow-y:auto; border-right:1px solid #ddd; }
.profile-panel { border-right:none; }

/* placeholder */
.placeholder {
  color: #323232;
  padding: 32px;
  text-align: center;
}

/* member list */
.member-list { list-style:none; margin:0; padding:0; }
.member-list li {
  display:flex; align-items:center; padding:8px; cursor:pointer;
  border-bottom:1px solid #eee;
}
.member-list li.active { background:#eef6ff; }
.icon { font-size:24px; margin-right:8px; }
.member-info strong { display:block; }
.member-info span  { font-size:13px; color:#666; }

/* profile */
.profile-card { text-align:center; margin-bottom:16px; }
.avatar { font-size:80px; color:#b0c4de; }

/* AG Grid */
.profile-grid, .details-grid {
  width:100%;
  margin-bottom:16px;
}
.label-cell { font-weight:500; background:#f9fafb; }
.value-cell { padding-left:12px; }
.profile-details summary {
  cursor:pointer;
  font-weight:bold;
  margin-bottom:8px;
}
</style>
