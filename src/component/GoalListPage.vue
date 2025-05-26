<template>
  <div class="container">
    <h1 class="page-title">목표</h1>

    <!-- 목표 목록 -->
    <table class="goals-table">
      <thead>
        <tr>
          <th>목표</th>
          <th>목표치</th>
          <th>가중치</th>
          <th>달성율</th>
          <th>담당자</th>
          <th>등록일</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="goal in goals"
          :key="goal.id"
          class="clickable"
          :class="{ selected: selectedGoal?.id === goal.id }"
          @click="selectGoal(goal)"
        >
          <td>{{ goal.title }}</td>
          <td>{{ goal.target }}</td>
          <td>{{ goal.weight }}%</td>
          <td>
            <div class="progress-cell">
              <div class="progress-bar-bg">
                <div
                  class="progress-bar-fill"
                  :style="{ width: computedRateValue(goal) + '%' }"
                ></div>
              </div>
              <span>
                {{ temp[goal.id].achievement != null
                  ? computedRate(goal)
                  : '-' }}
              </span>
            </div>
          </td>
          <td>{{ goal.owner }}</td>
          <td>{{ goal.createdAt }}</td>
        </tr>
      </tbody>
    </table>

    <!-- 상세 패널 -->
    <div v-if="selectedGoal" class="detail-panel">
      <!-- 목표 정보 -->
      <div class="info-card">
        <h3>목표 정보</h3>
        <dl>
          <dt>목표명</dt><dd>{{ selectedGoal.title }}</dd>
          <dt>목표수치</dt><dd>{{ selectedGoal.target }}</dd>
          <dt>목표내용</dt><dd>{{ selectedGoal.description }}</dd>
          <dt>담당자</dt><dd>{{ selectedGoal.owner }}</dd>
          <dt>가중치</dt><dd>{{ selectedGoal.weight }}%</dd>
          <dt>등록일</dt><dd>{{ selectedGoal.createdAt }}</dd>
        </dl>
      </div>

      <!-- 실적 입력 -->
      <div class="input-card">
        <h3>실적 입력</h3>
        <div class="field">
          <label>실적 수치</label>
          <input
            type="number"
            v-model.number="temp[selectedGoal.id].achievement"
          />
        </div>
        <div class="field">
          <label>달성율</label>
          <input
            type="text"
            :value="temp[selectedGoal.id].achievement != null
              ? computedRate(selectedGoal)
              : '-'"
            readonly
          />
        </div>
        <div class="field">
          <label>첨부파일</label>
          <input
            type="file"
            @change="onFileChange($event, selectedGoal.id)"
          />
          <p v-if="temp[selectedGoal.id].fileInfo">
            {{ temp[selectedGoal.id].fileInfo.name }}
            ({{ temp[selectedGoal.id].fileInfo.size }}MB)
          </p>
        </div>
      </div>

      <!-- 자기 평가 -->
      <div class="eval-card">
        <h3>자기 평가</h3>
        <textarea
          v-model="temp[selectedGoal.id].selfEval"
          placeholder="평가 내용을 입력하세요"
        ></textarea>
        <button class="btn-save" @click="save(selectedGoal.id)">
          저장
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const goals = ref([])
const selectedGoal = ref(null)
const temp = ref({})

function fetchGoals() {
  fetch('/mockup.json')
    .then(r => r.json())
    .then(data => {
      goals.value = data.goals
      data.goals.forEach(g => {
        temp.value[g.id] = {
          achievement: g.achievementRate,
          selfEval: g.selfEval || '',
          fileInfo: null,
        }
      })
    })
}

function selectGoal(goal) {
  selectedGoal.value =
    selectedGoal.value?.id === goal.id ? null : goal
}

function onFileChange(e, id) {
  const f = e.target.files[0]
  if (!f) return
  temp.value[id].fileInfo = {
    name: f.name,
    size: (f.size / 1024 / 1024).toFixed(1),
    raw: f,
  }
}

function computedRateValue(goal) {
  const a = temp.value[goal.id].achievement
  if (a == null || !goal.target) return 0
  return Math.min(100, Math.max(0, (a / goal.target) * 100))
}

function computedRate(goal) {
  const val = computedRateValue(goal)
  return val ? val.toFixed(1) + '%' : '0%'
}

function save(id) {
  const ach = temp.value[id].achievement
  goals.value = goals.value.map(g =>
    g.id === id ? { ...g, achievementRate: ach } : g
  )
  alert(`저장 완료!\n달성율: ${computedRate(selectedGoal.value)}`)
}

onMounted(fetchGoals)
</script>

<style scoped>
/* 박스 사이즈 꼬이지 않게 */
* { box-sizing: border-box; }

.container {
  padding: 24px;
  background: #fff;
  border-radius: 8px;
}

/* 목록 테이블 */
.goals-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 24px;
}
.goals-table th,
.goals-table td {
  border: 1px solid #e0e6ed;
  padding: 8px;
}
.goals-table th {
  background: #f5f7fa;
  font-weight: 500;
}
.clickable {
  cursor: pointer;
}
.selected {
  background: #eef6ff;
}

/* 상세 패널: 반응형 그리드 + 가로 스크롤 */
.detail-panel {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 16px;
  width: 100%;
  padding: 16px;
  background: #edf5ff;
  border-radius: 8px;
  overflow-x: auto;
}

/* 카드 공통 */
.info-card,
.input-card,
.eval-card {
  background: #fff;
  padding: 12px;
  border-radius: 4px;
}

/* 입력 카드 */
.field {
  margin-bottom: 12px;
}
.field label {
  display: block;
  margin-bottom: 4px;
}
.input-card input[readonly] {
  background: #f5f5f5;
  border: 1px solid #ccc;
  padding: 6px;
}

/* 자기 평가 카드 */
.eval-card {
  display: flex;
  flex-direction: column;
}
.eval-card textarea {
  flex: 1;
  width: 100%;
  resize: none;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
}
.btn-save {
  margin-top: 12px;
  align-self: flex-end;
  padding: 6px 12px;
  background: #67c23a;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

/* 목록용 게이지 */
.progress-cell {
  display: flex;
  align-items: center;
}
.progress-bar-bg {
  flex: 1;
  height: 8px;
  background: #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
  margin-right: 8px;
}
.progress-bar-fill {
  height: 100%;
  background: #67c23a;
  transition: width 0.3s ease;
}
</style>
