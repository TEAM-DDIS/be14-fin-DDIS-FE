<template>
  <div class="org-container">
    <h3 class="company-title">
      DDIS <span class="rep">{{ getCompanyRep() }}</span>
    </h3>
    <ul class="org-list">
      <!-- 1) 본부 반복 -->
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
          
        </div>

        <!-- 본부가 펼쳐졌을 때 부서 표시 -->
        <ul v-show="expanded['h' + head.headId]" class="org-list">
          <li v-for="dept in head.departments" :key="dept.departmentId">
            <div
              class="node dept"
              @click.stop="onDepartmentClick(dept)"
            >
              <i
                :class="
                  expanded['d' + dept.departmentId]
                    ? 'fa fa-chevron-down'
                    : 'fa fa-chevron-right'
                "
              />
              {{ dept.departmentName }}
            </div>

            <!-- 부서가 펼쳐졌을 때 하위 표시 -->
            <div
              v-show="expanded['d' + dept.departmentId]"
              class="dept-children"
            >
              <!-- 부서장 노드 -->
              <div
                v-if="dept.deptManager"
                class="node emp emp-manager"
              >
                부장: {{ dept.deptManager.employeeName }}
              </div>

              <!-- 팀 리스트 -->
              <ul class="team-list">
                <li v-for="team in dept.teams" :key="team.teamId">
                  <div
                    class="node team"
                    @click.stop="onTeamClick(team)"
                  >
                    <i
                      :class="
                        expanded['t' + team.teamId]
                          ? 'fa fa-chevron-down'
                          : 'fa fa-chevron-right'
                      "
                    />
                    {{ team.teamName }}
                  </div>

                  <!-- 팀원이 펼쳐졌을 때 표시 (부서장은 제외) -->
                  <ul
                    v-show="expanded['t' + team.teamId]"
                    class="member-list"
                  >
                    <li
                      v-for="emp in filteredTeamMembers(team)"
                      :key="emp.employeeId"
                    >
                      <div class="node emp">
                        {{ emp.rankName }} {{ emp.positionName }}: {{ emp.employeeName }}
                      </div>
                    </li>
                  </ul>
                </li>
              </ul>
            </div>
          </li>
        </ul>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'

// 상위로 이벤트 발송
const emit = defineEmits(['dept-selected', 'team-selected'])

// 전체 계층 데이터
const hierarchy = ref([])

// 펼침/접힘 상태
const expanded = reactive({})

onMounted(async () => {
  try {
    const res = await fetch('http://localhost:8000/structure/hierarchy')
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    hierarchy.value = await res.json()
  } catch (err) {
    console.error('❌ 조직 계층 로드 실패:', err)
    hierarchy.value = []
  }
})

function toggle(key) {
  expanded[key] = !expanded[key]
}

function onDepartmentClick(dept) {
  toggle('d' + dept.departmentId)
  emit('dept-selected', dept)
}

function onTeamClick(team) {
  toggle('t' + team.teamId)
  emit('team-selected', team)
}

// 회사 대표 찾기 (positionCode === 'P005')
function getCompanyRep() {
  for (const head of hierarchy.value) {
    if (head.headManager?.positionCode === 'P005') {
      return head.headManager.employeeName
    }
  }
  return ''
}

// 부서장 필터링 헬퍼
function isDeptManager(emp) {
  return emp.rankName === '부장' && emp.positionName === '부서장'
}

// 팀원 리스트에서 부서장만 제외
function filteredTeamMembers(team) {
  return team.members.filter(emp => !isDeptManager(emp))
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
.org-list li::before {
  content: '';
  position: absolute;
  top: 0;
  left: 8px;
  width: 2px;
  height: 100%;
  background: #ccc;
}
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
.node i {
  margin-right: 6px;
  font-size: 12px;
  color: #00a8e8;
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
  font-size: 19px;
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
.node.emp-manager {
  font-size: 16px;
  margin-bottom: 8px;
  color: #000;
  font-weight: bold;
  padding-left: 16px;
}

.node.head:hover,
.node.dept:hover,
.node.team:hover {
  background-color: #f0f0f0;
  border-radius: 4px;
}

.dept-children {
  margin-left: 8px;
}

.team-list {
  list-style: none;
  margin: 0;
  padding: 0;
}
.team-list > li {
  position: relative;
  padding-left: 24px;
}

.member-list {
  list-style: none;
  margin: 0;
  padding: 0;
}
.member-list > li {
  position: relative;
  padding-left: 24px;
}
</style>
