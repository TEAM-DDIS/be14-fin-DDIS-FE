<template>
  <div class="goal-page">
    <h1 class="page-title">내가 쓴 평가</h1>
    <p class="desc" style="margin-left:20px; margin-bottom:10px;">실적 목록</p>

    <div class="panels">
      <!-- Left: 내가 평가한 목표만 -->
      <section class="panel goals-panel">
        <div v-if="evaluatedGoals.length === 0" class="placeholder">
          <p class="placeholder-text">아직 평가를 작성한 목표가 없습니다.</p>
        </div>
        <div v-else class="goals-list">
          <div
            v-for="goal in evaluatedGoals"
            :key="goal.goalId"
            class="goal-card"
            :class="{ selected: selected === goal.goalId }"
            @click="selectGoal(goal)"
          >
            <div class="card-top">
              <span class="date">{{ formatDate(goal.goalCreatedAt) }}</span>
              <span class="author">{{ goal.employeeName }}</span>
            </div>
            <h4 class="card-title">{{ goal.goalTitle }}</h4>
          </div>
        </div>
      </section>

      <!-- Right: 상사 평가 점수만 읽기 전용 -->
      <section class="panel perf-panel">
        <div v-if="!selectedGoal" class="empty">
          <p class="empty-text">왼쪽에서 평가를 본 목표를 선택해주세요.</p>
        </div>
        <div v-else class="perf-content">
          <h3 class="perf-title">{{ selectedGoal.goalTitle }}</h3>
          <table class="detail-table-vertical">
            <tbody>
              <tr>
                <th>상사 평가 점수</th>
                <td>
                  {{ selectedGoal.performance.review?.reviewScore ?? '미등록' }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'

const goals     = ref([])
const selected  = ref(null)
const userStore = useUserStore()

// performance.review.reviewScore 가 있는 목표만
const evaluatedGoals = computed(() =>
  goals.value.filter(g => g.performance && g.performance.review)
)

const selectedGoal = computed(() =>
  evaluatedGoals.value.find(g => g.goalId === selected.value)
)

function formatDate(iso) {
  return iso?.slice(0, 10) || ''
}

async function fetchGoals() {
  const token = localStorage.getItem('token')
  try {
    const res = await fetch('http://localhost:8000/goals', {
      headers: { Authorization: `Bearer ${token}` }
    })
    if (!res.ok) throw new Error('목표 불러오기 실패')
    goals.value = await res.json()
  } catch (e) {
    console.error(e)
    goals.value = []
  }
}

function selectGoal(goal) {
  selected.value = goal.goalId
}

onMounted(fetchGoals)
</script>

<style scoped>
.page-title {
  margin-left: 20px;
  margin-bottom: 30px;
  color: #00a8e8;
}
.desc {
  font-size: 18px;
}
.panels {
  display: flex;
  margin-left: 20px;
  height: calc(100vh - 100px);
}
.panel {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  padding: 24px;
}
.goals-panel {
  width: 45%;
  overflow-y: auto;
}
.perf-panel {
  width: 55%;
  background: #f5f5f5;
  overflow-y: auto;
}
.placeholder, .empty {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}
.placeholder-text, .empty-text {
  color: #00a8e8;
  font-size: 1.2rem;
  font-weight: 600;
}
.goals-list {
  display: flex;
  flex-direction: column;
}
.goal-card {
  padding: 16px;
  margin-bottom: 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s, border-color 0.2s;
}
.goal-card.selected {
  background: #eef;
  border-color: #00a8e8;
}
.card-top {
  display: flex;
  justify-content: space-between;
  color: #888;
  font-size: 0.85rem;
  margin-bottom: 8px;
}
.card-title {
  font-size: 1rem;
  font-weight: 600;
}
.perf-content {
  margin-top: 16px;
}
.perf-title {
  color: #00a8e8;
  font-size: 1.5rem;
  margin-bottom: 16px;
}
.detail-table-vertical {
  width: 100%;
  border-collapse: collapse;
}
.detail-table-vertical th,
.detail-table-vertical td {
  border: 1px solid #e0e0e0;
  padding: 12px;
  text-align: center;
  background: #fff;
}
.detail-table-vertical th {
  background: #fafafa;
  font-weight: 600;
}
</style>
