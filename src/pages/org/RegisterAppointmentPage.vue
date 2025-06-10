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
            <td>
              <input
                v-model="form.name"
                @blur="loadEmployeeInfo"
                type="text"
                placeholder="사원번호를 입력하세요"
              />
            </td>
          </tr>
          <tr>
            <th>발령제목</th>
            <td>
              <input
                v-model="form.title"
                type="text"
                placeholder="발령제목을 입력하세요"
              />
            </td>
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
            <td>
              <input
                v-model="form.effectiveDate"
                type="date"
              />
            </td>
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
          style="width: 100%; height: 400px;"
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
    jobCode: null,
    positionCode: null,
    rankCode: null
  },
  org: { 
    headId: null, 
    departmentId: null, 
    teamId: null, 
    jobId: null, 
    positionCode: null,
    rankCode: null
  }
})

// 데이터 저장소
const dataStore = reactive({
  headquarters: [],
  department: [],
  team: [],
  job: []
})
const currentHeads = ref([])
const jobsCurrent = ref([])
const positionsCurrent = ref([])
const ranksCurrent = ref([])
const orgHeads = ref([])
const departmentsNew = ref([])
const teamsNew = ref([])
const jobsNew = ref([])
const positionsNew = ref([])
const ranksNew     = ref([])

const employeeCache = reactive(new Map())


// 초기 전체 계층 로드
onMounted(async () => {
  const res = await axios.get('http://localhost:8000/structure/heads')
  orgHeads.value = res.data
  try {
    const resp = await axios.get('http://localhost:8000/structure/hierarchy')
    const full = Array.isArray(resp.data) ? resp.data : []
    dataStore.headquarters = full.map(h => ({ headId: h.headId, headName: h.headName, headCode: h.headCode }))
    dataStore.department   = full.flatMap(h => (h.departments||[]).map(d => ({ departmentId: d.departmentId, departmentName: d.departmentName, departmentCode: d.departmentCode, headId: h.headId })))
    dataStore.team         = full.flatMap(h => (h.departments||[]).flatMap(d => (d.teams||[]).map(t => ({ teamId: t.teamId, teamName: t.teamName, teamCode: t.teamCode, departmentId: d.departmentId }))))
    dataStore.job          = full.flatMap(h => (h.departments||[]).flatMap(d => (d.teams||[]).flatMap(t => (t.jobs||[]).map(j => ({ jobId: j.jobId, jobName: j.jobName, jobCode: j.jobCode, teamId: t.teamId })))) )
    currentHeads.value     = dataStore.headquarters
    await nextTick()
    gridApi.value?.refreshCells({ columns: ['current', 'new'], force: true })
  } catch (e) {
    console.error('hierarchy 로드 실패', e)
  }
})

// Employee 정보 로드
async function loadEmployeeInfo() {
  if (!form.name) return

  const id = String(form.name)
  let emp = employeeCache.get(id)

  if (!emp) {
    try {
      const res = await axios.get(`http://localhost:8000/introduction/employee/${id}`)
      emp = res.data
      employeeCache.set(id, emp)     // 캐시에 저장
    } catch {
      alert('사원정보를 불러오는 중 오류가 발생했습니다.')
      return
    }
  }

  // emp 가 확보됐으면, 기존 로직 수행
  form.currentOrg.headId       = emp.headId
  form.currentOrg.departmentId = emp.departmentId
  form.currentOrg.teamId       = emp.teamId
  form.currentOrg.jobId        = emp.jobId
  form.currentOrg.jobCode      = emp.jobCode
  form.currentOrg.positionCode = emp.positionCode
  form.currentOrg.rankCode     = emp.rankCode

  jobsCurrent.value = [{ jobId: emp.jobId, jobName: emp.jobName, jobCode: emp.jobCode }]
  positionsCurrent.value = [{ positionCode: emp.positionCode, positionName: emp.positionName }]
  ranksCurrent.value     = [{ rankCode: emp.rankCode, rankName: emp.rankName }]

  await nextTick()
  gridApi.value.refreshCells({ columns: ['current'], force: true })
}


const filteredDepartmentsCurrent = computed(() =>
  dataStore.department.filter(d => d.headId === form.currentOrg.headId)
)
const filteredTeamsCurrent = computed(() =>
  dataStore.team.filter(t => t.departmentId === form.currentOrg.departmentId)
)

// 워치로 각 선택 리셋
watch(() => form.currentOrg.headId, () => {
  form.currentOrg.departmentId = null; form.currentOrg.teamId = null; form.currentOrg.jobId = null;
  jobsCurrent.value = []; positionsCurrent.value = []; ranksCurrent.value = [];
  gridApi.value?.refreshCells({ columns: ['current'], force: true })
})
watch(() => form.currentOrg.departmentId, () => {
  form.currentOrg.teamId = null; form.currentOrg.jobId = null;
  jobsCurrent.value = [];
  gridApi.value?.refreshCells({ columns: ['current'], force: true })
})
watch(() => form.currentOrg.teamId, async id => {
  form.currentOrg.jobId = null; jobsCurrent.value = [];
  if (id) {
    const res = await axios.get(`http://localhost:8000/introduction/team/${id}/job`)
    jobsCurrent.value = Array.isArray(res.data)
      ? res.data.map(j => ({ jobId: j.jobId, jobName: j.jobName, jobCode: j.jobCode }))
      : []
  }
  gridApi.value?.refreshCells({ columns: ['current'], force: true })
})
// 1) form.org.teamId 변경 시 직무 로드 (기존)
watch(() => form.org.teamId, async teamId => {
  jobsNew.value = []
  form.org.jobId = null
  if (teamId) {
    const res = await axios.get(`http://localhost:8000/introduction/team/${teamId}/job`)
    jobsNew.value = Array.isArray(res.data)
      ? res.data.map(j => ({ jobId: j.jobId, jobName: j.jobName, jobCode: j.jobCode }))
      : []
  }
  gridApi.value?.refreshCells({ columns:['new'], force:true })
})

// → 여기에 이어서 “직책” 호출
watch(() => form.org.jobId, async jobId => {
  positionsNew.value = []
  ranksNew.value     = []
  form.org.positionCode = null
  form.org.rankCode     = null

  if (jobId) {
    // 예: teamId → 가능한 직책·직급을 가져오는 API
    const [posRes, rankRes] = await Promise.all([
      axios.get(`http://localhost:8000/introduction/job/${jobId}/positions`),
      axios.get(`http://localhost:8000/introduction/job/${jobId}/ranks`)
    ])
    positionsNew.value = Array.isArray(posRes.data)
      ? posRes.data.map(p => ({ positionCode: p.positionCode, positionName: p.positionName }))
      : []
    ranksNew.value = Array.isArray(rankRes.data)
      ? rankRes.data.map(r => ({ rankCode: r.rankCode, rankName: r.rankName }))
      : []
  }
  gridApi.value?.refreshCells({ columns:['new'], force:true })
})

// 2) 본부 → 부서
watch(() => form.org.headId, async headId => {
  form.org.departmentId = form.org.teamId = form.org.jobId = form.org.positionCode = form.org.rankCode = null
  departmentsNew.value = teamsNew.value = jobsNew.value = positionsNew.value = ranksNew.value = []
  if (!headId) return gridApi.value.refreshCells({ columns:['new'], force:true })

  const r = await axios.get(`http://localhost:8000/structure/heads/${headId}/departments`)
  departmentsNew.value = r.data
  gridApi.value.refreshCells({ columns:['new'], force:true })
})

// 3) 부서 → 팀
watch(() => form.org.departmentId, async deptId => {
  form.org.teamId = form.org.jobId = form.org.positionCode = form.org.rankCode = null
  teamsNew.value = jobsNew.value = positionsNew.value = ranksNew.value = []
  if (!deptId) return gridApi.value.refreshCells({ columns:['new'], force:true })

  const r = await axios.get(`http://localhost:8000/structure/departments/${deptId}`)
  teamsNew.value = r.data.teams
  gridApi.value.refreshCells({ columns:['new'], force:true })
})

// 4) 팀 → 직무
watch(() => form.org.teamId, async teamId => {
  form.org.jobId = form.org.positionCode = form.org.rankCode = null
  jobsNew.value = positionsNew.value = ranksNew.value = []
  if (!teamId) return gridApi.value.refreshCells({ columns:['new'], force:true })

  const r = await axios.get(`http://localhost:8000/introduction/team/${teamId}/job`)
  jobsNew.value = r.data.map(j => ({
    jobId: j.jobId, jobName: j.jobName, jobCode: j.jobCode
  }))
  gridApi.value.refreshCells({ columns:['new'], force:true })
})

// 5) 직무 → 직책·직급
watch(() => form.org.jobId, async jobId => {
  form.org.positionCode = form.org.rankCode = null
  positionsNew.value = ranksNew.value = []
  if (jobId) {
    const [posRes, rankRes] = await Promise.all([
      axios.get(`http://localhost:8000/introduction/job/${jobId}/positions`),
      axios.get(`http://localhost:8000/introduction/job/${jobId}/ranks`)
    ])
    positionsNew.value = posRes.data
    ranksNew.value = rankRes.data
  }
  gridApi.value?.refreshCells({ columns: ['new'], force: true })
})


// ag-Grid 설정: position, rank 칼럼 추가
const orgFields = {
  head: '소속 본부',
  department: '소속 부서',
  team: '소속 팀',
  job: '소속 직무',
  position: '소속 직책',
  rank: '소속 직급'
}
const rowData = reactive([])
const defaultColDef = { resizable: true, sortable: true }
const columnDefs = [
  { field: 'label', headerName: '항목', flex: 1, editable: false },
  { field: 'current', headerName: '현재 소속 조직', flex: 3, cellRenderer: params => makeSelect(params, 'currentOrg') },
  { field: 'new', headerName: '발령 조직', flex: 3, cellRenderer: params => makeSelect(params, 'org') }
]

function makeSelect(params, context) {
  const key = params.data.key
  const sel = document.createElement('select')
  sel.style.width = '100%'
  sel.appendChild(new Option('선택', ''))

  let list = []
  if (context === 'currentOrg') {
    if (key === 'head') list = currentHeads.value
    else if (key === 'department') list = filteredDepartmentsCurrent.value
    else if (key === 'team') list = filteredTeamsCurrent.value
    else if (key === 'job') list = jobsCurrent.value
    else if (key === 'position') list = positionsCurrent.value
    else if (key === 'rank') list = ranksCurrent.value
  } else {
    if (key==='head')       list = orgHeads.value
    else if (key==='department') list = departmentsNew.value
    else if (key==='team')       list = teamsNew.value
    else if (key==='job')        list = jobsNew.value
    else if (key==='position')   list = positionsNew.value
    else if (key==='rank')       list = ranksNew.value
  }

  const idKey =
    key === 'position'
      ? 'positionCode'
      : key === 'rank'
      ? 'rankCode'
      : key + 'Id'
  const labelKey =
    key === 'position'
      ? 'positionName'
      : key === 'rank'
      ? 'rankName'
      : key + 'Name'

  list.forEach(item => {
    const opt = new Option(item[labelKey], item[idKey])
    if (String(item[idKey]) === String(form[context][idKey])) opt.selected = true
    sel.appendChild(opt)
  });

  sel.value = form[context][idKey] || '';

  sel.onchange = e => {
        form[context][idKey] = e.target.value || null
    // **jobCode, positionCode, rankCode** 도 함께 세팅
    if (context === 'currentOrg' && key === 'job') {
      const chosen = list.find(x => String(x[idKey]) === e.target.value)
      form.currentOrg.jobCode = chosen?.jobCode || null
    }
    gridApi.value.refreshCells({ force: true })
  }

  return sel
}

function onGridReady(params) {
  gridApi.value = params.api
  rowData.length = 0
  Object.entries(orgFields).forEach(([key, label]) =>
    rowData.push({ key, label, current: null, new: null })
  )
}

async function submit() {
  // 0) 직원 정보 준비 여부 확인
  if (!form.currentOrg.jobId) {
    alert('직원 정보가 아직 로드되지 않았습니다.\n사원번호 입력 후 잠시 기다려주세요.');
    return;
  }

  try {
    // --- 1) employeeId, 기본 정보 ---
    const employeeId = Number(form.name);
    const appointmentReason = form.title;
    const appointmentType = form.type;
    const appointmentEffectiveDate = form.effectiveDate;

    // --- 2) helper: id → code ---
    const findById = (arr, idKey, codeKey) => id => {
      const it = arr.find(x => String(x[idKey]) === String(id));
      return it ? it[codeKey] : null;
    };

    // currentOrg 코드 매핑 함수들
    const headCodeFrom     = findById(dataStore.headquarters, 'headId', 'headCode');
    const deptCodeFrom     = findById(dataStore.department,    'departmentId', 'departmentCode');
    const teamCodeFrom     = findById(dataStore.team,          'teamId', 'teamCode');
    const jobCodeFrom      = findById(jobsCurrent.value,       'jobId', 'jobCode');      // ← 여기!
    const positionCodeFrom = findById(positionsCurrent.value,  'positionCode', 'positionCode');
    const rankCodeFrom     = findById(ranksCurrent.value,      'rankCode', 'rankCode');

    // org (to) 코드 매핑 함수들
    const headCodeTo       = findById(orgHeads.value,         'headId', 'headCode');
    const deptCodeTo       = findById(departmentsNew.value,   'departmentId', 'departmentCode');
    const teamCodeTo       = findById(teamsNew.value,         'teamId', 'teamCode');
    const jobCodeTo        = findById(jobsNew.value,          'jobId', 'jobCode');
    const positionCodeTo   = findById(positionsNew.value,     'positionCode', 'positionCode');
    const rankCodeTo       = findById(ranksNew.value,         'rankCode', 'rankCode');

    // --- 3) payload 조립 ---
    const payload = {
      // employeeId,

      // fromHeadCode:       headCodeFrom(form.currentOrg.headId),
      // fromDepartmentCode: deptCodeFrom(form.currentOrg.departmentId),
      // fromTeamCode:       teamCodeFrom(form.currentOrg.teamId),
      // fromJobCode:        jobCodeFrom(form.currentOrg.jobId),         // ← 여기!
      // fromPositionCode:   positionCodeFrom(form.currentOrg.positionCode),
      // fromRankCode:       rankCodeFrom(form.currentOrg.rankCode),

      // toHeadCode:         headCodeTo(form.org.headId),
      // toDepartmentCode:   deptCodeTo(form.org.departmentId),
      // toTeamCode:         teamCodeTo(form.org.teamId),
      // toJobCode:          jobCodeTo(form.org.jobId),
      // toPositionCode:     positionCodeTo(form.org.positionCode),
      // toRankCode:         rankCodeTo(form.org.rankCode),

      // appointmentReason,
      // appointmentType,
      // appointmentEffectiveDate,

      // // NotNull 제약 채우기
      // appointmentStatus: '대기',
      // isApplied: false

      employeeId: Number(form.name),
      appointmentReason: form.title,
      appointmentType: form.type,
      appointmentEffectiveDate: form.effectiveDate,

      // 3) “from” 조직 코드는 이미 로드 시점에 채워둔 jobCode, positionCode, rankCode를 바로 사용
      fromHeadCode:       dataStore.headquarters.find(h => h.headId === form.currentOrg.headId)?.headCode     || null,
      fromDepartmentCode: dataStore.department   .find(d => d.departmentId === form.currentOrg.departmentId)?.departmentCode || null,
      fromTeamCode:       dataStore.team         .find(t => t.teamId === form.currentOrg.teamId)?.teamCode     || null,
      fromJobCode:        form.currentOrg.jobCode,     // ← 여기만 직접 꺼내 쓰면 null 이 안 됩니다
      fromPositionCode:   form.currentOrg.positionCode,
      fromRankCode:       form.currentOrg.rankCode,

      // 4) “to” 조직 코드는 findById 를 써도 좋습니다
      toHeadCode:         orgHeads.value.find(h => h.headId === form.org.headId)?.headCode                 || null,
      toDepartmentCode:   departmentsNew.value.find(d => d.departmentId === form.org.departmentId)?.departmentCode || null,
      toTeamCode:         teamsNew.value.find(t => t.teamId === form.org.teamId)?.teamCode                 || null,
      toJobCode:          jobsNew.value.find(j => j.jobId === form.org.jobId)?.jobCode                    || null,
      toPositionCode:     form.org.positionCode,
      toRankCode:         form.org.rankCode,

      // 5) NotNull 제약 채우기
      appointmentStatus: '대기',
      isApplied: false
    };

    // --- 4) API 호출 ---
    await axios.post('http://localhost:8000/appointment/create', payload);

    alert('등록 성공!');
    router.back();

  } catch (err) {
    console.error('등록 실패', err);
    alert('등록 중 오류가 발생했습니다.');
  }
}


// 코드 찾기 헬퍼
const findCode = (arr, id, codeKey) => {
  const it = arr.find(x => String(Object.values(x)[0]) === String(id))
  return it ? it[codeKey] : null
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