<template>
  <h1 class="page-title">조직 구성</h1>
  <p class="desc">조직도 조회</p>
  <div class="content-box">
    <div class="org-dashboard">
      <!-- Left: Org Hierarchy -->
      <div class="left">
        <h2>조직도</h2>
        <OrgHierarchy @team-selected="onTeamSelected" />
      </div>

      <!-- Middle: Team Members List -->
      <div class="team-panel">
        <template v-if="selectedTeam">
          <h2>{{ selectedTeam.team_name }} 팀원</h2>
          <ul class="member-list">
            <li
              v-for="emp in teamMembers"
              :key="emp.employee_id"
              @click="onEmployeeSelected(emp)"
              :class="{ active: emp.employee_id === selectedEmployee?.employee_id }"
            >
              <img src="@/assets/icons/profile_img.svg" alt="profile" class="profile" />
              <div class="member-info">
                <strong>{{ emp.employee_name }}</strong>
                <span>{{ emp.position_name }}</span>
                <small>/ {{ emp.rank_name }}</small>
              </div>
            </li>
          </ul>
        </template>
        <template v-else>
          <div class="placeholder">왼쪽에서 팀을 선택해주세요.</div>
        </template>
      </div>

      <!-- Right: Employee Profile -->
      <div class="profile-panel">
        <template v-if="selectedEmployee">
          <h2>프로필 정보</h2>
          <div class="profile-top">
            <div class="profile-card">
              <img src="@/assets/icons/profile_img.svg" alt="profile" class="profile2" />
              <h4>{{ selectedEmployee.rank_name }} {{ selectedEmployee.employee_name }}</h4>
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
  </div>
  <button class="edit-button" @click="onEdit">편집</button>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import OrgHierarchy from '@/components/org/structure/Hierarchy.vue'

// 선택된 팀, 사원
const selectedTeam = ref(null)
const selectedEmployee = ref(null)
const teamMembers = ref([])

// 공통 데이터 저장소
const dataStore = reactive({
  employees: [],
  positions: [],
  ranks: [],
  departments: [],
  headquarters: []
})

// org.json에서 데이터 로드
onMounted(async () => {
  try {
    const res = await fetch('/org.json')
    const oData = await res.json()
    dataStore.positions = oData.position
    dataStore.ranks = oData.rank
    dataStore.departments = oData.department
    dataStore.headquarters = oData.headquarters
    dataStore.employees = oData.employees.map(e => ({
      ...e,
      position_name:
        oData.position.find(p => p.position_code === e.position_code)?.position_name ||
        '',
      rank_name:
        oData.rank.find(r => r.rank_code === e.rank_code)?.rank_name || ''
    }))
  } catch (err) {
    console.error('org.json 로드 실패:', err)
  }
})

// OrgHierarchy.vue에서 팀 선택 시
function onTeamSelected(team) {
  selectedTeam.value = team
  selectedEmployee.value = null
  teamMembers.value = dataStore.employees.filter(
    e => e.team_code === team.team_code
  )
}

// 팀원 클릭
function onEmployeeSelected(emp) {
  selectedEmployee.value = emp
}

// "편집" 버튼 클릭 시
const router = useRouter()
function onEdit() {
  router.push('/org/structure/edit')
}

// AG Grid 대신 사용했던 데이터 컴퓨티드
const profileRowData = computed(() => {
  if (!selectedEmployee.value) return []
  const e = selectedEmployee.value
  return [
    { label: '이름', value: e.employee_name },
    { label: '생년월일', value: e.birthdate || '-' },
    { label: '직급', value: e.rank_name },
    { label: '사번', value: e.employee_id }
  ]
})

const detailsRowData = computed(() => {
  if (!selectedEmployee.value) return []
  const e = selectedEmployee.value
  const lookup = (arr, codeField, codeValue, nameField) =>
    (dataStore[arr].find(x => x[codeField] === codeValue) || {})[nameField] ||
    ''
  return [
    {
      label: '소속 본부',
      value: lookup('headquarters', 'head_code', e.head_code, 'head_name')
    },
    {
      label: '소속 부서',
      value: lookup(
        'departments',
        'department_code',
        e.department_code,
        'department_name'
      )
    },
    { label: '소속 팀', value: selectedTeam.value.team_name },
    { label: '직책', value: e.position_name },
    { label: '직급', value: e.rank_name },
    { label: '직무', value: e.job_code },
    { label: '이메일', value: e.email || '-' }
  ]
})
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

h2 {
  margin-top: 20px;
}

/* placeholder */
.placeholder {
  color: #00a8e8;
  font-size: 18px;
  font-weight: bold;
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
  position: absolute;
  top: 40px;
  right: 40px;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  font-family: inherit;
  background-color: #00a8e8;
  color: white;
  border: 1px solid transparent;
  border-radius: 10px;
  padding: 10px 30px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: background-color 0.2s, box-shadow 0.2s;
  box-sizing: border-box;
}
.edit-button:hover {
  background-color: white;
  color: #00a8e8;
  border-color: #00a8e8;
  box-shadow: inset 1px 1px 10px rgba(0, 0, 0, 0.25);
}
</style>
