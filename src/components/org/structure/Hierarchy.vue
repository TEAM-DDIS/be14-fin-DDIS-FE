<template>
  <div class="org-container">
    <h3 class="company-title">
      DDIS <span class="rep">{{ getCompanyRep() }}</span>
    </h3>
    <ul class="org-list">
      <li v-for="head in hierarchy" :key="head.headId">
        <div class="node head" @click="toggle('h' + head.headId)">
          <i
            :class="
              expanded['h' + head.headId]
                ? 'fa fa-chevron-down'
                : 'fa fa-chevron-right'
            "
          />
          {{ head.headName }}
          <!-- <small>(본부장: {{ getHeadRep(head.headId) }})</small> -->
        </div>
        <ul v-show="expanded['h' + head.headId]">
          <li v-for="dept in head.departments" :key="dept.departmentId">
            <div class="node dept" @click="toggle('d' + dept.departmentId)">
              <i
                :class="
                  expanded['d' + dept.departmentId]
                    ? 'fa fa-chevron-down'
                    : 'fa fa-chevron-right'
                "
              />
              {{ dept.departmentName }}
              <!-- <small>(부서장: {{ getDeptRep(dept.departmentId) }})</small> -->
            </div>
            <ul v-show="expanded['d' + dept.departmentId]">
              <li v-for="team in dept.teams" :key="team.teamId">
                <div class="node team" @click.stop="selectTeam(team)">
                  <i
                    :class="
                      expanded['t' + team.teamId]
                        ? 'fa fa-chevron-down'
                        : 'fa fa-chevron-right'
                    "
                  />
                  {{ team.teamName }}
                  <!-- <small>(팀장: {{ getTeamRep(team.teamId) }})</small> -->
                </div>
                <ul v-show="expanded['t' + team.teamId]">
                  <li
                    v-for="emp in team.members"
                    :key="emp.employeeId"
                  >
                    <div class="node emp">
                      {{ emp.rankName }} {{ emp.positionName }}:
                      {{ emp.employeeName }}
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

const emit = defineEmits(['team-selected'])
const hierarchy = ref([])    // HeadQueryDTO[] 배열
const expanded = reactive({}) // 펼침/접힘 상태: keys = 'h'+headId, 'd'+deptId, 't'+teamId

// 트리 항목 클릭 시 토글
function toggle(key) {
  expanded[key] = !expanded[key]
}

// 팀을 클릭하면 이벤트 발행
function selectTeam(team) {
  toggle('t' + team.teamId)
  emit('team-selected', team)
}

// 회사 대표(CEO)를 찾기: positionCode === 'P005'인 사원 이름 반환
function getCompanyRep() {
  for (const head of hierarchy.value) {
    for (const dept of head.departments) {
      for (const team of dept.teams) {
        for (const emp of team.members) {
          if (emp.positionCode === 'P005') {
            return emp.employeeName
          }
        }
      }
    }
  }
  return ''
}

// 해당 본부장의 사원(직급 P004) 찾아서 이름 반환
function getHeadRep(headId) {
  const head = hierarchy.value.find(h => h.headId === headId)
  if (!head) return ''
  for (const dept of head.departments) {
    for (const team of dept.teams) {
      for (const emp of team.members) {
        if (emp.positionCode === 'P004' && emp.headId === headId) {
          return emp.employeeName
        }
      }
    }
  }
  return ''
}

// 해당 부서장의 사원(직급 P003) 찾아서 이름 반환
function getDeptRep(deptId) {
  for (const head of hierarchy.value) {
    const dept = head.departments.find(d => d.departmentId === deptId)
    if (!dept) continue
    for (const team of dept.teams) {
      for (const emp of team.members) {
        if (emp.positionCode === 'P003' && emp.departmentId === deptId) {
          return emp.employeeName
        }
      }
    }
  }
  return ''
}

// 해당 팀장의 사원(직급 P002) 찾아서 이름 반환
function getTeamRep(teamId) {
  for (const head of hierarchy.value) {
    for (const dept of head.departments) {
      const team = dept.teams.find(t => t.teamId === teamId)
      if (!team) continue
      for (const emp of team.members) {
        if (emp.positionCode === 'P002' && emp.teamId === teamId) {
          return emp.employeeName
        }
      }
    }
  }
  return ''
}

onMounted(async () => {
  try {
    const url = 'http://localhost:8000/structure/hierarchy'
    console.log('📥 조직 계층 호출 URL:', url)
    const res = await fetch(url)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    hierarchy.value = await res.json()
  } catch (err) {
    console.error('❌ 조직 계층 로드 실패:', err)
    hierarchy.value = []
  }
})
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
  font-weight: bold;
  font-size: 20px;
  margin-bottom: 12px;
}
.node.dept {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 12px;
}
.node.team {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 12px;
}
.node.emp {
  font-size: 16px;
  margin-bottom: 8px;
  color: #555;
  cursor: default;
}

.node.head,
.node.dept,
.node.team {
  transition: background-color 0.2s;
}

.node.head:hover,
.node.dept:hover,
.node.team:hover {
  background-color: #eee;
  border-radius: 4px;
}
</style>
