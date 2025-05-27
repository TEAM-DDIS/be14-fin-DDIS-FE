<!-- 조직 및 직무 > 조직도 구성 -->
<template>
  <div class="org-container">
    <h2 class="company-title">DDIS <span class="rep">({{ getCompanyRep() }})</span></h2>
    <ul class="org-list">
      <li v-for="hq in headquarters" :key="hq.head_code">
        <div class="node head" @click="toggle(hq.head_code)">
          <i :class="expanded[hq.head_code] ? 'fa fa-chevron-down' : 'fa fa-chevron-right'"/>
          {{ hq.head_name }} <small>({{ getHeadRep(hq.head_code) }})</small>
        </div>
        <ul v-show="expanded[hq.head_code]">
          <li v-for="dept in getDepartments(hq.head_code)" :key="dept.department_code">
            <div class="node dept" @click="toggle(dept.department_code)">
              <i :class="expanded[dept.department_code] ? 'fa fa-chevron-down' : 'fa fa-chevron-right'"/>
              {{ dept.department_name }} <small>({{ getDeptRep(dept.department_code) }})</small>
            </div>
            <ul v-show="expanded[dept.department_code]">
              <li v-for="team in getTeams(dept.department_code)" :key="team.team_code">
                <div class="node team" @click="toggle(team.team_code)">
                  <i :class="expanded[team.team_code] ? 'fa fa-chevron-down' : 'fa fa-chevron-right'"/>
                  {{ team.team_name }} <small>({{ getTeamRep(team.team_code) }})</small>
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
import axios from 'axios'

const headquarters = ref([])
const departments  = ref([])
const teams        = ref([])
const employees    = ref([])
const positions    = ref([])
const ranks        = ref([])
const expanded     = reactive({})
function toggle(key) { expanded[key] = !expanded[key] }

onMounted(async () => {
  const [hRes,dRes,tRes,eRes,pRes,rRes] = await Promise.all([
    axios.get('http://localhost:3000/headquarters'),
    axios.get('http://localhost:3000/department'),
    axios.get('http://localhost:3000/team'),
    // axios.get('http://localhost:3000/employees'),
    axios.get('http://localhost:3000/position'),
    axios.get('http://localhost:3000/rank')
  ])
  headquarters.value = hRes.data
  departments.value  = dRes.data
  teams.value        = tRes.data
  employees.value    = eRes.data
  positions.value    = pRes.data
  ranks.value        = rRes.data
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
  return employees.value
    .filter(e => e.team_code === teamCode)
    .map(e => {
      const pos = positions.value.find(p=>p.position_code===e.position_code)||{}
      const rk  = ranks.value.find(r=>r.rank_code===e.rank_code)||{}
      return { ...e, position_name: pos.position_name||'', rank_name: rk.rank_name||'' }
    })
}
function getCompanyRep() {
  const ceo = employees.value.find(e=>e.position_code==='P005')
  return ceo?ceo.employee_name:''
}
function getHeadRep(headCode) {
  const h = employees.value.find(e=>e.head_code===headCode && e.position_code==='P004')
  return h?h.employee_name:''
}
function getDeptRep(deptCode) {
  const d = employees.value.find(e=>e.department_code===deptCode && e.position_code==='P003')
  return d?d.employee_name:''
}
function getTeamRep(teamCode) {
  const t = employees.value.find(e=>e.team_code===teamCode && e.position_code==='P002')
  return t?t.employee_name:''
}
</script>

<style scoped>
.org-container { padding:20px; background:#fff; }
.company-title { font-size:25px; margin-bottom:16px; }
.company-title .rep { font-size:14px; color:#666; }
.org-list, .org-list ul { list-style:none; padding:0; margin:0; }
.org-list li { position: relative; padding-left:20px; }
.org-list li::before {
  content: '';
  position: absolute;
  top: 0;
  left: 10px;
  width: 1px;
  height: 100%;
  background: #ccc;
}
.org-list li::after {
  content: '';
  position: absolute;
  top: 12px;
  left: 10px;
  width: 10px;
  height: 1px;
  background: #ccc;
}
.node { display:flex; align-items:center; cursor:pointer; }
.node i { margin-right:6px; }
.node.head { font-weight:600; font-size:20px; margin-bottom: 10px; }
.node.dept { font-size:16px; margin-bottom: 8px;}
.node.team { font-size:15px; margin-bottom: 8px;}
.node.emp  { font-size:14px; margin-bottom: 6px; color:#555; cursor:default; }
</style>