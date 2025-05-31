<template>
  <div class="evaluation-page">
    <main class="main-content">
      <header class="header">
        <h1>평가</h1>
      </header>
      <div class="content-panels">
        <!-- 1) 평가 대상자 리스트 -->
        <img class="arrows" src="@/assets/icons/Polygon-2.svg"> 
        <section class="panel people-panel">
          <ul class="people-list">
            <li
              v-for="p in people"
              :key="p.id"
              :class="{ selected: selectedPerson === p.id }"
              @click="selectPerson(p)"
            >
              <img :src="p.avatar" alt="avatar" class="avatar" />
              <div class="info">
                <strong class="name">{{ p.name }}</strong>
                <span class="role">{{ p.role }}</span>
              </div>
              <span class="dept">{{ p.dept }}</span>
            </li>
          </ul>
        </section>

        <!-- 2) 목표 카드 리스트 -->
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
        </section>

        <!-- 3) 평가 입력 패널 -->
        <section class="panel perf-panel">
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
                  <tr class="subheader">
                    <td colspan="2">목표내용</td>
                  </tr>
                  <tr>
                    <td colspan="2" class="description">
                      {{ selectedGoal.description }}
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

              <div class="btn-save-wrap">
                <button class="btn-save" @click="submitEval">저장</button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'

const people = [
  { id: 1, name: '이병현', role: '팀장', dept: 'PC개발팀', avatar: '/avatars/1.jpg' },
  { id: 2, name: '추하루', role: '대리', dept: 'PC개발팀', avatar: '/avatars/2.jpg' },
  { id: 3, name: '고문지', role: '사원', dept: 'PC개발팀', avatar: '/avatars/3.jpg' },
  { id: 4, name: '강동룡', role: '사원', dept: 'PC개발팀', avatar: '/avatars/4.jpg' },
  { id: 5, name: '강병탁', role: '사원', dept: 'PC개발팀', avatar: '/avatars/5.jpg' },
  { id: 6, name: '한도이', role: '사원', dept: 'PC개발팀', avatar: '/avatars/6.jpg' },
]
const goals = ref([
  { id: 1, ownerId: 2, owner: '추하루', date: '2025-05-22', title: '신규 고객 20명을 확보한다.', target: 20, weight: 30, progress: 30, description: '월별 신규 고객 유지 활동을 통해 리드 전환을 유도함', evaluation: null },
  { id: 2, ownerId: 3, owner: '고문지', date: '2025-05-20', title: '블로그 포스팅 5개 작성', target: 5, weight: 20, progress: 40, description: '제품 사용 사례 위주의 블로그 포스트 작성', evaluation: null },
  { id: 3, ownerId: 4, owner: '강동룡', date: '2025-05-18', title: '고객 문의 100건 처리', target: 100, weight: 50, progress: 80, description: 'CS 시스템을 통한 문의 대응 완료', evaluation: null }
])
const selectedPerson = ref(null)
const selectedGoal = ref(null)
const evalForm = reactive({ score: '', comment: '' })

const filteredGoals = computed(() =>
  goals.value.filter(g => g.ownerId === selectedPerson.value)
)

function selectPerson(p) {
  selectedPerson.value = p.id
  selectedGoal.value = null
}
function selectGoal(g) {
  selectedGoal.value = g
  evalForm.score = g.evaluation?.score || ''
  evalForm.comment = g.evaluation?.comment || ''
}
function submitEval() {
  if (!selectedGoal.value || !evalForm.score) return
  selectedGoal.value.evaluation = { ...evalForm }
  alert('평가가 저장되었습니다.')
}
</script>

<style scoped>
/* 전체 레이아웃 */
.evaluation-page {
  height: 100vh;
  display: flex;
  font-family: 'Noto Sans KR', sans-serif;
}
.header {
  padding: 16px 24px;
}
.header h1 {
  margin: 0;
  font-size: 1.5rem;
  color: #333;
}
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  
}
.content-panels {
  display: flex;
  flex: 1;
  padding: 24px;
  overflow: hidden;
}
.arrows {
  position:absolute;
  left:55%;
  z-index: 2;
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
  background: #4096ff;
  color: #fff;
  border: none;
  padding: 10px 24px;
  border-radius: 6px;
  font-size: 1rem;
  cursor: pointer;
}
</style>
