<template>
  <div class="container">
    <h1 class="page-title">목표 상세</h1>
    <button class="btn-back" @click="goBack()">돌아가기</button>

    <div class="detail-wrapper">
      <!-- 왼쪽: 목표 정보 -->
      <div class="info-card">
        <dl>
          <dt>목표명</dt><dd>{{ goal.title }}</dd>
          <dt>목표수치</dt><dd>{{ goal.target }}</dd>
          <dt>목표내용</dt><dd>{{ goal.description }}</dd>
          <dt>담당자</dt><dd>{{ goal.owner }}</dd>
          <dt>가중치</dt><dd>{{ goal.weight }}%</dd>
          <dt>등록일</dt><dd>{{ goal.createdAt }}</dd>
          <dt>달성율</dt>
          <dd>
            {{ goal.achievementRate !== null
              ? goal.achievementRate + '%'
              : '-' }}
          </dd>
        </dl>
      </div>

      <!-- 가운데: 실적 입력 & 파일 업로드 -->
      <div class="input-card">
        <h2>실적 입력</h2>
        <div class="field">
          <label for="achievement">실적 수치</label>
          <input
            id="achievement"
            type="number"
            v-model.number="achievement"
            placeholder="숫자를 입력하세요"
          />
        </div>
        <div class="field">
          <label for="file">첨부파일</label>
          <input id="file" type="file" @change="onFileChange" />
          <p v-if="fileInfo">
            {{ fileInfo.name }} ({{ fileInfo.size }}MB)
          </p>
        </div>
      </div>

      <!-- 오른쪽: 자기 평가 -->
      <div class="eval-card">
        <h2>자기 평가</h2>
        <textarea
          rows="6"
          v-model="selfEval"
          placeholder="평가 내용을 입력하세요"
        ></textarea>
        <button class="btn-save" @click="saveAchievement">
          저장
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const goalId = Number(route.params.id)

const goal = ref({
  id: null,
  title: '',
  description: '',
  target: null,
  weight: null,
  owner: '',
  createdAt: '',
  achievementRate: null,
})
const achievement = ref(null)
const selfEval = ref('')
const fileInfo = ref(null)

function fetchDetail() {
  // public/mockup.json 파일에서 불러오기
  fetch('/mockup.json')
    .then(res => res.json())
    .then(data => {
      const found = data.goals.find(g => g.id === goalId)
      if (found) {
        goal.value = found
        achievement.value = found.achievementRate
        selfEval.value = found.selfEval || ''
      }
    })
    .catch(err => console.error('상세 불러오기 실패:', err))
}

function onFileChange(e) {
  const file = e.target.files[0]
  if (!file) return
  fileInfo.value = {
    name: file.name,
    size: (file.size / 1024 / 1024).toFixed(1),
    raw: file,
  }
}

function saveAchievement() {
  // FormData 로 묶어서 전송 예시
  const form = new FormData()
  form.append('achievement', achievement.value)
  form.append('selfEval', selfEval.value)
  if (fileInfo.value) {
    form.append('file', fileInfo.value.raw)
  }

  // 실제 API 대신 mockup.json 테스트용이라면 아래 주석 처리
  fetch(`/api/goals/${goalId}/achievement`, {
    method: 'POST',
    body: form,
  })
    .then(res => {
      if (!res.ok) throw new Error('저장 실패')
      alert('저장되었습니다.')
      router.back()
    })
    .catch(err => alert(err.message))
}

function goBack() {
  router.back()
}

onMounted(fetchDetail)
</script>

<style scoped>
 .page-title {
    margin-left: 20px;
    margin-bottom: 30px;
    color: #00a8e8;
  }
  .desc {
    display: block;
    margin-left: 20px;
    margin-bottom: 10px;
    font-size: 18px;
  }
.container {
  padding: 24px;
  background: #f0f8ff;
  border-radius: 8px;
}
.page-title {
  font-size: 24px;
  display: inline-block;
}
.btn-back {
  float: right;
  padding: 6px 12px;
  background: #409eff;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
.detail-wrapper {
  display: flex;
  gap: 16px;
  margin-top: 24px;
}
.info-card,
.input-card,
.eval-card {
  background: #fff;
  padding: 16px;
  border-radius: 8px;
  flex: 1;
}
.info-card dt {
  font-weight: bold;
  margin-top: 8px;
}
.info-card dd {
  margin: 4px 0 8px 0;
}
.field {
  margin-bottom: 12px;
}
.field label {
  display: block;
  margin-bottom: 4px;
}
.btn-save {
  margin-top: 8px;
  padding: 6px 12px;
  background: #67c23a;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
</style>
