<template>
  <h1 class="page-title">인사발령</h1>
  <p class="desc">인사발령 등록</p>

  <div class="content-box">
    <div class="register-container">
      <!-- 1. 기본 정보 -->
      <div class="info-section">
        <table class="info-table">
          <tr>
            <th>사원번호</th>
            <td><input v-model="form.name" type="text" placeholder="사원번호를 입력하세요" /></td>
          </tr>
          <tr>
            <th>발령제목</th>
            <td><input v-model="form.title" type="text" placeholder="발령제목을 입력하세요" /></td>
          </tr>
          <tr>
            <th>발령유형</th>
            <td>
              <select v-model="form.type">
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
            <td><input v-model="form.effectiveDate" type="date" /></td>
          </tr>
        </table>
      </div>

      <!-- 2. 조직 변경: ag-Grid 사용 -->
      <div class="org-section">
        <AgGridVue
          class="ag-theme-alpine custom-theme"
          :gridOptions="{ theme: 'legacy' }"
          :rowData="rowData"
          :columnDefs="columnDefs"
          :defaultColDef="defaultColDef"
          @grid-ready="onGridReady"
          style="width: 100%; height: 340px;"
        />
      </div>

      <!-- 3. 버튼 그룹 -->
      <div class="button-group">
        <button class="btn-cancel" @click="cancel">취소</button>
        <button class="btn-save" @click="submit">저장</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, watch, onMounted, computed, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { AgGridVue } from 'ag-grid-vue3'
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community'
ModuleRegistry.registerModules([AllCommunityModule])

const router = useRouter()
const gridApi = ref(null)

// ── 폼 상태 ──────────────────────────────────────────────────
const form = reactive({
  name: '',
  title: '',
  type: '승진',
  effectiveDate: '',
  currentOrg: { headId: null, departmentId: null, teamId: null, jobId: null },
  org:        { headId: null, departmentId: null, teamId: null, jobId: null }
})

// ── 1) 현재 조직(currentOrg): 전체 계층 1회 로드 + computed 필터 ─────────
const dataStore = reactive({
  headquarters: [],
  department:   [],
  team:         [],
  job:          []
})
const currentHeads = ref([])

onMounted(async () => {
  try {
    const resp = await axios.get('http://localhost:8000/structure/hierarchy')
    const full = Array.isArray(resp.data) ? resp.data : []
    if (!Array.isArray(resp.data)) {
      console.warn('Expected hierarchy array but got:', resp.data)
    }

    // 본부
    dataStore.headquarters = full.map(h => ({
      headId:   h.headId,
      headName: h.headName,
      headCode: h.headCode
    }))
    currentHeads.value = dataStore.headquarters

    // 부서
    dataStore.department = full.flatMap(h =>
      (Array.isArray(h.departments) ? h.departments : []).map(d => ({
        departmentId:   d.departmentId,
        departmentName: d.departmentName,
        headId:         h.headId
      }))
    )
    // 팀
    dataStore.team = full.flatMap(h =>
      (Array.isArray(h.departments) ? h.departments : []).flatMap(d =>
        (Array.isArray(d.teams) ? d.teams : []).map(t => ({
          teamId:       t.teamId,
          teamName:     t.teamName,
          departmentId: d.departmentId
        }))
      )
    )
    // 직무
    dataStore.job = full.flatMap(h =>
      (Array.isArray(h.departments) ? h.departments : []).flatMap(d =>
        (Array.isArray(d.teams) ? d.teams : []).flatMap(t =>
          (Array.isArray(t.jobs) ? t.jobs : []).map(j => ({
            jobId:   j.jobId,
            jobName: j.jobName,
            teamId:  t.teamId
          }))
        )
      )
    )
        // 2) hierarchy가 로드된 직후에
    //    “현재 조직” 컬럼만 새로 그려 주기
    await nextTick()
    gridApi.value?.refreshCells({
      columns: ['current'],
      force:   true
    })
  } catch (e) {
    console.error('현재조직 hierarchy 로드 실패', e)
  }
})

const filteredDepartmentsCurrent = computed(() =>
  dataStore.department.filter(d => d.headId === form.currentOrg.headId)
)
const filteredTeamsCurrent = computed(() =>
  dataStore.team.filter(t => t.departmentId === form.currentOrg.departmentId)
)
const filteredJobsCurrent = computed(() =>
  dataStore.job.filter(j => j.teamId === form.currentOrg.teamId)
)

// ── 2) 발령 조직(org): 단계별 API + watcher ─────────────────────────
const orgHeads       = ref([])
const departmentsNew = ref([])
const teamsNew       = ref([])
const jobsNew        = ref([])

onMounted(async () => {
  try {
    const resp = await axios.get('http://localhost:8000/structure/heads')
    orgHeads.value = Array.isArray(resp.data) ? resp.data : []
    if (!Array.isArray(resp.data)) {
      console.warn('Expected heads array but got:', resp.data)
    }
  } catch (e) {
    console.error('발령조직 본부 로드 실패', e)
  }
})

watch(() => form.org.headId, async headId => {
  // 초기화…
  departmentsNew.value = []
  teamsNew.value       = []
  jobsNew.value        = []
  form.org.departmentId = null
  form.org.teamId       = null
  form.org.jobId        = null

  if (!headId) {
    gridApi.value?.refreshCells({ force: true })
    return
  }

  try {
    const resp = await axios.get(
      `http://localhost:8000/structure/heads/${headId}/departments`
    )
    departmentsNew.value = Array.isArray(resp.data) ? resp.data : []
  } catch (e) {
    console.error('발령조직 부서 로드 실패', e)
  } finally {
    // 발령 조직(new) 컬럼만 다시 렌더링
    gridApi.value?.refreshCells({
      columns: ['new'],   // field 속성명이 “new”인 컬럼만
      force:   true
    })
  }
})

watch(() => form.org.departmentId, async deptId => {
  teamsNew.value = []
  jobsNew.value  = []
  form.org.teamId = null
  form.org.jobId  = null

  if (!deptId) {
    gridApi.value?.refreshCells({ force: true })
    return
  }

  try {
    const resp = await axios.get(
      `http://localhost:8000/structure/departments/${deptId}`
    )
    teamsNew.value = Array.isArray(resp.data.teams) ? resp.data.teams : []
  } catch (e) {
    console.error('발령조직 팀 로드 실패', e)
  } finally {
    gridApi.value?.refreshCells({
      columns: ['new'],
      force:   true
    })
  }
})

// 4) 팀 선택 시 ▶ 직무 조회
watch(() => form.org.teamId, async teamId => {
  jobsNew.value = []
  form.org.jobId = null

  if (!teamId) {
    gridApi.value?.refreshCells({ force: true })
    return
  }

  try {
    const resp = await axios.get(
      `http://localhost:8000/structure/teams/${teamId}/jobs`
    )
    jobsNew.value = Array.isArray(resp.data) ? resp.data : []
  } catch (e) {
    console.error('발령조직 직무 로드 실패', e)
  } finally {
    gridApi.value?.refreshCells({
      columns: ['new'],
      force:   true
    })
  }
})

// ── ag-Grid 설정 ───────────────────────────────────────────────
const orgFields = {
  head:       '소속 본부',
  department: '소속 부서',
  team:       '소속 팀',
  job:        '소속 직무'
}
const rowData = reactive([])
const defaultColDef = { resizable: true, sortable: true }
const columnDefs = [
  { field: 'label', headerName: '항목', flex: 1, editable: false },
  {
    field: 'current',
    headerName: '현재 소속 조직',
    flex: 2,
    cellRenderer: params => makeSelect(params, 'currentOrg')
  },
  {
    field: 'new',
    headerName: '발령 조직',
    flex: 3,
    cellRenderer: params => makeSelect(params, 'org')
  }
]

function makeSelect(params, context) {
  const key = params.data.key
  const select = document.createElement('select')
  select.style.width = '100%'
  select.appendChild(new Option('선택', ''))

  let list = []
  if (context === 'currentOrg') {
    if (key === 'head')       list = Array.isArray(currentHeads.value) ? currentHeads.value : []
    else if (key === 'department') list = Array.isArray(filteredDepartmentsCurrent.value) ? filteredDepartmentsCurrent.value : []
    else if (key === 'team')       list = Array.isArray(filteredTeamsCurrent.value) ? filteredTeamsCurrent.value : []
    else if (key === 'job')        list = Array.isArray(filteredJobsCurrent.value) ? filteredJobsCurrent.value : []
  } else {
    if (key === 'head')       list = Array.isArray(orgHeads.value) ? orgHeads.value : []
    else if (key === 'department') list = Array.isArray(departmentsNew.value) ? departmentsNew.value : []
    else if (key === 'team')       list = Array.isArray(teamsNew.value) ? teamsNew.value : []
    else if (key === 'job')        list = Array.isArray(jobsNew.value) ? jobsNew.value : []
  }

  console.log(`makeSelect(${context}, ${key}) → list:`, list)

  const idKey    = key === 'head' ? 'headId'
                   : key === 'department' ? 'departmentId'
                   : key === 'team'       ? 'teamId'
                                          : 'jobId'
  const labelKey = key === 'head'       ? 'headName'
                   : key === 'department' ? 'departmentName'
                   : key === 'team'       ? 'teamName'
                                          : 'jobName'

  list.forEach(item => {
    const opt = new Option(item[labelKey], item[idKey])
    if (String(item[idKey]) === String(form[context][idKey])) {
      opt.selected = true
    }
    select.appendChild(opt)
  })

  select.onchange = e => {
    const v = e.target.value ? Number(e.target.value) : null
    form[context][idKey] = v
    if (context === 'org') {
      if (key === 'head')       { form.org.departmentId = null; form.org.teamId = null; form.org.jobId = null }
      if (key === 'department') { form.org.teamId = null; form.org.jobId = null }
      if (key === 'team')       { form.org.jobId = null }
    }
    gridApi.value.refreshCells({ force: true })
  }

  return select
}

function onGridReady(params) {
  gridApi.value = params.api
  rowData.length = 0
  Object.entries(orgFields).forEach(([key, label]) =>
    rowData.push({ key, label, current: null, new: null })
  )
}

async function submit() {
  // TODO: payload 구성 → axios.post / put
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

/* 전체 컨테이너 */
.content-box {
  background: #fff;
  border-radius: 12px;
  padding: 20px 32px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  margin: 24px;
}
.register-container {
  width: 60%;
  margin: 0 auto;
  margin-top: 20px;
  margin-bottom: 20px;
}
/* 정보 입력 섹션 */
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
  border: 1px solid #c8c8c8;
  padding: 12px 12px;
}
.info-table th {
  width: 120px;
  background: #f8f9fa;
}
.info-section input[type="text"],
.info-section input[type="date"],
.info-section select {
  width: 100%;
  box-sizing: border-box;
  padding: 8px 12px;
  font-size: 14px;
  border: 2px solid #c8c8c8;
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
  color: #555;
}

/* 조직 그리드 섹션 */
.org-section {
  width: 100%;
  margin: 0 auto;
  margin-top: 20px;
  margin-bottom: 20px;
}

/* 버튼 그룹 */
.button-group {
  display: flex;
  gap: 100px;
  justify-content: center;
  margin-top: 40px;
  margin-bottom: 20px;
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
</style>