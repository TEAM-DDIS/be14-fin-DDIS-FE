<!-- 조직 및 직무 > 인사발령 > 인사발령 등록 -->

<template>
  <h1 class="page-title">
    <img src="@/assets/icons/back_btn.svg"
      alt="back"
      class="back-btn"
      @click="goBack" />
      인사발령
  </h1>
  <p class="desc">인사발령 등록</p>

  <div class="content-box">
    <div class="register-container">
      <div class="form-grid-container">
        <div class="info-section">
          <div class="select-container">
            <button class="btn-select" @click="showApprovalModal = true">
              사원 추가
            </button>
          </div>
          <table class="info-table">
            <tr>
              <th>사원번호</th>
              <td>{{  form.currentOrg.employeeId || '-' }}</td>
            </tr>
            <tr>
              <th>사원명</th>
              <td>{{ form.currentOrg.employeeName || '-' }}</td>
            </tr>
            <tr>
              <th>발령제목</th>
              <td>
                <input
                  v-model="form.title"
                  type="text"
                  placeholder="발령제목을 입력하세요"
                  :disabled="!form.currentOrg.employeeId"
                />
              </td>
            </tr>
            <tr>
              <th>발령유형</th>
              <td>
                <select v-model="form.type"
                        :disabled="!form.title">
                  <option value="승진">승진</option>
                  <option value="전보">전보</option>
                  <option value="전직">전직</option>
                  <option value="직급조정">직급조정</option>
                  <option value="직무">직무</option>
                </select>
              </td>
            </tr>
            <tr>
              <th>발령일자</th>
              <td>
                <input
                  v-model="form.effectiveDate"
                  type="date"
                  :disabled="!form.title"
                />
              </td>
            </tr>
          </table>
        </div>

        <div class="org-section">
          <AgGridVue
            class="ag-theme-alpine custom-theme"
            :gridOptions="{ theme: 'legacy' }"
            :rowData="rowData"
            :columnDefs="columnDefs"
            :defaultColDef="{ sortable: true, resizable: true }"
            @grid-ready="onGridReady"
            style="width: 100%; height: 285px;"
          />
        </div>
      </div>

      <div class="button-group">
        <button class="btn-cancel" @click="cancel">취소</button>
        <button class="btn-save" @click="submit">저장</button>
      </div>
    </div>
  </div>

  <GetEmployeeModal
    v-if="showApprovalModal"
    :hierarchy="fullHierarchy"
    :initialApprovers="[]"
    @update="onApprovalUpdate"
    @submit="onApprovalSubmit"
    @close="showApprovalModal = false"
  />

  <OrgSelectorModal
  v-if="showOrgSelectorModal"
  :hierarchy="fullHierarchy"
  :requiredKeys="typeToKeys[form.type]" 
  :show-jobs="typeToKeys[form.type].includes('job')"
  :show-ranks="typeToKeys[form.type].includes('rank')"
  @select="handleOrgSelected"
  
  @close="showOrgSelectorModal = false"
  @rank-selected="handleOrgSelected"
  @job-selected="handleOrgSelected"
/>

<BaseToast ref="toastRef" />
</template>

<script setup>
import { reactive, ref, watch, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import 'core-js/features/array/flat-map'
import { useUserStore } from '@/stores/user'
import { AgGridVue } from 'ag-grid-vue3'
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community'
ModuleRegistry.registerModules([AllCommunityModule])

import GetEmployeeModal from '@/components/org/appointment/GetEmployeeModal.vue'
import OrgSelectorModal from '@/components/org/appointment/OrgSelectorModal.vue'
import BaseToast from '@/components/toast/BaseToast.vue'

const showApprovalModal = ref(false)
const employeeList = ref([])

const fullHierarchy = ref([])

const router = useRouter()
const gridApi = ref(null)

const toastRef = ref(null)

function showToast(msg) {
  toastRef.value?.show(msg)
}


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
const userStore = useUserStore()
const token = userStore.accessToken
const payload = parseJwtPayload(token)
const isHR = payload?.role?.includes('ROLE_HR') || payload?.auth?.includes('ROLE_HR')

if (!isHR) {
  showToast('접근 권한이 없습니다.')
  router.push('/error403')
}

function goBack() {
  router.back()
}

// 폼 상태
const form = reactive({
  name: '',
  title: '',
  type: '승진',
  effectiveDate: '',
  currentOrg: {
    headId: null,
    departmentId: null,
    teamId: null,
    jobId: null,
    jobName: null,
    jobCode: null,
    positionCode: null,
    rankCode: null
  },
  org: { 
    headId: null,
    departmentId: null,
    teamId: null,
    jobId: null,
    jobCode: null,
    positionCode: null,
    rankCode: null,
    rankName: null
  }
})

const dataStore = reactive({
  headquarters: [],
  department: [],
  team: [],
  job: []
})

const pureOrg = {
  headId: null,
  departmentId: null,
  teamId: null,
  jobId: null,
  jobCode: null,
  positionCode: null,
  rankCode: null
}


const currentHeads = ref([])
const departmentsCurrent = ref([])  
const teamsCurrent       = ref([])  
const jobsCurrent = ref([])
const positionsCurrent = ref([])
const ranksCurrent = ref([])
const departmentsNew = ref([])
const teamsNew = ref([])
const jobsNew = ref([])
const positionsNew = ref([])
const ranksNew     = ref([])

const employeeCache = reactive(new Map())


onMounted(async () => {
  try {
    const resp = await axios.get('http://localhost:5000/structure/hierarchy')
    const full = Array.isArray(resp.data) ? resp.data : []

   fullHierarchy.value = full

    dataStore.headquarters = full.map(h => ({ headId: h.headId, headName: h.headName, headCode: h.headCode }))
    dataStore.department = full.flatMap(head =>
      (head.departments || []).map(dept => ({
        departmentId:   dept.departmentId,
        departmentName: dept.departmentName,
        departmentCode: dept.departmentCode,
        headId:         head.headId
      }))
    )
 
    // 각 department 아래의 teams 를 평탄화
    dataStore.team = full.flatMap(head =>
      (head.departments || []).flatMap(dept =>
        (dept.teams || []).map(team => ({
          teamId:      team.teamId,
          teamName:    team.teamName,
          teamCode:    team.teamCode,
          departmentId: dept.departmentId
        }))
      )
    )

    dataStore.job = full.flatMap(head =>
      (head.departments || []).flatMap(dept =>
        (dept.teams || []).flatMap(team =>
          (team.jobs || []).map(job => ({
            jobId:   job.jobId,
            jobName: job.jobName,
            jobCode: job.jobCode,
            teamId:  team.teamId
          }))
        )
      )
    )

    currentHeads.value = dataStore.headquarters
    await nextTick()
    gridApi.value?.refreshCells({ columns: ['current', 'new'], force: true })
  } catch (e) {
    console.error('hierarchy 로드 실패', e)
  }
})

async function loadEmployeeInfo() {
  if (!form.currentOrg.employeeId) return

  const id = String(form.currentOrg.employeeId)
  let emp = employeeCache.get(id)

  if (!emp) {
    try {
      const res = await axios.get(`http://localhost:5000/introduction/employee/${id}`)
      emp = res.data
      employeeCache.set(id, emp)     // 캐시에 저장
    } catch {
      showToast('사원정보를 불러오는 중 오류가 발생했습니다.')
      return
    }
  }

  form.currentOrg.headId       = emp.headId
  form.currentOrg.departmentId = emp.departmentId
  form.currentOrg.teamId       = emp.teamId
  form.currentOrg.jobId        = emp.jobId
  form.currentOrg.jobCode      = emp.jobCode
  form.currentOrg.positionCode = emp.positionCode
  form.currentOrg.rankCode     = emp.rankCode

  departmentsCurrent.value = dataStore.department
    .filter(d => d.departmentId === emp.departmentId)
  teamsCurrent.value       = dataStore.team
    .filter(t => t.teamId === emp.teamId)
  jobsCurrent.value = [{
    jobId:   emp.jobId,
    jobName: emp.jobName,
    jobCode: emp.jobCode
  }]
  positionsCurrent.value = [{ positionCode: emp.positionCode, positionName: emp.positionName }]
  ranksCurrent.value     = [{ rankCode: emp.rankCode, rankName: emp.rankName }]

  console.log('[✅ API 응답]', emp)

  gridApi.value.refreshCells({ columns: ['current'], force: true })
}

async function onApprovalSubmit(selectedList) {
  const stub = selectedList[0]
  if (!stub) return

  form.currentOrg.employeeId   = stub.employeeId
  form.currentOrg.employeeName = stub.employeeName

  await loadEmployeeInfo()
  form.org.headId       = form.currentOrg.headId
  form.org.departmentId = form.currentOrg.departmentId
  form.org.teamId       = form.currentOrg.teamId
  form.org.jobId        = form.currentOrg.jobId
  form.org.positionCode = form.currentOrg.positionCode
  form.org.rankCode     = form.currentOrg.rankCode

  showApprovalModal.value = false
}

function fillCurrentOrgCells() {
  rowData.forEach(r => {
    switch(r.key) {
      case 'head':
        r.current = dataStore.headquarters.find(h => h.headId === form.currentOrg.headId)?.headName || ''
        break
      case 'department':
        r.current = dataStore.department.find(d => d.departmentId === form.currentOrg.departmentId)?.departmentName || ''
        break
      case 'team':
        r.current = dataStore.team.find(t => t.teamId === form.currentOrg.teamId)?.teamName || ''
        break
      case 'job':
        r.current = form.currentOrg.jobId 
          ? dataStore.job.find(j => j.jobId === form.currentOrg.jobId)?.jobName 
          : ''
        break
      case 'position':
        r.current = positionsCurrent.value.find(p => p.positionCode === form.currentOrg.positionCode)?.positionName || ''
        break
      case 'rank':
        r.current = ranksCurrent.value.find(rk => rk.rankCode === form.currentOrg.rankCode)?.rankName || ''
        break
    }
  })

  gridApi.value.refreshCells({ columns: ['current'], force: true })
}

function onApprovalUpdate(newList) {
  employeeList.value = newList
}


// 발령 조직 watch
// 본부 → 부서
watch(() => form.org.headId, async headId => {
  form.org.departmentId = form.org.teamId = form.org.jobId = form.org.positionCode = form.org.rankCode = null
  departmentsNew.value = teamsNew.value = jobsNew.value = positionsNew.value = ranksNew.value = []
  if (!headId) return gridApi.value.refreshCells({ columns:['new'], force:true })

  const r = await axios.get(`http://localhost:5000/structure/heads/${headId}/departments`)
  departmentsNew.value = r.data
  gridApi.value.refreshCells({ columns:['new'], force:true })
})

// 부서 → 팀
watch(() => form.org.departmentId, async deptId => {
  form.org.teamId = form.org.jobId = form.org.positionCode = form.org.rankCode = null
  teamsNew.value = jobsNew.value = positionsNew.value = ranksNew.value = []
  if (!deptId) return gridApi.value.refreshCells({ columns:['new'], force:true })

  const r = await axios.get(`http://localhost:5000/structure/departments/${deptId}`)
  teamsNew.value = r.data.teams
  gridApi.value.refreshCells({ columns:['new'], force:true })
})

// 팀 → 직무
watch(() => form.org.teamId, async teamId => {
  form.org.jobId = form.org.positionCode = form.org.rankCode = null
  jobsNew.value = positionsNew.value = ranksNew.value = []
  if (!teamId) return gridApi.value.refreshCells({ columns:['new'], force:true })

  const r = await axios.get(`http://localhost:5000/introduction/team/${teamId}/job`)
  jobsNew.value = r.data.map(j => ({
    jobId: j.jobId, jobName: j.jobName, jobCode: j.jobCode
  }))
  gridApi.value.refreshCells({ columns:['new'], force:true })
})

// 직무 → 직책·직급
watch(() => form.org.jobId, async jobId => {
  form.org.positionCode = form.org.rankCode = null
  positionsNew.value = ranksNew.value = []
  if (jobId) {
    const [posRes, rankRes] = await Promise.all([
      axios.get(`http://localhost:5000/introduction/job/${jobId}/positions`),
      axios.get(`http://localhost:5000/introduction/job/${jobId}/ranks`)
    ])
    positionsNew.value = posRes.data
    ranksNew.value = rankRes.data
  }
  gridApi.value?.refreshCells({ columns: ['new'], force: true })
})

const orgFields = {
  head: '소속 본부',
  department: '소속 부서',
  team: '소속 팀',
  job: '소속 직무',
  position: '소속 직책',
  rank: '소속 직급'
}
const rowData = reactive([])
const columnDefs = [
  { field: 'label', headerName: '항목', flex: 1, editable: false },
  { field: 'current', headerName: '현재 소속 조직', flex: 1.8, cellRenderer: params => makeSelect(params, 'currentOrg') },
  {
    field: 'new',
    headerName: '발령 조직',
    flex: 1.8,
    cellRenderer: params => makeSelect(params, 'org'),
    headerComponentParams: {
      template: `
        <div style="display:flex; justify-content:space-between; align-items:center; width:100%;">
          <span>발령 조직</span>
        <button id="openOrgModal" style="margin-left:auto;" class="btn-plus">조직 선택</button>
        <style>
          .btn-plus {
            background-color: #3f3f3f;
            border-radius: 8px;
            border: 1px solid transparent;
            padding: 6px 10px;
            font-size: 12px;
            font-weight: bold;
            color: #ffffff;
            cursor: pointer;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
            transition: background-color 0.2s, box-shadow 0.2s;
            box-sizing: border-box;
          }
          .btn-plus:hover {
            background-color: white;
            color: #3f3f3f;
            border-color: #3f3f3f;
            box-shadow: inset 1px 1px 10px rgba(0, 0, 0, 0.25);
          }
        </style>
      </div>
      `
    }
  }
]

const typeToKeys = {
  승진:   ['head', 'department', 'team'],
  전보:   ['department', 'team'],
  전직:   ['department', 'team', 'job'],  
  직급조정: ['department', 'team', 'position', 'rank'],
  직무:   ['department', 'team', 'job']
}


watch(() => form.type, newType => {
  rowData.length = 0
  const keys = typeToKeys[newType] || []
  keys.forEach(key => {
    rowData.push({
      key,
      label: orgFields[key],
      current: '',
      new: null
    })
  })
}, { immediate: true })

const showOrgSelectorModal = ref(false)
const orgPickerKey = ref(null)

function openOrgModalForKey(key) {
  orgPickerKey.value = key
  showOrgSelectorModal.value = true
}

function syncOrgToGrid() {
  rowData.forEach(r => {
    switch (r.key) {
      case 'head':
        r.new = dataStore.headquarters.find(h => h.headId === pureOrg.headId)?.headName || ''
        break
      case 'department':
        r.new = dataStore.department.find(d => d.departmentId === pureOrg.departmentId)?.departmentName || ''
        break
      case 'team':
        r.new = dataStore.team.find(t => t.teamId === pureOrg.teamId)?.teamName || ''
        break
      case 'rank':
        r.new = ranksNew.value.find(rk => rk.rankCode === pureOrg.rankCode)?.rankName || ''
        break
      case 'position':
        r.new = positionsNew.value.find(p => p.positionCode === pureOrg.positionCode)?.positionName || ''
        break
      case 'job': {
        const match = jobsNew.value.find(j => String(j.jobId) === String(pureOrg.jobId))
        console.log('🧪 match for job:', match)
        r.new = match?.jobName || ''
        break
      }
    }
  })
  gridApi.value.refreshCells({ columns:['new'], force:true })
}



// 발령 조직 컬럼에 데이터 불러오기 위한 변수 설정
function handleOrgSelected(selected) {
  pureOrg.headId        = selected.headId || null
  pureOrg.departmentId  = selected.departmentId || null
  pureOrg.teamId        = selected.teamId || null
  pureOrg.jobId         = selected.jobId || null
  pureOrg.jobCode       = selected.jobCode || null
  pureOrg.positionCode  = selected.positionCode || null
  pureOrg.rankCode      = selected.rankCode || null

  jobsNew.value = selected.jobId ? [{
    jobId: selected.jobId,
    jobName: selected.jobName,
    jobCode: selected.jobCode
  }] : []

  ranksNew.value = selected.rankCode ? [{
    rankCode: selected.rankCode,
    rankName: selected.rankName
  }] : []

  positionsNew.value = selected.positionCode ? [{
    positionCode: selected.positionCode,
    positionName: selected.positionName
  }] : []

  syncOrgToGrid()

  console.log('[form.org 저장된 값]', JSON.stringify(form.org, null, 2))

  showOrgSelectorModal.value = false
}

function makeSelect(params, context) {
  const key = params.data.key

  if (context === 'org') {
    const inp = document.createElement('input')
    inp.type = 'text'
    inp.readOnly = true
    inp.value = params.data.new || ''
    inp.style.width = '95%'
    inp.style.height = '70%'
    inp.style.border = '2px solid #eee'
    inp.style.borderRadius = '8px'
    inp.style.background = '#f9f9f9'
    return inp
  }

  if (context === 'currentOrg') {
    const readOnlyInput = value => {
      const input = document.createElement('input')
      input.type = 'text'
      input.value = value || ''
      input.readOnly = true
      input.style.width = '95%'
      input.style.height = '70%'
      input.style.border = '2px solid #c8c8c8'
      input.style.borderRadius = '8px'
      input.style.background = 'transparent'
      input.style.paddingLeft = '15px'
      return input
    }

    if (key === 'head')
      return readOnlyInput(dataStore.headquarters.find(h => h.headId === form.currentOrg.headId)?.headName)
    else if (key === 'department')
      return readOnlyInput(dataStore.department.find(d => d.departmentId === form.currentOrg.departmentId)?.departmentName)
    else if (key === 'team')
      return readOnlyInput(dataStore.team.find(t => t.teamId === form.currentOrg.teamId)?.teamName)
    else if (key === 'job')
      return readOnlyInput(jobsCurrent.value[0]?.jobName)
    else if (key === 'position')
      return readOnlyInput(positionsCurrent.value[0]?.positionName)
    else if (key === 'rank')
      return readOnlyInput(ranksCurrent.value[0]?.rankName)
    else return readOnlyInput('')

  }

  return document.createTextNode('-')
}

function onGridReady(params) {
  gridApi.value = params.api
  rowData.length = 0

  const keys = typeToKeys[form.type] || []
  keys.forEach(key =>
    rowData.push({ key, label: orgFields[key], current: '', new: '' })
  )

  fillCurrentOrgCells()

  nextTick(() => {
    const btn = document.querySelector('#openOrgModal')
    if (btn) btn.addEventListener('click', () => openOrgModalForKey('org'))
  })
}

async function submit() {

    await nextTick()

    console.log('✅ departmentId in form.org:', form.org.departmentId)
    console.log('✅ teamId in form.org:', form.org.teamId)
    console.log('✅ dataStore.department:', dataStore.department)
    console.log('✅ dataStore.team:', dataStore.team)

    const org = { ...form.org };
    const current = { ...form.currentOrg };

    const getCode = (list, idKey, codeKey, idVal) => {
      if (!idVal) return null;
      const found = list.find(item => String(item[idKey]) === String(idVal));
      return found ? found[codeKey] : null;
    };

  const payload = {
  employeeId: Number(current.employeeId),
  appointmentReason: form.title,
  appointmentType: form.type,
  appointmentEffectiveDate: form.effectiveDate,

  fromHeadCode:      getCode(dataStore.headquarters, 'headId', 'headCode', current.headId),
  fromDepartmentCode:getCode(dataStore.department, 'departmentId', 'departmentCode', current.departmentId),
  fromTeamCode:      getCode(dataStore.team, 'teamId', 'teamCode', current.teamId),
  fromJobCode:       current.jobCode,
  fromPositionCode:  current.positionCode,
  fromRankCode:      current.rankCode,

  toHeadCode:        getCode(dataStore.headquarters, 'headId', 'headCode', pureOrg.headId || current.headId),
  toDepartmentCode:  getCode(dataStore.department, 'departmentId', 'departmentCode', pureOrg.departmentId) || pureOrg.departmentId,
  toTeamCode:        getCode(dataStore.team, 'teamId', 'teamCode', pureOrg.teamId) || pureOrg.teamId,
  toJobCode:         pureOrg.jobCode || current.jobCode,
  toPositionCode:    pureOrg.positionCode || current.positionCode,
  toRankCode:        pureOrg.rankCode || current.rankCode,

  appointmentStatus: '대기',
  isApplied: false
}


  console.log('▶ 전송 payload:', payload);

  try {
    await axios.post(
      'http://localhost:5000/appointment/create',
      payload,
      { headers: { 'Content-Type': 'application/json' } }
    );
    showToast('등록 성공!');
    router.push('/org/appointment');
  } catch (err) {
    console.error('▶ AxiosError:', err);
    showToast(
      `등록 중 오류가 발생했습니다.\n` +
      `${err.response?.data?.message || err.message}`
    );
  }
}


function cancel() {
  router.back()
}
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
.back-btn {
  width: 24px;
  height: 24px;
  margin-right: -10px;
  cursor: pointer;
}

.content-box {
  background: var(--bg-box);
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  margin-left: 20px;
  position: relative;
  padding: 20px 32px 80px; 
}
.register-container {
  width: 80%;
  margin: 0 auto;
  margin-top: 20px;
  margin-bottom: 20px;
}

.form-grid-container {
  display: flex;
  gap: 60px;
  align-items: flex-start;
  margin-bottom: 60px;
  padding: 0 20px;
}

.info-section {
  flex: 1;
  min-width: 300px;
}

.org-section {
  flex: 1;
  min-width: 400px;
  
  margin-top: 65px;
}

.info-section {
  width: 100%;
}
.info-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}
.info-table th,
.info-table td {
  border: 1px solid var(--border-color);
  padding: 12px 12px;
}
.info-table th {
  width: 120px;
  background-color: var(--bg-label-cell);
}
.info-section input[type="text"],
.info-section input[type="date"],
.info-section select {
  width: 100%;
  box-sizing: border-box;
  padding: 8px 12px;
  font-size: 14px;
  border: 2px solid var(--border-color);
  border-radius: 8px;
  outline: none;
  font-family: 'inter';
}
.info-section input[type="text"]:focus,
.info-section input[type="date"]:focus,
.info-section select:focus {
  border: 1px solid black;
}
.info-section input[type="text"]::placeholder {
  color: var(--text-main);
}

.button-group {
  position: absolute;
  bottom: 50px;
  right: 240px;
  display: flex;
  gap: 15px;
}
.btn-save {
  font-size: 14px;
  font-weight: bold;
  background-color: #00a8e8;
  color: white;
  border: 1px solid transparent;
  border-radius: 10px;
  padding: 10px 30px;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: background-color 0.2s, box-shadow 0.2s;
}
.btn-save:hover {
  background-color: white;
  color: #00a8e8;
  border-color: #00a8e8;
  box-shadow: inset 1px 1px 10px rgba(0, 0, 0, 0.25);
}

.btn-cancel {
  font-size: 14px;
  font-weight: bold;
  background-color: #D3D3D3;
  color: #000;
  border: none;
  border-radius: 10px;
  padding: 10px 30px;
  font-weight: bold;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: background-color 0.2s, box-shadow 0.2s;
  box-sizing: border-box;

}
.btn-cancel:hover {
  background-color: #000;
  color: #fff;
}

.select-container {
  display: flex;
  justify-content: flex-start;
  margin-bottom: 15px; 
  margin-top: 15px;
}

.btn-select {
  font-size: 14px;
  font-weight: bold;
  background-color: #00a8e8;
  color: white;
  border: 1px solid transparent;
  border-radius: 10px;
  padding: 10px 16px;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: background-color 0.2s, box-shadow 0.2s;
}

.btn-select:hover {
  background-color: white;
  color: #00a8e8;
  border-color: #00a8e8;
  box-shadow: inset 1px 1px 10px rgba(0, 0, 0, 0.25);
}
</style>
