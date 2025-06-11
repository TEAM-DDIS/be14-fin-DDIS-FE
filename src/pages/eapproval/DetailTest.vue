<!-- 기안 상세페이지 조회 테스트 -->

<template>
  <div class="business-draft-detail">
    <!-- 상단 제목 및 삭제 버튼 -->
    <div class="header-row">
      <h2 class="center-title">사업기안</h2>
      <button class="delete-btn">삭제</button>
    </div>

    <!-- 기본 정보 테이블 -->
    <table class="info-table" v-if="draftDetail">
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

    <!-- 결재선 테이블 -->
    <div class="section-title">결재선</div>
    <table class="line-table" v-if="draftDetail && draftDetail.approvalLine">
      <thead>
        <tr>
          <th>번호</th>
          <th>성명</th>
          <th>팀</th>
          <th>직책</th>
          <th>상태</th>
          <th>종류</th>
          <th>상신일시</th>
          <th>결재일시</th>
          <th>의견</th>
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

    <!-- 기안내용 -->
    <div class="section-title">기안내용</div>
    <table class="content-table" v-if="draftDetail && draftDetail.content">
      <tr>
        <th>제목</th>
        <td>{{ draftDetail.content.title }}</td>
      </tr>
      <tr>
        <th>첨부파일</th>
        <td>
          <template v-if="draftDetail.content.refFile && draftDetail.content.refFile.length">
            <div v-for="file in draftDetail.content.refFile" :key="file.name">
              {{ file.name }} <span class="file-info">({{ file.size }}, {{ file.type }})</span>
            </div>
          </template>
          <template v-else>-</template>
        </td>
      </tr>
    </table>

    <div class="main-content-box" v-if="draftDetail && draftDetail.content">
      <div class="main-content-title">본문</div>
      <div class="main-content-body">
        {{ draftDetail.content.body }}
      </div>
    </div>

    <!-- 하단 버튼 -->
    <div class="footer-btns">
      <button class="cancel-btn">취소</button>
      <button class="edit-btn">수정</button>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import axios from 'axios'
import { useRoute } from 'vue-router'

// 📌 현재 라우터에서 문서 ID 추출
const route = useRoute()
const docId = route.params.docId

// 📌 상태 변수들
const draftDetail = ref(null)
const isLoading = ref(true)
const error = ref(null)

// 📌 컴포넌트 마운트 시 데이터 요청
onMounted(() => {
  axios.get(`http://localhost:8000/drafts/${docId}`)
    .then(res => {
      console.log('👉 백엔드 응답 원본:', res.data)
      const data = res.data

      // ✅ JSON 문자열 또는 파싱된 객체 처리
      let parsedContent = {}
      try {
        const rawContent = data.contentDto || data.docContent || data.content || null

        if (typeof rawContent === 'string') {
          parsedContent = JSON.parse(rawContent)
        } else if (typeof rawContent === 'object' && rawContent !== null) {
          parsedContent = rawContent
        } else {
          console.warn('⚠️ contentDto / docContent / content 가 비어있거나 null입니다.')
        }
      } catch (e) {
        console.warn('❌ content 파싱 실패', e)
      }

      // ✅ 프론트에서 쓰기 좋게 구조화
      draftDetail.value = {
        docId: data.docId,
        team: data.team,
        position: data.position,
        drafter: data.drafter,
        date: data.date?.replace('T', ' ').slice(0, 16),
        keepYear: data.keepYear,
        receiver: parsedContent.receiver?.join(', ') || '-',
        referer: parsedContent.reference?.join(', ') || '-',
        approvalLine: data.approvalLine || [],
        content: {
          title: parsedContent.title || '',
          refFile: parsedContent.files || [],
          body: parsedContent.body || ''
        }
      }

      console.log('📥 기안 상세 파싱 결과', draftDetail.value)
    })
    .catch(err => {
      error.value = err
      console.error('❌ 오류 발생', err)
    })
    .finally(() => {
      isLoading.value = false
    })
})
</script>



<style scoped>
.business-draft-detail {
  background: #ffffff;
  min-height: 100vh;
  border-radius: 15px;
}
.header-row {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  background: #fff;
  border-radius: 12px 12px 0 0;
  margin: 32px 32px 0 32px;
  padding: 24px 32px 16px 32px;
  position: relative;
}
.center-title {
  font-family: Arial, sans-serif;
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  font-size: 20px;
  font-weight: bold;
  color: #000;
  margin: 0;
}
.delete-btn {
  background: #1da1f2;
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 8px 24px;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}
.delete-btn:hover {
  background: #1976d2;
}
.info-table {
  width: 90%;
  margin: 0 auto 32px auto;
  background: #fff;
  border-collapse: collapse;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
}
.info-table th, .info-table td {
  border: 1px solid #e3e6ea;
  padding: 10px 16px;
  font-size: 15px;
  text-align: left;
}
.info-table th {
  background: #f7f8fa;
  color: #222;
  font-weight: 600;
  width: 120px;
}
.section-title {
  font-size: 16px;
  font-weight: 600;
  margin: 24px 0 8px 5%;
  color: #222;
}
.line-table {
  width: 90%;
  margin: 0 auto 32px auto;
  background: #fff;
  border-collapse: collapse;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
}
.line-table th, .line-table td {
  border: 1px solid #e3e6ea;
  padding: 8px 10px;
  font-size: 14px;
  text-align: center;
}
.line-table th {
  background: #f7f8fa;
  color: #222;
  font-weight: 600;
}
.content-table {
  width: 90%;
  margin: 0 auto 0 auto;
  background: #fff;
  border-collapse: collapse;
    border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
}
.content-table th, .content-table td {
  border: 1px solid #e3e6ea;
  padding: 10px 16px;
  font-size: 15px;
  text-align: left;
}
.content-table th {
  background: #f7f8fa;
  color: #222;
  font-weight: 600;
  width: 120px;
}
.main-content-box {
  width: 90%;
  margin: 32px auto 32px auto;
  background: #fff;
  border-radius: 15px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  border: 1px solid #e3e6ea;
  border-top: none;
}
.main-content-title {
  background: #f7f8fa;
  padding: 10px 16px;
  font-size: 15px;
  font-weight: 600;
  border-bottom: 1px solid #e3e6ea;
}
.main-content-body {
  padding: 18px 20px;
  font-size: 15px;
  color: #222;
  white-space: pre-wrap;
  min-height: 220px;
  overflow-wrap: break-word;
  word-break: break-all;
}
.footer-btns {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-top: 24px;
}
.cancel-btn {
  background: #bfc6ce;
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 8px 32px;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}
.cancel-btn:hover {
  background: #a0a7b0;
}
.edit-btn {
  background: #1da1f2;
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 8px 32px;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}
.edit-btn:hover {
  background: #1976d2;
}
.file-info {
  color: #888;
  font-size: 13px;
}
</style> 