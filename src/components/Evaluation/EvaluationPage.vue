<template>
  <div class="evaluation-page">
    <main class="main-content">
      <div class="header-bar">
        <h1 class="page-title">평가</h1>
        <!-- 내가 쓴 평가 보기 버튼 -->
        <button class="btn-my-reviews" @click="goToMyReviews">
          내가 쓴 평가 보기
        </button>
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
                  <strong class="name">{{ p.name }} </strong>
                  <span class="role"> {{ p.role }}</span>
                </div>
                <span class="dept">{{ p.dept }}</span>
              </li>
            </ul>
          </section>
        </div>

        <!-- 2) 목표 카드 리스트 -->
         <div class="block">
        <p class="desc">평가 목록</p>
        <img class="arrows" src="@/assets/icons/Polygon-2.svg" />
        <section class="panel goals-panel">
          <div class="goals-list">
            <div
              v-for="goal in filteredGoals"
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

              <!-- ★ 목표수치 · 실적수치 표시 ★ -->
              <div class="score-info" style="margin-bottom: 12px; display:flex; justify-content: space-between; font-size:0.9rem; color:#555;">
                <span>목표수치: {{ goal.target }}</span>
                <span>실적수치: {{ goal.performance }}</span>
              </div>

              <div class="card-bottom">
                <div class="progress-group">
                  <span class="label">달성률</span>
                  <div class="progress-bar" style="margin: 0 8px 0 6px;">
                    <!-- 게이지 너비: 달성률 % 만큼 -->
                    <div
                      class="progress-fill"
                      :style="{ width: goal.progress + '%' }"
                    ></div>
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
        </section>
      </div> 

        <!-- 3) 평가 입력 패널 -->
        <div class="block perf-block">
          <p class="desc">평가 내용</p>
          <section class="panel perf-panel hide-scrollbar">
            <div v-if="!selectedGoal" class="empty">
              <p class="empty-text">평가할 목표를 선택하세요.</p>
            </div>
            <div v-else class="perf-content">
              <!-- 목표명 -->
              <div class="detail-header">
                <div class="label">목표명</div>
                <div class="title">{{ selectedGoal.title }}</div>
              </div>

              <!-- 상세 내용 레이블 -->
              <div class="detail-subheader">상세 내용</div>

              <!-- 상세 정보 테이블 -->
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

              <!-- 입력 폼 -->
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
                  <textarea
                    id="comment"
                    v-model="evalForm.comment"
                    placeholder="의견을 입력하세요"
                  ></textarea>
                </div>

                <div class="btn-save-wrap" >
                  <button class="btn-save" @click="submitManagerEval('승인')">승인</button>
                  <button class="btn-save" @click="submitManagerEval('반려')" style="margin-left: 8px;">반려</button>
                </div>

            


              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'  // Pinia 스토어 경로에 맞춰 조정

const router = useRouter()
function goToMyReviews() {
  router.push({ name: 'MyEvaluations' })
}

// ─────────────────────────────────────────────────────────────────
// Pinia 스토어 인스턴스: 토큰과 현재 로그인된 유저 정보
// ─────────────────────────────────────────────────────────────────
const userStore = useUserStore()
const accessToken = computed(() => userStore.accessToken)
const currentUser = computed(() => userStore.user)  // { employeeId, teamId, ... }

// ─────────────────────────────────────────────────────────────────
// JWT 페이로드 디코딩 함수
// ─────────────────────────────────────────────────────────────────
function getPayload() {
  try {
    const raw = accessToken.value || ''
    // 1) 토큰을 '.' 으로 분리 → 페이로드(Base64URL) 가져오기
    const payloadBase64Url = raw.split('.')[1] || ''
    // 2) '-' → '+', '_' → '/' 로 바꿔서 표준 Base64 형태로 변환
    const base64 = payloadBase64Url.replace(/-/g, '+').replace(/_/g, '/')
    // 3) atob()로 디코딩하여 JSON 문자열로 복원
    const jsonStr = atob(base64)
    // 4) JSON.parse → 객체 반환
    return JSON.parse(jsonStr)
  } catch (e) {
    console.error('토큰 페이로드 파싱 실패:', e)
    return null
  }
}

// payload에서 teamId 추출 (없으면 null)
const teamId = computed(() => {
  const payload = getPayload()
  return payload?.teamId ?? null
})

// ─────────────────────────────────────────────────────────────────
// (1) 데이터 상태 정의
// ─────────────────────────────────────────────────────────────────
const employees = ref([])       // 백엔드에서 받아온 전체 직원+목표 데이터
const selectedEmployee = ref(null)
const selectedGoal = ref(null)
const evalForm = reactive({ score: '', comment: '' })

// ─────────────────────────────────────────────────────────────────
// (2) 페이지 초기 로드: 직원+목표 데이터 fetch
// ─────────────────────────────────────────────────────────────────
onMounted(async () => {
  const payload = getPayload()
  const tid = payload?.teamId ?? null
  if (!tid) {
    alert('토큰에 teamId가 없습니다. 다시 로그인해 주세요.')
    return
  }

  try {
    const res = await fetch(`http://localhost:8000/review/${tid}`, {
      headers: {
        Authorization: `Bearer ${accessToken.value}`
      }
    })
    if (!res.ok) {
      const errText = await res.text()
      console.error('[EvalPage] API 에러 응답:', res.status, errText)
      alert('팀원 조회에 실패했습니다.')
      return
    }
    employees.value = await res.json()
  } catch (err) {
    console.error('[EvalPage] fetch 예외:', err)
    alert('팀원 데이터를 불러오는 중 오류가 발생했습니다.')
  }
})

// ─────────────────────────────────────────────────────────────────
// (3) people 배열: employees → 화면용 사람 목록으로 변환
// ─────────────────────────────────────────────────────────────────
const people = computed(() =>
  employees.value.map(emp => ({
    id: emp.employeeId,
    name: emp.employeeName,
    role: emp.positionName,
    dept: emp.teamName,
    avatar: emp.avatarUrl || ''  // 백엔드에 avatarUrl이 없다면 빈 문자열
  }))
)

// ─────────────────────────────────────────────────────────────────
// (4) filteredGoals: 선택된 직원의 목표 목록으로 변환
// ─────────────────────────────────────────────────────────────────
const filteredGoals = computed(() => {
  const emp = employees.value.find(e => e.employeeId === selectedEmployee.value)
  if (!emp || !emp.goals) return []

  return emp.goals.map(goal => {
    const perfObj = goal.performance || null
    // 1) 백엔드 goal.performance?.performanceValue 꺼내기 (실적수치)
    const perfValue = goal.performance?.performanceValue ?? 0
    // 2) 실적수치 / 목표수치(goal.goalValue) → 달성률(%)
    const achievement = goal.goalValue
      ? Math.round((perfValue / goal.goalValue) * 100)
      : 0

    const managerScore = perfObj?.reviewerScore ?? null
    const managerComment = perfObj?.reviewerContent ?? ''
    return {
      id: goal.goalId,
      ownerId: emp.employeeId,
      owner: emp.employeeName,
      date: goal.goalCreatedAt.split('T')[0],  // 'YYYY-MM-DD'
      title: goal.goalTitle,
      target: goal.goalValue,          // 목표수치
      weight: goal.goalWeight,         // 가중치
      performanceObj: perfObj,
      performance: perfValue,          // 실적수치
      progress: achievement,            // 달성률(%)
      description: goal.goalContent,
       evaluation: {
        // 전역 state에 매번 빈 평가가 아닌,
        // 이미 backend에 있던 reviewerScore/reviewerContent를 초기값으로 사용
        score: managerScore,
        comment: managerComment
      }
    }
  })
})

// ─────────────────────────────────────────────────────────────────
// (5) 직원 선택 시
// ─────────────────────────────────────────────────────────────────
function selectEmployee(p) {
  selectedEmployee.value = p.id
  selectedGoal.value = null
  evalForm.score = ''
  evalForm.comment = ''
}

// ─────────────────────────────────────────────────────────────────
// (6) 목표 선택 시
// ─────────────────────────────────────────────────────────────────
function selectGoal(g) {
  selectedGoal.value = g
  evalForm.score = g.evaluation?.score || ''
  evalForm.comment = g.evaluation?.comment || ''
}

// ─────────────────────────────────────────────────────────────────
// (7) 평가 저장 (자기평가/더미 로직)
// ─────────────────────────────────────────────────────────────────
async function submitEval() {
  if (!selectedGoal.value || !evalForm.score) return

  const perfObj = selectedGoal.value.performanceObj 
  if (!perfObj?.performanceId) {
    alert('아직 자기평가가 등록되지 않아 상사평가를 할 수 없습니다.')
    return
  }

  const performanceId = perfObj.performanceId

  // ② 상사 ID
  const reviewerId = currentUser.value?.employeeId
  if (!reviewerId) {
    alert('로그인 정보를 확인해주세요.')
    return
  }

  const payload = {
    employeeIdReviewer: reviewerId,
    reviewerScore: Number(evalForm.score),
    reviewerContent: evalForm.comment || '',
    decision: '승인'  // 기본값으로 “승인”을 가정. 필요시 UI에서 선택받도록 수정.
  }

  try {
    const res = await fetch(
      `http://localhost:8000/review/manager/performance/${performanceId}/evaluate`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken.value}`
        },
        body: JSON.stringify(payload)
      }
    )
    if (!res.ok) {
      const errText = await res.text()
      console.error('[EvalPage] 평가 저장 실패:', res.status, errText)
      alert('평가 저장에 실패했습니다.')
      return
    }

    // 화면 로컬에도 반영
    selectedGoal.value.evaluation = {
      score: evalForm.score,
      comment: evalForm.comment
    }
    alert('평가가 정상적으로 저장되었습니다.')
  } catch (err) {
    console.error('[EvalPage] 평가 저장 중 오류:', err)
    alert('평가 저장 중 오류가 발생했습니다.')
  }
}

// ─────────────────────────────────────────────────────────────────
// (8) 상사평가 제출 함수
// ─────────────────────────────────────────────────────────────────
async function submitManagerEval(decision) {
  if (!selectedGoal.value || !evalForm.score) {
    alert('평가할 목표를 선택하고, 점수를 입력하세요.')
    return
  }

  const perfObj = selectedGoal.value.performanceObj
  if (!perfObj?.performanceId) {
    alert('아직 자기평가가 등록되지 않아 상사평가를 할 수 없습니다.')
    return
  }
  const performanceId = perfObj.performanceId

  const reviewerId = currentUser.value?.employeeId
  if (!reviewerId) {
    alert('로그인 정보가 올바르지 않습니다.')
    return
  }

  const payload = {
    performanceId: performanceId,
    employeeIdReviewer: reviewerId,
    reviewerScore: Number(evalForm.score),
    reviewerContent: evalForm.comment || '',
    decision: decision  // "승인" 또는 "반려"
  }

  try {
    const res = await fetch(
      `http://localhost:8000/review/manager/performance/${performanceId}/evaluate`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken.value}`
        },
        body: JSON.stringify(payload)
      }
    )
    if (!res.ok) {
      const errText = await res.text()
      console.error('[ManagerEval] API 에러:', res.status, errText)
      alert('상사평가 저장에 실패했습니다.')
      return
    }
    selectedGoal.value.evaluation.score = evalForm.score
    selectedGoal.value.evaluation.comment = evalForm.comment
    alert('상사평가가 성공적으로 저장되었습니다.')
    // (선택) 평가 후 목록을 새로고침하거나, 페이지를 리로드
    // 예: await fetchTeamData()
  } catch (err) {
    console.error('[ManagerEval] 예외:', err)
    alert('서버 오류로 상사평가에 실패했습니다.')
  }
}
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
  left: 660px;
  /* margin-left: 180px; */
  transform: translateY(-50%);
}

/* 1) 평가 대상자 리스트 */
.people-panel {
  width: 200px;
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  overflow-y: auto;
  margin-right: 20px;
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
.people-list li.selected,
.people-list li:hover {
  background: #eef3f8;
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
  width: 350px;
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
  color: #1890ff;
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
