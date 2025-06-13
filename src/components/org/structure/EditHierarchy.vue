<!-- src/components/org/structure/Hierarchy.vue -->
<template>
  <div class="org-container">
    <!-- 1) 최상위 회사 노드 -->
    <div
      class="node head-root"
      @click="toggleRoot"
      :class="{ 'expanded-root': expandedRoot }"
    >
      <i :class="expandedRoot ? 'fa fa-chevron-down' : 'fa fa-chevron-right'"></i>
      DDIS <span class="rep">{{ getCompanyRep() }}</span>
    </div>
    <div class="control-buttons">
      <button @click="expandAll" class="control-btn">전체 보기</button>
      <button @click="collapseAll" class="control-btn">전체 닫기</button>
    </div>

    <!-- 2) DDIS가 펼쳐져 있을 때 본부 목록 표시 -->
    <ul v-show="expandedRoot" class="org-list">
      <li v-for="hq in headquarters" :key="hq.headCode">
        <!-- 본부 노드 -->
        <div
          class="node head"
          @click="toggleHead(hq.headCode)"
          @dragover.prevent="onDragOver"
          @dragleave="onDragLeave"
          @drop="onDrop('head', hq, $event)"
        >
          <i :class="expanded[hq.headCode] ? 'fa fa-chevron-down' : 'fa fa-chevron-right'" />
          {{ hq.headName }}
          
        </div>

        <!-- 본부가 펼쳐져 있을 때 하위 부서 목록 표시 -->
        <ul v-show="expanded[hq.headCode]">
          <li
            v-for="dept in getDepartments(hq.headId)"
            :key="dept.departmentCode"
          >
            <!-- 부서 노드: 클릭 시 토글, 드래그 가능 -->
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
                :class="expanded[dept.departmentCode]
                  ? 'fa fa-chevron-down'
                  : 'fa fa-chevron-right'"
              />
              {{ dept.departmentName }}
              
            </div>

            <!-- 부서가 펼쳐졌을 때 하위 팀 표시 -->
            <ul v-show="expanded[dept.departmentCode]">
              <li
                v-for="team in getTeams(dept.departmentId)"
                :key="team.teamCode"
              >
                <!-- 팀 노드: 클릭 시 토글, 드래그 가능 -->
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
                    :class="expanded[team.teamCode]
                      ? 'fa fa-chevron-down'
                      : 'fa fa-chevron-right'"
                  />
                  {{ team.teamName }}
                  
                </div>

                <!-- 팀이 펼쳐졌을 때 직원 표시 -->
                <ul v-show="expanded[team.teamCode]">
                  <li
                    v-for="emp in getEmployeesByTeam(team.teamCode)"
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
    <!-- 저장/취소 버튼 -->
    <div class="move-buttons">
      <button class="btn-cancel" @click="cancelChanges">취소</button>
      <button class="btn-confirm" :disabled="pendingMoves.length === 0" @click="saveChanges">
        저장
      </button>
      <span v-if="pendingMoves.length">(총 {{ pendingMoves.length }}건 대기 중)</span>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue'
import axios from 'axios'

const dragData = ref({ type: null, item: null }) 
const pendingMoves = ref([])  

// --- 2) 컴포넌트 내부 상태 ---
const headquarters = ref([]) 
const departments = ref([]) 
const teams = ref([]) 
const employees = ref([]) 


// 최상위 “DDIS” 노드 펼침 상태
const expandedRoot = ref(true)

// 본부/부서/팀 각각 펼침 상태 저장용
const expanded = reactive({}) 


// 부모 컴포넌트로 이벤트 전달
const emit = defineEmits(['dept-selected', 'team-selected'])


// --- 3) Mounted 시점에 백엔드에서 조직 계층과 사원 정보 가져오기 ---
onMounted(async () => {
  try {
    // 1) 본부→부서→팀→사원 계층 전체 조회
    const res = await fetch('http://localhost:8000/structure/hierarchy')
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json()

    // 3-1) 본부 목록만 저장
    headquarters.value = data.map(h => ({
      headId: h.headId,
      headName: h.headName,
      headCode: h.headCode || '',
      departments: h.departments 
    }))

    // 3-2) departments, teams, employees 배열을 분리하여 보관
    const deptList = []
    const teamList = []
    const empList = []

    data.forEach(hq => {
      hq.departments.forEach(d => {
        deptList.push({
          departmentId: d.departmentId,
          departmentName: d.departmentName,
          departmentCode: d.departmentCode,
          headId: hq.headId
        })
        d.teams.forEach(t => {
          teamList.push({
            teamId: t.teamId,
            teamName: t.teamName,
            teamCode: t.teamCode,
            departmentId: d.departmentId
          })
          t.members.forEach(e => {
            empList.push({
              employeeId:   e.employeeId,
              employeeName: e.employeeName,
              positionCode: e.positionCode,
              positionName: e.positionName,
              rankCode:     e.rankCode,
              rankName:     e.rankName,
              headCode:     e.headCode || '',
              departmentCode: e.departmentCode || '',
              teamCode:     e.teamCode || '',
              email:        e.email || '',
              birthdate:    e.birthdate || ''
            })
          })
        })
      })
    })

    departments.value = deptList
    teams.value       = teamList
    employees.value   = empList

    // 2) position / rank 데이터가 별도 API가 있으면 여기서 fetch하여 저장
    // positions.value = [...]
    // ranks.value     = [...]

  } catch (err) {
    console.error('❌ 조직 계층 로드 실패:', err)
  }
})

// --- 4) 트리 토글 함수들 ---
function toggleRoot() {
  expandedRoot.value = !expandedRoot.value
}
function toggleHead(headCode) {
  expanded[headCode] = !expanded[headCode]
}
function toggleDept(deptCode) {
  expanded[deptCode] = !expanded[deptCode]
}
function toggleTeam(teamCode) {
  expanded[teamCode] = !expanded[teamCode]
}

// 부서 선택 시 (DeptQueryDTO 전체 객체)
function selectDepartment(dept) {
  toggleDept(dept.departmentCode)
  emit('dept-selected', dept)
}

// 팀 선택 시 (TeamQueryDTO 전체 객체)
function selectTeam(team) {
  toggleTeam(team.teamCode)
  emit('team-selected', team)
}

// --- 5) 드래그 & 드롭 이벤트 처리 ---
// 드래그 시작 → 어떤 객체를 드래그했는지 저장
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
async function onDrop(targetType, targetItem, event) {
  const node = event.currentTarget.querySelector('.node')
  if (node) node.classList.remove('drag-over')

  const { type, item } = dragData.value
  console.log('onDrop', type, '→', targetType, item, 'to', targetItem)
  if (type === 'department' && targetType === 'head') {
    item.headId = targetItem.headId
    // 변경 이력을 남겨둡니다.
    pendingMoves.value.push({
      type: 'department',
      itemId: item.departmentId,
      newParentId: item.headId,
      payload: {
        departmentName: item.departmentName,
        headId: item.headId
      }
    })
  }
  else if (type === 'team' && targetType === 'department') {
    item.departmentId = targetItem.departmentId
     pendingMoves.value.push({
      type: 'team',
      itemId: item.teamId,
      newParentId: item.departmentId,
      payload: {
        teamName: item.teamName,
        departmentId: item.departmentId
      }
    })
  }
    dragData.value = { type: null, item: null }
  }


// --- 6) 트리에서 필요한 데이터 조회 헬퍼 함수들 ---
// headId → 본부 소속 부서 목록 반환
function getDepartments(headId) {
  return departments.value.filter(d => d.headId === headId)
}
// departmentId → 부서 소속 팀 목록 반환
function getTeams(departmentId) {
  return teams.value.filter(t => t.departmentId === departmentId)
}
// teamCode → 해당 팀 소속 직원 목록 반환
function getEmployeesByTeam(teamCode) {
  return employees.value.filter(e => e.teamCode === teamCode)
}

// --- 7) 사원 정보 조회 헬퍼 함수들 ---
// “회사 대표” (positionCode = 'P005')
function getCompanyRep() {
  const ceo = employees.value.find(e => e.positionCode === 'P005')
  return ceo ? ceo.employeeName : ''
}
// 해당 본부의 “본부장” (positionCode = 'P004')
function getHeadRep(headCode) {
  const h = employees.value.find(
    e => e.headCode === headCode && e.positionCode === 'P004'
  )
  return h ? h.employeeName : ''
}
// 해당 부서의 “부서장” (positionCode = 'P003')
function getDeptRep(deptCode) {
  const d = employees.value.find(
    e => e.departmentCode === deptCode && e.positionCode === 'P003'
  )
  return d ? d.employeeName : ''
}
// 해당 팀의 “팀장” (positionCode = 'P002')
function getTeamRep(teamCode) {
  const t = employees.value.find(
    e => e.teamCode === teamCode && e.positionCode === 'P002'
  )
  return t ? t.employeeName : ''
}

/** 변경 내역 서버에 한꺼번에 반영 */
async function saveChanges() {
  try {
    for (const mv of pendingMoves.value) {
      const url = `http://localhost:8000/org/update/${mv.type}/${mv.itemId}`
      await axios.put(url, mv.payload)
    }
    alert('변경 사항이 저장되었습니다.')
    pendingMoves.value = []
  } catch (err) {
    console.error(err)
    alert('저장 중 오류가 발생했습니다.')
  }
}
async function cancelChanges() {
  if (!confirm('모든 변경을 취소하시겠습니까?')) return
  await loadHierarchy()
  pendingMoves.value = []
}

/** 전체 보기 */
function expandAll() {
  // 최상위 노드도 열기
  expandedRoot.value = true

  // 모든 본부 열기
  headquarters.value.forEach(hq => {
    expanded[hq.headCode] = true
  })
  // 모든 부서 열기
  departments.value.forEach(dept => {
    expanded[dept.departmentCode] = true
  })
  // 모든 팀 열기
  teams.value.forEach(team => {
    expanded[team.teamCode] = true
  })
}

/** 전체 닫기 */
function collapseAll() {
  // 최상위 노드도 닫기
  expandedRoot.value = false

  // expanded 객체의 값들을 모두 false 로
  Object.keys(expanded).forEach(key => {
    expanded[key] = false
  })
}
</script>

<style scoped>
.org-container {
  font-size: 14px;
  color: #333;
  padding: 0 12px;
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

/* 최상위 DDIS 노드 스타일 */
.node.head-root {
  font-size: 20px;
  font-weight: bold;

  display: flex;
  align-items: center;
  cursor: pointer;
}
.node.head-root i {
  margin-right: 6px;
  font-size: 12px;
  color: #00a8e8;
}
/* “EXPANDED” 상태 강조 */
/* .expanded-root {
  background-color: #f3f3f3;
  border-radius: 4px;
  padding: 2px 4px;
} */

/* 계층별 리스트 */
.org-list,
.org-list ul {
  list-style: none;
  margin: 0;
  padding: 0;
}
.org-list li {
  position: relative;
  padding-left: 30px;
}
/* 세로 라인 */
.org-list li::before {
  content: '';
  position: absolute;
  top: 0;
  left: 14px;
  width: 2px;
  height: 100%;
  background: #ccc;
}
/* 가로 라인 */
.org-list li::after {
  content: '';
  position: absolute;
  top: 12px;
  left: 14px;
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

.move-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 16px;
  margin: 20px 0px;
}

.btn-confirm {
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
}

.btn-confirm:hover {
  background-color: #fff;
  color: #00a8e8;
  border: 1px solid #00a8e8;
}

.btn-cancel {
  font-size: 14px;
  font-weight: bold;
  background-color: #D3D3D3;
  color: #000;
  border: none;
  border-radius: 10px;
  padding: 10px 30px;
  font-weight: bold;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: background-color 0.2s, box-shadow 0.2s;
  box-sizing: border-box;
}
.btn-cancel:hover {
  background-color: #000;
  color: #fff;
}
</style>
