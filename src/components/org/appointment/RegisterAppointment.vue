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
        <AgGridVue
          class="ag-theme-alpine custom-theme"
          :gridOptions="{ theme: 'legacy' }"
          :rowData="rowData"
          :columnDefs="columnDefs"
          :defaultColDef="defaultColDef"
          @grid-ready="onGridReady"
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
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community'

  ModuleRegistry.registerModules([AllCommunityModule])

// 라우터
const router = useRouter()

// 그리드 API 레퍼런스 (필요시 사용)
const gridApi = ref(null)

// 폼 초기값
const form = reactive({
  name: '',
  title: '',
  type: '승진',
  effectiveDate: '',
  org: {
    headId: null,
    departmentId: null,
    teamId: null,
    jobId: null,
    positionId: null,
    rankId: null
  },
})

// 현재 조직 예시
const currentOrg = reactive({
  head: '개발본부',
  department: 'PC게임개발부서',
  team: 'PC개발팀',
  job: 'PC게임개발',
  position: '팀원',
  rank: '사원'
})

// org.json 데이터 저장소
const dataStore = reactive({
  headquarters: [],
  department: [],
  team: [],
  job: [],
  position: [],
  rank: []
})

// 필터 컴퓨티드
const filteredDepartments = computed(() =>
  dataStore.department.filter(d => d.head_id === form.org.headId  
))
const filteredTeams = computed(() =>
  dataStore.team.filter(t => t.department_id === form.org.departmentId
))
const filteredJobs = computed(() =>
  dataStore.job.filter(j => j.team_id === form.org.teamId
))

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
  } catch (e) {
      console.error('org.json 로딩 실패', e)
    }
})

// 그리드 초기화
const columnDefs = [
  { field: 'label',
    headerName: '항목',
    editable: false,
    flex: 1
  },
  { field: 'current',
    headerName: '현재 소속 조직',
    editable: false,
    flex: 2
  },
  {
    field: 'new',
    headerName: '발령 조직',
    flex: 3,
    // 항상 drop-down select 렌더러
    cellRenderer: params => {
      const key = params.data.key
      let options = []
      if (key === 'head')       options = dataStore.headquarters.map(h => ({ label: h.head_name, id: h.head_id }))
      else if (key === 'department') options = filteredDepartments.value.map(d => ({ label: d.department_name, id: d.department_id }))
      else if (key === 'team')       options = filteredTeams.value.map(t => ({ label: t.team_name, id: t.team_id }))
      else if (key === 'job')        options = filteredJobs.value.map(j => ({ label: j.job_name, id: j.job_id }))
      else if (key === 'position')   options = dataStore.position.map(p => ({ label: p.position_name, id: p.position_id }))
      else if (key === 'rank')       options = dataStore.rank.map(r => ({ label: r.rank_name, id: r.rank_id }))

      const select = document.createElement('select')
      select.style.width = '100%'
      const empty = document.createElement('option')
      empty.value = ''
      empty.text = '선택'
      select.appendChild(empty)
      options.forEach(opt => {
        const option = document.createElement('option')
        option.value = opt.id
        option.text = opt.label
        if (String(opt.id) === String(params.data.new)) option.selected = true
        select.appendChild(option)
      })
      select.onchange = e => {
        params.node.setDataValue('new', e.target.value)
        // 변경 즉시 form.org에 매핑
        mapToForm(params.data.key, e.target.value)
      }
      return select
    }
  }
]
const defaultColDef = { resizable: true }
const rowData = reactive([])

function onGridReady(params) {
  gridApi.value = params.api
  rowData.length = 0
  Object.entries(orgFields).forEach(([key, label]) => rowData.push({ key, label, current: currentOrg[key], new: '' }))
}

// 데이터 변경시 form.org 매핑
function mapToForm(key, id) {
  const val = Number(id)
  switch (key) {
    case 'head':       form.org.headId = val; form.org.departmentId = null; form.org.teamId = null; form.org.jobId = null; break
    case 'department': form.org.departmentId = val; form.org.teamId = null; form.org.jobId = null; break
    case 'team':       form.org.teamId = val; form.org.jobId = null; break
    case 'job':        form.org.jobId = val; break
    case 'position':   form.org.positionId = val; break
    case 'rank':       form.org.rankId = val; break
  }
  // 셀 새로고침
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
.page-title {
  margin-left: 20px;
  margin-bottom: 50px;
  color: #00a8e8;
}
.desc {
  display: block;
  margin-left: 20px;
  margin-bottom: 10px;
}
.content-box {
    background: #fff;
    border-radius: 12px;
    padding: 20px 32px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.05);
    margin: 24px;
}
.info-section,
.org-section {
  margin-bottom: 24px;
}
.info-table, .org-table { width: 100%; border-collapse: collapse; text-align: left; }
.info-table th, .info-table td { border: 1px solid #e5e7eb; padding: 8px 12px; }
.info-table th { width: 120px; background: #f9fafb; }
.button-group { display: flex; gap: 100px; justify-content: center; }
.btn-save, .btn-cancel { font-size: 14px; font-weight: bold; background-color: #00a8e8; color: white; border: 1px solid transparent; border-radius: 10px; padding: 10px 30px; cursor: pointer; box-shadow: 0 2px 8px rgba(0,0,0,0.08); transition: background-color 0.2s, box-shadow 0.2s; }
.btn-save:hover, .btn-cancel:hover { background-color: white; color: #00a8e8; border-color: #00a8e8; box-shadow: inset 1px 1px 10px rgba(0,0,0,0.25); }
</style>