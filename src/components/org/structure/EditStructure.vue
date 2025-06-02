<template>
  <div class="page-container">
    <h1 class="page-title">조직 구성</h1>

    <!-- ① 조직도 편집 툴바 -->
    <div class="section">
      <p class="desc">조직도 편집</p>
      <div class="toolbar-card">
        <label for="org-select" class="toolbar-label">조직도 편집</label>
        <select id="org-select" v-model="selectedOrg" class="toolbar-select">
          <option disabled value="">조직 선택</option>
          <option v-for="org in orgOptions" :key="org.id" :value="org.id">
            {{ org.name }}
          </option>
        </select>
        <button class="toolbar-btn" @click="addOrg"><i class="fa fa-plus"></i></button>
        <button class="toolbar-btn" @click="removeOrg"><i class="fa fa-minus"></i></button>
        <input
          type="text"
          v-model="searchKeyword"
          placeholder="검색"
          class="toolbar-search"
        />
        <!-- 부서 이동 모드를 켜거나 끄는 버튼 -->
        <button class="move-mode-btn" @click="toggleMoveMode">
          부서 이동
        </button>
      </div>
    </div>

    <div class="content-grid">
      <!-- ② 조직도 조회용 트리 / 왼쪽 패널 -->
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

      <!-- ③ 부서/팀 정보 + 소개 + 직원 목록 / 중앙 패널 -->
      <div class="section">
        <p class="desc">조직 정보 조회</p>
        <div class="card info-panel">
          <h2 class="card-title">조직 정보</h2>

          <!-- 3-1) 부서가 선택된 경우 -->
          <div v-if="selectedDept" class="info-content">
            <ul class="info-list">
              <h3 class="section-title">부서 정보</h3>
              <li><strong>부서명:</strong> {{ selectedDept.department_name }}</li>
              <li><strong>부서 코드:</strong> {{ selectedDept.department_code }}</li>
              <li>
                <strong>상위 본부명:</strong>
                {{ getHeadNameById(selectedDept.head_id) }}
              </li>
              <li>
                <strong>관련 팀:</strong>
                <span
                  v-for="(tag, idx) in deptIntroduction?.tags"
                  :key="idx"
                >
                  {{ tag }}
                  <span
                    v-if="idx < (deptIntroduction?.tags.length || 0) - 1"
                  >
                    , 
                  </span>
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
                  <tr
                    v-if="employeesByDept(selectedDept.department_code).length === 0"
                  >
                    <td colspan="4" class="no-data">
                      해당 부서에 직원이 없습니다.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- 3-2) 팀이 선택된 경우 -->
          <div v-else-if="selectedTeam" class="info-content">
            <ul class="info-list">
              <h3 class="section-title">팀 정보</h3>
              <li><strong>팀명:</strong> {{ selectedTeam.team_name }}</li>
              <li><strong>팀 코드:</strong> {{ selectedTeam.team_code }}</li>
              <li>
                <strong>상위 부서명:</strong>
                {{ getDeptNameById(selectedTeam.department_id) }}
              </li>
              <li>
                <strong>상위 본부명:</strong>
                {{ getHeadNameByDept(selectedTeam.department_id) }}
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
                  <tr
                    v-if="employeesByTeam(selectedTeam.team_code).length === 0"
                  >
                    <td colspan="4" class="no-data">
                      해당 팀에 직원이 없습니다.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- 3-3) 아무것도 선택되지 않은 경우 -->
          <div v-else class="placeholder-info">
            좌측 트리에서 부서 또는 팀을 선택하세요.
          </div>
        </div>
      </div>

      <!-- ④ 부서 이동 모드 / 오른쪽 패널 -->
      <div class="section">
        <!-- showMoveMode 가 true일 때만 오른쪽 카드 표시 -->
        <template v-if="showMoveMode">
          <p class="desc">조직 구조 이동</p>
          <div class="card move-panel">
            <h2 class="card-title">부서 이동</h2>
            <p class="move-instruction">
              드래그&드롭으로 부서·팀을 다른 본부/부서로 이동할 수 있습니다.
            </p>
            <div class="move-tree-container">
              <EditHierarchy
                v-if="dataLoaded && showMoveMode"
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
              <button class="btn-confirm" @click="confirmMove">확인</button>
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import OrgHierarchyAll from '@/components/org/structure/HierarchyAll.vue'
import EditHierarchy from '@/components/org/structure/EditHierarchy.vue'

/**
 * dataStore: org.json 전체 데이터를 저장
 *  - introduction: 부서/팀별 소개
 *  - headquarters, department, team, position, rank: 조직 구조
 *  - employees: 직원 목록
 */
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

// 화면 로딩 완료 여부
const dataLoaded = ref(false)

// 툴바 관련 상태 (조직도 선택, 검색어)
const orgOptions = ref([
  { id: 'all', name: 'DDIS 전체' },
  { id: 'dev', name: '개발본부' },
  { id: 'hr', name: '경영지원본부' },
  { id: 'biz', name: '사업본부' }
])
const selectedOrg = ref('')
const searchKeyword = ref('')

// 사용자가 선택한 부서/팀/직원
const selectedDept = ref(null)
const selectedTeam = ref(null)
const selectedEmployee = ref(null)

// 부서 이동 모드 표시 여부
const showMoveMode = ref(false)

/**
 * mounted 시 public/org.json 파일을 fetch
 */
onMounted(async () => {
  try {
    const res = await fetch('/org.json')
    const oData = await res.json()

    // introduction 데이터
    dataStore.introduction = oData.introduction || []

    // 조직 구조/직원 데이터
    dataStore.headquarters = oData.headquarters || []
    dataStore.departments = oData.department || []
    dataStore.teams = oData.team || []
    dataStore.position = oData.position || []
    dataStore.rank = oData.rank || []
    dataStore.appointment = oData.appointment || []
    dataStore.appointmentDetail = oData.appointmentDetail || []

    // employees 에는 position_name, rank_name까지 매핑해 둠
    dataStore.employees = (oData.employees || []).map(e => ({
      ...e,
      position_name:
        oData.position.find(p => p.position_code === e.position_code)
          ?.position_name || '',
      rank_name:
        oData.rank.find(r => r.rank_code === e.rank_code)?.rank_name || ''
    }))

    dataLoaded.value = true
  } catch (err) {
    console.error('org.json 로드 실패:', err)
  }
})

/**
 * “부서” 클릭 시 호출
 */
function onDeptSelected(dept) {
  selectedDept.value = dept
  selectedTeam.value = null
  selectedEmployee.value = null
}

/**
 * “팀” 클릭 시 호출
 */
function onTeamSelected(team) {
  selectedTeam.value = team
  selectedDept.value = null
  selectedEmployee.value = null
}

/**
 * 직원 클릭 시 호출
 */
function onEmployeeClick(emp) {
  selectedEmployee.value = emp
}

/**
 * 부서 이동 모드 토글
 */
function toggleMoveMode() {
  showMoveMode.value = !showMoveMode.value
}

/**
 * 부서 이동 트리에서 “부서” 클릭 시
 */
function onDeptSelectedForMove(dept) {
  console.log('이동용 부서 선택 ▶', dept)
}

/**
 * 부서 이동 트리에서 “팀” 클릭 시
 */
function onTeamSelectedForMove(team) {
  console.log('이동용 팀 선택 ▶', team)
}

/**
 * 부서 이동 취소
 */
function cancelMove() {
  showMoveMode.value = false
}

/**
 * 부서 이동 확인 (저장 로직)
 */
function confirmMove() {
  // 실제로 드래그&드롭 후 dataStore.departments, dataStore.teams가 수정되었으므로
  // 원한다면 여기에 서버로 변경사항 전송(fetch/post 등)을 추가.
  alert('부서 이동 내용이 저장되었습니다.')
  showMoveMode.value = false
}

/**
 * 부서가 선택된 경우, dataStore.introduction에서 해당 부서 소개 객체를 찾음
 */
const deptIntroduction = computed(() => {
  if (!selectedDept.value) return null
  return (
    dataStore.introduction.find(
      i =>
        i.introduction_type === '부서' &&
        i.department_id === selectedDept.value.department_id
    ) || null
  )
})

/**
 * 팀이 선택된 경우, dataStore.introduction에서 해당 팀 소개 객체를 찾음
 */
const teamIntroduction = computed(() => {
  if (!selectedTeam.value) return null
  return (
    dataStore.introduction.find(
      i =>
        i.introduction_type === '팀' &&
        i.team_id === selectedTeam.value.team_id
    ) || null
  )
})

/**
 * head_id(숫자)를 받아서 head_name 반환
 */
function getHeadNameById(headId) {
  const h = dataStore.headquarters.find(hq => hq.head_id === headId)
  return h ? h.head_name : ''
}
/**
 * department_id(숫자)를 받아서 department_name 반환
 */
function getDeptNameById(departmentId) {
  const d = dataStore.departments.find(d => d.department_id === departmentId)
  return d ? d.department_name : ''
}
/**
 * department_id 기준으로 head_id를 구해, head_name 반환
 */
function getHeadNameByDept(departmentId) {
  const d = dataStore.departments.find(d => d.department_id === departmentId)
  if (!d) return ''
  return getHeadNameById(d.head_id)
}

/**
 * 선택된 부서의 직원 목록 반환 (department_code 기준)
 */
function employeesByDept(deptCode) {
  return dataStore.employees.filter(e => e.department_code === deptCode)
}

/**
 * 선택된 팀의 직원 목록 반환 (team_code 기준)
 */
function employeesByTeam(teamCode) {
  return dataStore.employees.filter(e => e.team_code === teamCode)
}

/**
 * 툴바: 조직도 추가/삭제 (예시)
 */
function addOrg() {
  alert('조직도 추가 기능 호출')
}
function removeOrg() {
  alert('조직도 삭제 기능 호출')
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
  margin-bottom: 50px;
  color: #00a8e8;
}
.desc {
  display: block;
  margin-left: 20px;
  margin-bottom: 8px; /* 여백을 약간 줄임 */
}
.page-container {
  padding: 20px;
}

/* ① 조직도 편집 툴바 */
.toolbar-card {
  display: flex;
  align-items: center;
  background: #ffffff;
  border-radius: 12px;
  padding: 20px 32px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  margin-bottom: 30px;
}
.toolbar-label {
  font-weight: bold;
  font-size: 20px;
  margin-right: 16px;
}
.toolbar-select {
  border: 1px solid #d1d1d1;
  border-radius: 4px;
  padding: 8px 8px;
  font-size: 14px;
  margin-right: 8px;
}
.toolbar-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: #00a8e8;
  color: white;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  margin-right: 8px;
}
.toolbar-btn i {
  pointer-events: none;
}
.toolbar-search {
  margin-left: auto;
  padding: 4px 12px;
  border: 1px solid #d1d1d1;
  border-radius: 4px;
  font-size: 14px;
  width: 180px;
}
/* 부서 이동 모드 토글 버튼 */
.move-mode-btn {
  margin-left: 16px;
  background-color: #00a8e8;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s;
}
.move-mode-btn:hover {
  background-color: #008fc1;
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

/* 공통 카드 스타일 */
.card {
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  padding: 30px 40px;
  display: flex;
  flex-direction: column;
  max-height: 75vh;
  overflow: hidden;
  flex: 1;      /* 세로로 같은 높이를 차지하게 함 */
  min-height: 0; /* 내부 스크롤이 잘 동작하도록 */
}
.card-title {
  font-weight: bold;
  margin-bottom: 8px;
}

/* ② 조직도 트리 카드 */
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
  border-bottom: 2px solid #00a8e8;
  font-size: 22px;
  font-weight: bold;
  padding-bottom: 2px;
  margin-bottom: 12px;
}

.info-panel {
  overflow-y: auto;
  overflow-x: auto;
  padding-right: 8px;
}
.info-list {
  list-style: none;
  font-size: 20px;
  margin-bottom: 8px;
}
.info-list li {
  margin-bottom: 6px;
}
.intro-tags {
  font-size: 16px;
  color: #3d3d3d;
  margin-bottom: 16px;
}
.no-intro {
  font-size: 18px;
  color: #888;
  margin: 16px 0;
  text-align: center;
}
/* 직원 목록 테이블 */
.member-section {
  margin-top: 16px;
}
.member-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
  margin: 0 auto;
}
.member-table th,
.member-table td {
  border: 1px solid #ddd;
  padding: 8px;
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

/* ④ 부서 이동 카드 */
.move-panel {
  display: flex;
  flex-direction: column;
}
.move-instruction {
  font-size: 16px;
  color: #555;
  margin-bottom: 10px;
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
  background-color: #00a8e8;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 20px;
  cursor: pointer;
  transition: background-color 0.2s;
}
.btn-cancel:hover,
.btn-confirm:hover {
  background-color: #008fc1;
}

/* 스크롤바 스타일 */
.tree-container::-webkit-scrollbar,
.move-tree-container::-webkit-scrollbar {
  width: 6px;
}
.tree-container::-webkit-scrollbar-thumb,
.move-tree-container::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 3px;
}
.tree-container::-webkit-scrollbar-track,
.move-tree-container::-webkit-scrollbar-track {
  background: transparent;
}
</style>
