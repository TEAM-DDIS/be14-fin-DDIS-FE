<template>
  <div class="goal-page">
    <span class="total-title">성과 관리</span>
    <div class="labels-row">
      <h2 class="section-title">목표 관리</h2>
      <div class="label-spacer"></div>
      <h2 class="section-title">실적 관리</h2>
    </div>
    <div class="panels">
      <section class="panel goals-panel">
        <div class="goal-container">
          <div v-if="goals.length === 0 && !showGoalForm" class="placeholder">
            <p class="placeholder-text">목표를 등록해보세요!</p>
          </div>
          <form v-else-if="showGoalForm" class="goal-form" @submit.prevent="addGoal">
            <div class="form-row">
              <label for="title">목표명</label>
              <input id="title" v-model="newGoal.goalTitle" placeholder="예) 신규 고객 20명 확보" required />
            </div>
            <div class="form-row half">
              <div>
                <label for="target">목표수치</label>
                <input id="target" v-model.number="newGoal.goalValue" type="number" placeholder="숫자로 입력" required />
              </div>
              <div>
                <label for="weight">가중치(%)</label>
                <input id="weight" v-model.number="newGoal.goalWeight" type="number" placeholder="0~100" required />
              </div>
            </div>
            <div class="form-row">
              <label for="description">목표내용</label>
              <textarea id="description" v-model="newGoal.goalContent" placeholder="상세 설명을 입력하세요"></textarea>
            </div>
            <div class="form-actions">
              <button class="btn-primary" type="submit">저장</button>
              <button class="btn-secondary" type="button" @click="cancelGoal">취소</button>
            </div>
          </form>
          <div v-else class="goals-list">
            <div
              v-for="goal in goals"
              :key="goal.goalId"
              class="goal-card"
              :class="{ selected: selected === goal.goalId }"
              @click="selectGoal(goal)"
            >
              <button class="btn-card-delete" @click.stop="confirmDelete(goal.goalId)" title="삭제">×</button>
              <div class="card-top">
                <span class="date">{{ goal.goalCreatedAt }}</span>
                <span class="author">{{ goal.employeeName }}</span>
              </div>
              <h4 class="card-title">{{ goal.goalTitle }}</h4>
              <div class="card-bottom">
                <div class="progress-group">
                  <span class="label">달성률</span>
                  <div class="progress-bar">
                    <div class="progress-fill" :style="{ width: goal.progress + '%' }"></div>
                  </div>
                  <span class="progress-text">{{ goal.progress }}%</span>
                </div>
                <div class="pill-group">
                  <span class="pill weight">가중치 {{ goal.goalWeight }}%</span>
                  <span class="pill target">목표치 {{ goal.goalValue }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="actions" v-if="!showGoalForm">
          <button class="btn-primary" @click="openGoalForm">목표등록</button>
        </div>
      </section>

      <div class="arrow-container"><span class="arrow-icon"></span></div>

      <section class="panel perf-panel">
        <div class="perf-header">
          <button v-if="selectedGoal?.performance" class="btn-delete" @click="deletePerf">삭제</button>
        </div>
        <div v-if="!selectedGoal" class="empty">
          <p class="empty-text">목표를 클릭해서 실적을 등록해보세요!</p>
        </div>
        <div v-else class="perf-content">
          <div class="detail-title"><span class="detail-title-label">목표명</span></div>
          <h3 class="perf-title">{{ selectedGoal.goalTitle }}</h3>
          <div class="detail-header"><span class="detail-label">상세 내용</span></div>
          <table class="detail-table-vertical">
            <tbody>
              <tr>
                <th>담당자</th><td>{{ selectedGoal.employeeName }}</td>
                <th>등록일</th><td>{{ selectedGoal.goalCreatedAt }}</td>
              </tr>
              <tr>
                <th>가중치</th><td>{{ selectedGoal.goalWeight }}%</td>
                <th>목표수치</th><td>{{ selectedGoal.goalValue }}</td>
              </tr>
              <tr><th colspan="4">목표내용</th></tr>
              <tr><td colspan="4">{{ selectedGoal.goalContent }}</td></tr>
            </tbody>
          </table>
          <div class="perf-form">
            <div class="attach-area">
              <label>첨부 파일</label>
              <div class="file-box">
                <template v-if="form.fileName">
                  <span class="file-name">{{ form.fileName }}</span>
                  <span class="file-size">{{ form.fileSize }}</span>
                </template>
                <button class="btn-attach" @click="$refs.fileInput.click()">첨부파일 등록</button>
                <input ref="fileInput" type="file" class="sr-only" @change="onFileChange" />
              </div>
            </div>
            <div class="input-area">
              <label>실적 수치</label>
              <input v-model.number="form.actual" type="number" placeholder="실적 수치" />
            </div>
            <div class="input-area">
              <label>자기 평가</label>
              <textarea v-model="form.comment" placeholder="자기 평가"></textarea>
            </div>
            <div class="btn-save-wrap">
              <button class="btn-save" @click="submitPerf">등록</button>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>


<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'

const goals = ref([])
const selected = ref(null)
const showGoalForm = ref(false)
const userStore = useUserStore()

const newGoal = reactive({
  title: '',
  target: null,
  weight: null,
  description: '',
  date: getKoreaLocalDateTimeString(),
  owner: '김띠스 대리'
})

const form = reactive({
  actual: null,
  comment: '',
  file: null,
  fileName: '',
  fileSize: ''
})

const selectedGoal = computed(() => goals.value.find(g => g.id === selected.value))

onMounted(fetchGoals)
function getKoreaLocalDateTimeString() {
  const now = new Date()
  const tzOffset = now.getTimezoneOffset() * 60000 // 한국은 -540분 → +9시간
  const localISOTime = new Date(now - tzOffset).toISOString().slice(0, 19)
  return localISOTime // 예: "2025-05-29T10:43:00"
}

function fetchGoals() {
  const token = localStorage.getItem('token')
  fetch('http://localhost:8000/goals', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })
    .then(res => res.json())
    .then(data => {
      goals.value = data.map(goal => ({
        ...goal,
        progress: 0,
        performance: { date: '', actual: 0, comment: '', attachment: null }
      }))
    })
    .catch(err => console.error('목표 불러오기 실패:', err))
}

watch(() => form.actual, val => {
  const g = selectedGoal.value
  if (!g || !g.target) return
  g.progress = Math.min(100, Math.round((val / g.target) * 100))
})

function confirmDelete(id) {
  if (confirm('정말 삭제하시겠습니까?')) deleteGoal(id)
}

function addGoal() {
  if (!newGoal.title) return

  const token = localStorage.getItem('token')
  const payload = {
    goalTitle: newGoal.title,
    goalValue: newGoal.target,
    goalWeight: newGoal.weight,
    goalContent: newGoal.description,
    goalCreatedAt: newGoal.date

  }

  fetch('http://localhost:8000/goals', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  })
    .then(res => res.json())
    .then(id => {
      goals.value.push({
        id: id,
        ...payload,
        progress: 0,
        performance: { date: '', actual: 0, comment: '', attachment: null }
      })
      cancelGoal()
    })
    .catch(err => console.error('목표 등록 실패:', err))
}

function cancelGoal() {
  newGoal.title = ''
  newGoal.target = null
  newGoal.weight = null
  newGoal.description = ''
  showGoalForm.value = false
}

function selectGoal(goal) {
  selected.value = goal.id
  form.actual = goal.performance.actual
  form.comment = goal.performance.comment
  form.fileName = goal.performance.attachment?.name || ''
  form.fileSize = goal.performance.attachment?.size || ''
}

function openGoalForm() {
  showGoalForm.value = true
}

function onFileChange(e) {
  const f = e.target.files[0]
  if (!f) return
  form.file = f
  form.fileName = f.name
  form.fileSize = (f.size / 1024 / 1024).toFixed(1) + 'MB'
}

function submitPerf() {
  const g = selectedGoal.value
  if (!g) return
  g.performance = {
    date: new Date().toISOString().slice(0, 10),
    actual: form.actual,
    comment: form.comment,
    attachment: form.file ? { name: form.fileName, size: form.fileSize } : null
  }
}

function deletePerf() {
  const g = selectedGoal.value
  if (!g) return
  g.performance = { date: '', actual: 0, comment: '', attachment: null }
  g.progress = 0
  form.actual = null
  form.comment = ''
  form.file = null
  form.fileName = ''
  form.fileSize = ''
}

function deleteGoal(id) {
  const idx = goals.value.findIndex(g => g.id === id)
  if (idx !== -1) {
    goals.value.splice(idx, 1)
    if (selected.value === id) selected.value = null
  }
}
</script>

<style scoped>
.total-title{font-size:24px; color:#00A8E8;font-weight: 600;}
.goal-page{padding:24px;display:flex;flex-direction:column;height:100vh}
.labels-row{display:flex;gap:24px;margin-bottom:8px}
.section-title:first-child{width:40%; font-size: 12px;}.label-spacer{width:20px}.section-title:last-child{font-size: 12px; width:55%}
.panels{flex:1;display:flex;gap:24px;overflow:hidden}
.panel{background:#fff;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.05);display:flex;flex-direction:column;padding:24px}
.goals-panel{width:40%}.goal-container, .perf-content{flex:1}
.placeholder{flex:1;display:flex;align-items:center;justify-content:center}
.placeholder-text{color:#00A8E8;font-size:1.2rem;font-weight:600}
.goal-form{background:#fff;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.05);padding:24px;display:flex;flex-direction:column;gap:16px;margin-bottom:16px}
.form-row{display:flex;flex-direction:column;gap:4px}.form-row.half{flex-direction:row;gap:16px}.form-row.half>div{flex:1}
.form-row label{font-weight:600;font-size:.9rem;color:#333}
.form-row input,.form-row textarea{box-sizing:border-box;width:100%;padding:8px 12px;border:1px solid #d9d9d9;border-radius:6px;background:#fafafa;font-size:.95rem;transition:border-color .2s,background .2s}
.form-row input{height:48px}.form-row textarea{height:96px;overflow-y:auto;resize:none}
.form-row input:focus,.form-row textarea:focus{outline:none;border-color:#00A8E8;background:#fff}
.form-actions{display:flex;justify-content:flex-end;gap:8px}
.btn-primary{background:#00A8E8;color:#fff;border:none;padding:8px 20px;border-radius:6px;cursor:pointer}
.btn-secondary{background:#f5f5f5;color:#333;border:none;padding:8px 20px;border-radius:6px;cursor:pointer}
.goals-list{flex:1;overflow-y:auto;padding-right:4px;margin-bottom:16px}
.goal-card{position:relative;background:#fff;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.05);padding:16px;margin-bottom:12px;cursor:pointer;transition:transform .2s}
.goal-card:hover{transform:translateY(-2px)}
.goal-card.selected{background:#d7d7d7;box-shadow:inset 0 2px 4px rgba(0,0,0,0.08),0 1px 2px rgba(0,0,0,0.05)}
.btn-card-delete{position:absolute;top:2px;right:2px;background:transparent;border:none;font-size:1.2rem;color:#888;cursor:pointer;opacity:0;transition:opacity .2s}
.goal-card:hover .btn-card-delete{opacity:1}
.card-top{display:flex;justify-content:space-between;color:#888;font-size:.85rem;margin-bottom:8px}
.card-title{font-size:1rem;font-weight:600;margin:4px 0 12px;line-height:1.4}
.card-bottom{display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px}
.progress-group{flex:1;display:flex;align-items:center;gap:8px}
.progress-bar{flex:1;height:12px;background:#e0e0e0;border:1px solid #ccc;border-radius:6px;overflow:hidden}
.progress-fill{height:100%;background:#00A8E8;transition:width .3s}
.progress-text{color:#444;font-size:.85rem;min-width:28px;text-align:right}
.pill-group{display:flex;gap:8px}
.pill{padding:4px 12px;border-radius:8px;font-size:.75rem;font-weight:500;color:#fff}
.pill.weight{background:#8EC48E}
.pill.target{background:#F48E8E}
.actions{display:flex;justify-content:center;gap:8px}
.arrow-container{display:flex;align-items:center;justify-content:center}
.arrow-icon{width:20px;height:20px;border-right:2px solid #ddd;border-bottom:2px solid #ddd;transform:rotate(-45deg)}
.perf-title {
  color: #00A8E8;
  font-size: 1.5rem; /* 글씨 크기 확대 */
  font-weight: 600;
  margin: 0;
}
.perf-panel{width:55%;display:flex;flex-direction:column;overflow-y:auto;padding-bottom:24px;background:#f5f5f5}
.perf-header{display:flex;justify-content:flex-end;margin-bottom:16px;padding:16px 0}
.perf-form {
  display: grid;
  /* 왼쪽은 label 크기만큼, 오른쪽은 나머지 모두 */
  grid-template-columns: max-content 1fr;
  row-gap: 16px;    /* 행 간격 */
  column-gap: 24px; /* 열 간격 */
  align-items: start;
}
.btn-delete{background:#c8c8c8;border:none;padding:6px 12px;border-radius:6px;color:#fff;cursor:pointer}
.empty{display:flex;align-items:center;justify-content:center;flex:1}
.empty-text{color:#00A8E8;font-size:1.2rem;font-weight:600}
.detail-table-vertical{width:100%;border-collapse:collapse;margin-bottom:20px}
.detail-table-vertical th,.detail-table-vertical td{border:1px solid #e0e0e0;padding:12px;text-align:center;font-size:.9rem}
.detail-table-vertical th{background:#fafafa;font-weight:600}
.attach-area,
.input-area {
  display: contents;
}

.input-area label{font-weight:600}
.input-area input,.input-area textarea{width:100%;padding:8px;border:1px solid #d9d9d9;border-radius:6px;background:#fafafa;resize:none}
.input-area textarea {
  width: 100%;
  box-sizing: border-box;
}

.attach-area label{width:80px;font-weight:600}
.file-box{display:flex;align-items:center;background:#fafafa;border-radius:6px;padding:6px 12px;gap:8px}
.btn-attach{background:#00A8E8;color:#fff;border:none;padding:6px 12px;border-radius:6px;cursor:pointer}
.sr-only{position:absolute;width:1px;height:1px;overflow:hidden}
.btn-save-wrap{text-align:center}
.btn-save{background:#00A8E8;color:#fff;border:none;padding:10px 24px;border-radius:6px;cursor:pointer}
.detail-title { margin-bottom:12px; }
.detail-title-label { display:block; font-size:0.9rem; color:#888; margin-bottom:4px; }
.detail-header { display:flex; align-items:center; padding:8px 0; border-top:1px solid #e0e0e0; margin-top:16px; }
.detail-label { font-size:1rem; font-weight:600; color:#333; }
.detail-table-vertical tr:nth-child(odd) td {
  background: #fafafa;
}
.detail-table-vertical tr:nth-child(even) td {
  background: #fff;
}
</style>
