<template>
  <div class="goal-page">
    <h1 class="page-title">
      <img src="@/assets/icons/back_btn.svg"
      alt="back"
      class="back-btn"
      @click="goBack" />
      성과 관리
    </h1>
    <div class="labels-row">
      <p class="section-title">목표 관리</p>
      <div class="label-spacer"></div>
      <p class="section-title">실적 관리</p>
    </div>
    <div class="panels">
      <img class="arrows" src="@/assets/icons/Polygon-2.svg"> 

      <!-- 1) 목표 목록 및 등록 패널 -->
      <section class="panel goals-panel">
        <div class="goal-container">
          <button class="btn-primary" style="margin-bottom: 10px;" @click="openMyPerfModal">내 실적 보기</button>
          <!-- 목표가 없고 등록 폼도 안 보일 때 -->
          <div v-if="goals.length === 0 && !showGoalForm" class="placeholder">
            <p class="placeholder-text">목표를 등록해보세요! </p>
          </div>

          <!-- 목표 등록 폼 -->
          <form v-else-if="showGoalForm" class="goal-form" @submit.prevent="addGoal">
             <!-- 상태 바 -->
            <div class="weight-status" :class="{
                'over': totalWeight > 100,
                'complete': totalWeight === 100
              }">
              현재 가중치 합계: {{ totalWeight }}%
              <span v-if="totalWeight < 100"> (남음 {{ 100 - totalWeight }}%)</span>
              <span v-if="totalWeight > 100"> — 초과되었습니다!</span>
              <span v-else-if="totalWeight === 100"> — 가중치가 딱 맞았습니다!</span>
            </div>
                      
            <div class="form-row">
              <label for="title">목표명</label>
              <input
                id="title"
                v-model="newGoal.goalTitle"
                placeholder="예) 신규 고객 20명 확보"
                required
              />
            </div>
            <div class="form-row half">
              <div>
                <label for="target">목표수치</label>
                <input
                  id="target"
                  v-model.number="newGoal.goalValue"
                  type="number"
                  placeholder="숫자로 입력"
                  required
                />
              </div>
              <div>
                <label for="weight">가중치(%)</label>
                <input
                  id="weight"
                  v-model.number="newGoal.goalWeight"
                  type="number"
                  placeholder="0~100"
                  required
                />
              </div>
            </div>
            <div class="form-row">
              <label for="description">목표내용</label>
              <textarea
                id="description"
                v-model="newGoal.goalContent"
                placeholder="상세 설명을 입력하세요"
              ></textarea>
            </div>
            <div class="form-actions">
              <button class="btn-secondary" type="button" @click="cancelGoal">취소</button>
              <button class="btn-primary" type="submit":disabled="newGoal.goalWeight <= 0 || totalWeight + newGoal.goalWeight > 100">저장</button>
            </div>
          </form>

          <!-- 목표 리스트 -->
          <div v-else class="goals-list">
            <div
              v-for="goal in currentYearGoals"
              :key="goal.goalId"
              class="goal-card"
              :class="{ selected: selected === goal.goalId }"
              @click="selectGoal(goal)"
            >
              <button
                class="btn-card-delete"
                @click.stop="confirmDelete(goal.goalId)"
                title="삭제"
              >×</button>
              <div class="card-top">
                <span class="date">{{ formatDate(goal.goalCreatedAt) }}</span>
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

        <!-- 목표등록 버튼 -->
        <div class="actions" v-if="!showGoalForm">
          <button class="btn-primary" @click="openGoalForm" :disabled="totalWeight >= 100">목표등록</button>
        </div>
      </section>

      <!-- 2) 실적 입력/수정 패널 -->
      <section class="panel perf-panel">
        <div class="perf-header">
          <button v-if="hasPerformance" class="btn-delete" @click="confirmDeletePerf">삭제</button>
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
              <tr class="center"><th colspan="4">목표내용</th></tr>
              <tr class="center"><td colspan="4">{{ selectedGoal.goalContent }}</td></tr>
              <tr class="center"><th colspan="4">첨부파일</th></tr>
              <tr class="center"><td colspan="4"><div v-if="form.existingAttachmentKeys.length" class="existing-files">
             <ul>
              <li
                v-for="(url, idx) in presignedUrls"
                :key="idx"
                class="existing-file-item"
              >
                <a :href="url" target="_blank" rel="noopener noreferrer" class="link-preview">
                  {{ form.existingAttachmentFileNames[idx] }}
                </a>
            
                <span class="file-size-text">
                  ({{ (form.existingAttachmentFileSizes[idx] / 1024 / 1024).toFixed(1) }}MB)
                </span>
              </li>
            </ul>
          </div></td></tr>
            </tbody>
          </table>

          <!-- 3) 이미 등록된 첨부파일이 있으면 목록으로 보여줌 -->
          

          <!-- 실적 입력/수정 폼 -->
          <div class="perf-form">
            <div class="attach-area">
              <label>첨부 파일</label>
              <div class="file-box">
                <template v-if="form.file">
                  <span class="file-name">{{ form.fileName }}</span>
                  <span class="file-size">{{ form.fileSize }}</span>
                </template>
                <button v-if="isCurrentYearGoal" class="btn-attach" @click="$refs.fileInput.click()">첨부파일 등록</button>
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
              <button v-if="isCurrentYearGoal" class="btn-save" @click="submitPerf">{{ hasPerformance ? '수정' : '등록' }}</button>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
    

  <MyPerfModal
    :show="showMyPerfModal"
    :performances="pastPerformances"
    @close="closeMyPerfModal"
    @select="handleModalSelect" 
  />

  <BaseToast ref="toastRef" />

  <GoalConfirmModal
    :show="showConfirm"
    message="정말 삭제하시겠습니까?"
    @confirm="onModalConfirm"
    @cancel="onModalCancel"
  />

  <GoalConfirmModal
  :show="showPerfConfirm"
  message="정말 실적을 삭제하시겠습니까?"
  @confirm="onPerfModalConfirm"
  @cancel="onPerfModalCancel"
  />
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import { v4 as uuidv4 } from 'uuid'
import MyPerfModal from '@/components/Goals/MyPerfModal.vue'
import { useRouter } from 'vue-router'
import BaseToast from '@/components/toast/BaseToast.vue'
import GoalConfirmModal from './GoalConfirmModal.vue'

const showConfirm    = ref(false)
const toDeleteGoalId = ref(null)
const goals = ref([])
const selected = ref(null)
const showGoalForm = ref(false)
const userStore = useUserStore()
const showMyPerfModal = ref(false)
// presigned URL 저장
const presignedUrls = ref([])
const token = useUserStore().accessToken
const router = useRouter()
const toastRef = ref(null)
const showPerfConfirm    = ref(false)

// 신규 목표 등록용 reactive 객체
const newGoal = reactive({
  goalTitle: '',
  goalValue: null,
  goalWeight: null,
  goalContent: '',
  goalCreatedAt: getKoreaLocalDateTimeString(),
  employeeName: userStore.name
})
// 삭제 버튼 클릭 시 → 모달 오픈
function confirmDelete(goalId) {
  toDeleteGoalId.value = goalId
  showConfirm.value    = true
}

// 모달 “확인” 클릭 시 실제 삭제
async function onModalConfirm() {
  await deleteGoals(toDeleteGoalId.value)
  showConfirm.value = false
}
function confirmDeletePerf() {
  showPerfConfirm.value = true
}
async function onPerfModalConfirm() {
  await deletePerf()             // 기존 deletePerf 함수
  showPerfConfirm.value = false
}
function onPerfModalCancel() {
  showPerfConfirm.value = false
}
// 모달 “취소” 클릭 시 닫기
function onModalCancel() {
  showConfirm.value = false
}
function goBack() {
  router.back()
}

const totalWeight = computed(() =>
  goals.value.reduce((sum, g) => sum + (g.goalWeight || 0), 0)
)

function openMyPerfModal() { showMyPerfModal.value = true }
function closeMyPerfModal() { showMyPerfModal.value = false }

// 실적 폼 데이터
const form = reactive({
  actual: null,
  comment: '',
  file: null,
  fileName: '',
  fileSize: '',
  existingAttachmentKeys: [],
  existingAttachmentFileNames: [],
  existingAttachmentFileTypes: [],
  existingAttachmentFileSizes: [],
  performanceId: null
})

// computed: 선택된 목표
const selectedGoal = computed(() =>
  goals.value.find(g => g.goalId === selected.value)
)
// computed: 실적이 이미 있으면 true
const hasPerformance = computed(() => form.performanceId !== null)

onMounted(fetchGoals)

// 날짜 포맷 함수 (YYYY-MM-DD)
function formatDate(isoString) {
  if (!isoString) return ''
  return isoString.slice(0, 10)
}
// 1) 올해(현재년도) 필터
const currentYear = new Date().getFullYear()
const currentYearGoals = computed(() =>
  goals.value.filter(g =>
    new Date(g.goalCreatedAt).getFullYear() === currentYear
  )
)

const pastPerformances = computed(() =>
  goals.value
    .filter(g =>
      // 1) 실적이 있고
      g.performance &&
      // 2) 매니저 평가가 완료된 것만 (reviewerScore가 null이 아니어야)
      g.performance.reviewerScore != null &&
      // 3) 과거 연도 것만
      new Date(g.goalCreatedAt).getFullYear() <= currentYear &&
      // 4) 내 실적인 것만
      g.performance.employeeIdSelfreviewer === userStore.employeeId
    )
    .map(g => ({
      performanceId: g.performance.performanceId,
      goalId:        g.goalId,
      goalTitle:     g.goalTitle,
      actual:        g.performance.performanceValue,
      comment:       g.performance.selfreviewContent,
      year:          new Date(g.goalCreatedAt).getFullYear(),
      // 매니저 평가 점수도 보여 주고 싶으면
      reviewrScore:   g.performance.reviewerScore,
      reviewScore:  g.reviewScore
    }))
)

// 한국 시각 기준 ISO 날짜 문자열 반환  
function getKoreaLocalDateTimeString() {
  const now = new Date()
  const tzOffset = now.getTimezoneOffset() * 60000
  return new Date(now - tzOffset).toISOString().slice(0, 19)
}

// 목표 목록을 백엔드에서 가져오기
function fetchGoals() {

  fetch('http://localhost:5000/goals', {
    headers: { Authorization: `Bearer ${token}` }
  })
    .then(res => res.json())
    .then(data => {
      goals.value = data.map(goal => {
        const prog = goal.performance
          ? Math.min(
              100,
              Math.round((goal.performance.performanceValue / goal.goalValue) * 100)
            )
          : 0
        return {
          ...goal,
          progress: prog
        }
      })
    })
    .catch(err => console.error('목표 불러오기 실패:', err))
}

// 실적 수치가 바뀔 때 progress 업데이트
watch(() => form.actual, val => {
  const g = selectedGoal.value
  if (!g || !g.goalValue) return
  g.progress = Math.min(100, Math.round((val / g.goalValue) * 100))
})

// 목표 클릭 시 폼 채우기
function selectGoal(goal) {
  selected.value = goal.goalId
  resetForm()
  presignedUrls.value = []
  if (goal.performance) {
    const perf = goal.performance
    form.actual = perf.performanceValue
    form.comment = perf.selfreviewContent
    form.performanceId = perf.performanceId
    if (Array.isArray(perf.attachmentKeys) && perf.attachmentKeys.length) {
      form.existingAttachmentKeys = [...perf.attachmentKeys]
      form.existingAttachmentFileNames = [...perf.attachmentFileNames]
      form.existingAttachmentFileTypes = [...perf.attachmentFileTypes]
      form.existingAttachmentFileSizes = [...perf.attachmentFileSizes]
      form.fileName = perf.attachmentFileNames[0]
      form.fileSize = `${(perf.attachmentFileSizes[0] / 1024 / 1024).toFixed(1)}MB`
      fetchPresignedUrls()
    }
  }
}
const isCurrentYearGoal = computed(() => {
  if (!selectedGoal.value) return false
  return new Date(selectedGoal.value.goalCreatedAt).getFullYear() === currentYear
})

// 폼 초기화
function resetForm() {
  form.actual = null
  form.comment = ''
  form.file = null
  form.fileName = ''
  form.fileSize = ''
  form.existingAttachmentKeys = []
  form.existingAttachmentFileNames = []
  form.existingAttachmentFileTypes = []
  form.existingAttachmentFileSizes = []
  form.performanceId = null
  presignedUrls.value = []
}

// 목표 등록 폼 열기
function openGoalForm() {
  showGoalForm.value = true
}

// -----------------------------
//  프리사인드 URL 미리 가져오기
// -----------------------------
async function fetchPresignedUrls() {
  presignedUrls.value = []

  for (let i = 0; i < form.existingAttachmentKeys.length; i++) {
    const s3Key   = form.existingAttachmentKeys[i]
    const fileType = form.existingAttachmentFileTypes[i]

    try {
      // 1) URLSearchParams 로 쿼리스트링 생성 (소문자 키)
      const qs = new URLSearchParams({
        filename:    s3Key,
        contentType: fileType
      }).toString()

      // 2) GET /s3/download-url?filename=…&contentType=…
      const res = await fetch(
        `http://localhost:5000/s3/download-url?${qs}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      if (!res.ok) throw new Error("프리사인드 URL 생성 실패")

      // 3) plain text 로 온 presigned GET URL
      const url = await res.text()
      presignedUrls.value.push(url)
    } catch (err) {
      console.error(err)
      presignedUrls.value.push("")
    }
  }
}

function getDownloadUrlWithDisposition(presignedUrl, filename) {
  // 1) filename(한글) → percent-encode
  const percentEncodedName = encodeURIComponent(filename);
  //    filename이 "목표.png"라면 → "%EB%AA%A9%ED%91%9C.png"

  // 2) RFC5987 rawDisposition: 
  //    "attachment; filename*=UTF-8''" 다음에 첫 번째 인코딩 문자열 붙이기
  const rawDisposition = `attachment; filename*=UTF-8''${percentEncodedName}`;
  //    → 예시: "attachment; filename*=UTF-8''%EB%AA%A9%ED%91%9C.png"

  // 3) rawDisposition 전체를 한번 더 encodeURIComponent
  const doubleEncoded = encodeURIComponent(rawDisposition);
  //    → 예시: "attachment%3B%20filename*%3DUTF-8''%25EB%25AA%25A9%25ED%2591%259C.png"

  // 4) presignedUrl 뒤에 붙여서 반환
  return presignedUrl + "&response-content-disposition=" + doubleEncoded;
}

// -----------------------------
//  파일 다운로드 (파일 업로드/수정 로직 제외)
// -----------------------------
async function downloadAttachment(fileKey, fileType) {
  try {
    // 쿼리스트링 생성
    const qs = new URLSearchParams({
      filename: fileKey,
      contentType: fileType
    }).toString();

    // ① 다운로드용 presign URL 요청
    const res = await fetch(
      `http://localhost:5000/s3/download-url?${qs}`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    if (!res.ok) throw new Error('다운로드 URL 생성 실패');

    // ② 백엔드가 반환한 presigned GET URL (plain text)
    const downloadUrl = await res.text();

    // ③ 새 탭으로 열기
    window.open(downloadUrl, '_blank');
  } catch (err) {
    console.error(err);
    showToast('파일 다운로드 중 오류가 발생했습니다.');
  }
}
function handleModalSelect(goalId) {
  selected.value = goalId       // 오른쪽에 해당 goal 데이터 바인딩
  closeMyPerfModal()
}

function onFileChange(e) {
  const f = e.target.files[0]
  if (!f) return
  form.file = f
  form.fileName = f.name
  form.fileSize = (f.size / 1024 / 1024).toFixed(1) + 'MB'
}

// 1) 목표 등록
async function addGoal() {
  if (newGoal.goalWeight <= 0) {
    return showToast('가중치는 0보다 커야 합니다.')
  }
  if (totalWeight.value + newGoal.goalWeight > 100) {
    return showToast(`가중치 합이 100%를 초과합니다. 현재 합: ${totalWeight.value}%`)
  }

  if (!newGoal.goalTitle) return

  const payload = {
    goalTitle: newGoal.goalTitle,
    goalValue: newGoal.goalValue,
    goalWeight: newGoal.goalWeight,
    goalContent: newGoal.goalContent,
    goalCreatedAt: newGoal.goalCreatedAt,
    employeeName: newGoal.employeeName
  }

  try {
    const res = await fetch('http://localhost:5000/goals', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    })
    if (!res.ok) throw new Error('목표 등록 실패')
    const id = await res.json()
    goals.value.push({
      goalId: id,
      ...payload,
      progress: 0,
      performance: null
    })
    cancelGoal()
  } catch (err) {
    console.error(err)
    showToast('목표 등록 중 오류가 발생했습니다.')
  }
}


// 목표 등록 취소
function cancelGoal() {
  newGoal.goalTitle = ''
  newGoal.goalValue = null
  newGoal.goalWeight = null
  newGoal.goalContent = ''
  showGoalForm.value = false
}

// 목표 삭제 전 확인


// 2) 목표 삭제
async function deleteGoals(id) {
  try {
    const res = await fetch(`http://localhost:5000/goals/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ goalId: id })
    })
    if (!res.ok) throw new Error('목표 삭제 실패')
    const idx = goals.value.findIndex(g => g.goalId === id)
    if (idx !== -1) {
      goals.value.splice(idx, 1)
      if (selected.value === id) selected.value = null
    }
  } catch (err) {
    console.error(err)
    showToast('삭제 중 오류가 발생했습니다.')
  }
}

// 3) 실적 등록/수정
async function submitPerf() {
  const g = selectedGoal.value
  if (!g) return showToast('먼저 목표를 선택해주세요.')

  let attachmentUrlsToSend = [...form.existingAttachmentKeys]
  let fileNamesToSend = [...form.existingAttachmentFileNames]
  let fileTypesToSend = [...form.existingAttachmentFileTypes]
  let fileSizesToSend = [...form.existingAttachmentFileSizes]

  // 새로 파일을 골랐다면 presign→PUT
if (form.file) {
  try {
    // GET /s3/upload-url?filename=...&contentType=...
    const qs = new URLSearchParams({
      filename: form.file.name,
      contentType: form.file.type
    }).toString();

    const presignRes = await fetch(
      `http://localhost:5000/s3/upload-url?${qs}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    if (!presignRes.ok) throw new Error('Presign URL 요청 실패');

    // 백엔드가 { key, url } 형태로 응답하니 그대로 파싱
    const { key, url: uploadUrl } = await presignRes.json();

    // S3에 PUT
    const putRes = await fetch(uploadUrl, {
      method: 'PUT',
      headers: { 'Content-Type': form.file.type },
      body: form.file
    });
    if (!putRes.ok) throw new Error('S3 파일 업로드 실패');

    // payload용 데이터 업데이트
    attachmentUrlsToSend = [key];
    fileNamesToSend      = [form.fileName];
    fileTypesToSend      = [form.file.type];
    fileSizesToSend      = [form.file.size];
  } catch (err) {
    console.error(err);
    return showToast('파일 업로드 중 오류가 발생했습니다.');
  }
}

  const payload = {
    performanceValue: form.actual,
    selfreviewContent: form.comment,
    selfCreatedAt: Date.now(),
    employeeIdSelfreviewer: userStore.employeeId,
    fileSize: fileSizesToSend.length ? fileSizesToSend[0] : null,
    attachmentKey: attachmentUrlsToSend.length ? attachmentUrlsToSend[0] : null,
    originalFileName: fileNamesToSend.length ? fileNamesToSend[0] : '',
    fileType: fileTypesToSend.length ? fileTypesToSend[0] : ''
  }

  try {
    let res
    if (hasPerformance.value) {
      res = await fetch(
        `http://localhost:5000/goalsperf/${g.goalId}/performance/${form.performanceId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        }
      )
    } else {
      res = await fetch(
        `http://localhost:5000/goalsperf/${g.goalId}/performance`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        }
      )
    }
    if (!res.ok) {
      console.error(await res.text())
      return showToast(hasPerformance.value ? '실적 수정에 실패했습니다.' : '실적 등록에 실패했습니다.')
    }
    const saved = await res.json()
    form.performanceId = saved.performanceId
    showToast(hasPerformance.value ? '실적이 수정되었습니다.' : '실적이 등록되었습니다.')
  } catch (err) {
    console.error(err)
    showToast('실적 저장 중 오류가 발생했습니다.')
  }
}

// 4) 실적 삭제
async function deletePerf() {
  const g = selectedGoal.value
  if (!g || !hasPerformance.value) return

  try {
    const res = await fetch(
      `http://localhost:5000/goalsperf/${g.goalId}/performance/${form.performanceId}`,
      {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      }
    )
    if (!res.ok) throw new Error('실적 삭제 실패')
    resetForm()
    showToast('실적이 삭제되었습니다.')
  } catch (e) {
    console.error(e)
    showToast('실적 삭제 중 오류가 발생했습니다.')
  }
}
function showToast(msg) {
  toastRef.value?.show(msg)
}

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
/* .total-title {
  margin-left: 20px;
  margin-bottom: 50px;
  color: var(--primary);
} */

/* .section-title {margin-left: 20px;} */
.goal-page {
  /* padding: 24px; */
  color: var(--text-main);
  display: flex;
  flex-direction: column;
  height: 100vh;
}
.weight-status {
  margin-bottom: 12px;
  font-weight: bold;
}
.weight-status.over { color: #d9534f; /* 빨강 */ }
.weight-status.complete { color: #5cb85c; /* 초록 */ }

input#weight.input-over {
  border-color: #d9534f;
}
input#weight.input-complete {
  border-color: #5cb85c;
}
.labels-row {
  display: flex;
  gap: 24px;
  margin-bottom: 8px;
  margin-top: -18px;
  
  /* margin-left:20px; */
}
.section-title:first-child {
  width: 40%;
  margin-left: 20px;
  margin-bottom: 10px;
  font-size: 18px;
  display: block;
}
.back-btn {
  width: 20px;
  height: 20px;
  margin-right: -10px;
  cursor: pointer;
}
.label-spacer {
  width: 20px;
}
.section-title:last-child {
  margin-left: 20px;
  width: 55%;
  margin-bottom: 10px;
  font-size: 18px;
  display: block;
}
.panels {
  box-shadow: 1px 1px 20px 1px rgba(0, 0, 0, 0.05);
  flex: 1;
  display: flex;
  overflow: hidden;
  position: relative;
    margin: 0 20px 24px;

  /* margin-left: 20px; */
}
.panel {
  background: var( --bg-box);
  border-radius: 8px;
  box-shadow:1px 1px 20px 1px rgba(0, 0, 0, 0.05); 
  display: flex;
  flex-direction: column;
  padding: 30px;
}
.panel::-webkit-scrollbar {
  display: none;
}
.goals-panel {
  margin-right: 0px;
  width: 45%;
  position: relative;
  z-index: 3;
  overflow-y: auto;
}
.goal-container,
.perf-content {
  flex: 1;
}
.existing-file-item{
  list-style: none;
}
.goals-panel::-webkit-scrollbar {
  display: none;
}
.placeholder {
  display: flex;
  align-items: center;
  justify-content: center;       
  flex: 1;
}
tr{
  text-align: left;
}
.placeholder-text {
  color: var(--primary);
  font-size: 1.2rem;
  font-weight: 600;
}
.goal-form {
  background: var(--modal-bg2);
  border-radius: 12px;
  box-shadow: 1px 1px 20px 1px rgba(0, 0, 0, 0.05);
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 16px;
}
.form-row {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.form-row.half {
  flex-direction: row;
  gap: 16px;
}
.form-row.half > div {
  flex: 1;
}
.form-row label {
  font-weight: 600;
  font-size: 0.9rem;
  color: #333;
}
.form-row input,
.form-row textarea {
  box-sizing: border-box;
  width: 100%;
  padding: 8px 12px;
  border: 1px solid var(--border-input);
  border-radius: 6px;
  background-color: var(--bg-main); 
  color: var(--text-main); 
  font-size: 0.95rem;
  transition: border-color 0.2s, background 0.2s;
}
.form-row input {
  height: 48px;
}
.form-row textarea {
  height: 96px;
  overflow-y: auto;
  resize: none;
}
.form-row input:focus,
.form-row textarea:focus {
  outline: none;
  border-color: var(--border-input) !important;
  background-color: var(--bg-main) !important; 
  color: var(--text-main); 
}
.form-row textarea {
  font-family: inherit;
  font-size: 0.95rem;
  line-height: 1.4;
  padding: 8px 12px;
  border: 1px solid var(--border-input);
  border-radius: 6px;
  background-color: var(--bg-main);  
  color: var(--text-main);
  box-sizing: border-box;
  resize: none;
  height: 48px;
}
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
.btn-primary {
    font-size: 14px;
  font-weight: bold;
  background-color: var(--primary);
  color: white;
  border: 1px solid transparent;
  border-radius: 10px;
  padding: 10px 30px;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: background-color 0.2s, box-shadow 0.2s;
  box-sizing: border-box;
}
.btn-primary:hover {
  background-color: var(--bg-main);
  color: var(--primary);
  border-color: var(--primary);
  box-shadow:
  inset 1px 1px 10px rgba(0, 0, 0, 0.25);
}
.btn-secondary {
    font-size: 14px;
  font-weight: bold;
  background-color: #c8c8c8;
  color: white;
  border: none;
  border-radius: 10px;
  padding: 10px 30px;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: background-color 0.2s, box-shadow 0.2s;
  box-sizing: border-box;
}
.btn-secondary:hover {
  background-color: var(--bg-main);
  color: var(--primary);
  border-color: var(--primary);
  box-shadow:
  inset 1px 1px 10px rgba(0, 0, 0, 0.25);
}
.goals-list {
  flex: 1;
  overflow-y: auto;
  /* padding-right: 4px; */
  padding: 3px;
  margin-bottom: 16px;
}
/* .goal-card{position:relative;background:#fff;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.1);padding:16px;margin-bottom:12px;cursor:pointer;transition:transform .2s} */
/* 기본 상태 */
.goal-card {
  position: relative;
  background: var(--bg-box);
  border-radius: 12px;
  box-shadow: 0px 0px 5px 4px var(--menu-btn-shadow);  padding: 16px;
  padding-bottom: 20px;
  margin-bottom: 12px;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

/* 클릭(Active) 상태 */
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
.btn-card-delete {
  position: absolute;
  top: 3px;
  right: 3px;
  background: transparent;
  border: none;
  font-size: 28px;
  margin-bottom: 5px;
  color: #888;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.2s;
}
.goal-card:hover .btn-card-delete {
  opacity: 1;
}
.card-top {
  display: flex;
  justify-content: space-between;
  /* color: #888; */
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
.card-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
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
  height: 12px;
  background: #e0e0e0;
  border: 1px solid #ccc;
  border-radius: 6px;
  overflow: hidden;
}
.progress-fill {
  height: 100%;
  background: var(--primary);
  transition: width 0.3s;
}
.progress-text {
  color: #444;
  font-size: 0.85rem;
  min-width: 28px;
  text-align: right;
}
.pill-group {
  display: flex;
  gap: 8px;
}
.pill {
  padding: 4px 12px;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 500;
  color: #fff;
}
.pill.weight {
  background: #8ec48e;
}
.pill.target {
  background: #f48e8e;
}
.actions {
  display: flex;
  justify-content: center;
  gap: 8px;
}
.perf-title {
  color: var(--primary);
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
}
.perf-panel {
  width: 55%;
  display: flex;
  margin-left: 0px;
  flex-direction: column;
  overflow-y: auto;
  padding-bottom: 24px;
  background: var(--calendar-border-color);
  position: relative;
  z-index: 1;
}
.perf-header {
  display: flex;
  justify-content: flex-end;
}
.perf-content {
  position: relative;
}
.arrows {
  position: absolute;
  left: 43%;
  z-index: 2;
  filter: var(--arrow-filter);
}
.perf-form {
  display: grid;
  position:relative;
  grid-template-columns: max-content 1fr;
  flex-direction: column;
  row-gap: 16px;
  column-gap: 24px;
  align-items: start;
}
.btn-delete {
  background-color: #000;
  border: none;
  padding: 6px 12px;
  border-radius: 6px;
  color: #fff;
  cursor: pointer;
}
.btn-delete:hover {
  background-color: white;
  color: #c8c8c8;;
  border-color: var(--primary);
  box-shadow:
  inset 1px 1px 10px rgba(0, 0, 0, 0.25);
}
.empty {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
}
.empty-text {
  color: var(--primary);
  font-size: 1.2rem;
  font-weight: 600;
}
.detail-table-vertical {
  width: 100%;
  border-collapse: collapse;

  margin-bottom: 20px;
}
table.detail-table-vertical {
  background: none;
  color: inherit;
  border-collapse: collapse;
}
.detail-table-vertical th,
.detail-table-vertical td {
  background: var(--bg-label-cell);
  color: var(--text-main);
  border: 1px solid var(--border-color);
  padding: 12px;
  font-size: 0.9rem;
}
.detail-table-vertical th {
  background: #fafafa;
  font-weight: 600;
}
.detail-table-vertical td {
  background: #ffffff;
}
.attach-area,
.input-area {
  display: contents;
}
.input-area label {
  font-weight: 600;
}
.input-area input,
.input-area textarea {
  padding: 8px;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  background: #fafafa;
  resize: none;
}
.input-area textarea {
  font-family: inherit;
  font-size: 0.95rem;
  line-height: 1.4;
  padding: 8px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  background: #fafafa;
  box-sizing: border-box;
  resize: none;
  height: 48px;
}
.form-row textarea:focus,
.input-area textarea:focus {
  outline: none;
  border-color: black;
  background: #fff;
}
.attach-area label {
  width: 80px;
  font-weight: 600;
}
.file-box {
  display: flex;
  align-items: center;
  background: #fafafa;
  border-radius: 6px;
  padding: 6px 12px;
  gap: 8px;
}
.center{
  text-align: center;
}
.btn-attach {
  font-size: 14px;
  font-weight: bold;
  background-color: var(--primary);
  color: var(--text-on-primary);  
  border: 1px solid transparent;
  border-radius: 10px;
  padding: 10px 30px;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: background-color 0.2s, box-shadow 0.2s;
  box-sizing: border-box;
}
.btn-attach:hover {
  background-color: var(--bg-main);
  color: var(--primary);
  border-color: var(--primary);
  box-shadow:
  inset 1px 1px 10px rgba(0, 0, 0, 0.25);
}
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
}
.btn-save-wrap {
  grid-column: 1 / -1; 
  margin-top: 30px;
  display: flex;
  justify-content: flex-end;
  padding-right: 0;
  gap: 8px;
}
.btn-save {
  font-size: 14px;
  font-weight: bold;
  background-color: var(--primary);
  color: var(--text-on-primary);  
  border: 1px solid transparent;
  border-radius: 10px;
  padding: 10px 30px;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: background-color 0.2s, box-shadow 0.2s;
  box-sizing: border-box;
}
.btn-save:hover {
  background-color: var(--bg-main);
  color: var(--primary);
  border-color: var(--primary);
  box-shadow:
  inset 1px 1px 10px rgba(0, 0, 0, 0.25);
}
.btn-primary:disabled {
  background-color: #c8c8c8;
  color: #6c757d;
  cursor: not-allowed;
  opacity: 0.65;
}
.detail-title {
  margin-bottom: 12px;
}
.detail-title-label {
  display: block;
  font-size: 0.9rem;
  color: #888;
  margin-bottom: 4px;
}
.detail-header {
  display: flex;
  align-items: center;
  padding: 8px 0;
  border-top: 1px solid #e0e0e0;
  margin-top: 16px;
}
.detail-label {
  font-size: 1rem;
  font-weight: 600;
  color: #333;
}
.detail-table-vertical tr:nth-child(odd) td {
  background: #ffffff;
}
.detail-table-vertical tr:nth-child(even) td {
  background: #fff;
}
.link-preview {
  color: inherit;            /* 부모 텍스트 색상 그대로 */
  text-decoration: none;     /* 밑줄 제거 */
  transition: color 0.2s;    /* 부드러운 색 변화 */
  cursor: pointer;
}
.link-preview:hover {
  text-decoration: underline;
}
.link-download {
  margin-left: 4px;
  color: #28a745;
  text-decoration: none;
  font-weight: bold;
}
.link-download:hover {
  text-decoration: underline;
}
.file-size-text {
  margin-left: 8px;
  color: #555;
  font-size: 0.9rem;
}
</style>
