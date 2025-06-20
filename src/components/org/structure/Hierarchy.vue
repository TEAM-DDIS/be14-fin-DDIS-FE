<template>
  <div class="org-container">
    <h3 class="company-title">
      DDIS <span class="rep">{{ getCompanyRep() }}</span>
    </h3>
    <div class="control-buttons">
      <button @click="expandAll" class="control-btn">전체 보기</button>
      <button @click="collapseAll" class="control-btn">전체 닫기</button>
    </div>

    <div class="org-box">
      <ul class="org-list">
        <li v-for="head in hierarchy" :key="head.headId">
          <div class="node head" @click="toggle('h' + head.headId)">
            <i
              :class="expanded['h' + head.headId] ? 'fa fa-chevron-down' : 'fa fa-chevron-right'"
            />
            {{ head.headName }}
          </div>

          <ul v-show="expanded['h' + head.headId]" class="org-list">
            <li v-for="dept in head.departments" :key="dept.departmentId">
              <div class="node dept" @click.stop="onDepartmentClick(dept)">
                <i
                  :class="expanded['d' + dept.departmentId] ? 'fa fa-chevron-down' : 'fa fa-chevron-right'"
                />
                {{ dept.departmentName }}
              </div>

              <div v-show="expanded['d' + dept.departmentId]" class="dept-children">
                <div v-if="dept.deptManager" class="node emp emp-manager">
                  부장: {{ dept.deptManager.employeeName }}
                </div>

                <ul class="team-list">
                  <li v-for="team in dept.teams" :key="team.teamId">
                    <div class="node team" @click.stop="onTeamClick(team)">
                      <i
                        :class="expanded['t' + team.teamId] ? 'fa fa-chevron-down' : 'fa fa-chevron-right'"
                      />
                      {{ team.teamName }}
                    </div>

                    <!-- <ul v-show="expanded['t' + team.teamId]" class="member-list">
                      <li v-for="emp in filteredTeamMembers(team)" :key="emp.employeeId">
                        <div class="node emp">
                          {{ emp.rankName }} {{ emp.positionName }}: {{ emp.employeeName }}
                        </div>
                      </li>
                    </ul> -->
                  </li>
                </ul>
              </div>
            </li>
          </ul>
        </li>
      </ul>
    </div>
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
    const res = await fetch('http://localhost:5000/structure/hierarchy')
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

// 전체 열기
function expandAll() {
  hierarchy.value.forEach(head => {
    expanded['h' + head.headId] = true
    head.departments.forEach(dept => {
      expanded['d' + dept.departmentId] = true
      dept.teams.forEach(team => {
        expanded['t' + team.teamId] = true
      })
    })
  })
}

// 전체 닫기
function collapseAll() {
  hierarchy.value.forEach(head => {
    expanded['h' + head.headId] = false
    head.departments.forEach(dept => {
      expanded['d' + dept.departmentId] = false
      dept.teams.forEach(team => {
        expanded['t' + team.teamId] = false
      })
    })
  })
}
</script>

<style scoped>
.org-container {
  font-size: 14px;
  color: #333;
  padding: 0 12px;
  margin-bottom: 20px;
}
.company-title {
  font-size: 18px;
  margin-bottom: 8px;
}
.company-title .rep {
  font-size: 14px;
  color: #666;
}

.control-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 4px;
  justify-content: flex-end;
}

.control-btn {
  background-color: #3f3f3f;
  border-radius: 8px;
  border: 1px solid transparent;
  padding: 6px 10px;
  font-size: 12px;
  font-weight: bold;
  color: #ffffff;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: background-color 0.2s, box-shadow 0.2s;
  box-sizing: border-box;
}
.control-btn:hover {
  background-color: white;
  color: #3f3f3f;
  border-color: #3f3f3f;
  box-shadow: inset 1px 1px 10px rgba(0, 0, 0, 0.25);
}

.org-list,
.org-list ul {
  list-style: none;
  margin: 0;
  padding: 0;
}
.org-box {
  height: 400px;
  overflow-y: auto;

  /* Firefox */
  scrollbar-width: thin;
  scrollbar-color: rgba(0,0,0,0.2) rgba(0,0,0,0.05);
}

/* WebKit 기반 스크롤바 전체 너비/트랙/슬라이더 */
.org-box::-webkit-scrollbar {
  width: 6px;
}
.org-box::-webkit-scrollbar-track {
  background: rgba(0,0,0,0.05);
  border-radius: 3px;
}
.org-box::-webkit-scrollbar-thumb {
  background-color: rgba(0,0,0,0.2);
  border-radius: 3px;
  margin: 4px 0;
}
.org-box::-webkit-scrollbar-thumb:hover {
  background-color: rgba(0,0,0,0.3);
}

/* 모든 화살표 버튼(위/아래, 좌/우) 완전 제거 */
/* .org-box::-webkit-scrollbar-button,
.org-box::-webkit-scrollbar-button:start,
.org-box::-webkit-scrollbar-button:end,
.org-box::-webkit-scrollbar-button:vertical:decrement,
.org-box::-webkit-scrollbar-button:vertical:increment,
.org-box::-webkit-scrollbar-button:horizontal:decrement,
.org-box::-webkit-scrollbar-button:horizontal:increment {
  display: none;
  width: 0;
  height: 0;
} */

/* (선택) 모서리 코너 부분도 투명 처리 */
.org-box::-webkit-scrollbar-corner {
  background: transparent;
}

/* 
.org-box.scrollbar {
 scrollbar-width: none;
} */

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
