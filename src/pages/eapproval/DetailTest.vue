<template>
  <!-- ◆ 페이지 제목 및 설명 -->
  <h1 class="page-title">결재함</h1>
  <p class="desc">업무 기안 조회</p>

  <!-- draftDetail이 있을 때만 렌더링 -->
  <div class="main-box" v-if="draftDetail">
      <h2>업무 기안</h2>

    <!-- 기본 정보 섹션 -->
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

    <!-- 결재선 섹션 -->
    <div class="approval-header">
      <span class="section-title">결재선</span>
      <button class="approval-button" @click="openApprovalModal">결재등록</button>
    </div>
    <!-- 결재등록 모달 -->
      <ApproveModal
        v-if="showApproveModal"
        :docId="docId"
        @close="showApproveModal = false"
        @submitted="fetchDetail"  />

    <table class="line-table" v-if="draftDetail.approvalLine.length">
      <thead>
        <tr>
          <th>번호</th><th>성명</th><th>팀</th><th>직책</th>
          <th>상태</th><th>종류</th><th>상신일시</th>
          <th>결재일시</th><th>의견</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in draftDetail.approvalLine" :key="item.no">
          <td>{{ item.no }}</td>
          <td>{{ item.name }}</td>
          <td>{{ item.team }}</td>
          <td>{{ item.position }}</td>
          <td>{{ item.status }}</td>
          <td>{{ item.type }}</td>
          <td>{{ item.submitDate || '-' }}</td>
          <td>{{ item.approveDate || '-' }}</td>
          <td>{{ item.comment || '-' }}</td>
        </tr>
      </tbody>
    </table>

    <!-- 기안내용 섹션: 제목, 첨부파일, 본문을 하나의 테이블로 구성 -->
    <table class="content-table">
      <thead>
        <tr>
          <th>제목</th>
          <td colspan="3">{{ draftDetail.content.title }}</td>
        </tr>
        <tr>
          <th>첨부파일</th>
          <td colspan="3">
            <template v-if="draftDetail.content.refFile.length">
              <div v-for="file in draftDetail.content.refFile" :key="file.name">
                {{ file.name }} <span class="file-info">({{ file.size }}, {{ file.type }})</span>
              </div>
            </template>
            <template v-else>-</template>
          </td>
        </tr>
        <tr>
          <th colspan="4">본문</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td colspan="4" class="content-body">{{ draftDetail.content.body }}</td>
        </tr>
      </tbody>
    </table>
  </div>

  <!-- draftDetail이 없을 때: 로딩 상태 표시 -->
  <div v-else class="loading">로딩 중입니다...</div>

  <!-- 하단 버튼 그룹 -->
  <div class="button-group">
    <button class="button gray">취소</button>
    <button class="button">확인</button>
  </div>
</template>


<script setup>
import { onMounted, ref } from 'vue'
import axios from 'axios'
import { useRoute } from 'vue-router'
// 결재등록 모달 컴포넌트
import ApproveModal from '@/components/eapproval/ApproveModal.vue'


// 라우터에서 docId 추출
const route = useRoute()
const docId = route.params.docId

// 상태
const draftDetail     = ref(null)
const isLoading       = ref(true)
const error           = ref(null)
const showApproveModal = ref(false)

// API 호출
async function fetchDetail() {
  isLoading.value = true
  try {
    const { data } = await axios.get(`http://localhost:8000/drafts/${docId}`)
    let parsed = {}
    try {
      const raw = data.contentDto || data.docContent || data.content
      parsed = typeof raw === 'string' ? JSON.parse(raw) : raw || {}
    } catch { console.warn('content 파싱 실패') }

    draftDetail.value = {
      docId: data.docId,
      team: data.team,
      position: data.position,
      drafter: data.drafter,
      date: data.submittedAt?.replace('T',' ').slice(0,16) || '',
      keepYear: data.keepYear,
      receiver: parsed.receiver?.join(', ') || '-',
      referer: parsed.reference?.join(', ') || '-',
      approvalLine: data.approvalLine || [],
      content: {
        title: parsed.title || '',
        refFile: parsed.files || [],
        body: parsed.body || ''
      }
    }
  } catch (e) {
    error.value = e
    console.error('기안 상세 조회 실패', e)
  } finally {
    isLoading.value = false
  }
}

// mounted 시 데이터 불러오기
onMounted(fetchDetail)

// 모달 열기
function openApprovalModal() {
  showApproveModal.value = true
}
</script>

<style scoped>
/* ==== 표 스타일: 헤더는 굵게, 본문은 일반체 ==== */
.page-title {
  margin-left: 20px;
  margin-bottom: 30px;
  color: #00a8e8;
}

/* ✅ 메인 박스: 전체 레이아웃 래퍼 */
.main-box {
  max-width: 1500px;
  margin: 20px auto;
  background: #fff;
  padding: 18px;
  box-shadow: 1px 1px 20px 1px rgba(0, 0, 0, 0.05);
  border-radius: 12px;
}

h2 {
  text-align: center;
  margin-bottom: 18px;
}

th {
  font-weight: 600;
  background: #f7f8fa;
  border: 1px solid #e3e6ea;
  padding: 8px;
  text-align: left;
}
td {
  font-weight: normal;
  border: 1px solid #e3e6ea;
  padding: 8px;
  text-align: left;
}

/* 테이블 공통 */
table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 16px;
}

/* 결재선, 본문용 구조 */
.approval-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 16px 0 8px;
}
.section-title {
  font-size: 16px;
  font-weight: 600;
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
  padding: 10px 15px;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: background-color 0.2s, box-shadow 0.2s;
  box-sizing: border-box;
  margin-top: 80px;
  margin-bottom: 5px;
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

/* 본문 내용 영역 */
.content-body {
  white-space: pre-wrap;
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

</style>
