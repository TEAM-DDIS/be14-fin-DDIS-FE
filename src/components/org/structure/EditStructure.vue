<template>
  <div class="page-container">
    <h1 class="page-title">조직 구성</h1>

    <!-- ① 조직도 편집 툴바 -->
    <div class="section">
      <p class="desc">조직도 편집</p>
      <div class="toolbar-card">
        <h2 class="toolbar-label">조직도 편집</h2>

        <!-- ＋ 버튼: 모달 열기 (임시로 주석) -->
        <button class="toolbar-btn" @click="openAddModal">
          <p class="toolbar-btn-detail">＋</p>
        </button>

        <!-- － 버튼: 삭제 모달 열기 (임시로 주석) -->
        <button class="toolbar-btn" @click="openDeleteModal">
          <p class="toolbar-btn-detail">－</p>
        </button>

        <!-- 검색 입력란: 엔터 키누르면 searchOrg 호출 -->
        <div class="search">
          <img src="@/assets/icons/search.svg" alt="search" class="search-img" />
          <input
            type="text"
            v-model="searchKeyword"
            placeholder="부서 또는 팀 이름/코드를 입력 후 Enter"
            class="toolbar-search"
            @keyup.enter="searchOrg"
          />
        </div>
      </div>
    </div>

    <div class="content-grid">
      <!-- ② 조직도 조회 패널 (트리) -->
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
              :employees="dataStore.employees"
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
            <div class="button-group">
              <button class="btn-dept" @click="showMovePanel = true">부서 이동</button>
              <button class="btn-employee" @click="showMovePanel = true">부서원 이동</button>
            </div>
            <ul class="info-list">
              <h3 class="section-title">부서 정보</h3>
              <li><strong>부서명: </strong> {{ selectedDept.department_name }}</li>
              <li><strong>부서 코드: </strong> {{ selectedDept.department_code }}</li>
              <li>
                <strong>상위 본부명: </strong>{{ getHeadNameById(selectedDept.head_id) }}
              </li>
              <li>
                <strong>관련 팀: </strong>
                <span v-for="(tag, idx) in deptIntroduction.tags" :key="idx">
                  {{ tag }}<span v-if="idx < deptIntroduction.tags.length - 1">, </span>
                </span>
              </li>
            </ul>
            <div class="member-section">
              <h3 class="section-title">직원 목록</h3>
              <table class="member-table">
                <thead>
                  <tr>
                    <th>사번</th>
                    <th>이름</th>
                    <th>직책</th>
                    <th>직급</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="emp in employeesByDept(selectedDept.department_code)"
                    :key="emp.employee_id"
                    @click="onEmployeeClick(emp)"
                    :class="{ active: emp.employee_id === selectedEmployee?.employee_id }"
                  >
                    <td>{{ emp.employee_id }}</td>
                    <td>{{ emp.employee_name }}</td>
                    <td>{{ emp.position_name }}</td>
                    <td>{{ emp.rank_name }}</td>
                  </tr>
                  <tr v-if="employeesByDept(selectedDept.department_code).length === 0">
                    <td colspan="4" class="no-data">해당 부서에 직원이 없습니다.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- 2) 팀이 선택된 경우 -->
          <div v-else-if="selectedTeam" class="info-content">
            <ul class="info-list">
              <div class="button-group">
                <button class="btn-dept" @click="showMovePanel = true">팀 이동</button>
                <button class="btn-employee" @click="showMovePanel = true">팀팀원 이동</button>
              </div>
              <h3 class="section-title">팀 정보</h3>
              <li><strong>팀명: </strong> {{ selectedTeam.team_name }}</li>
              <li><strong>팀 코드: </strong> {{ selectedTeam.team_code }}</li>
              <li>
                <strong>상위 부서명: </strong>{{ getDeptNameById(selectedTeam.department_id) }}
              </li>
              <li>
                <strong>상위 본부명: </strong>{{ getHeadNameByDept(selectedTeam.department_id) }}
              </li>
            </ul>
            <div class="member-section">
              <h3 class="section-title">직원 목록</h3>
              <table class="member-table">
                <thead>
                  <tr>
                    <th>사번</th>
                    <th>이름</th>
                    <th>직책</th>
                    <th>직급</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="emp in employeesByTeam(selectedTeam.team_code)"
                    :key="emp.employee_id"
                    @click="onEmployeeClick(emp)"
                    :class="{ active: emp.employee_id === selectedEmployee?.employee_id }"
                  >
                    <td>{{ emp.employee_id }}</td>
                    <td>{{ emp.employee_name }}</td>
                    <td>{{ emp.position_name }}</td>
                    <td>{{ emp.rank_name }}</td>
                  </tr>
                  <tr v-if="employeesByTeam(selectedTeam.team_code).length === 0">
                    <td colspan="4" class="no-data">해당 팀에 직원이 없습니다.</td>
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
          <p class="move-instruction">이동할 부서를 드래그하여 편집하세요.</p>

          <div class="move-tree-container">
            <EditHierarchy
              v-if="dataLoaded"
              :headquarters="dataStore.headquarters"
              :departments="dataStore.departments"
              :teams="dataStore.teams"
              :employees="dataStore.employees"
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

    <!-- ⑤ 신규 조직 등록 모달 (생략) -->
    <!-- ⑥ 조직 삭제 모달 (생략) -->
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import OrgHierarchyAll from '@/components/org/structure/HierarchyAll.vue'
import EditHierarchy from '@/components/org/structure/EditHierarchy.vue'

const dataStore = reactive({
  introduction: [],
  job: [],
  headquarters: [],
  departments: [],
  teams: [],
  position: [],
  rank: [],
  appointment: [],
  appointmentDetail: [],
  employees: []
})

const dataLoaded = ref(false)

// 검색어
const searchKeyword = ref('')

// 선택된 부서/팀/직원
const selectedDept = ref(null)
const selectedTeam = ref(null)
const selectedEmployee = ref(null)

// “부서 이동” 패널 표시 여부
const showMovePanel = ref(false)

// 부서소개, 팀소개 (info-panel에서 사용)
const deptIntroduction = computed(() => {
  if (!selectedDept.value) return { tags: [] }
  return (
    dataStore.introduction.find(
      i =>
        i.introduction_type === '부서' &&
        i.department_id === selectedDept.value.department_id
    ) || { introduction_context: '', tags: [] }
  )
})
const teamIntroduction = computed(() => {
  if (!selectedTeam.value) return { tags: [] }
  return (
    dataStore.introduction.find(
      i =>
        i.introduction_type === '팀' &&
        i.team_id === selectedTeam.value.team_id
    ) || { introduction_context: '', tags: [] }
  )
})

// 부서/팀 클릭 핸들러
function onDeptSelected(dept) {
  console.log('부서 선택:', dept)
  selectedDept.value = dept
  selectedTeam.value = null
  selectedEmployee.value = null
}
function onTeamSelected(team) {
  console.log('팀 선택:', team)
  selectedTeam.value = team
  selectedDept.value = null
  selectedEmployee.value = null
}

// 드래그&드롭 이동 트리의 부서/팀 선택 (임시로 콘솔 출력)
function onDeptSelectedForMove(dept) {
  console.log('이동용 부서 선택 ▶', dept)
}
function onTeamSelectedForMove(team) {
  console.log('이동용 팀 선택 ▶', team)
}

// 이동 취소 / 수정
function cancelMove() {
  showMovePanel.value = false
}
function confirmMove() {
  showMovePanel.value = false
}

// 부서 소개, 팀 소개 접근용
function getHeadNameById(headId) {
  const h = dataStore.headquarters.find(hq => hq.head_id === headId)
  return h ? h.head_name : ''
}
function getDeptNameById(departmentId) {
  const d = dataStore.departments.find(d => d.department_id === departmentId)
  return d ? d.department_name : ''
}
function getHeadNameByDept(departmentId) {
  const d = dataStore.departments.find(d => d.department_id === departmentId)
  return d ? getHeadNameById(d.head_id) : ''
}

// 직원 목록 필터
function employeesByDept(deptCode) {
  return dataStore.employees.filter(e => e.department_code === deptCode)
}
function employeesByTeam(teamCode) {
  return dataStore.employees.filter(e => e.team_code === teamCode)
}

// 검색 함수: 엔터 누르면 호출됨
function searchOrg() {
  const key = searchKeyword.value.trim().toLowerCase()
  console.log('searchOrg() 호출, 키워드=', key)

  if (!key) {
    alert('검색어를 입력해 주세요.')
    return
  }

  // 1) 부서명 또는 코드 검색
  const foundDept = dataStore.departments.find(
    d =>
      d.department_name.toLowerCase().includes(key) ||
      d.department_code.toLowerCase().includes(key)
  )
  console.log('foundDept=', foundDept)
  if (foundDept) {
    onDeptSelected(foundDept)
    return
  }

  // 2) 팀명 또는 코드 검색
  const foundTeam = dataStore.teams.find(
    t =>
      t.team_name.toLowerCase().includes(key) ||
      t.team_code.toLowerCase().includes(key)
  )
  console.log('foundTeam=', foundTeam)
  if (foundTeam) {
    onTeamSelected(foundTeam)
    return
  }

  alert('검색 결과가 없습니다.')
}

// mounted 시 org.json 데이터 로드
onMounted(async () => {
  try {
    const res = await fetch('/org.json')
    const oData = await res.json()
    dataStore.introduction = oData.introduction
    dataStore.job = oData.job
    dataStore.headquarters = oData.headquarters
    dataStore.departments = oData.department
    dataStore.teams = oData.team
    dataStore.position = oData.position
    dataStore.rank = oData.rank
    dataStore.appointment = oData.appointment
    dataStore.appointmentDetail = oData.appointmentDetail
    dataStore.employees = oData.employees.map(e => ({
      ...e,
      position_name:
        oData.position.find(p => p.position_code === e.position_code)
          ?.position_name || '',
      rank_name:
        oData.rank.find(r => r.rank_code === e.rank_code)?.rank_name || ''
    }))
    dataLoaded.value = true
    console.log('org.json 데이터 로드 완료', dataStore)
  } catch (err) {
    console.error('org.json 로드 실패:', err)
  }
})

// (모달 관련 함수들은 생략)

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
  margin-bottom: 8px;
}
.page-container {
  padding: 20px;
}

/* Toolbar */
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
.toolbar-search {
  padding: 6px 12px;
  border: 1px solid #dddddd;
  border-radius: 8px;
  font-size: 16px;
  width: 310px;
  height: 50%;
}
.search-img {
  width: 25px;
  height: 25px;
}
.search {
  display: flex;
  align-items: center;
  margin-left: auto;
  gap: 8px; /* 아이콘과 입력칸 사이 간격 */
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
  margin-bottom: 40px;
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
