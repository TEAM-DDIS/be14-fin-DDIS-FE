<template>
    <div class="org-container">
      <!-- 회사명과 대표자 표시 영역 -->
      <h3 class="company-title">
        DDIS <span class="rep">{{ getCompanyRep() }}</span>
      </h3>
      <!-- 본부 리스트 반복 -->
      <ul class="org-list">
        <li v-for="head in hierarchy" :key="head.headId">
          <!-- 본부 클릭 시 펼침/접힘 토글 -->
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
  
          <!-- 본부가 펼쳐졌을 때 부서 리스트 표시 -->
          <ul v-show="expanded['h' + head.headId]" class="org-list">
            <li v-for="dept in head.departments" :key="dept.departmentId">
              <!-- 부서 클릭 시 토글 & 이벤트 emit -->
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
  
              <!-- 부서가 펼쳐졌을 때 부서장 및 팀 리스트 표시 -->
              <div
                v-show="expanded['d' + dept.departmentId]"
                class="dept-children"
              >
               <!-- 부서장 -->
                  <ul class="member-list">
                    <li v-if="dept.deptManager">
                      <label
                        class="node emp emp-manager"
                        @click.stop="onEmployeeClick(dept.deptManager)"
                      >
                        <input
                          type="checkbox"
                          :value="dept.deptManager.employeeId"
                          v-model.number="selectedEmployees"
                        />
                        <i class="fa fa-user-tie" style="margin-right:6px;" />
                        부장: {{ dept.deptManager.employeeName }}
                      </label>
                    </li>
                  </ul>
  
                <!-- 팀 리스트 반복 -->
                <ul class="team-list">
                  <li v-for="team in dept.teams" :key="team.teamId">
                    <!-- 팀 클릭 시 토글 & 이벤트 emit -->
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
  
                    <!-- 팀이 펼쳐졌을 때 멤버 리스트(부서장 제외) 표시 -->
                    <ul
                      v-show="expanded['t' + team.teamId]"
                      class="member-list"
                    >
                      <li
                        v-for="emp in filteredTeamMembers(team)"
                        :key="emp.employeeId"
                        >
                        <label class="node emp" @click.stop="onEmployeeClick(emp)">
                            <input
                                type="checkbox"
                                :value="emp.employeeId"
                                v-model.number="selectedEmployees"
                            />
                            {{ emp.rankName }} {{ emp.positionName }}: {{ emp.employeeName }}
                          </label>
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
  import { ref, reactive, onMounted, watch } from 'vue'
  
  // 부모 컴포넌트에게 방출할 이벤트 정의
  const emit = defineEmits(['dept-selected','team-selected','employees-selected'])
  
  // 조직 계층 데이터
  const hierarchy = ref([])
  // 펼침/접힘 상태 저장 객체
  const expanded = reactive({})
  // 선택된 사원 ID 리스트
  const selectedEmployees = ref([])
  
  // 컴포넌트가 마운트되면 조직도 API 호출
  onMounted(async () => {
    try {
      const res = await fetch('http://localhost:8000/structure/hierarchy')
      hierarchy.value = await res.json()
          hierarchy.value.forEach(head => {
      head.headManager = findManager(head.departments, '본부장')

      head.departments.forEach(dept => {
        dept.deptManager = findManager(dept.teams, '부서장')
      })
    })

      emit('loaded-hierarchy', hierarchy.value)
    } catch (err) {
      console.error('조직 계층 로드 실패:', err)
    }
  })
  
  // 확장/축소 상태 토글 함수
  function toggle(key) {
    expanded[key] = !expanded[key]
  }
  function onEmployeeClick(emp) {
  emit('employees-selected', [emp.employeeId], emp) // 단일 선택 우선 처리
}
  


  // 부서 클릭 처리: 토글 및 dept-selected 이벤트 emit
  function onDepartmentClick(dept) {
    toggle('d' + dept.departmentId)
    emit('dept-selected', dept)
  }
  
  // 팀 클릭 처리: 토글 및 team-selected 이벤트 emit
  function onTeamClick(team) {
    toggle('t' + team.teamId)
    emit('team-selected', team)
  }
  
  // 회사 대표자 이름 가져오기: positionCode가 'P005'인 headManager
  function getCompanyRep() {
    for (const head of hierarchy.value) {
      if (head.headManager?.positionCode === 'P005') {
        return head.headManager.employeeName
      }
    }
    return ''
  }
  
  // 부서장은 멤버 리스트에서 제외하는 유틸 함수
  function isDeptManager(emp) {
    return emp.rankName === '부장' && emp.positionName === '부서장'
  }
  
  // 팀 멤버 필터링: 부서장 제외
  function filteredTeamMembers(team) {
    return team.members.filter(emp => !isDeptManager(emp))
  }

  function findManager(target, positionName) {
  // target: departments[]  or  teams[]
  const teams = Array.isArray(target[0]?.teams)
    ? target.flatMap(d => d.teams) // 본부 ⇒ 부서의 팀 펼치기
    : target                       // 이미 팀 배열
  for (const t of teams) {
    const found = t.members.find(m => m.positionName === positionName)
    if (found) return found
  }
  return null
}
  
  // selectedEmployees가 변경되면 부모에게 employees-selected 이벤트 emit
  watch(selectedEmployees, (newList) => {
    emit('employees-selected', newList)
  })
  </script>
  
  <style scoped>
  /* 전체 컨테이너 스타일 */
  .org-container {
    font-size: 14px;
    color: #333;
    padding: 0 12px;
  }
  
  /* 회사 제목 및 대표자 스타일 */
  .company-title {
    font-size: 18px;
    margin-bottom: 12px;
  }
  .company-title .rep {
    font-size: 14px;
    color: #666;
  }
  
  /* 리스트 기본 스타일 제거 */
  .org-list,
  .org-list ul {
    list-style: none;
    margin: 0;
    padding: 0;
  }
  
  /* 리스트 레벨 간 연결선 스타일 */
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
  
  /* 노드 공통 스타일 */
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
  
  /* 헤더, 부서, 팀별 글자 크기 및 굵기 차별화 */
  .node.head,
  .node.dept,
  .node.team {
    font-weight: bold;
  }
  .node.head { font-size: 20px; margin-bottom: 12px; }
  .node.dept { font-size: 19px; margin-bottom: 8px; }
  .node.team { font-size: 18px; margin-bottom: 6px; }
  
  /* 사원 노드 스타일 */
  .node.emp { font-size: 16px; margin-bottom: 5px; color: #555; cursor: default; }
  .node.emp-manager { font-size: 16px; margin-bottom: 8px; color: #000; font-weight: bold; padding-left: 16px; }
  
  /* 호버 시 강조 효과 */
  .node.head:hover,
  .node.dept:hover,
  .node.team:hover {
    background-color: #f0f0f0;
    border-radius: 4px;
  }
  
  /* 하위 컨테이너 여백 */
  .dept-children { margin-left: 8px; }
  
  /* 팀 및 멤버 리스트 스타일 */
  .team-list,
  .member-list { list-style: none; margin: 0; padding: 0; }
  .team-list > li,
  .member-list > li { position: relative; padding-left: 24px; }
  </style>
  