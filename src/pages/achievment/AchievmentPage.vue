<template>
  <h1 class="page-title">성과 이력</h1>
  <p class="desc">성과이력 조회</p>

  <div class="content-box">
      <div class="global-search">
        <img src="@/assets/icons/search.svg" class="search" />
        <input
          v-model="globalSearch"
          type="text"
          placeholder="사원 검색"
          class="global-search-input"
        />
        <ul v-if="globalSearch" class="search-results">
          <li
            v-for="emp in filteredAllEmployees"
            :key="emp.employeeId"
            @click="onEmployeeSelected(emp)"
            class="search-item"
          >
            {{ emp.rankName }} {{ emp.employeeName }} / {{ emp.teamName }}
          </li>
        </ul>
      </div>


    <div class="org-dashboard">
            
      <!-- Left: Org Hierarchy 트리 영역 -->
      <div class="left">
       
        <h2>조직도</h2>
        
            <Hierarchy
            :key="orgSearchQuery"
      @team-selected="onTeamSelected"
      :hierarchy="filteredHierarchy"
    />
      </div>

      <!-- Middle: Team Members List -->
      <div class="team-panel">
        <template v-if="selectedTeam">
          <h2>{{ selectedTeam.teamName }} 팀원</h2>
          <div class="search-box">
            <input
              v-model="memberSearch"
              type="text"
              placeholder="사원 이름으로 검색"
              class="search-input"
            />
          </div>
          <ul class="member-list">
            <li
              v-for="emp in filteredTeamMembers"
              :key="emp.employeeId"
              @click="onEmployeeSelected(emp)"
              :class="{ active: emp.employeeId === selectedEmployee?.employeeId }"
            >
              <img
                src="@/assets/icons/profile_img.svg"
                alt="profile"
                class="profile"
              />
              <div class="member-info">
                <strong>{{ emp.employeeName }}</strong>
                <span>{{ emp.positionName }}</span>
                <small>/ {{ emp.rankName }}</small>
              </div>
            </li>
          </ul>
        </template>
        <template v-else>
          <div class="placeholder">왼쪽에서 팀을 선택해주세요.</div>
        </template>
      </div>

      <!-- Right: Employee Profile 상세 정보 -->
      <div class="profile-panel">
        <template v-if="selectedEmployee">
          <h2>프로필 정보</h2>
          <div class="profile-top">
            <div class="profile-card">
              <img
                src="@/assets/icons/profile_img.svg"
                alt="profile"
                class="profile2"
              />
              <h4>
                {{ selectedEmployee.rankName }}
                {{ selectedEmployee.employeeName }}
              </h4>
            </div>
            <table class="profile-table">
              <tbody>
                <tr v-for="row in profileRowData" :key="row.label">
                  <td class="label-cell">{{ row.label }}</td>
                  <td class="value-cell">{{ row.value }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- 성과 이력 표 (AG Grid) -->
          <div class="grid-section" ref="salarySection">
            <div class="history-box">
              <h3 class="detail-title">성과 이력</h3>
              <AgGrid
                class="ag-theme-alpine custom-theme"
                :gridOptions="{ theme: 'legacy' }"
                :columnDefs="salaryColumnDefs"
                :rowData="salaryHistory"
                :pagination="true"
                style="width: 100%; height: 400px;"
              />
            </div>
          </div>
        </template>
        <template v-else>
          <div class="placeholder">가운데에서 사원을 선택해주세요.</div>
        </template>
      </div>
    </div>
  </div>
  
</template>

<script setup>
import { ref, onMounted, computed, watch  } from 'vue'
import { useRouter } from 'vue-router'
import Hierarchy from '@/components/org/structure/Hierarchy.vue'
import AgGrid from '@/components/grid/BaseGrid.vue'

// --- 상태 정의 ---
const hierarchy        = ref([])
const employees        = ref([])  // 전체 사원 flat list
const globalSearch     = ref('')
const orgSearchQuery   = ref('')
const memberSearch     = ref('')
const selectedTeam     = ref(null)
const teamMembers      = ref([])
const selectedEmployee = ref(null)
const salaryHistory    = ref([])


// AG Grid 컬럼 정의
const salaryColumnDefs = ref([
  { headerName: '기간', field: 'yearMonth', sortable: true, filter: true, width: 165 },
  { headerName: '성과 내용', field: 'performanceDescription', sortable: false, filter: true, width: 140 },
  { headerName: '결과', field: 'performanceValue', sortable: true, filter: true, width: 80 },
  {
    headerName: '평가 점수', field: 'reviewScore', sortable: true, filter: true, width: 105,
    valueFormatter: params => params.value != null ? `${params.value} 점` : '-'
  },
])

const router = useRouter()


// 1) 조직 계층 로드
onMounted(async () => {
  try {
    const res = await fetch('http://localhost:8000/structure/hierarchy')
    const data = res.ok ? await res.json() : []
      hierarchy.value = data
    // flatten hierarchy to employees
    const list = []
    function collect(nodes, deptName, teamName) {
      nodes.forEach(head => {
        head.departments.forEach(dept => {
          dept.teams.forEach(team => {
            team.members.forEach(emp => {
              list.push({
                ...emp,
                departmentName: dept.departmentName,
                teamName: team.teamName
              })
            })
          })
          if (dept.teams) collect([], dept.departmentName)
        })
      })
    }
    collect(data)
    employees.value = list
  } catch {
    hierarchy.value = []
    employees.value = []
  }
})

// Global search filter
const filteredAllEmployees = computed(() => {
  const q = globalSearch.value.trim().toLowerCase()
  if (!q) return []
  return employees.value.filter(emp => emp.employeeName.toLowerCase().includes(q))
})

// Org tree filter
function filterTree(nodes, q) {
  return nodes.reduce((acc, node) => {
    const children = node.children ? filterTree(node.children, q) : []
    const name = (node.teamName || node.departmentName || node.headName || '').toLowerCase()
    if (name.includes(q) || children.length) acc.push({ ...node, children })
    return acc
  }, [])
}
const filteredHierarchy = computed(() => {
  const q = orgSearchQuery.value.trim().toLowerCase()
  return q ? filterTree(hierarchy.value, q) : hierarchy.value
})

// Team member filter
const filteredTeamMembers = computed(() => {
  const q = memberSearch.value.trim().toLowerCase()
  if (!selectedTeam.value) return []
  const list = selectedTeam.value.members.map(e => ({ ...e }))
  return q
    ? list.filter(emp => emp.employeeName.toLowerCase().includes(q))
    : list
})

// 3) 트리에서 유일하게 하나만 매치되면 자동으로 선택
watch(filteredHierarchy, tree => {
  const q = orgSearchQuery.value.trim()
  if (!q) return

  const matches = []
  // 리프 노드(멤버)만 수집
  function collect(nodes) {
    nodes.forEach(n => {
      if (n.members) matches.push(...n.members)
      if (n.children) collect(n.children)
    })
  }
  collect(tree)

  if (matches.length === 1) {
    onEmployeeSelected(matches[0])
  }
})

// 2) 팀 선택
function onTeamSelected(team) {
  selectedTeam.value = team
  selectedEmployee.value = null
  teamMembers.value = (team.members || []).map(e => ({
    employeeId: e.employeeId,
    employeeName: e.employeeName,
    positionName: e.positionName,
    rankName: e.rankName,
  }))
  salaryHistory.value = []  // 팀 바뀔 때 초기화
}

// 3) 사원 선택 & 성과 이력 조회
async function onEmployeeSelected(emp) {
  selectedEmployee.value = null
  globalSearch.value = ''
  try {
    const [resEmp, resHist] = await Promise.all([
      fetch(`http://localhost:8000/structure/employee/${emp.employeeId}`),
      fetch(`http://localhost:8000/review/history/${emp.employeeId}`)
    ])
    selectedEmployee.value = resEmp.ok ? await resEmp.json() : null
    salaryHistory.value   = resHist.ok ? await resHist.json() : []

  } catch {
    selectedEmployee.value = null
    salaryHistory.value = []
  }
}


// 프로필 테이블 데이터
const profileRowData = computed(() => {
  if (!selectedEmployee.value) return []
  const e = selectedEmployee.value
  return [
    { label: '이름', value: e.employeeName },
    { label: '생년월일', value: e.birthdate || '-' },
    { label: '직급', value: e.rankName },
    { label: '사번', value: e.employeeId }
  ]
})
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

.global-search { 
  margin-bottom: 8px;
  display: flex;
  gap: 10px;
  position: relative;
  justify-content: flex-end;
}
.global-search-input{
  width: 160px;
  padding: 6px 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
}
.search {
  width: 20px;
}
.search-input { 
  width: 100%;
  padding: 8px; 
}
.search-results { 
  position: absolute;
  top: 45%;
  right: 0; 
  background: #fff; border: 1px solid #ddd; 
  width: 135px; 
  max-height: 200px; 
  overflow-y: auto; 
  z-index: 10; 
}
.search-item { 
  padding: 8px; 
  cursor: pointer; 
}
.search-item:hover { 
  background: #f0f0f0; 
}
.custom-grid :deep(.ag-header) {
  background-color: #f0f0f0 !important;
}
.fixed-select {
  width: 150px;
}

.content-box {
  background: #ffffff;
  border-radius: 12px;
  padding: 20px 32px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  margin: 24px;
  max-width: 100%;
  overflow-x: auto;
}
.org-dashboard {
  display: grid;
  grid-template-columns: 0.7fr 0.5fr 1.25fr;
  gap: 16px;
}
.left,
.team-panel,
.profile-panel {
  overflow-y: auto;
  scrollbar-gutter: stable;
}
.left,
.team-panel {
  padding: 10px;
  border-right: 1px solid #ddd;
}
.profile-panel {
  padding: 16px;
}

h2 {
  margin-top: -10px;
}

/* placeholder */
.placeholder {
  color: #00a8e8;
  font-size: 18px;
  font-weight: bold;
  padding: 32px;
  text-align: center;
}

/* member list */
.member-list {
  list-style: none;
  margin: 0;
  padding: 0;
}
.member-list li {
  display: flex;
  align-items: center;
  padding: 20px;
  cursor: pointer;
  border-bottom: 1px solid #d1d1d1;
}
.member-list li.active {
  background: #efefef;
  transition: background-color 0.2s;
}
.profile {
  width: 40px;
  height: 40px;
  margin-right: 20px;
}
.member-info strong {
  display: block;
}
.member-info span {
  font-size: 14px;
  color: #3b3b3b;
}

/* right profile */
.profile-top {
  display: flex;
  align-items: flex-start;
  gap: 30px;
  margin-bottom: 16px;
}
.profile-card {
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
  text-align: center;
  border: 1px solid #aeaeae;
  border-radius: 10px;
  padding: 10px 30px;
}
.profile2 {
  width: 120px;
  height: 120px;
  margin: 20px auto 10px auto;
}

/* Profile & Details Table */
.profile-table,
.details-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 16px;
}
.profile-table td,
.details-table td {
  border: 1px solid #c8c8c8;
  padding: 8px 12px;
}
.label-cell {
  background-color: #f8f9fa;
  font-weight: bold;
  width: 30%;
}
.value-cell {
  padding-left: 12px;
}
.profile-details summary {
  cursor: pointer;
  font-weight: bold;
  margin-bottom: 8px;
}

/* Edit 버튼 */
.edit-button {
  position: absolute;
  top: 40px;
  right: 40px;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  font-family: inherit;
  background-color: #00a8e8;
  color: white;
  border: 1px solid transparent;
  border-radius: 10px;
  padding: 10px 30px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: background-color 0.2s, box-shadow 0.2s;
  box-sizing: border-box;
}
.edit-button:hover {
  background-color: white;
  color: #00a8e8;
  border-color: #00a8e8;
  box-shadow: inset 1px 1px 10px rgba(0, 0, 0, 0.25);
}


.history-box {
  flex: 1;
  background: #fff;
  padding: 25px;
  border-radius: 8px;
  box-shadow: 1px 1px 20px 1px rgba(0, 0, 0, 0.05);
}

</style>
