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

</template>

<script setup>
import { reactive, ref, watch, onMounted, computed, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import 'core-js/features/array/flat-map'
import { AgGridVue } from 'ag-grid-vue3'
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community'
ModuleRegistry.registerModules([AllCommunityModule])

import debounce from 'lodash/debounce';

// 모달 표시 플래그 & 결재선 리스트
import GetEmployeeModal from '@/components/org/appointment/GetEmployeeModal.vue'
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
  { field: 'new', headerName: '발령 조직', flex: 1.8, cellRenderer: params => makeSelect(params, 'org') }
]

// 타입별로 보여줄 조직 단계 키(key) 목록
const typeToKeys = {
  승진:   ['head', 'department'],               // 승진 시: 본부, 부서
  전보:   ['department', 'team'],               // 전보 시: 부서, 팀
  전직:   ['department', 'team', 'job'],        // 전직 시: 부서, 팀, 직무
  직급조정: ['department', 'team', 'position'], // 직급조정: 부서, 팀, 직책
  직무:   ['department', 'team', 'job']         // 직무 변경: 부서, 팀, 직무
}

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



function makeSelect(params, context) {
  const key = params.data.key

    if (context === 'org') {
    const ok = {
      head:       () => !!form.currentOrg.employeeId,   // 사원 선택 후에만
      department: () => !!form.org.headId,              // 본부 선택 후에만
      team:       () => !!form.org.departmentId,        // 부서 선택 후에만
      job:        () => !!form.org.teamId,              // 팀 선택 후에만
      position:   () => !!form.org.jobId,               // 직무 선택 후에만
      rank:       () => !!form.org.positionCode         // 직책 선택 후에만
    }[ key ]?.();

    if (!ok) {
      // 이전 단계가 안 채워져 있으면 빈 readonly input 리턴
      return (() => {
        const inp = document.createElement('input');
        inp.type = 'text';
        inp.readOnly = true;
        inp.value = '';
        inp.style.width = '95%';
        inp.style.height = '70%';
        inp.style.border = '2px solid #eee';
        inp.style.borderRadius = '8px'
        inp.style.background = '#f9f9f9';
        return inp;
      })();
    }
  }

  // 현재 소속 조직은 텍스트 표시
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

      // 포커스 됐을 때
      input.addEventListener('focus', () => {
        input.style.border = '1px solid #000'
        input.style.outline = 'none'
      })

      // 포커스 벗어났을을 때
      input.addEventListener('blur', () => {
        input.style.border = '2px solid #c8c8c8'
      })
      return input
    }
    if (key === 'head')
      return readOnlyInput(
        dataStore.headquarters.find(h => h.headId === form.currentOrg.headId)?.headName
      )
    else if (key === 'department')
      return readOnlyInput(
        dataStore.department.find(d => d.departmentId === form.currentOrg.departmentId)?.departmentName
      )
    else if (key === 'team')
      return readOnlyInput(
        dataStore.team.find(t => t.teamId === form.currentOrg.teamId)?.teamName
      )
    else if (key === 'job')
      return readOnlyInput(
        jobsCurrent.value[0]?.jobName
      )
    else if (key === 'position')
      return readOnlyInput(
        positionsCurrent.value[0]?.positionName
      )
    else if (key === 'rank')
      return readOnlyInput(
        ranksCurrent.value[0]?.rankName
      )

    const span = document.createElement('span')
    span.textContent = text
    return span
  }


  // 발령 조직은 드롭다운 표시
  const sel = document.createElement('select')
  sel.style.width = '100%'
  sel.appendChild(new Option('선택', ''))

  let list = []
  if (key==='head')       list = orgHeads.value
  else if (key==='department') list = departmentsNew.value
  else if (key==='team')       list = teamsNew.value
  else if (key==='job')        list = jobsNew.value
  else if (key==='position')   list = positionsNew.value
  else if (key==='rank')       list = ranksNew.value

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

  fillCurrentOrgCells()
}

// async function submit() {

//     // --- helper: id → code 매핑 함수 추가 ---
//   const findById = (arr, idKey, codeKey) => id => {
//     const it = arr.find(x => String(x[idKey]) === String(id));
//     return it ? it[codeKey] : null;
//   };

//   const headCodeFrom    = findById(dataStore.headquarters,'headId',   'headCode');
//   const deptCodeFrom    = findById(dataStore.department,   'departmentId','departmentCode');
//   const teamCodeFrom    = findById(dataStore.team,         'teamId',   'teamCode');

//   const headCodeTo      = findById(orgHeads.value,        'headId',   'headCode');
//   const deptCodeTo      = findById(departmentsNew.value,  'departmentId','departmentCode');
//   const teamCodeTo      = findById(teamsNew.value,        'teamId',   'teamCode');
//   const jobCodeTo       = findById(jobsNew.value,         'jobId',    'jobCode');

//   const payload = {
//     employeeId: Number(form.name),
//     appointmentReason: form.title,
//     appointmentType: form.type,
//     appointmentEffectiveDate: form.effectiveDate,

//     fromHeadCode:      headCodeFrom(form.currentOrg.headId),
//     fromDepartmentCode:deptCodeFrom(form.currentOrg.departmentId),
//     fromTeamCode:      teamCodeFrom(form.currentOrg.teamId),
//     fromJobCode:       form.currentOrg.jobCode,
//     fromPositionCode:  form.currentOrg.positionCode,
//     fromRankCode:      form.currentOrg.rankCode,

//     toHeadCode:        headCodeTo(form.org.headId),
//     toDepartmentCode:  deptCodeTo(form.org.departmentId),
//     toTeamCode:        teamCodeTo(form.org.teamId),
//     toJobCode:         jobCodeTo(form.org.jobId),
//     toPositionCode:    form.org.positionCode,
//     toRankCode:        form.org.rankCode,

//     appointmentStatus: '대기',
//     isApplied: false
//   };
  
//   console.log('▶ 전송 payload:', payload);

//   try {
//     await axios.post(
//       'http://localhost:8000/appointment/create',
//       payload,
//       { headers: { 'Content-Type': 'application/json' } }
//     );
//     alert('등록 성공!');
//     router.push('/appointment');
//   } catch (err) {
//     console.error('▶ AxiosError:', err);
//     alert(
//       `등록 중 오류가 발생했습니다.\n` +
//       `${err.response?.data?.message || err.message}`
//     );
//   }
// }

// function cancel() {
//   router.back()
// }
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
  gap: 40px;
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
