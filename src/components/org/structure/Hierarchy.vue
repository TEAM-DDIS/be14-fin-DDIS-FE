<template>
  <div class="org-container">
    <h3 class="company-title">
      DDIS <span class="rep">{{ getCompanyRep() }}</span>
    </h3>
    <ul class="org-list">
      <li v-for="hq in headquarters" :key="hq.head_code">
        <div class="node head" @click="toggle(hq.head_code)">
          <i :class="expanded[hq.head_code] ? 'fa fa-chevron-down' : 'fa fa-chevron-right'" />
          {{ hq.head_name }} <small>(본부장: {{ getHeadRep(hq.head_code) }})</small>
        </div>
        <ul v-show="expanded[hq.head_code]">
          <li v-for="dept in getDepartments(hq.head_code)" :key="dept.department_code">
            <div class="node dept" @click="toggle(dept.department_code)">
              <i :class="expanded[dept.department_code] ? 'fa fa-chevron-down' : 'fa fa-chevron-right'" />
              {{ dept.department_name }} <small>(부서장: {{ getDeptRep(dept.department_code) }})</small>
            </div>
            <ul v-show="expanded[dept.department_code]">
              <li v-for="team in getTeams(dept.department_code)" :key="team.team_code">
                <div class="node team" @click.stop="selectTeam(team)">
                  <i :class="expanded[team.team_code] ? 'fa fa-chevron-down' : 'fa fa-chevron-right'" />
                  {{ team.team_name }} <small>(팀장: {{ getTeamRep(team.team_code) }})</small>
                </div>
                <ul v-show="expanded[team.team_code]">
                  <li v-for="emp in getEmployees(team.team_code)" :key="emp.employee_id">
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
import { ref, reactive, onMounted } from 'vue'

// 팀 선택 이벤트 emit 정의
const emit = defineEmits(['team-selected'])

const headquarters = ref([])
const departments  = ref([])
const teams        = ref([])
const employees    = ref([])
const positions    = ref([])
const ranks        = ref([])
const expanded     = reactive({})

function toggle(key) {
  expanded[key] = !expanded[key]
}

function selectTeam(team) {
  toggle(team.team_code)
  emit('team-selected', team)
}

onMounted(async () => {
  try {
    const res = await fetch('/org.json')
    const oData = await res.json()
    headquarters.value = oData.headquarters
    departments.value  = oData.department
    teams.value        = oData.team
    positions.value    = oData.position
    ranks.value        = oData.rank
    employees.value    = oData.employees.map(e => ({
      ...e,
      position_name: oData.position.find(p => p.position_code === e.position_code)?.position_name || '',
      rank_name:     oData.rank.find(r => r.rank_code     === e.rank_code    )?.rank_name     || ''
    }))
  } catch (err) {
    console.error('org.json 로드 실패:', err)
  }
})

function getDepartments(headCode) {
  const headId = Number(headCode.slice(1))
  return departments.value.filter(d => d.head_id === headId)
}

function getTeams(deptCode) {
  const deptId = Number(deptCode.slice(1))
  return teams.value.filter(t => t.department_id === deptId)
}

function getEmployees(teamCode) {
  return employees.value.filter(e => e.team_code === teamCode)
}

function getCompanyRep() {
  const ceo = employees.value.find(e => e.position_code === 'P005')
  return ceo ? ceo.employee_name : ''
}

function getHeadRep(headCode) {
  const h = employees.value.find(
    e => e.head_code === headCode && e.position_code === 'P004'
  )
  return h ? h.employee_name : ''
}

function getDeptRep(deptCode) {
  const d = employees.value.find(
    e => e.department_code === deptCode && e.position_code === 'P003'
  )
  return d ? d.employee_name : ''
}

function getTeamRep(teamCode) {
  const t = employees.value.find(
    e => e.team_code === teamCode && e.position_code === 'P002'
  )
  return t ? t.employee_name : ''
}
</script>

<style scoped>
.org-container {
  padding: 20px;
  background: #fff;
}
.company-title {
  font-size: 20px;
  margin-bottom: 16px;
}
.company-title .rep {
  font-size: 14px;
  color: #666;
}
.org-list,
.org-list ul {
  list-style: none;
  padding: 0;
  margin: 0;
}
.org-list li {
  position: relative;
  padding-left: 30px;
}

.org-list li::before {
  content: '';
  position: absolute;
  top: 0;
  left: 10px;
  width: 2px;
  height: 100%;
  background: #ccc;
}
.org-list li::after {
  content: '';
  position: absolute;
  top: 12px;
  left: 10px;
  width: 15px;
  height: 2px;
  background: #ccc;
}

.node {
  display: flex;
  align-items: center;
  cursor: pointer;
}
.node i {
  margin-right: 6px;
}
.node.head {
  font-weight: 600;
  font-size: 20px;
  margin-bottom: 12px;
}
.node.dept {
  font-size: 18px;
  margin-bottom: 12px;
}
.node.team {
  font-size: 17px;
  margin-bottom: 10px;
}
.node.emp {
  font-size: 14px;
  margin-bottom: 8px;
  color: #555;
  cursor: default;
}
</style>