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
    <AttendanceCard />

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
    { name: '용어 사전' }
  ]

  function handleClick(menu) {
    router.push(menu.path)
  }
</script>

<style scoped>
  .sidebar {
    width: 180px;
    height: 100vh;
    background-color: #f5f5f5;
    padding: 20px 20px;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    box-shadow: 1px 0 5px rgba(0, 0, 0, 0.05);
  }

  .home {
    background-color: #00A8E8;
    color: white;
    font-weight: bold;
    font-size: 16px;
    text-align: center;
    padding: 15px 0;
    width: calc(100% + 20px); /* ✅ 사이드바 오른쪽 padding 무시 */
    margin-right: -20px;       /* ✅ 사이드바 padding 보정 */
    margin-left: auto;         /* ✅ 오른쪽 정렬 */
    border-top-left-radius: 20px;
    border-bottom-left-radius: 20px;
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    letter-spacing: 1px;
    margin-bottom: 10px;
    box-sizing: border-box;
    transition: background-color 0.3s ease;
  }

  .home:hover {
    background-color: #007db3; /* 약간 어두운 파랑 */
    cursor: pointer;
  }

  .home-link {
    text-decoration: none;     /* ✅ 밑줄 제거 */
    color: inherit;            /* ✅ 상속된 글자색 유지 */
  }

  .menu-button {
    background-color: white;
    font-weight: bold;
    border: none;
    border-radius: 20px;
    padding: 15px 0px;
    font-size: 14px;
    cursor: pointer;
    box-shadow: 0px 1px 5px rgba(0, 0, 0, 0.1);
    transition: background-color 0.2s;

    text-align: center;
    margin-top: 10px;

  }

  .menu-button:hover {
    background-color: #bcbcbc;
  }

</style>
