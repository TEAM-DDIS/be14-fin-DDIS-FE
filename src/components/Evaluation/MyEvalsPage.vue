<template>
  <div class="goal-page">
    <h1 class="page-title">
      내가 쓴 평가
    </h1>
    <p class="desc">실적 목록</p>

    <div class="panels">
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

      <section class="panel perf-panel">
        <div v-if="!selectedGoal" class="empty">
          <p class="empty-text">왼쪽에서 평가를 본 목표를 선택해주세요.</p>
        </div>
        <div v-else class="perf-content">
          <h3 class="perf-title">{{ selectedGoal.goalTitle }}</h3>

          <table class="detail-table-vertical" style="margin-bottom:16px;">
            <tbody>
              <tr>
                <th>실적(점수)</th>
                <td>{{ selectedGoal.performance.performanceValue ?? '-' }}</td>
              </tr>
              <tr>
                <th>달성률</th>
                <td>{{ selectedGoal.progress }}%</td>
              </tr>
            </tbody>
          </table>

          <div v-if="!editMode">
            <table class="detail-table-vertical">
              <tbody>
                <tr>
                  <th>목표수치</th>
                  <td>{{ selectedGoal.goalValue }}</td>
                </tr>
                <tr>
                  <th>상사 평가 점수</th>
                  <td>{{ selectedGoal.performance.reviewerScore ?? '-' }}</td>
                </tr>
                <tr>
                  <th>상사 평가 의견</th>
                  <td>
                    {{ selectedGoal.performance.reviewerContent || '없음' }}
                  </td>
                </tr>
                <tr>
                  <th>상사 평가 일자</th>
                  <td>{{ formatDateTime(selectedGoal.performance.reviewerCreatedAt) }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div v-else class="perf-form">
            <div class="form-row">
              <label for="reviewScore">상사 평가 점수</label>
              <select id="reviewScore" v-model="reviewForm.score">
                <option disabled value="">선택</option>
                <option v-for="n in [1,2,3,4,5]" :key="n" :value="n">{{ n }}점</option>
              </select>
            </div>
            <div class="form-row">
              <label for="reviewContent">상사 평가 의견</label>
              <textarea
                id="reviewContent"
                v-model="reviewForm.content"
                placeholder="의견을 입력하세요"
              ></textarea>
            </div>
          </div>

          <!-- 버튼 그룹: 수정/저장, 취소 -->
          <div class="btn-group">
            <button v-if="!editMode" class="btn-primary" @click="editMode = true">
              수정
            </button>
            <template v-else>
              <button class="btn-cancel" @click="editMode = false">취소</button>
              <button class="btn-save" @click="submitReview">저장</button>
            </template>
          </div>
        </div>
      </section>
    </div>
  </div>
    <BaseToast ref="toastRef" />
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useUserStore } from '@/stores/user'
import { useRouter } from 'vue-router'

const goals = ref([])
const selected = ref(null)
const editMode = ref(false)
const reviewForm = ref({ performanceId: null, score: '', content: '' })
const userStore = useUserStore()
const router = useRouter()
const token = useUserStore().accessToken
import BaseToast from '@/components/toast/BaseToast.vue'
const toastRef = ref(null)

// performance.reviewerScore 가 있는 목표만
const evaluatedGoals = computed(() =>
  goals.value.filter(g =>
    g.performance &&
    g.performance.employeeIdReviewer === userStore.employeeId     // 내가 리뷰어인 것만
  )
)
// 선택된 목표
const selectedGoal = computed(() =>
  evaluatedGoals.value.find(g => g.goalId === selected.value)
)

watch(selectedGoal, goal => {
  editMode.value = false
  if (goal && goal.performance) {
    reviewForm.value.performanceId   = goal.performance.performanceId
    reviewForm.value.score    = goal.performance.reviewerScore || ''
    reviewForm.value.content  = goal.performance.reviewerContent || ''
  }
})

// 날짜 형식 YYYY-MM-DD
function formatDate(iso) {
  return iso?.slice(0, 10) || ''
}
// 날짜+시간 형식 YYYY-MM-DD HH:mm
function formatDateTime(iso) {
  if (!iso) return '-'
  const d = new Date(iso)
  const Y = d.getFullYear()
  const M = String(d.getMonth() + 1).padStart(2, '0')
  const D = String(d.getDate()).padStart(2, '0')
  const h = String(d.getHours()).padStart(2, '0')
  const m = String(d.getMinutes()).padStart(2, '0')
  return `${Y}-${M}-${D} ${h}:${m}`
}

async function fetchGoals() {
  const reviewerId = userStore.user.employeeId
  try {
    const res = await fetch(
      `https://api.isddishr.site/review/${reviewerId}/performance`,
      { headers: { Authorization: `Bearer ${token}` } }
    )
    if (!res.ok) throw new Error('내가 쓴 평가 불러오기 실패')
    const data = await res.json()
goals.value = data.map(dto => {
      const perfValue = dto.performanceValue ?? 0
      const goalValue = dto.goalValue ?? 0  
      const progress = goalValue > 0
        ? Math.round((perfValue / goalValue) * 100)
        : 0

      return {
        goalId:        dto.goalId,
        goalTitle:     dto.goalTitle,
        goalValue,
        goalCreatedAt: dto.reviewerCreatedAt,   // 원래 생성일이 필요하면 별도 필드로 담으세요
        performance: {
          performanceValue:  perfValue,
          reviewerScore:     dto.reviewerScore,
          reviewerContent:   dto.reviewerContent,
          reviewerCreatedAt: dto.reviewerCreatedAt,
          performanceId:     dto.performanceId
        },
        progress         // 달성률 추가
      }
    })
  } catch (e) {
    console.error(e)
    goals.value = []
  }
}

function selectGoal(goal) {
  selected.value = goal.goalId
}
function goBack() {
  router.back()
}

async function submitReview() {
  const { performanceId, score, content } = reviewForm.value
  // console.log('perfId=', performanceId)
  if (!performanceId) {
    return showToast('수정할 실적 ID가 없습니다. 먼저 실적을 선택하세요.')
  }
  if (!score) {
    return showToast('평가 점수를 선택해주세요.')
  }

  const token = localStorage.getItem('token')
  const payload = {
    employeeIdReviewer: userStore.employeeId,
    reviewerScore: Number(score),
    reviewerContent: content,
    decision: '승인'
  }

  try {
    const res = await fetch(
      `https://api.isddishr.site/review/manager/performance/${performanceId}/evaluate`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      }
    )
    if (!res.ok) throw new Error('저장 실패')
    const updated = await res.json()
    // 로컬에도 반영
    selectedGoal.value.performance.reviewerScore   = updated.reviewerScore
    selectedGoal.value.performance.reviewerContent = updated.reviewerContent
    editMode.value = false
    showToast('상사평가가 수정되었습니다.')
  } catch (e) {
    console.error(e)
    showToast('수정 중 오류가 발생했습니다.')
  }
}
function showToast(msg) {
  toastRef.value?.show(msg)
}
onMounted(fetchGoals)
</script>



<style scoped>
.page-title {
  margin-left: 20px;
  margin-bottom: 30px;
  color: var(--primary);
}
.desc {
    display: block;
    margin-left: 20px;
    margin-bottom: 10px;
    font-size: 18px;
}
.panels {
  display: flex;
  margin-left: 20px;
  height: calc(100vh - 100px);
}
.panel {
  background: var( --bg-box);
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
  background: var(--calendar-border-color);
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
  position: relative;
  background: var(--bg-box);
  border-radius: 12px;
  box-shadow: 0px 0px 5px 4px var(--menu-btn-shadow);  padding: 16px;
  padding: 16px;
  padding-bottom: 20px;
  margin-bottom: 12px;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}
.goal-card:active {
  box-shadow:
    inset 0 4px 8px rgba(0, 0, 0, 0.15),
    0 2px 8px rgba(0, 0, 0, 0.1);
}

/* 선택(selected) 상태 */
.goal-card.selected {
  box-shadow:
    inset 0 4px 8px rgba(0, 0, 0, 0.15),
    0 2px 8px rgba(0, 0, 0, 0.1);
  transform: translateY(0);
  background-color: var(--ag-primary-hover);
}

.goal-card:hover {
  /* transform: translateY(-2px); */
  box-shadow: inset 0px 0px 5px 4px var(--menu-btn-shadow);
  transition: background-color 0.3s, box-shadow 0.3s;
  background-color: var(--ag-primary-hover);
}
.back-btn {
  width: 25px;
  height: 25px;
  margin-right: -10px;
  cursor: pointer;
}
.card-top {
  display: flex;
  justify-content: space-between;
  color: var(--text-main);
  font-size: 0.85rem;
  margin-bottom: 10px;
  margin-top: 10px;
}
.card-title {
  font-size: 1rem;
  font-weight: 600;
  margin: 4px 0 12px;
  line-height: 1.4;
}
.perf-content {
  margin-top: 16px;
}
.perf-title {
  color: var(--primary);
  font-size: 1.5rem;
  margin-bottom: 16px;
}
.perf-form {
  display: flex;
  flex-direction: column; /* form-row들과 버튼을 세로로 쌓기 */
  max-width: 100%;
}

.form-row select {
  appearance: none;
  background-image: url('data:image/svg+xml;utf8,<svg fill="%23888" height="24" viewBox="0 0 24 24" width="24"><path d="M7 10l5 5 5-5z"/></svg>');
  background-repeat: no-repeat;
  background-position: right 12px center; 
  background-size: 16px;
}

.form-row {
  display: flex;
  flex-direction: column; /* label 위, input/textarea 아래 */
  margin-bottom: 16px;
}

.form-row label {
  display: block;
  margin-bottom: 6px;
  font-weight: 600;
  /* color: #333; */
}

.form-row select,
.form-row textarea {
  font-family: inherit;
  width: 100%;
  padding: 12px;
  font-size: 1rem;
  border: 1px solid var(--border-input);
  border-radius: 8px;
  background-color: var(--bg-main); 
  color: var(--text-main); 
  box-shadow: 0 1px 4px rgba(0,0,0,0.05);
  box-sizing: border-box;
  resize: none;
}
.btn-group {
  margin-top: 30px;
  display: flex;
  position: relative;
  justify-content: flex-end;
  gap: 8px;
}

.btn-primary,
.btn-save,
.btn-cancel {
  font-size: 14px;
  font-weight: bold;
  color: white;
  border: 1px solid transparent;
  border-radius: 10px;
  padding: 10px 30px;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: background-color 0.2s, box-shadow 0.2s;
  box-sizing: border-box;
  
}
.btn-cancel {
  background-color: #d3d3d3;
  color: #000;
  border: none;
}
.btn-cancel:hover {
  background-color: #000;
  color: #fff;
}
.btn-primary,
.btn-save{
  background-color: var(--primary);
  color: var(--text-on-primary);
  border: 1px solid transparent;
}
.btn-primary:hover,
.btn-save:hover {
  background-color: var(--bg-main);
  color: var(--primary);
  border-color: var(--primary);
  box-shadow:
  inset 1px 1px 10px rgba(0, 0, 0, 0.25);
}

.detail-table-vertical {
  width: 100%;
  border-collapse: collapse;
}
.detail-table-vertical th {
  border: 1px solid var(--border-color);
  padding: 12px;
  text-align: left;
  background: var(--bg-label-cell);
  color: var(--text-main);
}
.detail-table-vertical td {
  border: 1px solid var(--border-color);
  background: var(--bg-main);
  padding: 12px;
  text-align: left;
}
.detail-table-vertical th {
  background: var(--bg-label-cell);
  color: var(--text-main);
  font-weight: 600;
  width:45%;
}
</style>
