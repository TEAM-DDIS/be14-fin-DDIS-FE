<!-- 조직 및 직무 > 조직 구성 > 조직 구성 조회-->
<template>
  <div class="page-container">
    <h1 class="page-title">
      <img src="@/assets/icons/back_btn.svg"
      alt="back"
      class="back-btn"
      @click="goBack" />
      조직 구성 편집
    </h1>

    <div class="section">
      <p class="desc">조직도 편집</p>
      <div class="toolbar-card">
        <h2 class="toolbar-label">조직도 편집</h2>
        <div class="toolbar-btns">
          <button @click="openDeleteModal" class="toolbar-btn-delete">삭제</button>
          <button @click="openAddModal" class="toolbar-btn-register">등록</button>
        </div>
      </div>
    </div>

    <div class="content-grid">
      <div class="section">
        <p class="desc2">조직도 조회</p>
        <div class="card tree-panel scrollbar">
          <h2 class="card-title">조직도</h2>
          <div class="tree-container">
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

      <div class="section">
        <p class="desc2">조직 정보 조회</p>
        <div class="card info-panel scrollbar">
          <div class="info-header">
            <h2 class="card-title">조직 정보</h2>
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

          <div class="info-body">
            <div v-if="selectedDept" class="info-content">
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

            <div v-else-if="selectedTeam" class="info-content">
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

            <div v-else class="placeholder-info">
              좌측 트리에서 부서 또는 팀을 선택하거나, 검색창에 부서/팀을 입력하세요.
            </div>
          </div>
        </div>
      
      </div>

      <div class="section" v-if="selectedDept || selectedTeam">
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
              @reload="handleReload" 
            />
          </div>
        </div>
      </div>
    </div>

    <AddModal
      v-if="showAddModal"
      :show="showAddModal"
      :orgOptions="orgOptions"
      :headOptions="dataStore.headquarters"
      :deptOptions="dataStore.departments"
      @submit="handleAddOrg"
      @close="showAddModal = false"
    />

    <DeleteModal
      v-if="showDeleteModal"
      :orgOptions="orgOptions"
      :deleteListAll="deleteListAll"
      @close="closeDeleteModal"
      @confirm="handleDeleteOrg"
    />
  </div>  
  <BaseToast ref="toastRef" />
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import OrgHierarchyAll from '@/components/org/structure/Hierarchy.vue'
import EditHierarchy from '@/components/org/structure/EditHierarchy.vue'
import AddModal from '@/components/org/structure/AddModal.vue'
import DeleteModal from '@/components/org/structure/DeleteModal.vue'
import BaseToast from '@/components/toast/BaseToast.vue'

const deleteType = ref('')

const router = useRouter()
const userStore = useUserStore()

const dataLoaded = ref(false)
const searchKeyword = ref('')

const selectedDept     = ref(null)
const selectedTeam     = ref(null)
const selectedEmployee = ref(null)

const deptMembers = ref([])
const teamMembers = ref([])

const showAddModal    = ref(false)
const showDeleteModal = ref(false)

const dataStore = reactive({
  headquarters: [],
  departments: [],
  teams: [],
  position: [],
  rank: []
})

function parseJwtPayload(token) {
  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => `%${('00' + c.charCodeAt(0).toString(16)).slice(-2)}`)
        .join('')
    )
    return JSON.parse(jsonPayload)
  } catch (e) {
    return null
  }
}

const token = userStore.accessToken
const payload = parseJwtPayload(userStore.accessToken || token)
const isHR = payload?.role?.includes('ROLE_HR') || payload?.auth?.includes('ROLE_HR')

if (!isHR) {
  showToast('접근 권한이 없습니다.')
  router.push('/error403')
}

const toastRef = ref(null)

function showToast(msg) {
  toastRef.value?.show(msg)
}
const orgOptions = [
  { id: 'head', name: '본부' },
  { id: 'department', name: '부서' },
  { id: 'team', name: '팀' }
]

function goBack() {
  router.back()
}

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

onMounted(async () => {
  try {
    const res = await axios.get('https://api.isddishr.site/structure/hierarchy', {
      headers: { Authorization: `Bearer ${token}` }
    })
    dataStore.headquarters = res.data
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
  }
})

async function onDeptSelected(dept) {
  selectedDept.value     = dept
  selectedTeam.value     = null
  selectedEmployee.value = null
  teamMembers.value      = []
  deptMembers.value      = []

  try {
    const res = await axios.get(
      `https://api.isddishr.site/structure/departments/${dept.departmentId}/members`, {
      headers: { Authorization: `Bearer ${token}` }
    }
    )
    deptMembers.value = res.data
  } catch (e) {
    deptMembers.value = []
  }
}

async function onTeamSelected(team) {
  selectedTeam.value     = team
  selectedDept.value     = null
  selectedEmployee.value = null
  deptMembers.value      = []
  teamMembers.value      = []

  try {
    const res = await axios.get(
      `https://api.isddishr.site/structure/teams/${team.teamId}/members`, {
      headers: { Authorization: `Bearer ${token}` }
    }
    )
    teamMembers.value = res.data
  } catch (e) {
    teamMembers.value = []
  }
}

function onEmployeeClick(emp) {
  selectedEmployee.value = emp
}

function getHeadNameById(headId) {
  const h = dataStore.headquarters.find(hq => hq.headId === headId)
  return h ? h.headName : ''
}

function getHeadCodeById(headId) {
  const h = dataStore.headquarters.find(hq => hq.headId === headId)
  return h ? h.headCode : ''
}

function getDeptNameById(deptId) {
  const d = dataStore.departments.find(x => x.departmentId === deptId)
  return d ? d.departmentName : ''
}

function getDeptCodeById(deptId) {
  const d = dataStore.departments.find(x => x.departmentId === deptId)
  return d ? d.departmentCode : ''
}

function getHeadNameByDept(deptId) {
  const d = dataStore.departments.find(x => x.departmentId === deptId)
  return d ? getHeadNameById(d.headId) : ''
}

function getHeadCodeByDept(deptId) {
  const d = dataStore.departments.find(x => x.departmentId === deptId)
  return d ? getHeadCodeById(d.headId) : ''
}

const teamNamesOfDept = computed(() => {
  if (!selectedDept.value) return []
  return selectedDept.value.teams.map(t => t.teamName)
})

function searchOrg() {
  const key = searchKeyword.value.trim().toLowerCase()
  if (!key) {
    showToast('검색어를 입력해 주세요.')
    return
  }
  const foundDept = dataStore.departments.find(
    d =>
      d.departmentName.toLowerCase().includes(key) ||
      d.departmentCode.toLowerCase().includes(key)
  )
  if (foundDept) {
    for (const h of dataStore.headquarters) {
      const match = h.departments.find(dd => dd.departmentId === foundDept.departmentId)
      if (match) {
        onDeptSelected(match)
        return
      }
    }
  }

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

  showToast('검색 결과가 없습니다.')
}

function openAddModal() {
  showAddModal.value = true
}

async function handleAddOrg({ type, name, parentId }) {
  try {
    const headers = { 
      Authorization: `Bearer ${localStorage.getItem('token')}` 
    }
   if (type === 'head') {
     const res = await axios.post(
       'https://api.isddishr.site/org/create/head',
       { headName: name },
       { headers }
     )
      dataStore.headquarters.push(res.data)
    }
   else if (type === 'department') {
     const res = await axios.post(
       'https://api.isddishr.site/org/create/department',
       { departmentName: name, headId: parentId },
       { headers }
     )
      dataStore.departments.push(res.data)
      const head = dataStore.headquarters.find(h => h.headId === parentId)
      head && head.departments.push({ ...res.data, teams: [] })
    }
   else if (type === 'team') {
     const res = await axios.post(
       'https://api.isddishr.site/org/create/team',
       { teamName: name, departmentId: parentId },
       { headers }
     )
      dataStore.teams.push(res.data)
      for (const h of dataStore.headquarters) {
        const dept = h.departments.find(d => d.departmentId === parentId)
        if (dept) {
          dept.teams.push({ ...res.data, members: [] })
          break
        }
      }
    }
    // showToast("등록 성공!")
    showAddModal.value = false
    window.location.reload()
  } catch (e) {
    showToast('조직 추가 중 오류가 발생했습니다.')
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
    const endpointMap = {
      head: 'head',
      department: 'department',
      team: 'team'
    }
    const endpoint = endpointMap[type]
    const headers = { Authorization: `Bearer ${token}` }

    await Promise.all(
      ids.map(id =>
       axios.delete(
         `https://api.isddishr.site/org/delete/${endpoint}/${id}`,
         { headers }
       )
      )
    )
    showDeleteModal.value = false
    window.location.reload()
    // showToast('삭제 성공!')
    await loadHierarchy()
  } catch (err) {
    console.error('삭제 실패', err)
    showToast('삭제 중 오류가 발생했습니다.')
  }
}

async function loadHierarchy() {
  const res = await fetch('https://api.isddishr.site/structure/hierarchy',
    {
      headers: { 'Authorization': `Bearer ${token}` }
    }
  )
  const hierarchyData = await res.json()
  dataStore.headquarters = hierarchyData

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

function onDeptSelectedForMove(dept) {
  // console.log('이동용 부서 선택 ▶', dept)
}
function onTeamSelectedForMove(team) {
  // console.log('이동용 팀 선택 ▶', team)
}

function handleReload() {
  window.location.reload()
}
</script>

<style scoped>
.page-container {
  height: 120vh;
  display: flex;
  flex-direction: column;
  overflow: hidden; 
}
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
  margin-top: 0;
  font-size: 18px;
}

.desc2 {
  display: block;
  margin-left: 0;
  margin-bottom: 10px;
  font-size: 18px;
}

.toolbar-card {
  display: flex;
  align-items: center;
  background: var(--bg-box);
  border-radius: 12px;
  padding: 8px 16px;
  height: 70px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  margin-bottom: 30px;
  gap: 20px;
  margin-left: 20px;
}
.toolbar-label {
  font-weight: bold;
  font-size: 22px;
  margin-left: 10px;
  margin-right: 45px;
}
.toolbar-btns {
  display: flex;
  gap: 12px;
  margin-left: auto; 
  margin-right: 20px;
}

.toolbar-btn-register {
  display: flex;
  align-items: center;
  justify-content: center; 
  padding: 10px 24px;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  font-family: inherit;
  background-color: var(--primary);
  color: var(--text-on-primary);
  border: 1px solid transparent;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: background-color 0.2s, box-shadow 0.2s;
}
.toolbar-btn-register:hover {
  background-color: var(--bg-main);
  color: var(--primary);
  border-color: var(--primary);
}

.toolbar-btn-delete {
  font-size: 14px;
  font-weight: bold;
  background-color: #D3D3D3;
  color: #000;
  border: none;
  border-radius: 10px;
  padding: 10px 24px;
  font-weight: bold;
  cursor: pointer;
  border: transparent;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: background-color 0.2s, box-shadow 0.2s;
  box-sizing: border-box;

  display: flex;
  justify-content: flex-end;
  float: right;
}
.toolbar-btn-delete:hover {
  background-color: #000;
  color: #fff;
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
  border: 1px solid #ddd;
  color: var(--text-main);
  border-radius: 8px;
  font-size: 16px;
  width: 200px;
  height: 40%;
  background: var(--modal-box-bg);
}

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

.info-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px; 
}

.card {
  background: var(--bg-box);
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
  height: 550px;
  overflow: hidden;
  overflow-y: auto;
  padding: 10px 30px;
}

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
  background-color: var(--bg-label-cell);
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
  color: var(--text-sub);
  margin-bottom: 16px;
}
</style>