<template>
  <div class="org-container">
    <h3 class="company-title">
      DDIS <span class="rep">{{ getCompanyRep() }}</span>
    </h3>
    <ul class="org-list">
      <li v-for="hq in headquarters" :key="hq.head_code">
        <!-- 본부 노드: 클릭하면 펼침/접힘 -->
        <div class="node head" @click="toggleHead(hq.head_code)">
          <i :class="expanded[hq.head_code] ? 'fa fa-chevron-down' : 'fa fa-chevron-right'" />
          {{ hq.head_name }} <small>(본부장: {{ getHeadRep(hq.head_code) }})</small>
        </div>

        <!-- 본부가 펼쳐져 있을 때 하위 부서 표시 -->
        <ul v-show="expanded[hq.head_code]">
          <li
            v-for="dept in getDepartments(hq.head_id)"
            :key="dept.department_code"
          >
            <!-- 부서 노드: 클릭 시 dept-selected 이벤트 emit -->
            <div class="node dept" @click.stop="selectDepartment(dept)">
              <i :class="expanded[dept.department_code] ? 'fa fa-chevron-down' : 'fa fa-chevron-right'" />
              {{ dept.department_name }}
              <small>(부서장: {{ getDeptRep(dept.department_code) }})</small>
            </div>

            <!-- 부서가 펼쳐져 있을 때 하위 팀 표시 -->
            <ul v-show="expanded[dept.department_code]">
              <li
                v-for="team in getTeams(dept.department_id)"
                :key="team.team_code"
              >
                <!-- 팀 노드: 클릭 시 team-selected 이벤트 emit -->
                <div class="node team" @click.stop="selectTeam(team)">
                  <i
                    :class="expanded[team.team_code]
                      ? 'fa fa-chevron-down'
                      : 'fa fa-chevron-right'"
                  />
                  {{ team.team_name }}
                  <small>(팀장: {{ getTeamRep(team.team_code) }})</small>
                </div>
                <!-- 팀이 펼쳐졌을 때 직원 표시 (선택적으로 간단 나열) -->
                <ul v-show="expanded[team.team_code]">
                  <li v-for="emp in getEmployeesByTeam(team.team_code)" :key="emp.employee_id">
                    <div class="node emp">
                      {{ emp.rank_name }} {{ emp.position_name }}: {{ emp.employee_name }}
                    </div>
                  </li>
                </ul>
              </li>
            </ul>
          </li>
        </ul>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { reactive } from 'vue'

// 부모 컴포넌트로 이벤트 전달(dept-selected, team-selected)
const emit = defineEmits(['dept-selected', 'team-selected'])

// props로 전달받는 데이터
const props = defineProps({
  headquarters: {
    type: Array,
    required: true
  },
  departments: {
    type: Array,
    required: true
  },
  teams: {
    type: Array,
    required: true
  },
  employees: {
    type: Array,
    required: true
  },
  positions: {
    type: Array,
    required: true
  },
  ranks: {
    type: Array,
    required: true
  }
})

// 본부/부서/팀 각각 펼침 상태 저장용
const expanded = reactive({})

// 본부 토글
function toggleHead(headCode) {
  expanded[headCode] = !expanded[headCode]
}
// 부서 토글
function toggleDept(deptCode) {
  expanded[deptCode] = !expanded[deptCode]
}
// 팀 토글
function toggleTeam(teamCode) {
  expanded[teamCode] = !expanded[teamCode]
}

// 부서 선택: 토글 후 이벤트 emit
function selectDepartment(dept) {
  toggleDept(dept.department_code)
  emit('dept-selected', dept)
}

// 팀 선택: 토글 후 이벤트 emit
function selectTeam(team) {
  toggleTeam(team.team_code)
  emit('team-selected', team)
}

// 본부에 해당하는 부서 목록 반환
function getDepartments(headId) {
  return props.departments.filter(d => d.head_id === headId)
}

// 부서에 해당하는 팀 목록 반환
function getTeams(departmentId) {
  return props.teams.filter(t => t.department_id === departmentId)
}

// 특정 팀에 소속된 직원 목록 반환
function getEmployeesByTeam(teamCode) {
  return props.employees.filter(e => e.team_code === teamCode)
}

// “회사 대표” (직책 코드 P005) 조회
function getCompanyRep() {
  const ceo = props.employees.find(e => e.position_code === 'P005')
  return ceo ? ceo.employee_name : ''
}

// 해당 본부의 “본부장” (position_code = 'P004') 조회
function getHeadRep(headCode) {
  const h = props.employees.find(
    e => e.head_code === headCode && e.position_code === 'P004'
  )
  return h ? h.employee_name : ''
}

// 해당 부서의 “부서장” (position_code = 'P003') 조회
function getDeptRep(deptCode) {
  const d = props.employees.find(
    e => e.department_code === deptCode && e.position_code === 'P003'
  )
  return d ? d.employee_name : ''
}

// 해당 팀의 “팀장” (position_code = 'P002') 조회
function getTeamRep(teamCode) {
  const t = props.employees.find(
    e => e.team_code === teamCode && e.position_code === 'P002'
  )
  return t ? t.employee_name : ''
}
</script>

<style scoped>
.org-container {
  font-size: 14px;
  color: #333;
  padding: 0 12px;
}
.company-title {
  font-size: 18px;
  margin-bottom: 12px;
}
.company-title .rep {
  font-size: 14px;
  color: #666;
}
.org-list,
.org-list ul {
  list-style: none;
  margin: 0;
  padding: 0;
}
.org-list li {
  position: relative;
  padding-left: 24px;
}

/* 세로 라인 */
.org-list li::before {
  content: '';
  position: absolute;
  top: 0;
  left: 8px;
  width: 2px;
  height: 100%;
  background: #ccc;
}
/* 가로 라인 */
.org-list li::after {
  content: '';
  position: absolute;
  top: 12px;
  left: 8px;
  width: 15px;
  height: 2px;
  background: #ccc;
}

.node {
  display: flex;
  align-items: center;
  cursor: pointer;
}
.node.head,
.node.dept,
.node.team {
  font-weight: bold;
}
.node.head {
  font-size: 20px;
  margin-bottom: 12px;
}
.node.dept {
  font-size: 20px;
  margin-bottom: 8px;
}
.node.team {
  font-size: 18px;
  margin-bottom: 6px;
}
.node.emp {
  font-size: 16px;
  margin-bottom: 5px;
  color: #555;
  cursor: default;
}
.node i {
  margin-right: 6px;
  font-size: 12px;
  color: #00a8e8;
}

.node.head:hover,
.node.dept:hover,
.node.team:hover {
  background-color: #f0f0f0;
  border-radius: 4px;
}
</style>
