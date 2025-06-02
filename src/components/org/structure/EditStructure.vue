<template>
  <div class="page-container">
    <h1 class="page-title">조직 구성</h1>

    <!-- ① 조직도 편집 툴바 -->
    <div class="section">
      <p class="desc">조직도 편집</p>
      <div class="toolbar-card">
        <!-- 툴바 제목 -->
        <h2 class="toolbar-label">조직도 편집</h2>

        <!-- 조직 종류 선택 셀렉트 -->
        <!-- <select id="org-select" v-model="selectedOrg" class="toolbar-select">
          <option disabled value="">조직 선택</option>
          <option v-for="org in orgOptions" :key="org.id" :value="org.id">
            {{ org.name }}
          </option>
        </select> -->

        <!-- ＋ 버튼: 모달 열기 -->
        <button class="toolbar-btn" @click="openAddModal">
          <p class="toolbar-btn-detail">＋</p>
        </button>

        <!-- － 버튼: 삭제 모달 열기 -->
        <button class="toolbar-btn" @click="openDeleteModal">
          <p class="toolbar-btn-detail">－</p>
        </button>

        <!-- 검색 입력란 -->
         <div class="search">
          <img src="@/assets/icons/search.svg" alt="search" class="search-img">
          <input
            type="text"
            v-model="searchKeyword"
            placeholder="검색"
            class="toolbar-search"
          />
        </div>
      </div>
    </div>

    <div class="content-grid">
      <!-- ② 조직도 조회 패널 -->
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

          <!-- 부서 선택 시 -->
          <div v-if="selectedDept" class="info-content">
            <div class="button-group">
              <button class="btn-dept" @click="showMovePanel = true">부서 이동</button>
              <button class="btn-employee">부서원 이동</button>
            </div>
            <ul class="info-list">
              <h3 class="section-title">부서 정보</h3>
              <li><strong>부서명: </strong> {{ selectedDept.department_name }}</li>
              <li><strong>부서 코드: </strong> {{ selectedDept.department_code }}</li>
              <li>
                <strong>상위 본부명: </strong>
                {{ getHeadNameById(selectedDept.head_id) }}
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
                  <tr
                    v-if="employeesByDept(selectedDept.department_code).length === 0"
                  >
                    <td colspan="4" class="no-data">해당 부서에 직원이 없습니다.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- 팀 선택 시 -->
          <div v-else-if="selectedTeam" class="info-content">
            <ul class="info-list">
              <h3 class="section-title">팀 정보</h3>
              <li><strong>팀명: </strong> {{ selectedTeam.team_name }}</li>
              <li><strong>팀 코드: </strong> {{ selectedTeam.team_code }}</li>
              <li>
                <strong>상위 부서명: </strong>
                {{ getDeptNameById(selectedTeam.department_id) }}
              </li>
              <li>
                <strong>상위 본부명: </strong>
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
                  <tr v-if="employeesByTeam(selectedTeam.team_code).length === 0">
                    <td colspan="4" class="no-data">해당 팀에 직원이 없습니다.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- 아무것도 선택 안 됐을 때 -->
          <div v-else class="placeholder-info">
            좌측 트리에서 부서 또는 팀을 선택하세요.
          </div>
        </div>
      </div>

      <!-- ④ 부서 이동 (showMovePanel이 true일 때만 보여준다) -->
      <div class="section" v-if="showMovePanel">
        <p class="desc">조직 구조 이동</p>
        <div class="card move-panel">
          <h2 class="card-title">부서 이동</h2>
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

    <!-- ⑤ 신규 조직 등록 모달 -->
    <div v-if="showAddModal" class="modal-overlay" @click.self="closeAddModal">
      <div class="modal-content">
        <h3 class="modal-title">신규 조직 등록</h3>

        <!-- 조직 종류 선택: 기본값으로 selectedOrg -->
        <label class="modal-label" for="modal-org-type">조직 종류</label>
        <select
          id="modal-org-type"
          v-model="newOrgType"
          class="modal-select"
        >
          <option disabled value="">조직 종류 선택</option>
          <option v-for="org in orgOptions" :key="org.id" :value="org.id">
            {{ org.name }}
          </option>
        </select>

        <!-- 신규 조직 이름 입력 -->
        <label class="modal-label" for="modal-org-name">조직 이름</label>
        <input
          id="modal-org-name"
          v-model="newOrgName"
          type="text"
          placeholder="새 조직 이름을 입력하세요"
          class="modal-input"
        />

        <div class="modal-buttons">
          <button class="modal-btn-cancel" @click="closeAddModal">취소</button>
          <button class="modal-btn-submit" @click="submitNewOrg">등록</button>
        </div>
      </div>
    </div>

    <!-- ⑥ 조직 삭제 모달 -->
    <div
      v-if="showDeleteModal"
      class="modal-overlay"
      @click.self="closeDeleteModal"
    >
      <div class="modal-content">
        <h3 class="modal-title">조직 삭제</h3>

        <!-- 조직 종류 선택 -->
        <label class="modal-label" for="delete-org-type">삭제할 조직 종류</label>
        <select
          id="delete-org-type"
          v-model="deleteOrgType"
          class="modal-select"
        >
          <option disabled value="">조직 종류 선택</option>
          <option v-for="org in orgOptions" :key="org.id" :value="org.id">
            {{ org.name }}
          </option>
        </select>

        <!-- 선택한 조직 종류에 해당하는 항목 체크박스 나열 -->
        <div v-if="deleteList.length > 0" class="delete-list">
          <label
            v-for="item in deleteList"
            :key="item.value"
            class="delete-list-item"
          >
            <input
              type="checkbox"
              :value="item.value"
              v-model="selectedDeleteIds"
            />
            {{ item.label }}
          </label>
        </div>
        <div v-else class="no-data" style="margin-top: 12px;">
          조직 종류를 선택하면 목록이 여기에 표시됩니다.
        </div>

        <div class="modal-buttons">
          <button class="modal-btn-cancel" @click="closeDeleteModal">취소</button>
          <button
            class="modal-btn-delete"
            @click="doDeleteOrg"
            :disabled="selectedDeleteIds.length === 0"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed, watch } from 'vue'
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

// 툴바 옵션: 본부, 부서, 팀
const orgOptions = ref([
  { id: 'head', name: '본부' },
  { id: 'dept', name: '부서' },
  { id: 'team', name: '팀' }
])
const selectedOrg = ref('')      // toolbar 셀렉트에서 선택된 조직 종류
const searchKeyword = ref('')    // 검색어

// 신규 조직 등록용 상태
const showAddModal = ref(false)  // 등록 모달 표시 여부
const newOrgType = ref('')       // 모달 내 조직 종류 (초기값: toolbar에서 선택된 selectedOrg)
const newOrgName = ref('')       // 모달 내 신규 조직명

// 삭제용 모달 상태
const showDeleteModal = ref(false)   // 삭제 모달 표시 여부
const deleteOrgType = ref('')        // 삭제 모달 내 조직 종류 선택
const selectedDeleteIds = ref([])    // 체크된 삭제 대상 ID들

// 선택된 부서/팀/직원
const selectedDept = ref(null)
const selectedTeam = ref(null)
const selectedEmployee = ref(null)

// “부서 이동” 패널 표시 여부
const showMovePanel = ref(false)

// 부서, 팀 소개 추출 용
const deptIntroduction = computed(() => {
  if (!selectedDept.value) return null
  return (
    dataStore.introduction.find(
      i =>
        i.introduction_type === '부서' &&
        i.department_id === selectedDept.value.department_id
    ) || { introduction_context: '', tags: [] }
  )
})
const teamIntroduction = computed(() => {
  if (!selectedTeam.value) return null
  return (
    dataStore.introduction.find(
      i =>
        i.introduction_type === '팀' &&
        i.team_id === selectedTeam.value.team_id
    ) || { introduction_context: '', tags: [] }
  )
})

// 삭제 모달에서 보여줄 리스트 (조직 종류에 따라 동적으로 생성)
const deleteList = computed(() => {
  if (deleteOrgType.value === 'head') {
    // 본부 목록: head_id와 head_name
    return dataStore.headquarters.map(hq => ({
      value: hq.head_id,
      label: `${hq.head_name} (코드: ${hq.head_code})`
    }))
  }
  if (deleteOrgType.value === 'dept') {
    // 부서 목록: department_id와 department_name
    return dataStore.departments.map(dept => ({
      value: dept.department_id,
      label: `${dept.department_name} (코드: ${dept.department_code})`
    }))
  }
  if (deleteOrgType.value === 'team') {
    // 팀 목록: team_id와 team_name
    return dataStore.teams.map(team => ({
      value: team.team_id,
      label: `${team.team_name} (코드: ${team.team_code})`
    }))
  }
  return []
})

// watch: 조직 종류를 바꿀 때 체크박스 초기화
watch(deleteOrgType, () => {
  selectedDeleteIds.value = []
})

// mounted 시 org.json 로드
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
  } catch (err) {
    console.error('org.json 로드 실패:', err)
  }
})

// 조회용 트리에서 부서 선택
function onDeptSelected(dept) {
  selectedDept.value = dept
  selectedTeam.value = null
  selectedEmployee.value = null
}
// 조회용 트리에서 팀 선택
function onTeamSelected(team) {
  selectedTeam.value = team
  selectedDept.value = null
  selectedEmployee.value = null
}

// Move 트리에서 부서 선택
function onDeptSelectedForMove(dept) {
  console.log('이동용 부서 선택 ▶', dept)
}
// Move 트리에서 팀 선택
function onTeamSelectedForMove(team) {
  console.log('이동용 팀 선택 ▶', team)
}

// “취소” 버튼: showMovePanel = false
function cancelMove() {
  showMovePanel.value = false
}
// “수정” 버튼: (실제 로직 수행 후) showMovePanel = false
function confirmMove() {
  // 실제 수정 로직 추가 가능
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

function employeesByDept(deptCode) {
  return dataStore.employees.filter(e => e.department_code === deptCode)
}
function employeesByTeam(teamCode) {
  return dataStore.employees.filter(e => e.team_code === teamCode)
}

// 신규 조직 등록 모달: 열기 / 닫기
function openAddModal() {
  newOrgType.value = selectedOrg.value || ''
  newOrgName.value = ''
  showAddModal.value = true
}
function closeAddModal() {
  showAddModal.value = false
}

// 신규 조직 등록 시 호출
function submitNewOrg() {
  if (!newOrgType.value) {
    alert('조직 종류를 선택해 주세요.')
    return
  }
  if (!newOrgName.value.trim()) {
    alert('조직 이름을 입력해 주세요.')
    return
  }
  console.log('신규 조직 등록 →', {
    type: newOrgType.value,
    name: newOrgName.value.trim()
  })
  // 실제 등록 로직(API 호출 등)을 여기에 추가
  showAddModal.value = false
}

// 삭제용 모달: 열기 / 닫기
function openDeleteModal() {
  deleteOrgType.value = selectedOrg.value || ''
  selectedDeleteIds.value = []
  showDeleteModal.value = true
}
function closeDeleteModal() {
  showDeleteModal.value = false
}

// 조직 삭제 로직
function doDeleteOrg() {
  if (!deleteOrgType.value) {
    alert('삭제할 조직 종류를 선택해 주세요.')
    return
  }
  if (selectedDeleteIds.value.length === 0) {
    alert('삭제할 조직을 하나 이상 선택해 주세요.')
    return
  }

  // 본부 삭제
  if (deleteOrgType.value === 'head') {
    dataStore.headquarters = dataStore.headquarters.filter(
      hq => !selectedDeleteIds.value.includes(hq.head_id)
    )
    // (선택적으로: 이 본부에 속한 부서들도 cascade 삭제할 수 있음)
  }
  // 부서 삭제
  if (deleteOrgType.value === 'dept') {
    dataStore.departments = dataStore.departments.filter(
      dept => !selectedDeleteIds.value.includes(dept.department_id)
    )
    // (선택적으로: 이 부서에 속한 팀들도 cascade 삭제할 수 있음)
  }
  // 팀 삭제
  if (deleteOrgType.value === 'team') {
    dataStore.teams = dataStore.teams.filter(
      team => !selectedDeleteIds.value.includes(team.team_id)
    )
  }

  // 삭제 후 모달 닫기
  showDeleteModal.value = false
  selectedDeleteIds.value = []
}

// 툴바 “삭제” 버튼 예시 (단순 알림)
function removeOrg() {
  // 모달을 띄우도록 처리
  openDeleteModal()
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
.toolbar-select {
  border: 1px solid #d1d1d1;
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 16px;
  margin-right: 20px;
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
  width: 260px;
  height: 50%;
}
.search-img {
  width: 25px;
  height: 25px;
}
.search {
  display: flex;
  justify-content: flex-end;
  margin-left: auto;
  margin-right: 80px;
  align-items: center;
  gap: 5px;
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
  padding: 30px 40px;
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
  color: #888;
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

/* ⑤ 신규 조직 등록 모달 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
.modal-content {
  background: #fff;
  border-radius: 12px;
  padding: 24px 32px;
  width: 500px;
  max-width: 90%;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
}
.modal-title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 30px;
  text-align: center;
}
.modal-label {
  display: block;
  font-size: 16px;
  font-weight: bold;
  margin-top: 12px;
  margin-bottom: 6px;
}
.modal-select,
.modal-input {
  width: 100%;
  padding: 8px 10px;
  font-size: 14px;
  border: 1px solid #ddd;
  border-radius: 8px;
  margin-bottom: 20px;
  box-sizing: border-box;
}
.modal-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 30px;
}
.modal-btn-cancel,
.modal-btn-submit,
.modal-btn-delete {
  font-weight: bold;
  cursor: pointer;
  font-family: inherit;
  background-color: #00a8e8;
  color: white;
  border: 1px solid transparent;
  padding: 8px 20px;
  border-radius: 6px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: background-color 0.2s, box-shadow 0.2s;
}

.modal-btn-cancel:hover,
.modal-btn-submit:hover,
.modal-btn-delete:hover {
  background-color: #fff;
  color: #00a8e8;
  border: 1px solid #00a8e8;
}

/* ⑥ 조직 삭제 모달 (위와 동일하게 모달 배경 및 콘텐츠) */
.delete-list {
  max-height: 400px;
  overflow-y: auto;
  margin-bottom: 20px;
  border: 1px solid #ddd;
  padding: 8px;
  border-radius: 8px;
}
.delete-list-item {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  font-size: 16px;
}
.delete-list-item input {
  margin-right: 8px;
}
</style>
