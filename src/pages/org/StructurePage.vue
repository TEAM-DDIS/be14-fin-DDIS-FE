<template>
  <h1 class="page-title">조직 구성</h1>
  <p class="desc">조직도 조회</p>

  <div class="content-box">
    <div class="org-dashboard">
      <!-- Left: Org Hierarchy 트리 영역 -->
      <div class="left">
        <h2>조직도</h2>
        <!-- Hierarchy 컴포넌트를 통해 트리 전체를 렌더링 -->
        <Hierarchy @team-selected="onTeamSelected" :hierarchy="hierarchy" />
      </div>

      <!-- Middle: Team Members List -->
      <div class="team-panel">
        <template v-if="selectedTeam">
          <h2>{{ selectedTeam.teamName }} 팀원</h2>
          <ul class="member-list">
            <li
              v-for="emp in teamMembers"
              :key="emp.employeeId"
              @click="onEmployeeSelected(emp)"
              :class="{ active: emp.employeeId === selectedEmployee?.employeeId }"
            >
              <img
                src="@/assets/icons/profile_img.svg"
                alt="profile"
                class="profile"
              />
              <div class="member-info">
                <strong>{{ emp.employeeName }}</strong>
                <span>{{ emp.positionName }}</span>
                <small>/ {{ emp.rankName }}</small>
              </div>
            </li>
          </ul>
        </template>
        <template v-else>
          <div class="placeholder">왼쪽에서 팀을 선택해주세요.</div>
        </template>
      </div>

      <!-- Right: Employee Profile 상세 정보 -->
      <div class="profile-panel">
        <template v-if="selectedEmployee">
          <h2>프로필 정보</h2>
          <div class="profile-top">
            <div class="profile-card">
              <img
                src="@/assets/icons/profile_img.svg"
                alt="profile"
                class="profile2"
              />
              <h4>
                {{ selectedEmployee.rankName }}
                {{ selectedEmployee.employeeName }}
              </h4>
            </div>
            <!-- Profile Table -->
            <table class="profile-table">
              <tbody>
                <tr v-for="row in profileRowData" :key="row.label">
                  <td class="label-cell">{{ row.label }}</td>
                  <td class="value-cell">{{ row.value }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- 상세 정보 -->
          <details class="profile-details">
            <summary>상세 정보</summary>
            <table class="details-table">
              <tbody>
                <tr v-for="row in detailsRowData" :key="row.label">
                  <td class="label-cell">{{ row.label }}</td>
                  <td class="value-cell">{{ row.value }}</td>
                </tr>
              </tbody>
            </table>
          </details>
        </template>
        <template v-else>
          <div class="placeholder">가운데에서 사원을 선택해주세요.</div>
        </template>
      </div>
    </div>

    <button v-if="isHR" class="edit-button" @click="onEdit">조직 구성 편집</button>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import Hierarchy from '@/components/org/structure/Hierarchy.vue'

const hierarchy = ref([])
const selectedTeam = ref(null)
const teamMembers = ref([])
const selectedEmployee = ref(null)

const router = useRouter()

// 인사팀에서만 등록, 삭제버튼 
const userStore = useUserStore()
const token = localStorage.getItem('token')
const payload = parseJwtPayload(userStore.accessToken || token)
const isHR = payload?.role?.includes('ROLE_HR') || payload?.auth?.includes('ROLE_HR')

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

// 1) 초기 로딩: 조직 계층 가져오기 
onMounted(async () => {
  try {
    const url = 'https://api.isddishr.site/structure/hierarchy'
    console.log('📥 조직 계층 호출 URL:', url)
    const res = await fetch(url)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    hierarchy.value = await res.json()
  } catch (e) {
    console.error('❌ 조직 계층 로드 실패:', e)
    hierarchy.value = []
  }
})

// 2) 팀(node) 클릭 시: selectedTeam 세팅 & teamMembers에 팀원 목록 채우기
function onTeamSelected(team) {
  selectedTeam.value = team
  selectedEmployee.value = null

  // 이미 받아온 hierarchy에서 해당 팀의 members를 꺼내서 팀원 목록에 할당
  // team.members에는 { employeeId, employeeName, positionName, rankName } 형태의 배열
  teamMembers.value = (team.members || []).map(e => ({
    employeeId: e.employeeId,
    employeeName: e.employeeName,
    positionName: e.positionName,
    rankName: e.rankName,
  }))
}

// 3) 팀원 클릭 시: 사원 상세 조회
async function onEmployeeSelected(emp) {
  try {
    const url = `https://api.isddishr.site/structure/employee/${emp.employeeId}`
    console.log('📥 사원 상세 호출 URL:', url)
    const res = await fetch(url)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json()
    // data: EmployeeQueryDTO 형태
    selectedEmployee.value = {
      employeeId: data.employeeId,
      employeeName: data.employeeName,
      positionName: data.positionName,
      rankName: data.rankName,
      jobName: data.jobName,
      headId: data.headId,
      departmentId: data.departmentId,
      teamId: data.teamId,
      birthdate: data.birthdate,
      email: data.email,
      jobCode: data.jobCode || ''
    }
  } catch (e) {
    console.error('❌ 사원 상세 조회 실패:', e)
    selectedEmployee.value = null
  }
}

// 4) 편집 버튼 클릭 시: route 변경
function onEdit() {
  router.push('/org/structure/edit')
}

// 프로필 테이블 데이터 (이름, 생년월일, 직급, 사번)
const profileRowData = computed(() => {
  if (!selectedEmployee.value) return []
  const e = selectedEmployee.value
  return [
    { label: '이름', value: e.employeeName },
    { label: '직급', value: e.rankName },
    { label: '사번', value: e.employeeId },
    { label: '생년월일', value: e.birthdate || '-' }
  ]
})

// 상세 정보 테이블 데이터 (본부, 부서, 팀, 직책, 직급, 직무코드, 이메일)
const detailsRowData = computed(() => {
  if (!selectedEmployee.value) return []
  const e = selectedEmployee.value
  return [
    { label: '소속 본부', value: findHeadName(e.headId) },
    { label: '소속 부서', value: findDeptName(e.departmentId) },
    { label: '소속 팀', value: selectedTeam.value.teamName },
    { label: '직책', value: e.positionName },
    { label: '직급', value: e.rankName },
    { label: '직무', value: e.jobName || '-' },
    { label: '이메일', value: e.email || '-' }
  ]
})

// helper: headId → headName 찾기
function findHeadName(headId) {
  const head = hierarchy.value.find(h => h.headId === headId)
  return head ? head.headName : ''
}

// helper: departmentId → departmentName 찾기
function findDeptName(deptId) {
  for (const head of hierarchy.value) {
    const dept = head.departments.find(d => d.departmentId === deptId)
    if (dept) return dept.departmentName
  }
  return ''
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
.content-box {
  background: #ffffff;
  border-radius: 12px;
  padding: 20px 32px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  margin: 24px;
  max-width: 100%;
  overflow-x: auto;
}
.org-dashboard {
  display: grid;
  grid-template-columns: 0.7fr 0.6fr 1fr;
  gap: 16px;
}
.left,
.team-panel,
.profile-panel {
  overflow-y: auto;
  scrollbar-gutter: stable;
}
.left,
.team-panel {
  padding: 16px;
  border-right: 1px solid #ddd;
}
.profile-panel {
  padding: 16px;
}

/* placeholder */
.placeholder {
  color: #00a8e8;
  font-size: 15px;
  /* font-weight: bold; */
  padding: 32px;
  text-align: center;
}

/* member list */
.member-list {
  list-style: none;
  margin: 0;
  padding: 0;
}
.member-list li {
  display: flex;
  align-items: center;
  padding: 20px;
  cursor: pointer;
  border-bottom: 1px solid #d1d1d1;
}
.member-list li.active {
  background: #efefef;
  transition: background-color 0.2s;
}
.profile {
  width: 40px;
  height: 40px;
  margin-right: 20px;
}
.member-info strong {
  display: block;
}
.member-info span {
  font-size: 14px;
  color: #3b3b3b;
}

/* right profile */
.profile-top {
  display: flex;
  align-items: flex-start;
  gap: 30px;
  margin-bottom: 16px;
}
.profile-card {
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
  text-align: center;
  border: 1px solid #aeaeae;
  border-radius: 10px;
  padding: 10px 30px;
}
.profile2 {
  width: 120px;
  height: 120px;
  margin: 20px auto 10px auto;
}

/* Profile & Details Table */
.profile-table,
.details-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 16px;
}
.profile-table td,
.details-table td {
  border: 1px solid #c8c8c8;
  padding: 8px 12px;
}
.label-cell {
  background-color: #f8f9fa;
  font-weight: bold;
  width: 30%;
}
.value-cell {
  padding-left: 12px;
}
.profile-details summary {
  cursor: pointer;
  font-weight: bold;
  margin-bottom: 8px;
}

/* Edit 버튼 */
.edit-button {
  align-self: flex-end;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  font-family: inherit;
  background-color: #00a8e8;
  color: white;
  border: 1px solid transparent;
  border-radius: 10px;
  padding: 12px 30px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: background-color 0.2s, box-shadow 0.2s;
  box-sizing: border-box;

  display: block;
  margin-left: auto;
  margin-right: 20px;
  margin-bottom: 20px;
}
.edit-button:hover {
  background-color: white;
  color: #00a8e8;
  border-color: #00a8e8;
  box-shadow: inset 1px 1px 10px rgba(0, 0, 0, 0.25);
}
</style>
