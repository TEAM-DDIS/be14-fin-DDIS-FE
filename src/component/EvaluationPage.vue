
<template>
  <div class="page">
    <h1 class="page-title">평가</h1>

    <div class="eval-wrapper">
      <!-- 좌: 직원 리스트 -->
      <div class="panel employees">
        <ul>
          <li
            v-for="emp in employees"
            :key="emp.id"
            :class="{ active: selected?.id === emp.id }"
            @click="selectEmployee(emp)"
          >
            <span class="icon">👤</span>
            <div class="info">
              <div class="role">{{ emp.role }} · {{ emp.team }}</div>
              <div class="name">{{ emp.name }}</div>
            </div>
            <span class="arrow">›</span>
          </li>
        </ul>
      </div>

      <!-- 중: 선택 직원 목표 카드 -->
      <div class="panel goals">
        <div
          v-for="goal in selectedGoals"
          :key="goal.id"
          class="goal-card"
        >
          <div class="left-bar"></div>
          <div class="content">
            <h3 class="goal-title">{{ goal.title }}</h3>
            <div class="stats">
              <span>목표 {{ goal.target }}</span>
              <span>실적 {{ goal.achievement }}</span>
              <span>가중치 {{ goal.weight }}%</span>
            </div>
            <div class="rate">달성률 {{ computedRate(goal) }}</div>
          </div>
          <select v-model="grades[goal.id]">
            <option>탁월</option>
            <option>우수</option>
            <option>보통</option>
            <option>미흡</option>
          </select>
        </div>
      </div>

      <!-- 우: 평가 의견 (고정, 스크롤 제외) -->
      <div class="panel review">
        <h3 class="panel-title">평가의견</h3>
        <textarea
          v-model="comment"
          placeholder="의견을 입력하세요"
        ></textarea>
        <button class="btn-save" @click="saveReview">
          저장
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const employees   = ref([])
const goals       = ref([])
const evaluations = ref([])

const selected = ref(null)
const grades   = ref({})
const comment  = ref('')

function fetchData() {
  fetch('/eval-data.json')
    .then(r => {
      if (!r.ok) throw new Error(`HTTP ${r.status}`)
      return r.json()
    })
    .then(data => {
      employees.value   = data.employees
      goals.value       = data.goals
      evaluations.value = data.evaluations
      data.goals.forEach(g => { grades.value[g.id] = '보통' })
    })
    .catch(err => {
      console.error('데이터 로드 실패:', err)
      alert('데이터를 불러올 수 없습니다.')
    })
}

function selectEmployee(emp) {
  selected.value = emp
  const ev = evaluations.value.find(e => e.employeeId === emp.id)
  if (ev) {
    ev.grades.forEach(g => { grades.value[g.goalId] = g.grade })
    comment.value = ev.comment
  } else {
    selectedGoals.value.forEach(g => { grades.value[g.id] = '보통' })
    comment.value = ''
  }
}

const selectedGoals = computed(() =>
  goals.value.filter(g => g.employeeId === selected.value?.id)
)

function computedRate(goal) {
  const p = (goal.achievement / goal.target) * 100
  return isFinite(p) ? p.toFixed(1) + '%' : '-'
}

function saveReview() {
  const payload = {
    employeeId: selected.value.id,
    grades: selectedGoals.value.map(g => ({
      goalId: g.id,
      grade: grades.value[g.id]
    })),
    comment: comment.value
  }
  console.log('저장 payload:', payload)
  alert('평가가 저장되었습니다.')
}

onMounted(fetchData)
</script>

<style scoped>
.page {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 32px;
  background: #f5faff;
}

.page-title {
  font-size: 32px;
  margin-bottom: 24px;
  text-align: center;
}

.eval-wrapper {
  display: grid;
  grid-template-columns: 240px 1fr 360px;
  gap: 24px;
  width: 100%;
  max-width: 1400px;
  height: 75vh;
}

/* 좌/중 패널 고정 높이, 세로 스크롤 */
.panel.employees,
.panel.goals {
  overflow-y: auto;
  height: 100%;
}

/* 공통 패널 */
.panel {
  background: #fff;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

/* 직원 리스트 */
.employees ul {
  list-style: none;
  padding: 0;
  margin: 0;
}
.employees li {
  display: flex;
  align-items: center;
  padding: 12px;
  cursor: pointer;
  border-radius: 6px;
  margin-bottom: 8px;
  font-size: 16px;
}
.employees li.active {
  background: #e6f7ff;
}
.icon {
  font-size: 28px;
  margin-right: 12px;
}
.role {
  font-size: 14px;
  color: #666;
}
.name {
  font-size: 18px;
  font-weight: bold;
}
.arrow {
  margin-left: auto;
  font-size: 20px;
}

/* 목표 카드 */
.goals .goal-card {
  display: flex;
  align-items: center;
  background: #f8f9fa;
  margin-bottom: 16px;
  border-radius: 8px;
  overflow: hidden;
  padding: 8px;
}
.left-bar {
  width: 8px;
  background: #409eff;
}
.content {
  flex: 1;
  padding: 16px;
}
.goal-title {
  margin: 0 0 8px;
  font-size: 18px;
}
.stats span {
  margin-right: 16px;
  font-size: 14px;
  color: #444;
}
.rate {
  font-size: 14px;
  font-weight: bold;
}
.goals select {
  margin-left: 16px;
  padding: 6px;
  font-size: 14px;
}

/* 평가 의견 (고정, 스크롤 제외) */
.review {
  display: flex;
  flex-direction: column;
  height: 100%;
}
.panel-title {
  margin: 0 0 12px;
  font-size: 18px;
}
textarea {
  flex: 1;
  resize: none;
  padding: 12px;
  font-size: 16px;
  border: 1px solid #ccc;
  border-radius: 6px;
  margin-bottom: 16px;
}
.btn-save {
  align-self: flex-end;
  padding: 8px 16px;
  font-size: 16px;
  background: #67c23a;
  color: #fff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}
</style>

