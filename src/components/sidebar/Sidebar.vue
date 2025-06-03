<template>
  <aside class="sidebar">
    <!-- 상단 HOME -->
     <RouterLink to="/" class="home-link">
        <div class="home">
            HOME
        </div>
     </RouterLink>

    <div
      v-for="(menu, index) in menuItems"
      :key="index"
      class="menu-button"

      @click="$emit('menu-selected', menu.name)"
    >
      {{ menu.name }}
    </div>

    <!-- 하단 출근 박스 -->
    <AttendanceCard class="attendance-card" />

  </aside>
</template>

<script setup>
  import AttendanceCard from './AttendanceCard.vue';
  import {useRouter} from 'vue-router'

  defineProps({
    selected: String
  })

  const router = useRouter()

  const menuItems = [
    { name: '인사 정보' },
    { name: '근태 관리' },
    { name: '조직 및 직무'},
    { name: '전자 결재' },
    { name: '급여' },
    { name: '평가 및 성과' },
    { name: '공지 사항'},
    { name: '용어 사전'}
  ]
</script>

<style scoped>
  .sidebar {
    overflow-x: hidden; /* ✅ 수평 스크롤 제거 */
    margin-top: -6px;
    width: 180px;
    overflow-y: auto;
    min-height: calc(100vh - 60px); /* ✅ 화면 하단까지 배경 보이게 */
    /* position: fixed; */
    background-color: #f5f5f5;
    padding: 20px;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    /* justify-content: space-between; */
    box-shadow: 0.5px 0 5px rgba(0, 0, 0, 0.1);
    gap: 22px;
    /* font-size: 50px; */
      overflow: visible;  /* ✅ 스크롤 제거 */

  }

    /* 출근 박스는 마진 없이 자동으로 하단에 배치 */
.attendance-card {
  opacity: 80%;
  margin-left: -5px;
  position: sticky;
  bottom: 20px;
  margin-top: auto; /* 남은 공간 밀어내고 하단 고정 */
}


  .home {
    background-color: #00A8E8 ;
    color: white;
    font-weight: bold;
    font-size: 18px;
    text-align: left;
    padding: 12px 20px;
    width: calc(100% + 20px); /* ✅ 사이드바 오른쪽 padding 무시 */
    margin-right: -20px;       /* ✅ 사이드바 padding 보정 */
    /* margin-left: auto;         ✅ 오른쪽 정렬 */
    border-top-left-radius: 20px;
    border-bottom-left-radius: 20px;
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
    /* box-shadow: 0 0px 4px rgba(0, 0, 0, 0.2); */
    letter-spacing: 1px;
    /* margin-bottom: 5px; */
    box-sizing: border-box;
    transition: background-color 0.3s ease;
  }

  .home:hover {
    background-color: #007db3; /* 약간 어두운 파랑 */
    cursor: pointer;
        box-shadow: 0px 0px 10px 10px rgba(0, 0, 0, 0.03) inset;

  }

  .home-link {
    text-decoration: none;     /* ✅ 밑줄 제거 */
    color: inherit;            /* ✅ 상속된 글자색 유지 */
  }

  .menu-button {
    width: 95%;            /* 사이드바 너비에 딱 맞춤 */
    /* box-sizing: border-box; */
    background-color: white;
    margin-left: 7px;
    font-weight: bold;
    border: none;
    border-radius: 23px;
    padding: 15px 0px;
    font-size: 16px;
    cursor: pointer;
    box-shadow: 0px 0px 5px 4px rgba(0, 0, 0, 0.03);
    transition: background-color 0.3s, box-shadow 0.3s;
    text-align: center;

  }

  .menu-button:hover {
    background-color: #d6d6d6;
    box-shadow: inset 0px 0px 10px, 10px rgba(0, 0, 0, 0.1);
  }

</style>
