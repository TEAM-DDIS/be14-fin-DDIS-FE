<template>
  <div class="goals-page">
    <header class="page-header">
      <h1 class="page-title">목표</h1>
      <button class="btn-add" @click="openModal">
        목표 등록
      </button>
    </header>

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
          <td>{{ goal.value }}</td>
          <td>{{ goal.weight }}%</td>
          <td>
            <div class="progress-cell">
              <div class="progress-bar-bg">
                <div
                  class="progress-bar-fill"
                  :style="{ width: computeRate(goal) + '%' }"
                ></div>
              </div>
              <span>{{ computeRate(goal) }}%</span>
            </div>
          </td>
          <td>{{ goal.owner }}</td>
          <td>{{ goal.createdAt }}</td>
        </tr>
      </tbody>
    </table>

    <!-- Detail Panel: 선택한 목표 하단에 표시 with input & self-eval -->
    <div v-if="selectedGoal" class="detail-panel">
      <!-- 목표 정보 -->
      <div class="info-card">
        <h3>목표 정보</h3>
        <dl>
          <dt>목표명</dt><dd>{{ selectedGoal.title }}</dd>
          <dt>목표수치</dt><dd>{{ selectedGoal.value }}</dd>
          <dt>목표내용</dt><dd>{{ selectedGoal.content }}</dd>
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
              ? computeRate(selectedGoal) + '%' : '-'"
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
            {{ temp[selectedGoal.id].fileInfo.name }} ({{ temp[selectedGoal.id].fileInfo.size }}MB)
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
        <button class="btn-save" @click="save(selfEvalPage)">저장</button>
      </div>
    </div>

    <!-- Modal Overlay -->
    <div v-if="showCreate" class="modal-overlay" @click.self="closeModal">
      <div class="modal-content">
        <h2>목표 등록</h2>
        <div class="form-group">
          <label for="title">목표명</label>
          <input id="title" v-model="newGoal.title" />
        </div>
        <div class="form-group">
          <label for="value">목표치</label>
          <input id="value" type="number" v-model.number="newGoal.value" />
        </div>
        <div class="form-group">
          <label for="weight">가중치(%)</label>
          <input id="weight" type="number" v-model.number="newGoal.weight" />
        </div>
        <div class="form-group">
          <label for="owner">담당자</label>
          <input id="owner" v-model="newGoal.owner" />
        </div>
        <div class="modal-actions">
          <button class="btn-save" @click="createGoal">저장</button>
          <button class="btn-cancel" @click="closeModal">취소</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'

const goals = ref([])
const showCreate = ref(false)
const newGoal = ref({ id: null, title: '', value: null, weight: null, owner: '', content: '', createdAt: '' })
const selectedGoal = ref(null)
// 임시 객체: 실적, 파일, 자평 저장
const temp = reactive({})

function fetchGoals() {
  fetch('/mockup.json')
    .then(r => r.json())
    .then(data => {
      goals.value = data.goals.map(g => ({
        id: String(g.id), title: g.title, content: g.description,
        value: g.target, weight: g.weight, achievement: g.achievement || null,
        owner: g.owner, createdAt: g.createdAt
      }))
      goals.value.forEach(g => {
        temp[g.id] = { achievement: g.achievement, selfEval: '', fileInfo: null }
      })
    })
}

function computeRate(goal) {
  const a = temp[goal.id].achievement
  return a!=null? Math.min(100, Math.round((a/goal.value)*100)): 0
}

function openModal() { showCreate.value = true }
function closeModal() {
  showCreate.value = false
  newGoal.value = { id: null, title: '', value: null, weight: null, owner: '', content: '', createdAt: '' }
}

function createGoal() {
  const id = String(goals.value.length + 1)
  const date = new Date().toISOString().slice(0, 10)
  const goal = {
    id, title: newGoal.value.title, content: newGoal.value.content,
    value: newGoal.value.value, weight: newGoal.value.weight,
    achievement: null, owner: newGoal.value.owner, createdAt: date
  }
  goals.value.push(goal)
  temp[id] = { achievement: null, selfEval: '', fileInfo: null }
  closeModal()
}

function selectGoal(goal) {
  selectedGoal.value = selectedGoal.value?.id===goal.id?null:goal
}

function onFileChange(e, id) {
  const f = e.target.files[0]
  if(!f)return
  temp[id].fileInfo={ name: f.name, size:(f.size/1024/1024).toFixed(1) }
}

function save(id) {
  alert(`저장 완료: ${computeRate(selectedGoal.value)}% 달성, 자평: ${temp[id].selfEval}`)
}

onMounted(fetchGoals)
</script>

<style scoped>
.goals-page{padding:24px;background:#fff}
.page-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:16px}
.page-title{font-size:24px;margin:0}
.btn-add{padding:8px 16px;background:#409eff;color:#fff;border:none;border-radius:4px;cursor:pointer}
.btn-add:hover{background:#307fcc}

table.goals-table{width:100%;border-collapse:collapse;margin-bottom:24px}
.goals-table th,.goals-table td{border:1px solid #e0e6ed;padding:12px}
.clickable{cursor:pointer}
.selected{background:#eef6ff}
.progress-cell{display:flex;align-items:center}
.progress-bar-bg{flex:1;height:8px;background:#e0e0e0;border-radius:4px;margin-right:8px;overflow:hidden}
.progress-bar-fill{height:100%;background:#67c23a;transition:width .3s}

.detail-panel {
  display: grid;
  /* 첫째 칸 2, 둘째 칸 3, 셋째 칸 2 비율 */
  grid-template-columns: 2fr 3fr 2fr;
  gap: 16px;
  margin-top: 24px;
}
.info-card, .input-card, .eval-card{background:#f5faff;padding:16px;border-radius:8px}
.info-card dl{display:grid;grid-template-columns:80px 1fr;row-gap:8px;column-gap:16px}
.info-card dt{font-weight:bold}
.input-card .field{margin-bottom:12px}
.input-card label{display:block;margin-bottom:4px}
.input-card input{width:100%;padding:8px;border:1px solid #ccc;border-radius:4px}
.eval-card{display:flex;flex-direction:column}
.eval-card textarea{flex:1;resize:none;padding:8px;border:1px solid #ccc;border-radius:4px}
.eval-card .btn-save{align-self:flex-end;padding:6px 12px;background:#67c23a;color:#fff;border:none;border-radius:4px;cursor:pointer;margin-top:12px}
.eval-card .btn-save:hover{background:#57a33f}

/* Modal Styles */
.modal-overlay{position:fixed;top:0;left:0;width:100vw;height:100vh;background:rgba(0,0,0,.4);display:flex;justify-content:center;align-items:center;z-index:1e3}
.modal-content{background:#fff;padding:24px;border-radius:8px;width:400px;box-shadow:0 2px 10px rgba(0,0,0,.15)}
.form-group{margin-bottom:16px}
.form-group label{display:block;margin-bottom:4px;font-weight:500}
.form-group input{width:100%;padding:8px;border:1px solid #ccc;border-radius:4px}
.modal-actions{display:flex;justify-content:flex-end;gap:8px;margin-top:16px}
.btn-save{padding:6px 12px;background:#67c23a;color:#fff;border:none;border-radius:4px;cursor:pointer}
.btn-cancel{padding:6px 12px;background:#fff;color:#333;border:1px solid #ccc;border-radius:4px;cursor:pointer}
.btn-cancel:hover{background:#f5f5f5}
</style>
