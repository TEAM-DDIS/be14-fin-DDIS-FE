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
        <p class="desc">조직도 조회</p>
        <div class="card tree-panel">
          <h2 class="card-title">조직도</h2>
          <div class="tree-container">
            <OrgHierarchyAll
              v-if="dataLoaded"
              :headquarters="dataStore.headquarters"
              :departments="dataStore.departments"
              :teams="dataStore.teams"
              :positions="dataStore.position"
              :ranks="dataStore.rank"
              @dept-selected="onDeptSelected"
              @team-selected="onTeamSelected"
            />
            <div v-else class="loading">로딩 중...</div>
          </div>
        </div>
      </div>

      <!-- ③ 부서/팀 정보 + 직원 목록 패널 -->
      <div class="section">
        <p class="desc">조직 정보 조회</p>
        <div class="card info-panel">
          <h2 class="card-title">조직 정보</h2>

          <!-- 1) 부서가 선택된 경우 -->
          <div v-if="selectedDept" class="info-content">

            <!-- ★ 부서 이동 / 부서원 이동 버튼 추가 ★ -->
            <div class="button-group">
              <button class="btn-dept" @click="showMovePanel = true">
                부서 이동
              </button>
              <button class="btn-employee" @click="showMovePanel = true">
                부서원 이동
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
              <button class="btn-employee" @click="showMovePanel = true">
                팀원 이동
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

      <!-- ④ 부서 이동 (showMovePanel이 true일 때만 보여준다) -->
      <div class="section" v-if="showMovePanel">
        <p class="desc">조직 구조 이동</p>
        <div class="card move-panel">
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

          <div class="move-buttons">
            <button class="btn-cancel" @click="cancelMove">취소</button>
            <button class="btn-confirm" @click="confirmMove">수정</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 신규 조직 등록 모달 -->
    <AddModal
      v-if="showAddModal"
      :orgOptions="orgOptions"
      @close="closeAddModal"
      @submit="handleAddOrg"
    />

    <!-- 조직 삭제 모달 -->
    <DeleteModal
      v-if="showDeleteModal"
      :orgOptions="orgOptions"
      :initialType="deleteType"
      :deleteListAll="deleteListAll"
      @close="closeDeleteModal"
      @confirm="handleDeleteOrg"
    />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import OrgHierarchyAll from '@/components/org/structure/HierarchyAll.vue'
import EditHierarchy from '@/components/org/structure/EditHierarchy.vue'
import AddModal from '@/components/org/structure/AddModal.vue'
import DeleteModal from '@/components/org/structure/DeleteModal.vue'

// --- 데이터 스토어 정의 ---
// 백엔드 /structure/hierarchy 에서 받아온 본부→부서→팀 계층을 저장합니다.
const dataStore = reactive({
  headquarters: [],   // [{ headId, headName, headCode, departments: [...]}]
  departments: [],    // [{ departmentId, departmentName, departmentCode, headId }]
  teams: [],          // [{ teamId, teamName, teamCode, departmentId }]
  position: [],       // 추후 API가 있으면 채워 주세요
  rank: []            // 추후 API가 있으면 채워 주세요
})

// 로딩 여부
const dataLoaded = ref(false)

// 검색어
const searchKeyword = ref('')

// 선택된 부서/팀/사원
const selectedDept     = ref(null)
const selectedTeam     = ref(null)
const selectedEmployee = ref(null)

// “부서에 속한 직원 목록” & “팀에 속한 직원 목록”용
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
  { id: 'dept', name: '부서' },
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
    dept: dataStore.departments.map(dept => ({
      value: dept.departmentId,
      label: `${dept.departmentName} (코드: ${dept.departmentCode})`
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

// --- 페이지 로딩 시: 백엔드에서 “본부→부서→팀” 계층만 가져오기 ---
onMounted(async () => {
  try {
    // 1) 조직 계층 조회 (GET /structure/hierarchy)
    const urlHierarchy = 'http://localhost:8000/structure/hierarchy'
    console.log('📥 조직 계층 호출:', urlHierarchy)
    const resHier = await fetch(urlHierarchy)
    if (!resHier.ok) throw new Error(`HTTP ${resHier.status}`)
    const hierarchyData = await resHier.json()
    // HeadQueryDTO[] 형태
    dataStore.headquarters = hierarchyData.map(h => ({
      headId:   h.headId,
      headName: h.headName,
      headCode: h.headCode || '',
      departments: h.departments    // DepartmentQueryDTO[]
    }))

    // 2) hierarchyData 순회하며 departments, teams 배열 채우기
    const deptList = []
    const teamList = []
    hierarchyData.forEach(h => {
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

    // 3) position / rank 데이터는 API가 없으므로 빈 배열로 둡니다.
    dataStore.position = []
    dataStore.rank     = []

    dataLoaded.value = true
  } catch (err) {
    console.error('❌ 초기 데이터 로드 실패:', err)
  }
})

// --- 부서 선택 핸들러 ---
// OrgHierarchyAll 컴포넌트에서 @dept-selected="onDeptSelected"
async function onDeptSelected(dept) {
  // dept: DepartmentQueryDTO { departmentId, departmentName, departmentCode, headId, teams: [...] }
  selectedDept.value     = dept
  selectedTeam.value     = null
  selectedEmployee.value = null
  teamMembers.value      = []    // 팀원 목록 초기화
  deptMembers.value      = []    // 부서원 목록 초기화

  // “소속된 팀” 목록 각각의 teamId로 /structure/teams/{teamId}/members 호출 후 합치기
  const promises = dept.teams.map(teamObj => {
    const url = `http://localhost:8000/structure/teams/${teamObj.teamId}/members`
    return fetch(url).then(res => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      return res.json()
    })
  })

  try {
    // Promise.all로 모든 팀원 목록을 배열로 받고 평탄화(flatten)
    const results = await Promise.all(promises)
    const flattened = results.flat()
    deptMembers.value = flattened
  } catch (e) {
    console.error('❌ 부서원 조회 실패:', e)
    deptMembers.value = []
  }
}

// --- 팀 선택 핸들러 ---
// OrgHierarchyAll 컴포넌트에서 @team-selected="onTeamSelected"
async function onTeamSelected(team) {
  // team: TeamQueryDTO { teamId, teamName, teamCode, departmentId, members: [...] }
  selectedTeam.value     = team
  selectedDept.value     = null
  selectedEmployee.value = null
  deptMembers.value      = []
  teamMembers.value      = []

  // “해당 팀에 속한 직원만” 가져오기 (GET /structure/teams/{teamId}/members)
  try {
    const url = `http://localhost:8000/structure/teams/${team.teamId}/members`
    console.log('📥 팀원 조회 호출:', url)
    const res = await fetch(url)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json()
    teamMembers.value = data   // EmployeeQueryDTO[]
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
function closeAddModal() {
  showAddModal.value = false
}
function handleAddOrg(payload) {
  console.log('신규 조직 등록 →', payload)
  // TODO: 실제 등록 API 호출 후 dataStore 갱신
  showAddModal.value = false
}

function openDeleteModal() {
  deleteType.value = ''
  showDeleteModal.value = true
}
function closeDeleteModal() {
  showDeleteModal.value = false
}
function handleDeleteOrg(payload) {
  console.log('삭제할 조직 종류:', payload.type)
  console.log('선택된 ID들:', payload.ids)
  // TODO: 실제 삭제 API 호출 후 dataStore 갱신
  showDeleteModal.value = false
}

// --- 부서/팀 이동용 핸들러 ---
function onDeptSelectedForMove(dept) {
  console.log('이동용 부서 선택 ▶', dept)
}
function onTeamSelectedForMove(team) {
  console.log('이동용 팀 선택 ▶', team)
}
function cancelMove() {
  showMovePanel.value = false
}
function confirmMove() {
  showMovePanel.value = false
}
</script>

<style scoped>
/* 공통 리셋 */
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
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

.page-container {
  padding: 20px;
}

/* ① 조직도 편집 툴바 */
.toolbar-card {
  display: flex;
  align-items: center;
  background: #fff;
  border-radius: 12px;
  padding: 16px 24px;
  height: 100px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  margin-bottom: 50px;
  gap: 15px;
}
.toolbar-label {
  font-weight: bold;
  font-size: 20px;
  margin-right: 12px;
}
.toolbar-btn {
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
  margin-bottom: 2px;
  line-height: 1;
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
  padding: 24px;
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  overflow: hidden;
}
.card-title {
  font-weight: bold;
  margin-bottom: 12px;
}

/* ② 조직도 조회 */
.tree-panel {
  overflow-y: auto;
}
.tree-container {
  flex: 1;
  overflow-y: auto;
  padding-right: 8px;
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
  overflow-y: auto;
  overflow-x: auto;
  padding: 30px 40px;
}
.info-list {
  list-style: none;
  font-size: 18px;
  margin-bottom: 20px;
}
.info-list li {
  margin-bottom: 6px;
}
.member-section {
  margin-top: 16px;
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
  font-size: 18px;
  font-weight: bold;
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
  display: flex;
  flex-direction: column;
  padding: 30px 40px;
}
.move-instruction {
  font-size: 16px;
  color: #555;
  margin-bottom: 12px;
}
.move-tree-container {
  flex: 1;
  overflow-y: auto;
  padding-right: 8px;
}
.move-buttons {
  display: flex;
  justify-content: flex-end;
  margin-top: 12px;
  gap: 16px;
}
.btn-cancel,
.btn-confirm {
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  font-family: inherit;
  background-color: #00a8e8;
  color: white;
  border: 1px solid transparent;
  border-radius: 10px;
  padding: 10px 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: background-color 0.2s, box-shadow 0.2s;
}
.btn-cancel:hover,
.btn-confirm:hover {
  background-color: #fff;
  color: #00a8e8;
  border: 1px solid #00a8e8;
}
</style>
