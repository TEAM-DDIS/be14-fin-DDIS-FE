<template>
  <h1 class="page-title">인사발령</h1>
  <p class="desc">인사발령 등록</p>

  <div class="content-box">
    <div class="register-container">
      <div class="form-grid-container">
        <!-- 1. 기본 정보 -->
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

        <!-- 2. 조직 변경: ag-Grid 사용 -->
        <div class="org-section">
          <AgGridVue
            class="ag-theme-alpine custom-theme"
            :gridOptions="{ theme: 'legacy' }"
            :rowData="rowData"
            :columnDefs="columnDefs"
            :defaultColDef="{ sortable: true, resizable: true }"
            @grid-ready="onGridReady"
            style="width: 100%; height: 340px;"
          />
        </div>
      </div>

      <!-- 3. 버튼 그룹 -->
      <div class="button-group">
        <button class="btn-cancel" @click="cancel">취소</button>
        <button type="button" class="btn-save" @click="submit">저장</button>
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


</template>

<script setup>
import { reactive, ref, watch, onMounted, computed, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import 'core-js/features/array/flat-map'
import { AgGridVue } from 'ag-grid-vue3'
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community'
ModuleRegistry.registerModules([AllCommunityModule])

import GetEmployeeModal from '@/components/org/appointment/GetEmployeeModal.vue'
import OrgSelectorModal from '@/components/org/appointment/OrgSelectorModal.vue'
const showApprovalModal = ref(false)
const employeeList = ref([])

const fullHierarchy = ref([])

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

// 데이터 저장소
const dataStore = reactive({
  headquarters: [],
  department: [],
  team: [],
  job: []
})

// form.org를 대체할 전역변수
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
const orgHeads = ref([])
const departmentsNew = ref([])
const teamsNew = ref([])
const jobsNew = ref([])
const positionsNew = ref([])
const ranksNew     = ref([])

const employeeCache = reactive(new Map())


// 초기 전체 계층 로드
onMounted(async () => {
  try {
    const resp = await axios.get('http://localhost:8000/structure/hierarchy')
    const full = Array.isArray(resp.data) ? resp.data : []

   fullHierarchy.value = full
  //  fullHierarchy.value = resp.data


    // 기존 dataStore 세팅
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


// 모달에서 확인 버튼 눌렀을 때 호출되는 핸들러
async function onApprovalSubmit(selectedList) {
  const stub = selectedList[0]
  if (!stub) return

  // 1) 번호·이름
  form.currentOrg.employeeId   = stub.employeeId
  form.currentOrg.employeeName = stub.employeeName

  // 2) 조직 정보 로드
  await loadEmployeeInfo()
  form.org.headId       = form.currentOrg.headId
  form.org.departmentId = form.currentOrg.departmentId
  form.org.teamId       = form.currentOrg.teamId
  form.org.jobId        = form.currentOrg.jobId
  form.org.positionCode = form.currentOrg.positionCode
  form.org.rankCode     = form.currentOrg.rankCode


  // 3) 모달 닫기
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

  // 그리드에 반영
  gridApi.value.refreshCells({ columns: ['current'], force: true })
}


// 삭제나 추가될 때마다 approverList 를 업데이트 합니다
function onApprovalUpdate(newList) {
  employeeList.value = newList
}


// 발령 조직 watch
// 본부 → 부서
watch(() => form.org.headId, async headId => {
  form.org.departmentId = form.org.teamId = form.org.jobId = form.org.positionCode = form.org.rankCode = null
  departmentsNew.value = teamsNew.value = jobsNew.value = positionsNew.value = ranksNew.value = []
  if (!headId) return gridApi.value.refreshCells({ columns:['new'], force:true })

  const r = await axios.get(`http://localhost:8000/structure/heads/${headId}/departments`)
  departmentsNew.value = r.data
  gridApi.value.refreshCells({ columns:['new'], force:true })
})

// 부서 → 팀
watch(() => form.org.departmentId, async deptId => {
  form.org.teamId = form.org.jobId = form.org.positionCode = form.org.rankCode = null
  teamsNew.value = jobsNew.value = positionsNew.value = ranksNew.value = []
  if (!deptId) return gridApi.value.refreshCells({ columns:['new'], force:true })

  const r = await axios.get(`http://localhost:8000/structure/departments/${deptId}`)
  teamsNew.value = r.data.teams
  gridApi.value.refreshCells({ columns:['new'], force:true })
})

// 팀 → 직무
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

// 직무 → 직책·직급
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
        <button id="openOrgModal" style="margin-left:auto;" class="btn-plus">✚</button>
        <style>
          .btn-plus {
            font-size: 12px;
            background-color: #00a8e8;
            color: white;
            border: 1px solid transparent;
            border-radius: 10px;
            padding: 6px 12px;
            cursor: pointer;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
            transition: background-color 0.2s, color 0.2s, border-color 0.2s, box-shadow 0.2s;
          }

          .btn-plus:hover {
            background-color: white;
            color: #00a8e8;
            border-color: #00a8e8;
            box-shadow: inset 1px 1px 10px rgba(0, 0, 0, 0.25);
          }
        </style>
      </div>
      `
    }
  }
]

// 타입별로 보여줄 조직 단계 키(key) 목록
const typeToKeys = {
  승진:   ['head', 'department', 'team'],               // 승진 시: 본부, 부서
  전보:   ['department', 'team'],               // 전보 시: 부서, 팀
  전직:   ['department', 'team', 'job'],        // 전직 시: 부서, 팀, 직무
  직급조정: ['department', 'team', 'position', 'rank'], // 직급조정: 부서, 팀, 직책
  직무:   ['department', 'team', 'job']         // 직무 변경: 부서, 팀, 직무
}

const showRanks = computed(() => {
  const keys = typeToKeys[form.type] || []
  return keys.includes('rank')
})
const showJobs = computed(() => {
  const keys = typeToKeys[form.type] || []
  return keys.includes('job')
})

// form.type이 바뀔 때마다 rowData 초기화
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




function handleOrgSelected(selected) {
  // form.org.headId = selected.headId || null
  // form.org.departmentId = selected.departmentId || null
  // form.org.teamId = selected.teamId || null
  // form.org.jobId = selected.jobId || null
  // form.org.jobCode = selected.jobCode || null
  // form.org.positionCode = selected.positionCode || null
  // form.org.rankCode = selected.rankCode || null
  // form.org.rankName = selected.rankName || null

  // // ✅ 추가: 직무 목록 갱신
  // // jobsNew.value = [{
  // //   jobId: selected.jobId,
  // //   jobName: selected.jobName,
  // //   jobCode: selected.jobCode
  // // }]

  // // ranksNew.value = [{
  // //   rankCode: selected.rankCode,
  // //   rankName: selected.rankName
  // // }]

  //   jobsNew.value = selected.jobId ? [{
  //   jobId: selected.jobId,
  //   jobName: selected.jobName,
  //   jobCode: selected.jobCode
  // }] : []

  // ranksNew.value = selected.rankCode ? [{
  //   rankCode: selected.rankCode,
  //   rankName: selected.rankName
  // }] : []

    pureOrg.headId        = selected.headId || null
  pureOrg.departmentId  = selected.departmentId || null
  pureOrg.teamId        = selected.teamId || null
  pureOrg.jobId         = selected.jobId || null
  pureOrg.jobCode       = selected.jobCode || null
  pureOrg.positionCode  = selected.positionCode || null
  pureOrg.rankCode      = selected.rankCode || null

  // 기존 form.org 갱신은 제거 가능
  // form.org = { ...pureOrg } 등으로 연결할 수도 있음

  // 선택된 job, rank 이름 저장용
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


  // 🔥 선택한 조직명 grid 반영
  syncOrgToGrid()

  console.log('[form.org 저장된 값]', JSON.stringify(form.org, null, 2))

  showOrgSelectorModal.value = false
}


function handleRankSelected(rank) {
  // rank = { rankId, rankName }
  form.org.rankCode = rank.rankId
  // 그리드 “new” 쪽에 반영
  syncOrgToGrid()
}



function makeSelect(params, context) {
  const key = params.data.key

  // 👉 발령 조직: readOnlyInput만
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

  // 👉 현재 소속 조직: 그대로 유지
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

  // 헤더의 + 버튼에 클릭 이벤트 연결
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


    // form.org의 Proxy 문제를 회피하기 위해 얕은 복사
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
      'http://localhost:8000/appointment/create',
      payload,
      { headers: { 'Content-Type': 'application/json' } }
    );
    alert('등록 성공!');
    router.push('/org/appointment');
  } catch (err) {
    console.error('▶ AxiosError:', err);
    alert(
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

/* 전체 컨테이너 */
.content-box {
  background: #fff;
  border-radius: 12px;
  padding: 20px 32px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  margin: 24px;
}
.register-container {
  /* width: 60%; */
  margin: 0 auto;
  margin-top: 20px;
  margin-bottom: 20px;
}

.form-grid-container {
  display: flex;
  gap: 60px;
  align-items: flex-start;
  margin-bottom: 20px;
  padding: 0 20px;
}

/* 왼쪽 테이블 영역 너비 */
.info-section {
  flex: 1;
  min-width: 300px;
}

/* 오른쪽 ag-Grid 영역 너비 */
.org-section {
  flex: 1.5;               /* 왼쪽의 두 배 너비 */
  min-width: 400px;
  height: 350px;         /* 필요에 따라 조절 */
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
  margin-top: 60px;
  margin-bottom: 40px;
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

  display: flex;
  justify-content: flex-end;
  float: right;
}
.btn-cancel:hover {
  background-color: #000;
  color: #fff;
}

.select-container {
  display: flex;
  justify-content: flex-start;
  margin-bottom: 15px; /* 테이블과 버튼 사이 간격 */
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
