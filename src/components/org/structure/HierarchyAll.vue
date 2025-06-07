<template>
  <div class="org-container">
    <h3 class="company-title">
      DDIS <span class="rep">{{ getCompanyRep() }}</span>
    </h3>
    <ul class="org-list">
      <!-- 본부(Head) 반복 -->
      <li v-for="head in hierarchy" :key="head.headId">
        <!-- 본부 노드: 클릭하면 펼침/접힘 -->
        <div class="node head" @click="toggle('h' + head.headId)">
          <i
            :class="
              expanded['h' + head.headId]
                ? 'fa fa-chevron-down'
                : 'fa fa-chevron-right'
            "
          />
          {{ head.headName }}
          <small>(본부장: {{ getHeadRep(head.headId) }})</small>
        </div>

        <!-- 본부가 펼쳐져 있을 때 하위 부서(Department) 표시 -->
        <ul v-show="expanded['h' + head.headId]">
          <li
            v-for="dept in head.departments"
            :key="dept.departmentId"
          >
            <!-- 부서 노드: 클릭하면 dept-selected 이벤트 emit -->
            <div class="node dept" @click.stop="selectDepartment(dept)">
              <i
                :class="
                  expanded['d' + dept.departmentId]
                    ? 'fa fa-chevron-down'
                    : 'fa fa-chevron-right'
                "
              />
              {{ dept.departmentName }}
              <small>(부서장: {{ getDeptRep(dept.departmentId) }})</small>
            </div>

            <!-- 부서가 펼쳐져 있을 때 하위 팀(Team) 표시 -->
            <ul v-show="expanded['d' + dept.departmentId]">
              <li
                v-for="team in dept.teams"
                :key="team.teamId"
              >
                <!-- 팀 노드: 클릭하면 team-selected 이벤트 emit -->
                <div class="node team" @click.stop="selectTeam(team)">
                  <i
                    :class="
                      expanded['t' + team.teamId]
                        ? 'fa fa-chevron-down'
                        : 'fa fa-chevron-right'
                    "
                  />
                  {{ team.teamName }}
                  <small>(팀장: {{ getTeamRep(team.teamId) }})</small>
                </div>

                <!-- 팀이 펼쳐졌을 때, 팀원(Employee) 표시 -->
                <ul v-show="expanded['t' + team.teamId]">
                  <li
                    v-for="emp in team.members"
                    :key="emp.employeeId"
                  >
                    <div class="node emp">
                      {{ emp.rankName }} {{ emp.positionName }}: {{ emp.employeeName }}
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

// 상위 컴포넌트로 이벤트를 내보낼 때 쓸 이벤트 정의
const emit = defineEmits(['dept-selected', 'team-selected'])

// 내부 상태: 백엔드에서 받은 전체 계층 데이터
const hierarchy = ref([])

// 각 노드(본부, 부서, 팀)의 펼침/접힘 상태를 저장할 객체
const expanded = reactive({})

// 페이지가 마운트될 때 백엔드 호출
onMounted(async () => {
  try {
    // ⚠️ 실제 백엔드 포트가 8080이 아니라면 여기를 바꿔 주세요.
    const url = 'http://localhost:8000/structure/hierarchy'
    console.log('📥 조직 계층 호출 URL:', url)
    const res = await fetch(url)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    // HeadQueryDTO[] 형태로 응답
    // HeadQueryDTO {
    //   headId, headName, headCode?,
    //   departments: [
    //     DepartmentQueryDTO {
    //       departmentId, departmentName, departmentCode?, headId,
    //       teams: [
    //         TeamQueryDTO {
    //           teamId, teamName, teamCode?, departmentId,
    //           members: [
    //             EmployeeQueryDTO { employeeId, employeeName, positionCode, positionName, rankCode, rankName, headId, departmentId, teamId, birthdate, email, jobCode? }
    //           ]
    //         }
    //       ]
    //     }
    //   ]
    // }
    hierarchy.value = await res.json()
  } catch (err) {
    console.error('❌ 조직 계층 로드 실패:', err)
    hierarchy.value = []
  }
})

// 토글 함수: key는 'h'+headId, 'd'+deptId, 't'+teamId 형태로 사용
function toggle(key) {
  expanded[key] = !expanded[key]
}

// 부서 선택: 부서 객체(DepartmentQueryDTO) 자체를 emit
function selectDepartment(dept) {
  toggle('d' + dept.departmentId)
  emit('dept-selected', dept)
}

// 팀 선택: 팀 객체(TeamQueryDTO) 자체를 emit
function selectTeam(team) {
  toggle('t' + team.teamId)
  emit('team-selected', team)
}

// “회사 대표(CEO)”를 찾는 헬퍼: positionCode === 'P005' 인 사원 이름 반환
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

// 해당 본부의 “본부장”(positionCode === 'P004') 조회
function getHeadRep(headId) {
  // headId에 맞는 HeadQueryDTO 객체를 찾아서 그 내부 멤버 중 포지션이 'P004'인 사원 찾기
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

// 해당 부서의 “부서장”(positionCode === 'P003') 조회
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

// 해당 팀의 “팀장”(positionCode === 'P002') 조회
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
