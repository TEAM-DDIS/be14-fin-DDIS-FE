<template>
  <div class="org-container">
    <!-- 최상위 회사 노드 -->
    <div
      class="node head-root"
      @click="toggleRoot"
      :class="{ 'expanded-root': expandedRoot }"
    >
      <i :class="expandedRoot ? 'fa fa-chevron-down' : 'fa fa-chevron-right'"></i>
      DDIS <span class="rep">{{ getCompanyRep() }}</span>
    </div>

    <!-- DDIS가 펼쳐져 있을 때 본부 목록 표시 -->
    <ul v-show="expandedRoot" class="org-list">
      <li v-for="hq in headquarters" :key="hq.head_code">
        <!-- 본부 노드 -->
        <div
          class="node head"
          @click="toggleHead(hq.head_code)"
          @dragover.prevent="onDragOver"
          @dragleave="onDragLeave"
          @drop="onDrop('head', hq, $event)"
        >
          <i :class="expanded[hq.head_code] ? 'fa fa-chevron-down' : 'fa fa-chevron-right'" />
          {{ hq.head_name }}
          <small>(본부장: {{ getHeadRep(hq.head_code) }})</small>
        </div>

        <!-- 본부가 펼쳐져 있을 때 하위 부서 목록 표시 -->
        <ul v-show="expanded[hq.head_code]">
          <li
            v-for="dept in getDepartments(hq.head_id)"
            :key="dept.department_code"
          >
            <!-- 부서 노드: 클릭 시 토글/emit, draggable -->
            <div
              class="node dept"
              @click.stop="selectDepartment(dept)"
              draggable="true"
              @dragstart="onDragStart('department', dept)"
              @dragover.prevent="onDragOver"
              @dragleave="onDragLeave"
              @drop="onDrop('department', dept, $event)"
            >
              <i
                :class="expanded[dept.department_code]
                  ? 'fa fa-chevron-down'
                  : 'fa fa-chevron-right'"
              />
              {{ dept.department_name }}
              <small>(부서장: {{ getDeptRep(dept.department_code) }})</small>
            </div>

            <!-- 부서가 펼쳐져 있을 때 하위 팀 표시 -->
            <ul v-show="expanded[dept.department_code]">
              <li
                v-for="team in getTeams(dept.department_id)"
                :key="team.team_code"
              >
                <!-- 팀 노드: 클릭 시 토글/emit, draggable -->
                <div
                  class="node team"
                  @click.stop="selectTeam(team)"
                  draggable="true"
                  @dragstart="onDragStart('team', team)"
                  @dragover.prevent="onDragOver"
                  @dragleave="onDragLeave"
                  @drop="onDrop('team', team, $event)"
                >
                  <i
                    :class="expanded[team.team_code]
                      ? 'fa fa-chevron-down'
                      : 'fa fa-chevron-right'"
                  />
                  {{ team.team_name }}
                  <small>(팀장: {{ getTeamRep(team.team_code) }})</small>
                </div>

                <!-- 팀이 펼쳐졌을 때 직원 표시 -->
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
import { reactive, ref, onMounted } from 'vue'

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

// 1) 최상위 “DDIS” 노드 펼침 상태
const expandedRoot = ref(true) // 기본값을 true로 두어 처음에 본부가 보이도록 함

// 2) 각 본부/부서/팀 펼침 상태 저장용
const expanded = reactive({})

// 3) 드래그 중인 객체 정보 (type: 'department'|'team', item: 객체)
const dragData = ref({ type: null, item: null })

// 최상위 “DDIS” 토글
function toggleRoot() {
  expandedRoot.value = !expandedRoot.value
}

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

// 부서 선택 시 토글 후 이벤트 emit
function selectDepartment(dept) {
  toggleDept(dept.department_code)
  emit('dept-selected', dept)
}

// 팀 선택 시 토글 후 이벤트 emit
function selectTeam(team) {
  toggleTeam(team.team_code)
  emit('team-selected', team)
}

// 드래그 시작: type과 해당 아이템을 저장
function onDragStart(type, item) {
  dragData.value = { type, item }
}
// 드래그 오버 시 시각 강조
function onDragOver(event) {
  const node = event.currentTarget.querySelector('.node')
  if (node) node.classList.add('drag-over')
}
// 드래그 떠날 때 강조 제거
function onDragLeave(event) {
  const node = event.currentTarget.querySelector('.node')
  if (node) node.classList.remove('drag-over')
}

// 드롭 처리: 부서→본부, 팀→부서 이동
function onDrop(targetType, targetItem, event) {
  const node = event.currentTarget.querySelector('.node')
  if (node) node.classList.remove('drag-over')

  const { type, item } = dragData.value

  if (type === 'department' && targetType === 'head') {
    // 부서를 새로운 본부로 이동: head_id 갱신
    item.head_id = targetItem.head_id
  } else if (type === 'team' && targetType === 'department') {
    // 팀을 새로운 부서로 이동: department_id 갱신
    item.department_id = targetItem.department_id
  }

  // 드래그 데이터 초기화
  dragData.value = { type: null, item: null }
}

// 본부 ID로 해당 본부의 부서 목록을 반환
function getDepartments(headId) {
  return props.departments.filter(d => d.head_id === headId)
}
// 부서 ID로 해당 부서의 팀 목록을 반환
function getTeams(departmentId) {
  return props.teams.filter(t => t.department_id === departmentId)
}
// 팀 코드로 해당 팀에 속한 직원 목록을 반환
function getEmployeesByTeam(teamCode) {
  return props.employees.filter(e => e.team_code === teamCode)
}

// “회사 대표” (position_code = 'P005') 조회
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

/* 최상위 DDIS 노드 스타일 */
.node.head-root {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  cursor: pointer;
}
.node.head-root i {
  margin-right: 6px;
  font-size: 12px;
  color: #00a8e8;
}
/* “EXPANDED” 상태도 강조 표시 */
.expanded-root {
  background-color: #f0f8ff;
  border-radius: 4px;
  padding: 2px 4px;
}

/* 계층별 리스트 */
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
  padding: 2px 4px;
  border-radius: 4px;
}
.node i {
  margin-right: 6px;
  font-size: 12px;
  color: #00a8e8;
}

/* 본부/부서/팀/직원 폰트 크기 차등 적용 */
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

/* Hover 시 강조 효과 */
.node.head:hover,
.node.dept:hover,
.node.team:hover {
  background-color: #f0f0f0;
}

/* 드래그 오버 시 강조 스타일 */
.drag-over {
  border: 1px solid #2f80ed !important;
  background-color: #eaf4ff !important;
}
</style>
