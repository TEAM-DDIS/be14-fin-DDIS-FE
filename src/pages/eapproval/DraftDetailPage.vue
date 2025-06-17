<!-- 기안문 상세 조회 페이지 -->

<template>
    <div v-if="!isLoading">
  <!-- ◆ 페이지 제목 및 설명 -->
  <h1 class="page-title">{{ currentTitle }}</h1>
  <p class="desc">{{ currentDesc }}</p>

  <div class="main-box">
    <div class="container" v-if="draftDetail">
        <!-- 기본 정보 섹션 -->
          <h2>업무 기안</h2>
          <hr class="bold-divider" />
        <table class="info-table">
          <tr>
            <th>기안부서</th>
            <td>{{ draftDetail.team }}</td>
            <th>직급</th>
            <td>{{ draftDetail.rankName }}</td>
          </tr>
          <tr>
            <th>기안자</th>
            <td>{{ draftDetail.drafter }}</td>
            <th>기안일자</th>
            <td>{{ draftDetail.date }}</td>
          </tr>
          <tr>
            <th>문서번호</th>
            <td>{{ draftDetail.docId }}</td>
            <th>보존연한</th>
            <td>{{ draftDetail.keepYear }}년</td>
          </tr>
          <tr>
            <th>수신자</th>
            <td>{{ draftDetail.receiver || '-' }}</td>
            <th>참조자</th>
            <td>{{ draftDetail.referer || '-' }}</td>
          </tr>
        </table>

        <!-- Conditional Button Section: 회수하기 or 결재하기 -->
        <div class="action-header">
            <span class="section-title">결재선</span>
            <!-- 회수하기 버튼 -->
            <button
              v-if="isDrafterViewingMyDraftBox"
              class="action-button"
              :disabled="!isRetractable"
              @click="openRetrieveModal"
            >회수하기</button>
            <!-- 결재하기 버튼 -->
            <button
              v-else-if="isApproverViewingApprovalBox"
              class="action-button"
              :disabled="!selectedLine || selectedLine.status !== '미결'"
              @click="openApprovalModal"
            >결재하기</button>
        </div>

      <hr class="section-divider" />

        <!-- 결재라인 리스트: 클릭하여 선택 후 상단 버튼 사용 -->
        <table class="line-table" v-if="draftDetail.approvalLine.length">
          <thead>
            <tr>
              <th style="width: 30px">번호</th>
              <th style="width: 80px">성명</th>
              <th style="width: 110px">팀</th>
              <th style="width: 80px">직급</th>
              <th style="width: 80px">상태</th>
              <th style="width: 80px">종류</th>
              <th style="width: 180px">결재일시</th>
              <th style="width: auto">의견</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="item in draftDetail.approvalLine"
              :key="item.id"
              @click="selectLine(item.id)"
              :class="{ selected: currentLineId === item.id }"
            >
              <td>{{ item.step }}</td>
              <td>{{ item.name }}</td>
              <td>{{ item.team }}</td>
              <td>{{ item.rankName }}</td>
              <td>{{ item.status }}</td>
              <td>{{ item.type }}</td>
              <td>{{ item.approveDate ? item.approveDate.replace('T', ' ').slice(0, 16) : '-' }}</td>
              <td>{{ item.comment || '-' }}</td>
            </tr>
          </tbody>
        </table>

        <!-- 승인/반려 모달 -->
          <ApprovalModal
            v-if="showApprovalModal"
            :line-id="Number(currentLineId)"
            :approval-line="selectedLine"
            :rank-name="selectedLine?.rankName"
            @close="closeModal"
            @submit="handleApprove"
          />

        <!-- 회수 모달 -->
        <RetrieveModal
          v-if="showRetrieveModal"
          :doc-id="docId"
          @close="showRetrieveModal = false"
          @submit="handleWithdraw"
        />

        <!-- ◆ 기안 내용 작성 영역 -->
        <div class="section-title">기안내용</div>
          <hr class="section-divider" />

        <!-- 제목 및 첨부파일 섹션 통합 테이블 -->
        <table class="section-content-table">
          <tbody>
            <tr>
              <th class="label-cell">제&nbsp;&nbsp;&nbsp;목</th>
              <td>
                <div>
                  {{ draftDetail.docTitle }}
                </div>
              </td>
            </tr>
            <tr>
              <th class="label-cell">첨부파일</th>
              <td>
                <div >
                  <template v-if="draftDetail.content.refFile.length">
                    <ul>
                      <li
                        v-for="file in draftDetail.content.refFile"
                        :key="file.key"
                      >
                        <a
                          v-if="file.url"
                          :href="file.url"
                          target="_blank"
                        >
                          {{ file.name }}
                        </a>
                        <span v-else class="file-info error">
                          {{ file.name }} (URL 생성 실패)
                        </span>
                      </li>
                    </ul>
                  </template>
                  <template v-else>-</template>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- 본문 섹션 -->
        <table class="content-table">
          <tr>
            <th colspan="4" class="content-header">본문</th>
          </tr>
          <tr>
            <td colspan="4">
              <div class="content-body">
                <div v-html="draftDetail.content.body"></div>
              </div>
            </td>
          </tr>
        </table>
    </div>
      <!-- 하단 버튼 그룹 -->
      <div class="button-group">
        <button class="button gray" @click="handleCancel">취소</button>
        <button class="button" @click="handleConfirm">확인</button>
  </div>

        <!-- 반려 또는 회수 탭일 때 재상신 버튼 -->
        <!-- <button v-if="isBanryeoDoc || isHoesuDoc" @click="handleResubmit">재상신</button> -->
      </div>

        </div>
          <!-- draftDetail이 없을 때: 로딩 상태 표시 -->
          <div v-else class="loading">로딩 중입니다...</div>
</template>

<script setup>
// Composition API 함수 import
import { onMounted, ref, computed } from 'vue'           // 상태 관리와 생명주기 훅
import axios from 'axios'                                 // HTTP 요청 라이브러리
import { useRoute, useRouter } from 'vue-router'                     // 현재 URL의 파라미터(docId 등)를 읽기 위함
import ApprovalModal from '@/components/eapproval/ApproveModal.vue'  // 결재 모달 컴포넌트
import RetrieveModal from '@/components/eapproval/RetrieveModal.vue'  // 회수 모달 컴포넌트
import { useUserStore } from '@/stores/user'

// 📌 현재 페이지의 URL에서 docId 추출 (예: /drafts/123 → docId = 123)
const route = useRoute()
const router = useRouter()
const docId = route.params.docId

// 📌 상태 변수 (reactive 데이터)
const draftDetail = ref(null)         // 기안 상세 데이터
const isLoading = ref(true)           // 로딩 상태 표시용
const error = ref(null)               // 에러 정보 저장
const presignedUrls = ref([])


// 📌 모달 관련 상태 변수
const showApprovalModal = ref(false)  // 결재 모달 열림 여부
const showRetrieveModal = ref(false)  // 회수 모달 열림 여부
const currentLineId = ref(null)       // 선택된 결재선의 ID


const box = route.query.box || ''
const boxKey = box.endsWith('Box') ? box : `${box}Box` // ← 보정

const pageTitleMap = {
  MyDraftBox: '기안함',
  ApprovalBox: '결재함',
  ReceiverBox: '수신함',
  ReferenceBox: '참조함'
}

const currentTitle = computed(() => pageTitleMap[boxKey] || '문서함')


//  query.formName 기준
const descMap = {
  일반기안: '업무 기안 조회',
}
const currentDesc = computed(() => {
  const formName = route.query.formName || ''
  return descMap[formName] || '업무 기안 조회'
})

//  로그인 사용자 ID
const myId = ref('') // myId를 ref로 선언하여 반응성 추가

//  문서 상태 기반 조건
const isSangsinDoc = computed(() => draftDetail.value?.docStatus === '심사중')
const isBanryeoDoc = computed(() => draftDetail.value?.docStatus === '반려')
const isHoesuDoc   = computed(() => draftDetail.value?.docStatus === '회수')
const userStore = useUserStore()

// 회수 가능 조건 (DraftDetailPage에서만 사용)
const isRetractable = computed(() => {
  if (!draftDetail.value || !myId.value) return false // myId가 초기화되지 않았으면 false
  const isDrafter = String(draftDetail.value.drafterId) === myId.value // drafterId도 String으로 변환하여 비교
  const firstApproverStatus = draftDetail.value.approvalLine?.[1]?.status // 첫 번째 결재자(기안자 다음)의 상태
  console.log('회수 가능 여부 체크:', {
    isDrafter,
    boxKey,
    docStatus: draftDetail.value.docStatus,
    firstApproverStatus,
    myId: myId.value,
    drafterId: draftDetail.value.drafterId,
    approvalLine: draftDetail.value.approvalLine
  })
  return isDrafter &&
         boxKey === 'MyDraftBox' && // Only in MyDraftBox
        draftDetail.value.docStatus === '심사중' &&
         (firstApproverStatus === '대기중' || firstApproverStatus === '미결')
})

// 새롭게 추가되는 computed 속성
const isDrafterViewingMyDraftBox = computed(() => {
  if (!draftDetail.value || !myId.value) return false
  return String(draftDetail.value.drafterId) === myId.value &&
         boxKey === 'MyDraftBox' &&
         draftDetail.value.docStatus !== '회수' // '회수' 상태일 때는 보이지 않음
})

const isApproverViewingApprovalBox = computed(() => {
  if (!draftDetail.value || !myId.value) return false
  return String(draftDetail.value.drafterId) !== myId.value &&
         boxKey === 'ApprovalBox' &&
         draftDetail.value.docStatus !== '회수' // '회수' 상태일 때는 보이지 않음
})

// 📌 선택된 결재선
const selectedLine = computed(() => {
  return draftDetail.value?.approvalLine?.find(
    line => Number(line.id) === Number(currentLineId.value)
  ) || null
})

// 4) S3 다운로드용 presigned URL 요청
async function fetchPresignedUrls() {
  presignedUrls.value = []
  const token = localStorage.getItem('token')
  for (const file of draftDetail.value.content.refFile) {
    const qs = new URLSearchParams({
      filename:    file.key,       // DB에 저장된 S3 key
      contentType: file.type       // MIME 타입
    }).toString()

    const res = await fetch(
      `http://localhost:8000/s3/download-url?${qs}`,
      { headers: { Authorization: `Bearer ${token}` } }
    )
    if (!res.ok) {
      presignedUrls.value.push(null)
    } else {
      presignedUrls.value.push(await res.text())
    }
  }
}

// 📌 기안 상세 조회 API 호출 함수
async function fetchDetail() {
  isLoading.value = true
    try {
    // --- START: Ensure employeeId is in localStorage and myId ref is set --- BEGIN
    let employeeIdFromLocalStorage = userStore.employeeId
    console.log('fetchDetail: Initial userStore employeeId:', employeeIdFromLocalStorage)

    if (!employeeIdFromLocalStorage || employeeIdFromLocalStorage === 'null' || employeeIdFromLocalStorage === 'undefined') {
      console.log('fetchDetail: employeeId not found in localStorage, trying to fetch from /drafter/me')
      try {
        const token = localStorage.getItem("token")
        if (!token) {
          console.warn('fetchDetail: No token found in localStorage. Cannot fetch user info.')
          // router.push({ name: 'LoginPage' }); // 로그인 페이지로 리다이렉트
          // return; // 토큰이 없으면 함수 종료
        }

        const userRes = await axios.get("http://localhost:8000/drafter/me", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
        if (userRes.data && userRes.data.empId) {
          localStorage.setItem('employeeId', String(userRes.data.empId)) // String으로 저장
          myId.value = String(userRes.data.empId) // myId ref 업데이트
          console.log('fetchDetail: Fetched employeeId from /drafter/me and set in localStorage and myId ref:', myId.value)
        } else {
          console.warn('fetchDetail: ⚠️ /drafter/me did not return empId. Response data:', userRes.data)
        }
      } catch (userFetchError) {
        console.error('fetchDetail: ❌ Failed to fetch user info from /drafter/me:', userFetchError)
      }
    } else {
      myId.value = employeeIdFromLocalStorage // localStorage에서 가져온 값을 myId ref에 설정
      console.log('fetchDetail: employeeId already exists in localStorage, set to myId ref:', myId.value)
    }
    // --- END: Ensure employeeId is in localStorage and myId ref is set --- END

    const res = await axios.get(`http://localhost:8000/drafts/query/${docId}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
    console.log('✅ 상세 데이터:', res.data)

    const data = res.data

    const parsed = data.contentDto || {
      body: data.docContent || '',
      refFile: [],
      receiver: [],
      reference: []
    }

    // ✅ 프론트에서 title fallback 적용
    const safeTitle = parsed.title?.trim() ? parsed.title : data.title || '제목 없음'

    draftDetail.value = {
      docId: data.docId,
      docTitle: data.docTitle,
      docStatus: data.docStatus,
      team: data.team,
      position: data.position, // 이 필드는 더 이상 직급으로 사용되지 않음
      drafter: data.drafter,
      drafterId: String(data.drafterId), // drafterId 추가 및 문자열 변환
      rankName: data.rankName, // 기안자 직급 추가
      date: data.date?.replace('T', ' ').slice(0, 16) || '',
      keepYear: data.keepYear,
      receiver: parsed.receiver?.join(', ') || '-',
      referer: parsed.reference?.join(', ') || '-',
      approvalLine: data.approvalLine.map(line => ({
        ...line,
        rankName: line.approvalLine_rankName || line.rankName || '', // approvalLine_rankName 우선 사용
      })) || [],
      content: {
        refFile: parsed.refFile || [],
        body: parsed.body || ''
      }
    }

console.log('📦 백엔드에서 받은 제목 - title:', data.docTitle)
console.log('📦 백엔드에서 받은 내용 - content:',{
        refFile: parsed.refFile || [],
        body: parsed.body || ''
      })

  } catch (e) {
    error.value = e
    console.error('❗ 기안 상세 조회 실패', e)
  } finally {
    isLoading.value = false
  }
}

// 📌 컴포넌트가 화면에 처음 보여질 때 API 호출
onMounted(fetchDetail)

// 📌 결재라인 목록 중 하나를 클릭하면 해당 ID를 저장
function selectLine(id) {
  currentLineId.value = Number(id)
  console.log('✅ 선택된 결재선:', draftDetail.value?.approvalLine.find(line => line.id === id))
}

// 📌 '결재하기' 버튼 클릭 시 모달 열기
function openApprovalModal() {
  console.log('🟡 모달 열기 시도')

  // 아무것도 선택되지 않았으면 모달 안 열림
  if (!selectedLine.value) {
    console.warn('❌ selectedLine 없음')
    return
  }

  // 현재 로그인한 사용자 ID (ref에서 가져옴)
  
  // 결재선의 결재자 ID와 현재 로그인한 사용자의 ID를 문자열로 변환하여 비교
  if (String(selectedLine.value.employeeId) !== myId.value) {
    alert('결재 권한이 없습니다.')
    return
  }

  // 결재선 상태가 '미결'이 아니면 모달 열리지 않음
  if (selectedLine.value.status !== '미결') {
      console.warn('❌ 상태가 미결 아님:', selectedLine.value.status)
      alert('미결 상태의 결재만 처리할 수 있습니다.') // 사용자에게 알림
      return
  }

  console.log('✅ 조건 통과, 모달 오픈')
  showApprovalModal.value = true
}

// 📌 '회수하기' 버튼 클릭 시 모달 열기
function openRetrieveModal() {
  console.log('🟡 회수 모달 열기 시도', {
    isRetractable: isRetractable.value,
    showRetrieveModal: showRetrieveModal.value
  })
  if (!isRetractable.value) {
    console.warn('❌ 회수할 수 없는 상태')
    return
  }
  showRetrieveModal.value = true
  console.log('✅ 모달 상태 변경:', showRetrieveModal.value)
}

// 📌 모달 닫기
function closeModal() {
  showApprovalModal.value = false
  showRetrieveModal.value = false // 회수 모달도 닫기
}

// 📌 승인 또는 반려 처리 후 다시 기안 상세정보 갱신
async function handleApprove({ lineId, status, opinion }) {
  console.log('📤 handleApprove 호출 –', { lineId, status, opinion })
  try {
    const token = localStorage.getItem('token') || ''
    const headers = token ? { Authorization: `Bearer ${token}` } : {}

    // 승인인지 반려인지에 따라 경로 구분
    const path = status === '승인' ? 'approve' : 'reject'

    // 서버에 결재 요청 전송
    await axios.post(
      `http://localhost:8000/approvals/${lineId}/${path}`,
      { opinion },
      { headers }
    )

    // 반영된 상태를 다시 불러옴
    await fetchDetail()
  } catch (e) {
    console.error('❗ 결재 처리 실패', e)
    alert('결재 처리에 실패했습니다.')
  } finally {
    showApprovalModal.value = false  // 모달 닫기
  }
}

async function handleWithdraw() {
  console.log('📤 handleWithdraw 호출 –', { docId: draftDetail.value.docId })
  try {
    const token = localStorage.getItem('token') || ''
    const headers = token ? { Authorization: `Bearer ${token}` } : {}

    await axios.post(
      `http://localhost:8000/drafts/query/${draftDetail.value.docId}/recall`,
      {},
      { headers }
    )
    alert('문서가 성공적으로 회수되었습니다.')
    // 회수 탭으로 이동하도록 수정
    router.push({
      name: 'MyDraftBox',
      query: { tab: '회수' }
    })
  } catch (e) {
    console.error('❗ 회수 처리 실패', e)
    alert('회수 처리에 실패했습니다: ' + (e.response?.data?.message || e.message))
  } finally {
    showRetrieveModal.value = false
  }
}

  // 📌 하단 버튼 동작
  // 확인, 취소, 회수, 재상신 버튼
  function handleConfirm() {
    router.back()
  }
  function handleCancel() {
    router.back()
  }
  function handleResubmit() {
    if (draftDetail.value?.docId) {
      router.push({ name: 'DraftCreate', query: { resubmit: draftDetail.value.docId } })
    }
  }

</script>

<style scoped>
/* ==== 표 스타일: 헤더는 굵게, 본문은 일반체 ==== */
.page-title {
  margin-left: 20px;
  margin-bottom: 30px;
  color: #00a8e8;
}

.desc {
    display: block;
    margin-bottom: 10px;
    margin-left: 20px;
    font-size: 18px;
  }

/* 결재선,버튼 한줄 */
.action-header { /* Renamed from approval-header to be more general */
  display: flex;
  justify-content: space-between; /* 좌우 양끝 정렬 */
  align-items: center;             /* 수직 가운데 정렬 */
  margin: 16px 0 8px;
  padding: 0 12px;
  width: 100%;
  box-sizing: border-box;
}

/* ✅ 메인 박스: 전체 레이아웃 래퍼 */
.main-box {
  background: #ffffff;
  border-radius: 12px;
  padding: 20px 32px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  margin: 24px;
  max-width: 100%;
  display: flex;
  flex-direction: column;
  min-height: fit-content; /* or: min-height: 800px; */
}

/* ✅ 내부 컨텐츠 컨테이너 */
.container {
  font-family: Arial, sans-serif;
  min-width: 850px;
  max-width: 1600px;
  max-height: 1500px;
  margin: 20px auto;
}


/* ✅ 제목 영역 구분선 */
.bold-divider {
  height: 2px;
  background-color: #dddddd;
  border: none;
  margin: 16px 0;
}

h2 {
  text-align: center;
  margin-bottom: 20px;
}

.section-divider {
  width: 100%;
  margin: 12px 0 24px 0;
  box-sizing: border-box;
  border: none;
  border-top: 2px solid #ccc;
}

th {
  font-weight: 600;
  background: #f8f9fa;
  border: 1px solid #e3e6ea;
  padding: 8px;
  text-align: left;
}

td {
  font-weight: normal;
  border: 1px solid #e3e6ea;
  padding: 8px;
  text-align: left;
  white-space: normal;    /* ✅ 줄바꿈 허용 */
  word-break: break-word; /* ✅ 단어 중간이라도 줄바꿈 */
}

/* 테이블 공통 */
table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 16px;
}

.file-attachments-table {
  margin-bottom: 16px; /* Adjust spacing as needed */
}

.title-table {
  margin-bottom: 32px; /* 제목 테이블과 본문 테이블 간 간격 */
}

/* 결재선, 본문용 구조 */
/* .approval-header { */ /* Replaced by .action-header */
/*   align-items:baseline; */
/*   justify-content: space-between; */   /* ← 양쪽 끝 정렬 */
/* } */

.section-title {
  font-weight: bold;
  margin-top: 50px;
  margin-bottom: 0px;
}

/* 하단 버튼 그룹 */
.button-group {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-top: 16px;
}

/* 버튼 기본 */
.action-button, /* Renamed from .approval-button */
.button {
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

.button:hover {
  background-color: white;
  color: #00a8e8;
  border-color: #00a8e8;
  box-shadow: inset 1px 1px 10px rgba(0, 0, 0, 0.25);
}

.action-button {
  display: inline-block;
  margin-bottom: 0px;
}

.action-button:hover {
  background-color: white;
  color: #00a8e8;
  border-color: #00a8e8;
  box-shadow:
  inset 1px 1px 10px rgba(0, 0, 0, 0.25);
}

.button.gray {
  font-size: 14px;
  font-weight: bold;
  background-color: #D3D3D3;
  color: #000;
  border: none;
  border-radius: 10px;
  padding: 10px 30px;
  font-weight: bold;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: background-color 0.2s, box-shadow 0.2s;
  box-sizing: border-box;
}

.button.gray:hover {
  background-color: #000;
  color: #fff;
} 
/* 첨부파일 정보 */
.file-info {
  font-size: 13px;
  color: #666;
}

/* 본문영역 */
.content-header {
  margin-top: 0; /* 제목 섹션과 병합되었으므로 마진 제거 */
  text-align: center;
  background-color: #f7f8fa;
  font-size: 16px;
  font-weight: bold;
}

.content-body {
  min-height: 300px;        /* ✅ 기본 높이 고정 */
  padding: 16px;
  white-space: pre-wrap;
  background-color: #fdfdfd;
  line-height: 1.6;
}

/* 로딩 상태 */
.loading {
  text-align: center;
  margin: 32px 0;
}

.button-group {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-top: 24px;
}

.success-message {
  margin-top: 10px;
  padding: 10px;
  background-color: #e0f8e9;
  border: 1px solid #60c18e;
  color: #137a36;
  font-weight: bold;
  border-radius: 6px;
  text-align: center;
}

.line-table tr:hover {
  background-color: #D3D3D3;
  transition: background-color 0.3s ease;
}

.line-table tr.selected {
  background-color: #D3D3D3;
}

.line-table tr.hovered:not(.selected) {
  background-color: #D3D3D3;
  transition: background-color 0.3s ease;
}

/* 테이블 공통 */
table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 16px;
}

.section-content-table {
  margin-bottom: 24px; /* 본문 테이블과의 간격 */
}

.section-content-table th.label-cell {
  width: 100px; /* 라벨 칸 너비 고정 */
  background-color: #f8f9fa;
  font-weight: bold;
  text-align: center; /* 라벨 텍스트 중앙 정렬 */
}

.section-content-table td {
  text-align: left;
}

.content-display-box {
  min-height: 36px; /* 최소 높이 설정 (입력 필드 높이와 유사하게) */
  padding: 6px; /* 내부 여백 */
  box-sizing: border-box;
  border: 1px solid #ccc; /* 테두리 */
  border-radius: 8px; /* 둥근 모서리 */
  background-color: #fff;
  display: flex;
  align-items: center; /* 세로 중앙 정렬 */
}

.content-display-box ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.content-display-box li {
  margin-bottom: 4px;
}

.content-display-box li:last-child {
  margin-bottom: 0;
}

/* 본문영역 */
.content-header {
  margin-top: 0; /* 제목 섹션과 병합되었으므로 마진 제거 */
  text-align: center;
  background-color: #f7f8fa;
  font-size: 16px;
  font-weight: bold;
}

.content-body {
  min-height: 300px;        /* ✅ 기본 높이 고정 */
  padding: 16px;
  white-space: pre-wrap;
  background-color: #fdfdfd;
  line-height: 1.6;
}
</style>
