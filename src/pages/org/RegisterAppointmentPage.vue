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
import { reactive, computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { AgGridVue } from 'ag-grid-vue3'
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community'

ModuleRegistry.registerModules([AllCommunityModule])

// ◼︎ 라우터
const router = useRouter()

// ◼︎ 그리드 API 레퍼런스 (필요 시 사용)
const gridApi = ref(null)

// ◼︎ 폼 초기값
const form = reactive({
  name: '',
  title: '',
  type: '승진',
  effectiveDate: '',
  // “발령 조직” (new) 저장용
  org: {
    headId: null,
    departmentId: null,
    teamId: null,
    jobId: null,
    positionId: null,
    rankId: null
  },
  // “현재 조직” (current) 저장용
  currentOrg: {
    headId: null,
    departmentId: null,
    teamId: null,
    jobId: null,
    positionId: null,
    rankId: null
  }
})

// ◼︎ org.json 데이터 저장소
const dataStore = reactive({
  headquarters: [], // { head_id, head_name, head_code }
  department: [],  // { department_id, department_name, department_code, head_id }
  team: [],        // { team_id, team_name, team_code, department_id }
  job: [],         // { job_id, job_name, job_code, team_id }
  position: [],    // { position_id, position_name, position_code }
  rank: []         // { rank_id, rank_name, rank_code }
})

// ◼︎ “발령 조직” 드롭다운용 필터 (computed)
const filteredDepartmentsForNew = computed(() =>
  dataStore.department.filter(d => d.head_id === form.org.headId)
)
const filteredTeamsForNew = computed(() =>
  dataStore.team.filter(t => t.department_id === form.org.departmentId)
)
const filteredJobsForNew = computed(() =>
  dataStore.job.filter(j => j.team_id === form.org.teamId)
)

// ◼︎ “현재 조직” 드롭다운용 필터 (computed)
const filteredDepartmentsForCurrent = computed(() =>
  dataStore.department.filter(d => d.head_id === form.currentOrg.headId)
)
const filteredTeamsForCurrent = computed(() =>
  dataStore.team.filter(t => t.department_id === form.currentOrg.departmentId)
)
const filteredJobsForCurrent = computed(() =>
  dataStore.job.filter(j => j.team_id === form.currentOrg.teamId)
)

// ◼︎ org.json 로드
onMounted(async () => {
  try {
    const res = await axios.get('/org.json')
    Object.assign(dataStore, {
      headquarters: res.data.headquarters,
      department:   res.data.department,
      team:         res.data.team,
      job:          res.data.job,
      position:     res.data.position,
      rank:         res.data.rank
    })
    // (선택 사항) “현재 조직” 기본값으로 첫 번째 항목 세팅
    // 예를 들어, 첫 번째 본부를 기본값으로 지정하고 싶으면 아래처럼 세팅 가능:
    // if (dataStore.headquarters.length > 0) {
    //   form.currentOrg.headId = dataStore.headquarters[0].head_id
    // }
  } catch (e) {
    console.error('org.json 로딩 실패', e)
  }
})

// ◼︎ 그리드 컬럼 정의
const columnDefs = [
  {
    field: 'label',
    headerName: '항목',
    editable: false,
    flex: 1
  },
  {
    field: 'current',
    headerName: '현재 소속 조직',
    flex: 2,
    // “현재 조직”을 드롭다운으로 렌더링하여 form.currentOrg에 바인딩
    cellRenderer: params => {
      const key = params.data.key
      const select = document.createElement('select')
      select.style.width = '100%'

      // 빈 옵션 추가 (필요 시)
      const empty = document.createElement('option')
      empty.value = ''
      empty.text = '선택'
      select.appendChild(empty)

      let options = []
      // ◼︎ 본부
      if (key === 'head') {
        options = dataStore.headquarters.map(h => ({ label: h.head_name, id: h.head_id }))
      }
      // ◼︎ 부서 (현재 본부에 속한 부서만)
      else if (key === 'department') {
        options = filteredDepartmentsForCurrent.value.map(d => ({ label: d.department_name, id: d.department_id }))
      }
      // ◼︎ 팀 (현재 부서에 속한 팀만)
      else if (key === 'team') {
        options = filteredTeamsForCurrent.value.map(t => ({ label: t.team_name, id: t.team_id }))
      }
      // ◼︎ 직무 (현재 팀에 속한 직무만)
      else if (key === 'job') {
        options = filteredJobsForCurrent.value.map(j => ({ label: j.job_name, id: j.job_id }))
      }
      // ◼︎ 직책 (전체 목록)
      else if (key === 'position') {
        options = dataStore.position.map(p => ({ label: p.position_name, id: p.position_id }))
      }
      // ◼︎ 직급 (전체 목록)
      else if (key === 'rank') {
        options = dataStore.rank.map(r => ({ label: r.rank_name, id: r.rank_id }))
      }

      // 옵션 추가 & “현재값”이 있으면 selected 처리
      let currentSelectedId = null
      if (key === 'head') {
        currentSelectedId = form.currentOrg.headId
      } else if (key === 'department') {
        currentSelectedId = form.currentOrg.departmentId
      } else if (key === 'team') {
        currentSelectedId = form.currentOrg.teamId
      } else if (key === 'job') {
        currentSelectedId = form.currentOrg.jobId
      } else if (key === 'position') {
        currentSelectedId = form.currentOrg.positionId
      } else if (key === 'rank') {
        currentSelectedId = form.currentOrg.rankId
      }

      options.forEach(opt => {
        const option = document.createElement('option')
        option.value = opt.id
        option.text = opt.label
        if (String(opt.id) === String(currentSelectedId)) {
          option.selected = true
        }
        select.appendChild(option)
      })

      // ◼︎ 유저가 선택 변경 시
      select.onchange = e => {
        const selectedId = e.target.value === '' ? null : Number(e.target.value)
        switch (key) {
          case 'head':
            form.currentOrg.headId = selectedId
            // downstream(부서, 팀, 직무)를 초기화
            form.currentOrg.departmentId = null
            form.currentOrg.teamId = null
            form.currentOrg.jobId = null
            break
          case 'department':
            form.currentOrg.departmentId = selectedId
            form.currentOrg.teamId = null
            form.currentOrg.jobId = null
            break
          case 'team':
            form.currentOrg.teamId = selectedId
            form.currentOrg.jobId = null
            break
          case 'job':
            form.currentOrg.jobId = selectedId
            break
          case 'position':
            form.currentOrg.positionId = selectedId
            break
          case 'rank':
            form.currentOrg.rankId = selectedId
            break
        }
        // 변경 즉시 그리드 셀 새로고침 (하위 옵션 재로딩)
        gridApi.value.refreshCells({ force: true })
      }

      return select
    }
  },
  {
    field: 'new',
    headerName: '발령 조직',
    flex: 3,
    // “발령 조직”을 드롭다운으로 렌더링하여 form.org에 바인딩
    cellRenderer: params => {
      const key = params.data.key
      const select = document.createElement('select')
      select.style.width = '100%'

      const empty = document.createElement('option')
      empty.value = ''
      empty.text = '선택'
      select.appendChild(empty)

      let options = []
      // ◼︎ 본부
      if (key === 'head') {
        options = dataStore.headquarters.map(h => ({ label: h.head_name, id: h.head_id }))
      }
      // ◼︎ 부서 (선택된 발령 본부에 속한 부서만)
      else if (key === 'department') {
        options = filteredDepartmentsForNew.value.map(d => ({ label: d.department_name, id: d.department_id }))
      }
      // ◼︎ 팀 (선택된 발령 부서에 속한 팀만)
      else if (key === 'team') {
        options = filteredTeamsForNew.value.map(t => ({ label: t.team_name, id: t.team_id }))
      }
      // ◼︎ 직무 (선택된 발령 팀에 속한 직무만)
      else if (key === 'job') {
        options = filteredJobsForNew.value.map(j => ({ label: j.job_name, id: j.job_id }))
      }
      // ◼︎ 직책 (전체 목록)
      else if (key === 'position') {
        options = dataStore.position.map(p => ({ label: p.position_name, id: p.position_id }))
      }
      // ◼︎ 직급 (전체 목록)
      else if (key === 'rank') {
        options = dataStore.rank.map(r => ({ label: r.rank_name, id: r.rank_id }))
      }

      // “현재값”(selected) 세팅
      let newSelectedId = null
      if (key === 'head') {
        newSelectedId = form.org.headId
      } else if (key === 'department') {
        newSelectedId = form.org.departmentId
      } else if (key === 'team') {
        newSelectedId = form.org.teamId
      } else if (key === 'job') {
        newSelectedId = form.org.jobId
      } else if (key === 'position') {
        newSelectedId = form.org.positionId
      } else if (key === 'rank') {
        newSelectedId = form.org.rankId
      }

      options.forEach(opt => {
        const option = document.createElement('option')
        option.value = opt.id
        option.text = opt.label
        if (String(opt.id) === String(newSelectedId)) {
          option.selected = true
        }
        select.appendChild(option)
      })

      // ◼︎ 유저가 “발령 조직” 선택 시
      select.onchange = e => {
        const selectedId = e.target.value === '' ? null : Number(e.target.value)
        switch (key) {
          case 'head':
            form.org.headId = selectedId
            form.org.departmentId = null
            form.org.teamId = null
            form.org.jobId = null
            break
          case 'department':
            form.org.departmentId = selectedId
            form.org.teamId = null
            form.org.jobId = null
            break
          case 'team':
            form.org.teamId = selectedId
            form.org.jobId = null
            break
          case 'job':
            form.org.jobId = selectedId
            break
          case 'position':
            form.org.positionId = selectedId
            break
          case 'rank':
            form.org.rankId = selectedId
            break
        }
        gridApi.value.refreshCells({ force: true })
      }

      return select
    }
  }
]

const defaultColDef = {
  resizable: true
}

const rowData = reactive([])

// ◼︎ 그리드 준비 완료 시
function onGridReady(params) {
  gridApi.value = params.api
  rowData.length = 0

  // orgFields 객체 순서대로 rowData에 밀어넣기
  Object.entries(orgFields).forEach(([key, label]) => {
    rowData.push({
      key,
      label,
      // “current”, “new” 두 칼럼은 렌더러(cellRenderer)에서 직접 처리함
      current: null,
      new: null
    })
  })
}

// ◼︎ “저장” 클릭 시
async function submit() {
  try {
    const headObj = dataStore.headquarters.find(h => h.head_id === form.org.headId)
    const deptObj = dataStore.department.find(d => d.department_id === form.org.departmentId)
    const teamObj = dataStore.team.find(t => t.team_id === form.org.teamId)
    const jobObj = dataStore.job.find(j => j.job_id === form.org.jobId)
    const posObj = dataStore.position.find(p => p.position_id === form.org.positionId)
    const rankObj = dataStore.rank.find(r => r.rank_id === form.org.rankId)

    const payload = {
      employee_name: form.name,
      title: form.title,
      appointment_type: form.type,
      appointment_effective_date: form.effectiveDate,
      head_code: headObj?.head_code,
      department_code: deptObj?.department_code,
      team_code: teamObj?.team_code,
      job_code: jobObj?.job_code,
      position_code: posObj?.position_code,
      rank_code: rankObj?.rank_code
    }
    await axios.post('/appointments', payload)
    router.push('/appointment')
  } catch (err) {
    console.error('등록 실패', err)
    alert('등록 중 오류가 발생했습니다.')
  }
}

// ◼︎ “취소” 클릭 시
function cancel() {
  router.back()
}

// ◼︎ orgFields: 그리드 한 행마다 key-라벨 매핑
const orgFields = {
  head: '소속 본부',
  department: '소속 부서',
  team: '소속 팀',
  job: '소속 직무',
  position: '소속 직책',
  rank: '소속 직급'
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
