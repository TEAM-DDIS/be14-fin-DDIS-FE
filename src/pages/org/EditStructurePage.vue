<template>
  <div class="page-container">
    <h1 class="page-title">조직 구성</h1>

    <!-- ① 조직도 편집 툴바 (기존과 동일) -->
    <div class="section">
      <p class="desc">조직도 편집</p>
      <div class="toolbar-card">
        <h2 class="toolbar-label">조직도 편집</h2>

        <!-- ＋ 버튼: AddModal 열기 -->
        <button class="toolbar-btn" @click="openAddModal">
          <p class="toolbar-btn-detail">＋</p>
        </button>

        <!-- － 버튼: DeleteModal 열기 -->
        <button class="toolbar-btn" @click="openDeleteModal">
          <p class="toolbar-btn-detail">－</p>
        </button>

        <!-- 검색 입력란: 엔터 키 누르면 searchOrg 호출 -->
        <div class="search">
          <img
            src="@/assets/icons/search.svg"
            alt="search"
            class="search-img"
          />
          <input
            type="text"
            v-model="searchKeyword"
            placeholder="조직 검색"
            class="toolbar-search"
            @keyup.enter="searchOrg"
          />
        </div>
      </div>
    </div>

    <div class="content-grid">
      <!-- ② 조직도 조회 패널 (Tree) -->
      <div class="section">
        <p class="desc2">조직도 조회</p>
        <div class="card tree-panel scrollbar">
          <h2 class="card-title">조직도</h2>
          <div class="tree-container">
            <!-- OrgHierarchyAll 컴포넌트: :headquarters 하나만 넘겨줍니다 -->
            <OrgHierarchyAll
              v-if="dataLoaded"
              :headquarters="dataStore.headquarters"
              @dept-selected="onDeptSelected"
              @team-selected="onTeamSelected"
            />
            <div v-else class="loading">로딩 중...</div>
          </div>
        </div>
      </div>

      <!-- ③ 부서/팀 정보 + 직원 목록 패널 -->
      <div class="section">
        <p class="desc2">조직 정보 조회</p>
        <div class="card info-panel scrollbar">
          <h2 class="card-title">조직 정보</h2>

          <div class="info-body">
            <!-- 1) 부서가 선택된 경우 -->
            <div v-if="selectedDept" class="info-content">
              <!-- ★ 부서 이동 / 부서원 이동 버튼 추가 ★ -->
              <div class="button-group">
                <button class="btn-dept" @click="showMovePanel = true">
                  부서 이동
                </button>
              </div>

              <ul class="info-list">
                <h3 class="section-title">부서 정보</h3>
                <li>
                  <strong>부서명: </strong>
                  {{ selectedDept.departmentName }}
                </li>
                <li>
                  <strong>부서 코드: </strong>
                  {{ selectedDept.departmentCode }}
                </li>
                <li>
                  <strong>상위 본부명: </strong>
                  {{ getHeadNameById(selectedDept.headId) }}
                </li>
                <li>
                  <strong>상위 본부 코드: </strong>
                  {{ getHeadCodeById(selectedDept.headId) }}
                </li>
                <li>
                  <strong>소속 팀 명칭: </strong>
                  <span
                    v-for="(t, idx) in teamNamesOfDept"
                    :key="idx"
                  >
                    {{ t }}<span v-if="idx < teamNamesOfDept.length - 1">, </span>
                  </span>
                </li>
              </ul>

              <div class="member-section">
                <h3 class="section-title">소속 직원 목록</h3>
                <table class="member-table">
                  <thead>
                    <tr>
                      <th>사번</th>
                      <th>이름</th>
                      <th>직책</th>
                      <th>직급</th>
                      <th>이메일</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="emp in deptMembers"
                      :key="emp.employeeId"
                      @click="onEmployeeClick(emp)"
                      :class="{ active: emp.employeeId === selectedEmployee?.employeeId }"
                    >
                      <td>{{ emp.employeeId }}</td>
                      <td>{{ emp.employeeName }}</td>
                      <td>{{ emp.positionName }}</td>
                      <td>{{ emp.rankName }}</td>
                      <td>{{ emp.email || '-' }}</td>
                    </tr>
                    <tr v-if="deptMembers.length === 0">
                      <td colspan="5" class="no-data">
                        해당 부서에 직원이 없습니다.
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- 2) 팀이 선택된 경우 -->
            <div v-else-if="selectedTeam" class="info-content">
              <!-- ★ 팀 이동 / 팀원 이동 버튼 추가 ★ -->
              <div class="button-group">
                <button class="btn-dept" @click="showMovePanel = true">
                  팀 이동
                </button>
              </div>

              <ul class="info-list">
                <h3 class="section-title">팀 정보</h3>
                <li>
                  <strong>팀명: </strong>
                  {{ selectedTeam.teamName }}
                </li>
                <li>
                  <strong>팀 코드: </strong>
                  {{ selectedTeam.teamCode }}
                </li>
                <li>
                  <strong>상위 부서명: </strong>
                  {{ getDeptNameById(selectedTeam.departmentId) }}
                </li>
                <li>
                  <strong>상위 부서 코드: </strong>
                  {{ getDeptCodeById(selectedTeam.departmentId) }}
                </li>
                <li>
                  <strong>상위 본부명: </strong>
                  {{ getHeadNameByDept(selectedTeam.departmentId) }}
                </li>
                <li>
                  <strong>상위 본부 코드: </strong>
                  {{ getHeadCodeByDept(selectedTeam.departmentId) }}
                </li>
              </ul>

              <div class="member-section">
                <h3 class="section-title">팀원 목록</h3>
                <table class="member-table">
                  <thead>
                    <tr>
                      <th>사번</th>
                      <th>이름</th>
                      <th>직책</th>
                      <th>직급</th>
                      <th>이메일</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="emp in teamMembers"
                      :key="emp.employeeId"
                      @click="onEmployeeClick(emp)"
                      :class="{ active: emp.employeeId === selectedEmployee?.employeeId }"
                    >
                      <td>{{ emp.employeeId }}</td>
                      <td>{{ emp.employeeName }}</td>
                      <td>{{ emp.positionName }}</td>
                      <td>{{ emp.rankName }}</td>
                      <td>{{ emp.email || '-' }}</td>
                    </tr>
                    <tr v-if="teamMembers.length === 0">
                      <td colspan="5" class="no-data">
                        해당 팀에 직원이 없습니다.
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- 3) 아무것도 선택되지 않은 경우 -->
            <div v-else class="placeholder-info">
              좌측 트리에서 부서 또는 팀을 선택하거나, 검색창에 부서/팀을 입력하세요.
            </div>
          </div>
        </div>
      
      </div>

      <!-- ④ 부서 이동 (showMovePanel이 true일 때만 보여준다) -->
      <div class="section" v-if="showMovePanel">
        <p class="desc2">조직 구조 이동</p>
        <div class="card move-panel scrollbar">
          <h2 class="card-title">조직 이동</h2>
          <p class="move-instruction">
            이동할 부서를 드래그하여 편집하세요.
          </p>

          <div class="move-tree-container">
            <EditHierarchy
              v-if="dataLoaded"
              :headquarters="dataStore.headquarters"
              :departments="dataStore.departments"
              :teams="dataStore.teams"
              :employees="[]"
              :positions="dataStore.position"
              :ranks="dataStore.rank"
              @dept-selected="onDeptSelectedForMove"
              @team-selected="onTeamSelectedForMove"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- 신규 조직 등록 모달 -->
    <AddModal
      v-if="showAddModal"
      :show="showAddModal"
      :orgOptions="orgOptions"
      :headOptions="dataStore.headquarters"
      :deptOptions="dataStore.departments"
      @submit="handleAddOrg"
      @close="showAddModal = false"
    />

    <!-- 조직 삭제 모달 -->
    <DeleteModal
      v-if="showDeleteModal"
      :orgOptions="orgOptions"
      :deleteListAll="deleteListAll"
      @close="closeDeleteModal"
      @confirm="handleDeleteOrg"
    />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import axios from 'axios'

import OrgHierarchyAll from '@/components/org/structure/Hierarchy.vue'
import EditHierarchy from '@/components/org/structure/EditHierarchy.vue'
import AddModal from '@/components/org/structure/AddModal.vue'
import DeleteModal from '@/components/org/structure/DeleteModal.vue'

// --- 데이터 스토어 정의 ---
// 백엔드 /structure/hierarchy 에서 받아온 본부→부서→팀 계층을 저장합니다.
const dataStore = reactive({
  headquarters: [],
  departments: [],
  teams: [],
  position: [],
  rank: []
})

// 로딩 여부
const dataLoaded = ref(false)

// 검색어
const searchKeyword = ref('')

// 선택된 부서/팀/사원
const selectedDept     = ref(null)
const selectedTeam     = ref(null)
const selectedEmployee = ref(null)

// 부서/팀별 직원 목록
const deptMembers = ref([])  // Department 단위
const teamMembers = ref([])  // Team 단위

// 이동 패널 표시 여부
const showMovePanel = ref(false)

// Add/Delete 모달 표시 여부
const showAddModal    = ref(false)
const showDeleteModal = ref(false)

// 조직 종류 옵션 (“본부/부서/팀”)
const orgOptions = [
  { id: 'head', name: '본부' },
  { id: 'department', name: '부서' },
  { id: 'team', name: '팀' }
]

// 삭제 모달 관련
const deleteType = ref('')
const deleteListAll = computed(() => {
  return {
    head: dataStore.headquarters.map(hq => ({
      value: hq.headId,
      label: `${hq.headName} (코드: ${hq.headCode || ''})`
    })),
    department: dataStore.departments.map(department => ({
      value: department.departmentId,
      label: `${department.departmentName} (코드: ${department.departmentCode})`
    })),
    team: dataStore.teams.map(tm => ({
      value: tm.teamId,
      label: `${tm.teamName} (코드: ${tm.teamCode})`
    }))
  }
})
const deleteList = computed(() => {
  return deleteListAll.value[ deleteType.value ] || []
})

// Vue Router (필요 시 사용)
import { useRouter } from 'vue-router'
const router = useRouter()

onMounted(async () => {
  try {
    // 1) 조직 계층 조회 (GET /structure/hierarchy)
    const res = await axios.get('http://localhost:8000/structure/hierarchy')
    dataStore.headquarters = res.data

    // 2) hierarchyData 순회하며 departments, teams 배열 채우기
    const deptList = []
    const teamList = []
    res.data.forEach(h => {
      h.departments.forEach(d => {
        deptList.push({
          departmentId:   d.departmentId,
          departmentName: d.departmentName,
          departmentCode: d.departmentCode,
          headId:         h.headId
        })
        d.teams.forEach(t => {
          teamList.push({
            teamId:       t.teamId,
            teamName:     t.teamName,
            teamCode:     t.teamCode,
            departmentId: d.departmentId
          })
        })
      })
    })
    dataStore.departments = deptList
    dataStore.teams       = teamList

    dataLoaded.value = true
  } catch (err) {
    console.error('❌ 초기 데이터 로드 실패:', err)
  }
})


// --- 부서 선택 핸들러 ---
// OrgHierarchyAll 컴포넌트에서 @dept-selected="onDeptSelected"
async function onDeptSelected(dept) {
  selectedDept.value     = dept
  selectedTeam.value     = null
  selectedEmployee.value = null
  teamMembers.value      = []
  deptMembers.value      = []

  // GET /structure/departments/{deptId}/members
  try {
    const res = await axios.get(
      `http://localhost:8000/structure/departments/${dept.departmentId}/members`
    )
    deptMembers.value = res.data
  } catch (e) {
    console.error('❌ 부서원 조회 실패:', e)
    deptMembers.value = []
  }
}

// --- 팀 선택 핸들러 ---
// OrgHierarchyAll 컴포넌트에서 @team-selected="onTeamSelected"
async function onTeamSelected(team) {
  selectedTeam.value     = team
  selectedDept.value     = null
  selectedEmployee.value = null
  deptMembers.value      = []
  teamMembers.value      = []

  // GET /structure/teams/{teamId}/members
  try {
    const res = await axios.get(
      `http://localhost:8000/structure/teams/${team.teamId}/members`
    )
    teamMembers.value = res.data
  } catch (e) {
    console.error('❌ 팀원 조회 실패:', e)
    teamMembers.value = []
  }
}

// 사원 클릭 시
function onEmployeeClick(emp) {
  selectedEmployee.value = emp
}

// --- 헬퍼 함수들 ---
// headId → headName 조회
function getHeadNameById(headId) {
  const h = dataStore.headquarters.find(hq => hq.headId === headId)
  return h ? h.headName : ''
}
// headId → headCode 조회
function getHeadCodeById(headId) {
  const h = dataStore.headquarters.find(hq => hq.headId === headId)
  return h ? h.headCode : ''
}

// departmentId → departmentName 조회
function getDeptNameById(deptId) {
  const d = dataStore.departments.find(x => x.departmentId === deptId)
  return d ? d.departmentName : ''
}
// departmentId → departmentCode 조회
function getDeptCodeById(deptId) {
  const d = dataStore.departments.find(x => x.departmentId === deptId)
  return d ? d.departmentCode : ''
}

// departmentId → 상위 headName 조회
function getHeadNameByDept(deptId) {
  const d = dataStore.departments.find(x => x.departmentId === deptId)
  return d ? getHeadNameById(d.headId) : ''
}
// departmentId → 상위 headCode 조회
function getHeadCodeByDept(deptId) {
  const d = dataStore.departments.find(x => x.departmentId === deptId)
  return d ? getHeadCodeById(d.headId) : ''
}

// departmentId → 소속 팀 이름 배열
const teamNamesOfDept = computed(() => {
  if (!selectedDept.value) return []
  return selectedDept.value.teams.map(t => t.teamName)
})

// --- 검색 기능 (“부서명/부서코드”, “팀명/팀코드”) ---
function searchOrg() {
  const key = searchKeyword.value.trim().toLowerCase()
  if (!key) {
    alert('검색어를 입력해 주세요.')
    return
  }

  // 부서 찾기: departmentName 또는 departmentCode
  const foundDept = dataStore.departments.find(
    d =>
      d.departmentName.toLowerCase().includes(key) ||
      d.departmentCode.toLowerCase().includes(key)
  )
  if (foundDept) {
    // dataStore.headquarters 내부 departments 배열에서 동일한 departmentId 객체를 찾아서 onDeptSelected 호출
    for (const h of dataStore.headquarters) {
      const match = h.departments.find(dd => dd.departmentId === foundDept.departmentId)
      if (match) {
        onDeptSelected(match)
        return
      }
    }
  }

  // 팀 찾기: teamName 또는 teamCode
  const foundTeam = dataStore.teams.find(
    t =>
      t.teamName.toLowerCase().includes(key) ||
      t.teamCode.toLowerCase().includes(key)
  )
  if (foundTeam) {
    for (const h of dataStore.headquarters) {
      for (const d of h.departments) {
        const matchTeam = d.teams.find(tt => tt.teamId === foundTeam.teamId)
        if (matchTeam) {
          onTeamSelected(matchTeam)
          return
        }
      }
    }
  }

  alert('검색 결과가 없습니다.')
}

// --- AddModal / DeleteModal 제어 로직 ---
function openAddModal() {
  showAddModal.value = true
}

// 모달 submit 핸들러
async function handleAddOrg({ type, name, parentId }) {
  try {
    let res
    if (type === 'head') {
      res = await axios.post('http://localhost:8000/org/create/head', { headName: name })
      dataStore.headquarters.push(res.data)
    }
    else if (type === 'department') {
      res = await axios.post('http://localhost:8000/org/create/department', {
        departmentName: name,
        headId: parentId
      })
      // 리스트에 추가
      dataStore.departments.push(res.data)
      // 트리에도 반영
      const head = dataStore.headquarters.find(h => h.headId === parentId)
      head && head.departments.push({ ...res.data, teams: [] })
    }
    else if (type === 'team') {
      res = await axios.post('http://localhost:8000/org/create/team', {
        teamName: name,
        departmentId: parentId
      })
      dataStore.teams.push(res.data)
      // 트리에도 반영
      for (const h of dataStore.headquarters) {
        const dept = h.departments.find(d => d.departmentId === parentId)
        if (dept) {
          dept.teams.push({ ...res.data, members: [] })
          break
        }
      }
    }
    showAddModal.value = false
  } catch (e) {
    console.error('추가 실패', e)
    alert('조직 추가 중 오류가 발생했습니다.')
  }
}

function openDeleteModal() {
  deleteType.value = ''
  showDeleteModal.value = true
}
function closeDeleteModal() {
  showDeleteModal.value = false
}
async function handleDeleteOrg({ type, ids }) {
  try {
    // axios.delete 엔드포인트 매핑
    const endpointMap = {
      head: 'head',
      department: 'department',
      team: 'team'
    }
    const endpoint = endpointMap[type]
    await Promise.all(
      ids.map(id =>
        axios.delete(`http://localhost:8000/org/delete/${endpoint}/${id}`)
      )
    )
    alert('삭제 성공!')
    showDeleteModal.value = false
    await loadHierarchy()   // 삭제 후 트리 다시 로드
  } catch (err) {
    console.error('삭제 실패', err)
    alert('삭제 중 오류가 발생했습니다.')
  }
}

// 트리 전체를 다시 불러오는 유틸 (onMounted 로직 재사용)
async function loadHierarchy() {
  const res = await fetch('http://localhost:8000/structure/hierarchy')
  const hierarchyData = await res.json()
  dataStore.headquarters = hierarchyData

  // departments/teams 배열도 재구성 …
  const depts = []
  const teams = []
  hierarchyData.forEach(h => {
    h.departments.forEach(d => {
      depts.push({
        departmentId: d.departmentId,
        departmentName: d.departmentName,
        departmentCode: d.departmentCode,
        headId: h.headId
      })
      d.teams.forEach(t => {
        teams.push({
          teamId: t.teamId,
          teamName: t.teamName,
          teamCode: t.teamCode,
          departmentId: d.departmentId
        })
      })
    })
  })
  dataStore.departments = depts
  dataStore.teams       = teams
}

onMounted(loadHierarchy)

// --- 부서/팀 이동용 핸들러 ---
function onDeptSelectedForMove(dept) {
  console.log('이동용 부서 선택 ▶', dept)
}
function onTeamSelectedForMove(team) {
  console.log('이동용 팀 선택 ▶', team)
}
</script>

<style scoped>
/* 공통 리셋 */

.page-container {
  height: 120vh;
  display: flex;
  flex-direction: column;
  overflow: hidden; 
}
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

.desc2 {
  display: block;
  margin-left: 0;
  margin-bottom: 10px;
  font-size: 18px;
}


/* ① 조직도 편집 툴바 */
.toolbar-card {
  display: flex;
  align-items: center;
  background: #fff;
  border-radius: 12px;
  padding: 10px 24px;
  height: 100px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  margin-bottom: 50px;
  gap: 15px;
  margin-left: 20px;
}
.toolbar-label {
  font-weight: bold;
  font-size: 20px;
  margin-right: 12px;
  /* margin-bottom: 12px; */
}
.toolbar-btn {
  display: flex;
  align-items: center;
  justify-content: center; 
  width: 40px;
  height: 40px;
  font-size: 24px;
  font-weight: bold;
  cursor: pointer;
  font-family: inherit;
  background-color: #00a8e8;
  color: white;
  border: 1px solid transparent;
  border-radius: 5px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: background-color 0.2s, box-shadow 0.2s;
}
.toolbar-btn:hover {
  background-color: #fff;
  color: #00a8e8;
  border: 1px solid #00a8e8;
}
.toolbar-btn-detail {
  margin: 0;
}
.search {
  display: flex;
  align-items: center;
  margin-left: auto;
  gap: 8px;
}
.search-img {
  width: 25px;
  height: 25px;
}
.toolbar-search {
  padding: 6px 12px;
  border: 1px solid #dddddd;
  border-radius: 8px;
  font-size: 16px;
  width: 310px;
  height: 50%;
}
.toolbar-search:focus {
  outline: none;
  border: 1px solid black;
}

/* 3열 레이아웃 */
.content-grid {
  display: grid;
  grid-template-columns: 0.8fr 1.2fr 1fr;
  gap: 24px;
  align-items: stretch;
  margin-left: 20px;

}
.section {
  display: flex;
  flex-direction: column;
}

/* Card */
.card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  padding: 10px 30px;
  display: flex;
  flex-direction: column;
}

.card-title {
  font-weight: bold;
  margin-bottom: 12px;
}

/* ② 조직도 조회 */
.tree-panel {
  height: 550px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  overflow-y: auto;
}

.tree-panel.scrollbar {
  scrollbar-width: none;
}

.tree-container {
  flex: 1;
  overflow-y: auto;
  scrollbar-width: none;
  margin-bottom: 20px;
}

.loading {
  text-align: center;
  color: #888;
  margin-top: 40px;
}

/* ③ 부서/팀 정보 카드 */
.section-title {
  display: inline-block;
  border-bottom: 4px solid #00a8e8;
  font-size: 20px;
  font-weight: bold;
  padding-bottom: 2px;
  margin-bottom: 12px;
}


.info-panel {
  display: flex;
  flex-direction: column;
  height: 550px;            /* 고정 높이 */
  overflow: hidden;         /* 외부 스크롤 숨김 */
  overflow-y: auto;
  padding: 10px 30px;
}

/* .info-body {
  overflow: hidden;
  overflow-y: auto;
} */
.info-panel.scrollbar {
  scrollbar-width: none;
}


.info-list {
  list-style: none;
  font-size: 18px;
  margin-bottom: 20px;
  padding-left: 24px; 
}
.info-list li {
  margin-bottom: 6px;
}
.member-section {
  margin-top: 20px;
  padding: 24px;
}
.member-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
  margin-bottom: 20px;
}
.member-table th,
.member-table td {
  border: 1px solid #ddd;
  padding: 6px;
  text-align: left;
}
.member-table th {
  background: #f9fafb;
  font-weight: 500;
}
.member-table tr.active {
  background: #ececec;
}
.no-data {
  text-align: center;
  color: #888;
}
.placeholder-info {
  color: #00a8e8;
  font-size: 15px;
  text-align: center;
  margin-top: 40px;
}

/* 버튼 그룹 */
.button-group {
  display: flex;
  gap: 12px;
  margin-right: 20px;
  margin-bottom: 20px;
  justify-content: flex-end;
}
.btn-dept,
.btn-employee {
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
}
.btn-dept:hover,
.btn-employee:hover {
  background-color: #fff;
  color: #00a8e8;
  border: 1px solid #00a8e8;
}

/* ④ 부서 이동 카드 */
.move-panel {
  height: 550px;
  display: flex;
  flex-direction: column;
  padding: 10px 30px;
  overflow: hidden;
  overflow-y: auto;
}
.move-panel.scrollbar {
  scrollbar-width: none;
}
.move-tree-container {
  flex: 1;
  overflow-y: auto;
  scrollbar-width: none;
}
.move-instruction {
  font-size: 14px;
  color: #555;
  margin-bottom: 16px;
}
</style>