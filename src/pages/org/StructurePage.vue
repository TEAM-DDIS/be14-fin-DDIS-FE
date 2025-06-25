<!-- 조직 및 직무 > 조직 구성 > 조직 구성 조회-->
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
                :src="getProfileUrl(emp.profileImgPath)"
                alt="프로필"
                class="profile"
                @error="onImageError"
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
                :src="getProfileUrl(selectedEmployee.profileImgPath)"
                alt="프로필"
                class="profile2"
                @error="onImageError"
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

const props = defineProps({
  profileImg: String,
  name: String,
  role: String
})

// S3 프로필 이미지 가져오기
const S3_BASE_URL = 'https://ddisbucket-fin.s3.ap-northeast-2.amazonaws.com'

const getProfileUrl = path =>
  path ? `${S3_BASE_URL}/${path}` : '/images/erpizza_profile.svg'

function onImageError(e) {
  e.target.src = '/images/erpizza_profile.svg'
}

// 권한 설정: 인사팀에서만 등록, 삭제버튼 
const userStore = useUserStore()
const token = userStore.accessToken
const payload = parseJwtPayload(token)
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
// const token = useUserStore().accessToken

async function loadHierarchy() {
  const url = 'http://localhost:5000/structure/hierarchy'
  try {
    const res = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    hierarchy.value = await res.json()
  } catch (e) {
    console.error('❌ 조직 계층 로드 실패:', e)
    hierarchy.value = []
  }
}

onMounted(() => {
  loadHierarchy()
})

// 팀 클릭 시 팀원 목록 표시
function onTeamSelected(team) {
  selectedTeam.value = team
  selectedEmployee.value = null

  teamMembers.value = (team.members || []).map(e => ({
    employeeId: e.employeeId,
    employeeName: e.employeeName,
    profileImgPath: e.employeePhotoUrl,
    positionName: e.positionName,
    rankName: e.rankName,
  }))
}

// 팀원 클릭 시 사원 상세 조회
async function onEmployeeSelected(emp) {
  const url = `http://localhost:5000/structure/employee/${emp.employeeId}`
    try {
      const res = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()

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
        jobCode: data.jobCode || '',
        profileImgPath: data.employeePhotoUrl
      }
    } catch (e) {
      selectedEmployee.value = null
    }
}

function onEdit() {
  router.push('/org/structure/edit')
}

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

// 헬퍼 함수 (Id -> Name 변환)
function findHeadName(headId) {
  const head = hierarchy.value.find(h => h.headId === headId)
  return head ? head.headName : ''
}

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
  color: var(--primary); 
}

.desc {
  display: block;
  margin-left: 20px;
  margin-bottom: 10px;
  font-size: 18px;
}

.content-box {
  background: var(--bg-box);
  border-radius: 12px;
  padding: 20px 32px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  margin-left: 20px;
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

.placeholder {
  color: var(--primary); 
  font-size: 15px;
  padding: 32px;
  text-align: center;
}

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
  background: var(--bg-main);
  transition: background-color 0.2s;
}

.profile {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  margin-right: 20px;
}

.member-info strong {
  display: block;
}
.member-info span {
  font-size: 14px;
  color: var(--text-main);
}

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
  border-radius: 50%;
  object-fit: cover;
  margin: 20px auto 10px auto;
}

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
  background-color: var(--bg-label-cell);
}

.value-cell {
  padding-left: 12px;
}
.profile-details summary {
  cursor: pointer;
  font-weight: bold;
  margin-bottom: 8px;
}

.edit-button {
  align-self: flex-end;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  font-family: inherit;
  background-color: var(--primary);
  color: var(--text-on-primary);
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
  background-color: var(--bg-main);
  color: var(--primary);
  border-color: var(--primary);
  box-shadow: inset 1px 1px 10px rgba(0, 0, 0, 0.25);
}
</style>