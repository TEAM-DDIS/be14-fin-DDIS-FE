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
            <td><input v-model="form.name" type="text" placeholder="사원번호를 입력하세요"/></td>
          </tr>
          <tr>
            <th>발령제목</th>
            <td><input v-model="form.title" type="text" placeholder="발령제목을 입력하세요"/></td>
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
            <td><input v-model="form.effectiveDate" type="date"/></td>
          </tr>
        </table>
      </div>

      <!-- 2. 조직 변경: ag-Grid 사용 -->
      <div class="org-section">
        <ag-grid-vue
          class="ag-theme-alpine"
          :rowData="rowData"
          :columnDefs="columnDefs"
          :defaultColDef="defaultColDef"
          :singleClickEdit="true"
          @grid-ready="onGridReady"
          @cell-value-changed="onCellValueChanged"
          style="width: 100%; height: 300px;"
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
import { reactive, computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { AgGridVue } from 'ag-grid-vue3'
import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-alpine.css'

// 라우터
const router = useRouter()

// 그리드 API 레퍼런스
const gridApi = ref(null)

// 폼 초기값
const form = reactive({
  name: '',
  title: '',
  type: '승진',
  effectiveDate: '',
  org: { headId: null, departmentId: null, teamId: null, jobId: null, positionId: null, rankId: null },
})

// 현재 조직 예시
const currentOrg = reactive({ head: '개발본부', department: 'PC게임개발부서', team: 'PC개발팀', job: 'PC게임개발', position: '팀원', rank: '사원' })

// org.json 데이터 저장소
const dataStore = reactive({ headquarters: [], department: [], team: [], job: [], position: [], rank: [] })

// 필터 컴퓨티드
const filteredDepartments = computed(() => dataStore.department.filter(d => d.head_id === form.org.headId))
const filteredTeams       = computed(() => dataStore.team.filter(t => t.department_id === form.org.departmentId))
const filteredJobs        = computed(() => dataStore.job.filter(j => j.team_id === form.org.teamId))

// 선택 초기화 핸들러
function onHeadChange() { form.org.departmentId = null; form.org.teamId = null; form.org.jobId = null }
function onDeptChange() { form.org.teamId = null; form.org.jobId = null }

// org.json 로드
onMounted(async () => {
  try {
    const res = await axios.get('/org.json')
    Object.assign(dataStore, {
      headquarters: res.data.headquarters,
      department:   res.data.department,
      team:         res.data.team,
      job:          res.data.job,
      position:     res.data.position,
      rank:         res.data.rank,
    })
  } catch (e) { console.error('org.json 로딩 실패', e) }
})

// ag-Grid 설정
const columnDefs = [
  { field: 'label', headerName: '항목', editable: false, flex: 1 },
  { field: 'current', headerName: '현재 소속 조직', editable: false, flex: 2 },
  {
    field: 'new', headerName: '발령 조직', editable: true, flex: 3,
    cellEditor: 'agSelectCellEditor',
    cellEditorParams: params => getEditorParams(params.data.key)
  }
]
const defaultColDef = { resizable: true, sortable: true }
const rowData = reactive([])

// 그리드 초기화 시 행 데이터 설정
function onGridReady(params) {
  gridApi.value = params.api
  rowData.length = 0
  Object.entries(orgFields).forEach(([key, label]) => rowData.push({ key, label, current: currentOrg[key], new: null }))
}

// 셀 에디터 옵션 반환
function getEditorParams(key) {
  switch (key) {
    case 'head':       return { values: dataStore.headquarters.map(h => h.head_name) }
    case 'department': return { values: filteredDepartments.value.map(d => d.department_name) }
    case 'team':       return { values: filteredTeams.value.map(t => t.team_name) }
    case 'job':        return { values: filteredJobs.value.map(j => j.job_name) }
    case 'position':   return { values: dataStore.position.map(p => p.position_name) }
    case 'rank':       return { values: dataStore.rank.map(r => r.rank_name) }
    default:           return { values: [] }
  }
}

// 셀 값 변경 시 양방향 반영 및 셀 새로고침
function onCellValueChanged(params) {
  const { key, newValue } = { key: params.data.key, newValue: params.newValue }
  switch (key) {
    case 'head':       form.org.headId       = dataStore.headquarters.find(h => h.head_name === newValue)?.head_id; onHeadChange(); break
    case 'department': form.org.departmentId = dataStore.department.find(d => d.department_name === newValue)?.department_id; onDeptChange(); break
    case 'team':       form.org.teamId       = dataStore.team.find(t => t.team_name === newValue)?.team_id; break
    case 'job':        form.org.jobId        = dataStore.job.find(j => j.job_name === newValue)?.job_id; break
    case 'position':   form.org.positionId   = dataStore.position.find(p => p.position_name === newValue)?.position_id; break
    case 'rank':       form.org.rankId       = dataStore.rank.find(r => r.rank_name === newValue)?.rank_id; break
  }
  // dependent dropdown 리프레시
  gridApi.value.refreshCells({ force: true })
}

// 저장 핸들러
async function submit() {
  try {
    const head = dataStore.headquarters.find(h => h.head_id === form.org.headId)
    const dept = dataStore.department.find(d => d.department_id === form.org.departmentId)
    const team = dataStore.team.find(t => t.team_id === form.org.teamId)
    const job  = dataStore.job.find(j => j.job_id === form.org.jobId)
    const pos  = dataStore.position.find(p => p.position_id === form.org.positionId)
    const rank = dataStore.rank.find(r => r.rank_id === form.org.rankId)

    const payload = {
      employee_name: form.name,
      title: form.title,
      appointment_type: form.type,
      appointment_effective_date: form.effectiveDate,
      head_code: head?.head_code,
      department_code: dept?.department_code,
      team_code: team?.team_code,
      job_code: job?.job_code,
      position_code: pos?.position_code,
      rank_code: rank?.rank_code,
    }
    await axios.post('/appointments', payload)
    router.push('/appointment')
  } catch (err) {
    console.error('등록 실패', err)
    alert('등록 중 오류가 발생했습니다.')
  }
}

function cancel() { router.back() }

// 필드 라벨 매핑
const orgFields = { head: '소속 본부', department: '소속 부서', team: '소속 팀', job: '소속 직무', position: '소속 직책', rank: '소속 직급' }
</script>

<style scoped>
.page-title { margin-left: 20px; margin-bottom: 50px; color: #00a8e8; }
.desc { display: block; margin-left: 20px; margin-bottom: 10px; }
.content-box { width: 80%; max-width: 1200px; margin: 24px auto; background: #fff; border-radius: 12px; padding: 20px 32px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
.info-section, .org-section { margin-bottom: 24px; }
.info-table, .org-table { width: 100%; border-collapse: collapse; text-align: left; }
.info-table th, .info-table td, .org-table th, .org-table td { border: 1px solid #e5e7eb; padding: 8px 12px; }
.info-table th { width: 120px; background: #f9fafb; }
.button-group { display: flex; gap: 100px; justify-content: center; }
.btn-save, .btn-cancel { font-size: 14px; font-weight: bold; background-color: #00a8e8; color: white; border: 1px solid transparent; border-radius: 10px; padding: 10px 30px; cursor: pointer; box-shadow: 0 2px 8px rgba(0,0,0,0.08); transition: background-color 0.2s, box-shadow 0.2s; }
.btn-save:hover, .btn-cancel:hover { background-color: white; color: #00a8e8; border-color: #00a8e8; box-shadow: inset 1px 1px 10px rgba(0,0,0,0.25); }
</style>
