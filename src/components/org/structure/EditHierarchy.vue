<!-- EditHierarchy.vue -->
<template>
  <div class="edit-hierarchy">
    <ul class="head-list">
      <li
        v-for="head in heads"
        :key="head.head_id"
        class="node head-node"
       @dragover.prevent="onDragOver($event, 'head', head)"
       @dragleave="onDragLeave($event)"
       @drop="onDrop('head', head)"
      >
        <!-- 본부 이름 (드롭 대상) -->
        <div class="node-label">
          <i class="fa fa-building-o icon-head"></i>
          {{ head.head_name }}
        </div>

        <!-- 이 본부에 속한 부서 목록 -->
        <ul class="dept-list">
          <li
            v-for="dept in departmentsUnderHead(head.head_id)"
            :key="dept.department_id"
            class="node dept-node"
            draggable="true"
            @dragstart="onDragStart('department', dept)"
            @dragover.prevent
            @drop="onDrop('department', dept)"
            @click.stop="selectDept(dept)"
          >
            <!-- 부서 이름 (드래그 가능 + 클릭 시 ‘dept-selected’ 이벤트 발생) -->
            <div class="node-label">
              <i class="fa fa-sitemap icon-dept"></i>
              {{ dept.department_name }}
            </div>

            <!-- 이 부서에 속한 팀 목록 -->
            <ul class="team-list">
              <li
                v-for="team in teamsUnderDept(dept.department_id)"
                :key="team.team_id"
                class="node team-node"
                draggable="true"
                @dragstart="onDragStart('team', team)"
                @dragover.prevent
                @drop="onDrop('team', team)"
                @click.stop="selectTeam(team)"
              >
                <!-- 팀 이름 (드래그 가능 + 클릭 시 ‘team-selected’ 이벤트 발생) -->
                <div class="node-label">
                  <i class="fa fa-users icon-team"></i>
                  {{ team.team_name }}
                </div>
              </li>
            </ul>
          </li>
        </ul>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

/**
 * Props:
 *  - heads:      [{ head_id, head_name, head_code }, ...]
 *  - departments:[{ department_id, department_name, department_code, head_id }, ...]
 *  - teams:      [{ team_id, team_name, team_code, department_id }, ...]
 *  - employees:  (드래그&드롭 시 참고용으로 넘겨두었으나, 여기서는 사용하지 않음)
 *  - positions, ranks: (조회용으로 넘겨두었으나, 여기서는 사용하지 않음)
 */
const props = defineProps({
  heads: {
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
  employees: Array,
  positions: Array,
  ranks: Array
})

const emit = defineEmits([
  'dept-selected',  // 부서 이름 클릭 시 부모에게 알려줌
  'team-selected'   // 팀 이름 클릭 시 부모에게 알려줌
])

// 드래그 중인 아이템(type: 'department'|'team', item: 실제 객체)
const dragData = ref({ type: null, item: null })

/**
 * 드래그 시작할 때 호출
 * @param {String} type  - 'department' 또는 'team'
 * @param {Object} item  - 드래그하고 있는 실제 부서/팀 객체
 */
function onDragStart(type, item) {
  dragData.value = { type, item }
}

/**
 * 드롭할 때 호출
 * @param {String} targetType  - 드롭 대상의 타입('head','department','team')
 * @param {Object} targetItem  - 드롭 대상 객체
 */
function onDrop(targetType, targetItem) {
  // 부서를 본부 위에 드롭했다면 → 해당 부서의 head_id를 바꿔준다
  if (dragData.value.type === 'department' && targetType === 'head') {
    dragData.value.item.head_id = targetItem.head_id
  }
  // 팀을 부서 위에 드롭했다면 → 해당 팀의 department_id를 바꿔준다
  else if (dragData.value.type === 'team' && targetType === 'department') {
    dragData.value.item.department_id = targetItem.department_id
  }
  // 그 외(예를 들어 팀을 팀 위에 드롭 같은 허용하지 않는 경우)는 무시

  // 드래그 데이터 초기화
  dragData.value = { type: null, item: null }
}

/**
 * 특정 본부 ID에 속한 부서들만 필터링
 * @param {Number} headId
 * @returns {Array} 해당 본부의 부서 리스트
 */
function departmentsUnderHead(headId) {
  return props.departments.filter(d => d.head_id === headId)
}

/**
 * 특정 부서 ID에 속한 팀들만 필터링
 * @param {Number} deptId
 * @returns {Array} 해당 부서의 팀 리스트
 */
function teamsUnderDept(deptId) {
  return props.teams.filter(t => t.department_id === deptId)
}

/**
 * 부서 노드 클릭 시
 */
function selectDept(dept) {
  emit('dept-selected', dept)
}

/**
 * 팀 노드 클릭 시
 */
function selectTeam(team) {
  emit('team-selected', team)
}
</script>

<style scoped>
.edit-hierarchy {
  font-family: “Noto Sans KR”, sans-serif;
  font-size: 14px;
  color: #333;
}

/* 최상위 본부(Head) 리스트 */
.head-list {
  list-style: none;
  padding-left: 0;
  margin: 0;
}

/* 본부 노드 */
.head-node {
  margin-bottom: 8px;
  padding: 4px 0;
}

/* 부서 리스트 */
.dept-list {
  list-style: none;
  padding-left: 20px;
  margin: 4px 0 0;
}

/* 부서 노드 */
.dept-node {
  margin-bottom: 4px;
  padding: 4px 0;
}

/* 팀 리스트 */
.team-list {
  list-style: none;
  padding-left: 20px;
  margin: 2px 0 0;
}

/* 팀 노드 */
.team-node {
  margin-bottom: 2px;
  padding: 4px 0;
}

/* 공통 노드 레이블 */
.node-label {
  display: flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: 6px;
  cursor: pointer;
  user-select: none;
}

/* 드래그 가능한 요소에 약간의 호버/포커스 스타일 */
.node-label:hover {
  background-color: #f1f8ff;
}

/* 본부 아이콘 */
.icon-head {
  margin-right: 6px;
  color: #2f80ed;
}
/* 부서 아이콘 */
.icon-dept {
  margin-right: 6px;
  color: #219653;
}
/* 팀 아이콘 */
.icon-team {
  margin-right: 6px;
  color: #f2994a;
}

/* 드롭 가능한 노드(Head 또는 Department)에 시각적 강조선 추가 */
.head-node .node-label,
.dept-node .node-label {
  border: 1px solid transparent;
}
.head-node .node-label.drag-over,
.dept-node .node-label.drag-over {
  border-color: #2f80ed;
  background-color: #eaf4ff;
}

/* 드래그 시 불투명도 조절 */
.node-label[draggable="true"] {
  user-select: none;
}
.node-label[draggable="true"]:active {
  opacity: 0.6;
}
</style>
