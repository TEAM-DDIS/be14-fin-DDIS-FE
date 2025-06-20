<template>
  <div class="evaluation-page">
    <main class="main-content">
      <!-- 헤더 -->
      <div class="header-bar">
        <h1 class="page-title">평가</h1>
      </div>

      <div class="content-panels">
        <!-- 1) 평가 대상자 리스트 -->
        <div class="block">
          <p class="desc">팀원 목록</p>
          <section class="panel people-panel">
            <ul class="people-list">
              <li
                v-for="p in people"
                :key="p.id"
                :class="{ selected: selectedEmployee === p.id }"
                @click="selectEmployee(p)"
              >
                <img :src="p.avatar || '/avatars/default.jpg'" alt="avatar" class="avatar" />
                <div class="info">
                  <strong class="name">{{ p.name }}</strong>
                  <span class="role">{{ p.role }}</span>
                </div>
                <span class="dept">{{ p.dept }}</span>
              </li>
            </ul>
          </section>
        </div>

        <!-- 2) 평가 목록 & 과거 평가 탭 -->
        <div class="block">
          <div class="tab-bar">
            <button
              class="tab"
              :class="{ active: showCurrent }"
              @click="switchTab(true)"
            >평가 목록</button>
            <button
              class="tab"
              :class="{ active: !showCurrent }"
              @click="switchTab(false)"
            >과거 평가 목록</button>
          </div>

          <img class="arrows" src="@/assets/icons/Polygon-2.svg" />

          <section class="panel goals-panel">
            <!-- 현재 연도 목표 목록 -->
            <div v-if="showCurrent" class="goals-list">
              <div
                v-for="goal in displayedGoals"
                :key="goal.id"
                class="goal-card"
                :class="{ selected: selectedGoal?.id === goal.id }"
                @click="selectGoal(goal)"
              >
                <div class="card-top">
                  <span class="date">{{ goal.date }}</span>
                  <span class="author">{{ goal.owner }}</span>
                </div>
                <h4 class="card-title">{{ goal.title }}</h4>
                <div class="score-info">
                  <span>목표수치: {{ goal.target }}</span>
                  <span>실적수치: {{ goal.performance }}</span>
                </div>
                <div class="card-bottom">
                  <div class="progress-group">
                    <span class="label">달성률</span>
                    <div class="progress-bar">
                      <div class="progress-fill" :style="{ width: goal.progress + '%' }"></div>
                    </div>
                    <span class="progress-text">{{ goal.progress }}%</span>
                  </div>
                  <div class="pill-group">
                    <span class="pill weight">가중치 {{ goal.weight }}%</span>
                    <span class="pill target">목표치 {{ goal.target }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- 과거 평가 히스토리 -->
            <div v-else class="goals-list">
              <div
                v-for="h in historyRecords"
                :key="h.yearMonth + '_' + h.performanceDescription"
                class="goal-card"
                @click="selectHistory(h)"
              >
                <div class="card-top">
                  <span class="date">{{ h.yearMonth }}</span>
                  <span class="author">&nbsp;</span>
                </div>
                <h4 class="card-title">{{ h.performanceDescription }}</h4>
                <div class="score-info">
                  <span>목표수치: {{ h.goalValue }}</span>
                </div>
                <div class="card-bottom">
                  <div class="progress-group">

                  </div>
                  <div class="pill-group">
                    <span class="pill weight">실적수치: {{ h.performanceValue }}</span>
                    <span class="pill target">상사평가 {{ h.reviewScore }}점</span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

       <div class="block perf-block">
          <p class="desc">평가 내용</p>
          <section class="panel perf-panel hide-scrollbar">
            <!-- 현재 평가 탭 -->
            <div v-if="showCurrent">
              <div v-if="!selectedGoal" class="empty">
                <p class="empty-text">평가할 목표를 선택하세요.</p>
              </div>
              <div v-else class="perf-content">
                <div class="detail-info">
                <table class="detail-table">
                  <tbody>
                    <tr>
                      <th>담당자</th>
                      <td>{{ selectedGoal.owner }} 대리</td>
                    </tr>
                    <tr>
                      <th>가중치</th>
                      <td>{{ selectedGoal.weight }}%</td>
                    </tr>
                    <tr>
                      <th>등록일</th>
                      <td>{{ selectedGoal.date }}</td>
                    </tr>
                    <tr>
                      <th>목표수치</th>
                      <td>{{ selectedGoal.target }}</td>
                    </tr>
                    <tr>
                      <th>실적수치</th>
                      <td>{{ selectedGoal.performance }}</td>
                    </tr>
                    <tr>
                      <th>달성률</th>
                      <td>{{ selectedGoal.progress }}%</td>
                    </tr>
                    <tr class="subheader">
                      <td colspan="2">목표내용</td>
                    </tr>
                    <tr>
                      <td colspan="2" class="description">
                        {{ selectedGoal.description }}
                      </td>
                    </tr>
                    <tr>
                      <th>평가 점수</th>
                      <td>
                        {{ selectedGoal.evaluation.score !== null 
                          ? selectedGoal.evaluation.score + '점' 
                          : '미작성' }}
                      </td>
                    </tr>
                    <tr>
                      <th>평가 의견</th>
                      <td>
                        {{ selectedGoal.evaluation.comment || '없음' }}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>


                <!-- 평가 입력 폼 -->
                <div class="perf-form-fields">
                  <div class="form-group">
                    <label for="score">평가 점수</label>
                    <select id="score" v-model="evalForm.score">
                      <option disabled value="">선택</option>
                      <option v-for="n in 5" :key="n" :value="n">{{ n }}점</option>
                    </select>
                  </div>
                  <div class="form-group">
                    <label for="comment">평가 의견</label>
                    <textarea id="comment" v-model="evalForm.comment" placeholder="의견을 입력하세요"></textarea>
                  </div>
                  <div class="btn-save-wrap">
                    <button class="btn-save" @click="submitManagerEval('반려')">반려</button>
                    <button class="btn-save" @click="submitManagerEval('승인')" style="margin-left:8px;">승인</button>
                  </div>
                </div>
              </div>
            </div>

            <!-- 과거 평가 탭 -->
            <div v-else>
              <div v-if="!selectedHistory" class="empty">
                <p class="empty-text">과거 평가를 선택하세요.</p>
              </div>
              <div v-else class="detail-info">
                <table class="detail-table">
                  <tbody>
                    <tr>
                      <th>평가 연월</th>
                      <td>{{ selectedHistory.yearMonth }}</td>
                    </tr>
                    <tr>
                      <th>목표 제목</th>
                      <td>{{ selectedHistory.performanceDescription }}</td>
                    </tr>
                    <tr>
                      <th>목표 수치</th>
                      <td>{{ selectedHistory.goalValue }}</td>
                    </tr>
                    <tr>
                      <th>실적 수치</th>
                      <td>{{ selectedHistory.performanceValue }}</td>
                    </tr>
                    <tr>
                      <th>자기평가 의견</th>
                      <td>{{ selectedHistory.selfReviewContent }}</td>
                    </tr>
                    <tr>
                      <th>상사평가 점수</th>
                      <td>{{ selectedHistory.reviewScore }}점</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useUserStore } from '@/stores/user'

// 인증과 사용자 상태
const userStore      = useUserStore()
const accessToken    = computed(() => userStore.accessToken)
const currentUser    = computed(() => userStore.user)
const selectedHistory = ref(null)


function getPayload() {
  try {
    const raw = accessToken.value.split('.')[1].replace(/-/g,'+').replace(/_/g,'/')
    return JSON.parse(atob(raw))
  } catch {
    return {}
  }
}
const teamId = computed(() => getPayload().teamId)

// 리액티브 상태
const employees        = ref([])
const selectedEmployee = ref(null)
const showCurrent      = ref(true)
const historyRecords   = ref([])
const selectedGoal     = ref(null)
const evalForm         = reactive({ score: '', comment: '' })

// 직원 목록 매핑
const people = computed(() =>
  employees.value.map(emp => ({
    id:     emp.employeeId,
    name:   emp.employeeName,
    role:   emp.positionName,
    dept:   emp.teamName,
    avatar: emp.avatarUrl || ''
  }))
)

// 목표 리스트 가공
const filteredGoals = computed(() => {
  const emp = employees.value.find(e => e.employeeId === selectedEmployee.value)
  if (!emp?.goals) return []
  return emp.goals.map(g => {
    const perf    = g.performance || {}
    const perfVal = perf.performanceValue || 0
    return {
      id:      g.goalId,
      owner:   emp.employeeName,
      date:    g.goalCreatedAt.split('T')[0],
      title:   g.goalTitle,
      target:  g.goalValue,
      weight:  g.goalWeight,
      performance: perfVal,
      progress:    g.goalValue
        ? Math.round(perfVal / g.goalValue * 100)
        : 0,
      evaluation: {
        score:   perf.reviewerScore ?? null,
        comment: perf.reviewerContent ?? ''
      },
      performanceObj: perf
    }
  })
})
const currentYear      = new Date().getFullYear()
const currentYearGoals = computed(() =>
  filteredGoals.value.filter(g => +g.date.split('-')[0] === currentYear)
)
const pastGoals        = computed(() =>
  filteredGoals.value.filter(g => +g.date.split('-')[0] < currentYear)
)
const displayedGoals   = computed(() =>
  showCurrent.value ? currentYearGoals.value : pastGoals.value
)

function switchTab(val) {
  showCurrent.value = val
  if (!val && selectedEmployee.value) loadHistory()
}



// 직원 선택
function selectEmployee(p) {
  selectedEmployee.value = p.id
  selectedGoal.value     = null
  evalForm.score         = ''
  evalForm.comment       = ''
  if (!showCurrent.value) loadHistory()
}

// 목표 선택
function selectGoal(g) {
  selectedGoal.value = g
  evalForm.score     = g.evaluation.score || ''
  evalForm.comment   = g.evaluation.comment
}

function selectHistory(h) {
  selectedHistory.value = h
  // 기존 선택 목표는 초기화
  selectedGoal.value      = null
  evalForm.score          = ''
  evalForm.comment        = ''
}

// 초기: 팀원 목록 조회
async function fetchTeam() {
  if (!teamId.value) return
  const res = await fetch(`http://localhost:5000/review/${teamId.value}`, {
    headers: { Authorization: `Bearer ${accessToken.value}` }
  })
  if (!res.ok) throw new Error('팀원 불러오기 실패')
  employees.value = await res.json()
  if (people.value.length) selectEmployee(people.value[0])
}
onMounted(fetchTeam)

// 과거 평가 이력 API
async function loadHistory() {
  if (!selectedEmployee.value) return
  try {
    const res = await fetch(
      `http://localhost:5000/review/history/${selectedEmployee.value}`,
      { headers: { Authorization: `Bearer ${accessToken.value}` }}
    )
    if (!res.ok) throw new Error(await res.text())
    const raw = await res.json()
    historyRecords.value = raw.map(r => ({
      yearMonth:             r.yearMonth,
      performanceDescription: r.performanceDescription,
      goalValue:             r.goalValue,
      performanceValue:      r.performanceValue,
      selfReviewContent:     r.selfReviewContent,
      reviewScore:           r.reviewScore
    }))
  } catch (e) {
    console.error(e)
    alert('과거 평가 불러오기 실패')
  }
}

// 상사평가 저장
async function submitManagerEval(decision) {
  if (!selectedGoal.value || !evalForm.score) {
    return alert('목표 선택 및 점수 입력 필요')
  }
  const perfId = selectedGoal.value.performanceObj.performanceId
  const payload = {
    employeeIdReviewer: currentUser.value.employeeId,
    reviewerScore:      Number(evalForm.score),
    reviewerContent:    evalForm.comment,
    decision
  }
  try {
    const res = await fetch(
      `http://localhost:5000/review/manager/performance/${perfId}/evaluate`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization:   `Bearer ${accessToken.value}`
        },
        body: JSON.stringify(payload)
      }
    )
    if (!res.ok) throw new Error(await res.text())
    const updated = await res.json()
    selectedGoal.value.evaluation.score   = updated.reviewerScore
    selectedGoal.value.evaluation.comment = updated.reviewerContent
    alert('상사평가 저장 완료')
  } catch (e) {
    console.error(e)
    alert('상사평가 실패')
  }
}
onMounted(fetchTeam)
</script>

<style scoped>
/* 전체 레이아웃 */
 .page-title {
    margin-left: 20px;
    margin-bottom: 30px;
    color: #00a8e8;
  }
  .desc {
    display: block;
    /* margin-left: 20px; */
    margin-bottom: 10px;
    font-size: 18px;
  }
  .block {
    padding: 20px;
    display: flex;
    flex-direction: column;
  }
  .header-bar {
    display: flex;
    align-items: center;
    margin: 0 20px 10px;
  }
  /* 탭 버튼 스타일 */
.tab-bar {
  display: flex;
  overflow: hidden;
  margin-top: 16px;
}

/* 각 탭 버튼 */
.tab {
  font-size: 15px;
  padding: 6px 14px;
  background-color: #c8c8c8;
  border: none;
  border-radius: 10px 10px 0 0;
  margin-right: -8px;
  box-shadow: 1px 1px 20px rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;
  color: white;
  cursor: pointer;
}

 .tab:not(:last-child) {
  border-right: 1px solid #e0e0e0;
}

/* 활성 탭 */
.tab.active {
  background-color: white;
  color: black;
  font-weight: bold;
}

/* goals-panel border-top 지우면 탭 아래 딱 붙습니다 */
.goals-panel {
  border-top: none;
}
  .btn-my-reviews {
    margin-left: auto;
    font-size: 14px;
    font-weight: bold;
    background-color: #00a8e8;
    color: white;
    border: 1px solid transparent;
    border-radius: 10px;
    padding: 10px 30px;
    cursor: pointer;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    transition: background-color 0.2s, box-shadow 0.2s;
    box-sizing: border-box;
}
.btn-my-reviews:hover {
  background-color: white;
  color: #00a8e8;
  border-color: #00a8e8;
  box-shadow:
  inset 1px 1px 10px rgba(0, 0, 0, 0.25);
}
  .perf-block {
    /* padding: -20px; */
    margin-left: -40px;
    flex: 1;
    min-height: 0;
  }
  
  .hide-scrollbar {
    overflow: auto;
    scrollbar-width: none;
  }

.evaluation-page {
  height: 100vh;
  display: flex;
  font-family: 'Noto Sans KR', sans-serif;
}
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  
}
.content-panels {
  display: flex;
  flex: 1;
  overflow: hidden;
  position: relative;
}
.arrows {
  position:absolute;
  top: 25%;              /* 패널 높이 중간(필요 시 조정) */
  left: 990px;
  transform: translateY(-50%);
}

/* 1) 평가 대상자 리스트 */
.people-panel {
  position: relative;
  width: 400px;
  min-height: 360px;
  flex: 1;
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  z-index: 3;
}
.people-list {
  list-style: none;
  padding: 0;
  margin: 0;
}
.people-list li {
  display: flex;
  align-items: center;
  padding: 8px;
  margin-bottom: 8px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s;
}
.people-list li.selected
 {
    box-shadow:
    inset 0 4px 8px rgba(0, 0, 0, 0.15),
    0 2px 8px rgba(0, 0, 0, 0.1);
  transform: translateY(0);
  background-color: #f7f7f7;
}
.people-list li:hover{
  transform: translateY(-2px);
  opacity: 1;
}
.desc-tabs {
  display: flex;
  align-items: center;
  gap: 12px;
}
.avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  margin-right: 8px;
  object-fit: cover;
}
.info { flex: 1; }
.name { font-weight: 600; color: #333; }
.role { font-size: 0.85rem; color: #666; }
.dept { font-size: 0.75rem; color: #888; }

/* 2) 목표 카드 리스트 */
.goals-panel {
  position: relative;
  width: 500px;
  min-height: 360px;
  flex: 1;
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  z-index: 3;
}
.goals-list {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.goal-card {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.08);
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}
.goal-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.12);
}
.goal-card.selected {
  background: #eef3f8;
}
.card-top {
  display: flex;
  justify-content: space-between;
  color: #888;
  font-size: 0.85rem;
  margin-bottom: 8px;
}
.card-title {
  margin: 0 0 12px;
  font-weight: 600;
  color: #333;
}
.card-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
}

/* 과거 평가 리스트 레이아웃 */
.history-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* 과거 평가 카드 스타일 */
.history-card {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}
.history-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
}
.progress-group {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
}
.progress-bar {
  flex: 1;
  height: 8px;
  background: #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
}
.progress-fill {
  height: 100%;
  background: #4096ff;
  transition: width 0.3s;
}
.progress-text {
  font-size: 0.85rem;
  color: #444;
  min-width: 32px;
  text-align: right;
}
.pill-group {
  display: flex;
  gap: 6px;
}
.pill {
  padding: 2px 8px;
  border-radius: 6px;
  font-size: 0.75rem;
  color: #fff;
}
.pill.weight { background: #8EC48E; }
.pill.target { background: #F48E8E; }

/* 3) 평가 입력 패널 */
.perf-panel {
  width: 450px;
  min-height: 330px;
  flex: 1;
  background: #F8F9FA;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

/* 목표명 */
.detail-header {
  margin-bottom: 8px;
}
.detail-header .label {
  font-size: 0.85rem;
  color: #666;
  margin-bottom: 4px;
}
.detail-header .title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #00a8e8;
  line-height: 1.2;
}

/* 상세 내용 레이블 */
.detail-subheader {
  font-size: 0.95rem;
  font-weight: 600;
  color: #333;
  margin: 16px 0 8px;
}

/* 상세 정보 테이블 */
.detail-info {
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
}
.detail-table {
  width: 100%;
  border-collapse: collapse;
}
.detail-table th,
.detail-table td {
  padding: 10px;
  text-align: center;
  border-bottom: 1px solid #e0e0e0;
  border-right: 1px solid #e0e0e0;
  font-size: 0.95rem;
}
.detail-table th {
  width: 30%;
  background: #fafafa;
  font-weight: 600;
  color: #333;
}
.detail-table td {
  background: #fff;
  color: #444;
}
.detail-table .subheader td {
  background: #f7f7f7;
  font-weight: 600;
  
}
.detail-table .description {
  white-space: pre-wrap;
  line-height: 1.5;
  padding: 16px 10px;
  text-align: center;
}

/* 입력 폼 */
.perf-form-fields {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 16px;
}
.form-group label {
  display: block;
  margin-bottom: 6px;
  font-weight: 600;
  color: #333;
}
.form-group select,
.form-group textarea {
  font-family: inherit;
  width: 100%;
  padding: 12px;
  font-size: 1rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0,0,0,0.05);
  box-sizing: border-box;
  resize: none;
}

.form-group select {
  appearance: none;
  background-image: url('data:image/svg+xml;utf8,<svg fill="%23888" height="24" viewBox="0 0 24 24" width="24"><path d="M7 10l5 5 5-5z"/></svg>');
  background-repeat: no-repeat;
  background-position: right 12px center;
  background-size: 16px;
}
.form-group textarea {
  min-height: 120px;
}

/* 저장 버튼 */
.btn-save-wrap {
  text-align: right;
  margin-top: 8px;
}
.btn-save {
  font-size: 14px;
  font-weight: bold;
  background-color: #00a8e8;
  color: white;
  border: 1px solid transparent;
  border-radius: 10px;
  padding: 10px 30px;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: background-color 0.2s, box-shadow 0.2s;
  box-sizing: border-box;
}

.btn-save:hover {
  background-color: white;
  color: #00a8e8;
  border-color: #00a8e8;
  box-shadow:
  inset 1px 1px 10px rgba(0, 0, 0, 0.25);
}
</style>
