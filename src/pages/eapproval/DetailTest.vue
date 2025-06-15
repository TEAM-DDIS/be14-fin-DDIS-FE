<template>
  <!-- ◆ 페이지 제목 및 설명 -->
  <h1 class="page-title">결재함</h1>
  <p class="desc">업무 기안 조회</p>

  <div class="main-box">
    <div class="container" v-if="draftDetail">
        <!-- 기본 정보 섹션 -->
          <h2>업무 기안</h2>
          <hr class="bold-divider" />
        <table class="info-table">
          <tr>
            <th>기안부서</th>
            <td>{{ draftDetail.team }}</td>
            <th>직책</th>
            <td>{{ draftDetail.position }}</td>
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

        <!-- 결재선 섹션 with single button -->
        <div class="approval-header">
            <span class="section-title">결재선</span>
            <button
              class="approval-button"
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
              <td>{{ item.position }}</td>
              <td>{{ item.status }}</td>
              <td>{{ item.type }}</td>
              <td>{{ item.approveDate || '-' }}</td>
              <td>{{ item.comment || '-' }}</td>
            </tr>
          </tbody>
        </table>

        <!-- 승인/반려 모달 -->
        <!-- ApprovalModal에도 안전하게 넘기기 -->
          <ApprovalModal
            v-if="showApprovalModal"
            :line-id="Number(currentLineId)"
            @close="closeModal"
            @submit="handleApprove"
          />

        <!-- ◆ 기안 내용 작성 영역 -->
        <div class="section-title">기안내용</div>
          <hr class="section-divider" />

        <!-- 기안내용 섹션 -->
        <table class="title-table">
          <thead>
            <tr v-if="draftDetail && draftDetail.content">
              <th>제목</th>
                <td colspan="1">{{ draftDetail.docTitle }}</td>
            </tr>
            <tr>
              <th>첨부파일</th>
                <td colspan="1">
                  <template v-if="draftDetail.content.refFile.length">
                    <div v-for="file in draftDetail.content.refFile" :key="file.name">
                      {{ file.name }} <span class="file-info">({{ file.size }}, {{ file.type }})</span>
                    </div>
                  </template>
                  <template v-else>-</template>
                </td>
            </tr>
          </thead>
        </table>
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

          <!-- draftDetail이 없을 때: 로딩 상태 표시 -->
          <div v-else class="loading">로딩 중입니다...</div>
  </div>
  <!-- 하단 버튼 그룹 -->
      <div class="button-group">
        <button class="button gray">취소</button>
        <button class="button">확인</button>
      </div>
</template>

<script setup>
// Composition API 함수 import
import { onMounted, ref, computed } from 'vue'           // 상태 관리와 생명주기 훅
import axios from 'axios'                                 // HTTP 요청 라이브러리
import { useRoute } from 'vue-router'                     // 현재 URL의 파라미터(docId 등)를 읽기 위함
import ApprovalModal from '@/components/eapproval/ApproveModal.vue'  // 결재 모달 컴포넌트

// 📌 현재 페이지의 URL에서 docId 추출 (예: /drafts/123 → docId = 123)
const route = useRoute()
const docId = route.params.docId

// 📌 상태 변수 (reactive 데이터)
const draftDetail = ref(null)         // 기안 상세 데이터
const isLoading = ref(true)           // 로딩 상태 표시용
const error = ref(null)               // 에러 정보 저장


// 📌 모달 관련 상태 변수
const showApprovalModal = ref(false)  // 결재 모달 열림 여부
const currentLineId = ref(null)       // 선택된 결재선의 ID

// 📌 현재 선택된 결재선 데이터 (결재하기 버튼 활성화 조건에 사용됨)
// 숫자 비교 강제 일치
const myId = localStorage.getItem('employeeId') || ''; 

const selectedLine = computed(() => {
  return draftDetail.value?.approvalLine?.find(
    line => Number(line.id) === Number(currentLineId.value)
  ) || null
})

// 📌 기안 상세 조회 API 호출 함수
async function fetchDetail() {
  isLoading.value = true
  try {
    const { data } = await axios.get(`http://localhost:8000/drafts/query/${docId}`)

    const parsed = data.contentDto || {
      title: '',
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
      team: data.team,
      position: data.position,
      drafter: data.drafter,
      date: data.date?.replace('T', ' ').slice(0, 16) || '',
      keepYear: data.keepYear,
      receiver: parsed.receiver?.join(', ') || '-',
      referer: parsed.reference?.join(', ') || '-',
      approvalLine: data.approvalLine || [],
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
  currentLineId.value = Number(id)     // 🔧 여기서도 숫자로 강제 변환
  console.log('✅ currentLineId 선택됨:', currentLineId.value)
}

// 📌 '결재하기' 버튼 클릭 시 모달 열기
function openApprovalModal() {
  console.log('🟡 모달 열기 시도')

  // 아무것도 선택되지 않았거나 상태가 '미결'이 아니면 모달 안 열림
  if (!selectedLine.value) {
    console.warn('❌ selectedLine 없음')
    return
  }

  if (selectedLine.value.status !== '미결') {
    console.warn('❌ 상태가 미결 아님:', selectedLine.value.status)
    return
  }

  console.log('✅ 조건 통과, 모달 오픈')
  showApprovalModal.value = true
}

// 📌 모달 닫기
function closeModal() {
  showApprovalModal.value = false
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
.approval-header {
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
  max-height: 1500px;
}

/* ✅ 내부 컨텐츠 컨테이너 */
.container {
  font-family: Arial, sans-serif;
  max-width: 1350px;
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

.title-table {
  margin-bottom: 32px; /* 제목 테이블과 본문 테이블 간 간격 */
}

/* 결재선, 본문용 구조 */
.approval-header {
  align-items:baseline;
  justify-content: space-between;   /* ← 양쪽 끝 정렬 */
}

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
.approval-button,
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

.approval-button {
  display: inline-block;
  margin-bottom: 0px;
}

.approval-button:hover {
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
  margin-top: 100px; /* 제목 테이블과 간격 */
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
</style>
