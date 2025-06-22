<!-- home > 공지 사항 박스 -->
<template>
  <div class="box notice">
    <!-- 제목 영역 (공지 사항 + 바로가기 버튼) -->
    <div class="section-title-row">
      <div class="section-title">공지 사항</div>
      <div class="shortcut" @click="navigateTo('/post')">↗</div>
    </div>

    <!-- 구분선 -->
    <hr class="divider" />

    <!-- 공지 리스트 (스크롤 가능한 영역) -->
<div class="notice-list-wrapper">
  <div class="notice-list">
    <div
      class="notice-item"
      v-for="notice in notices"
      :key="notice.boardId"
      @click="goToDetail(notice.boardId)"
    >
      <div class="date">{{ formatDate(notice.boardCreateAt) }}</div>
      <div class="title">{{ notice.boardTitle }}</div>
      <div class="writer">{{ notice.employeeName }}</div>
    </div>
  </div>
</div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'

// 라우터 인스턴스 가져오기
const router = useRouter()

// 공지 목록 상태
const notices = ref([])

function goToDetail(id) {
  router.push(`/post/postDetail/${id}`)
}

// 컴포넌트 마운트 시 공지사항 데이터 불러오기
onMounted(async () => {
  const token = useUserStore().accessToken
  try {
    const res = await axios.get('https://api.isddishr.site/boards/lists', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    notices.value = res.data
  } catch (e) {
    console.error('공지사항 로딩 오류:', e)
  }
})

// 페이지 이동 함수
function navigateTo(path) {
  router.push(path)
}

// 날짜 포맷 함수 (YYYY-MM-DD)
function formatDate(dateStr) {
  return new Date(dateStr).toISOString().split('T')[0]
}
</script>

<style scoped>
/* 제목 영역 정렬 */
.section-title-row {
  padding-right: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* "공지 사항" 텍스트 */
.section-title {
  font-size: 17px;
  font-weight: bold;
  color: #000;
}

/* ↗ 바로가기 버튼 */
.shortcut {
  margin-top: -8px;
  font-size: 18px;
  font-weight: 600;
  text-align: center;
  color: #00A8E8;
  cursor: pointer;
  transition: color 0.2s;
}
.shortcut:hover {
  color: #000;
}

/* 구분선 */
.divider {
  border: none;
  border-top: 1px solid #eee;
  margin: 6px 0 12px;
}

/* 공지 리스트 전체 영역 (스크롤 가능) */
.notice-list {
  overflow-y: auto;
  padding-right: 15px;
}

/* 각 공지 항목 행 스타일 */
.notice-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  gap: 30px;
  cursor: pointer;
  transition: color 0.2s;
}

/* hover 시: 한 행 전체 텍스트 색상 변경 */
.notice-item:hover {
  color: #00A8E8;
}

/* 자식 텍스트들도 상위 색상 따라가도록 설정 */
.notice-item .date,
.notice-item .title,
.notice-item .writer {
  color: inherit;
  transition: color 0.2s;
}

/* 날짜 영역 */
.date {
  flex: 0 0 80px;
  font-size: 13px;
  font-weight: 500;
  color: #000;
}

/* 제목 영역 */
.title {
  flex: 1;
  font-size: 14px;
  font-weight: 500;
  color: #000;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 작성자 영역 */
.writer {
  flex: 0 0 60px;
  font-size: 13px;
  font-weight: 400;
  color: #000;
  text-align: right;
}

/* 스크롤바 커스터마이징 */
.notice-list::-webkit-scrollbar {
  width: 4px;
}
.notice-list::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 3px;
}
.notice-list::-webkit-scrollbar-track {
  background: transparent;
}
.notice-list-wrapper {
  position: relative;
  max-height: 140px; /* 고정 높이 지정 */
  overflow: hidden;
}

/* 리스트 자체는 여전히 스크롤 가능해야 함 */
.notice-list {
  overflow-y: auto;
  padding-right: 15px;
  height: 100%;
}

/* 아래 fade 효과 */
.notice-list-wrapper::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 20px;
  pointer-events: none; /* 클릭 막지 않게 */
  background: linear-gradient(to bottom, rgba(255, 255, 255, 0.09), #fff);
}

/* 전체 박스 스타일 */
.box {
  background: #fff;
  border-radius: 15px;
  padding: 20px;
  max-height: 200px;
  box-shadow: 1px 1px 20px 1px rgba(0, 0, 0, 0.05);
  font-size: 17px;
  font-weight: bold;
  display: flex;
  flex-direction: column;
}
</style>
