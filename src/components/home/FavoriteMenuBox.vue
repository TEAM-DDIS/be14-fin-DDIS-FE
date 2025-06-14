<!-- 자주 쓰는 메뉴 박스 -->
<template>
  <div class="box quick-menu">
    <!-- 상단 제목 -->
    <div class="title">자주 쓰는 메뉴</div>

    <!-- 자주 쓰는 메뉴 리스트 -->
    <div class="menu-list">
      <div
        class="menu-item"
        v-for="menu in favorites"
        :key="menu.menuId"
        @click="goTo(menu.menuPath)"
      >
        {{ menu.menuName }}
      </div>

      <!-- 메뉴 편집 버튼 -->
      <button class="edit-button" @click="$emit('edit')">메뉴 편집</button>
    </div>

  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { useUserStore } from '@/stores/user'

// 부모로부터 편집 이벤트 전달
const emit = defineEmits(['edit'])

// 라우터 인스턴스
const router = useRouter()

// 사용자 인증 정보
const userStore = useUserStore()

// 즐겨찾기 메뉴 리스트
const favorites = ref([])

// API 호출로 즐겨찾기 메뉴 가져오기
const fetchFavorites = async () => {
  try {
    const { data } = await axios.get(
      `http://localhost:8000/menus/favorites/${userStore.user.employeeId}`,
      {
        headers: {
          Authorization: `Bearer ${userStore.token}`
        }
      }
    )
    // 표시 순서대로 정렬
    favorites.value = data.sort((a, b) => a.displayOrder - b.displayOrder)
  } catch (err) {
    console.error('자주 쓰는 메뉴 불러오기 실패:', err)
  }
}

// 메뉴 클릭 시 해당 경로로 이동
function goTo(menuPath) {
  router.push(menuPath)
}

// 컴포넌트 마운트 시 메뉴 불러오기
onMounted(fetchFavorites)

// 외부에서 fetchFavorites()를 호출할 수 있도록 노출
defineExpose({ fetchFavorites })
</script>

<style scoped>
/* 전체 박스 */
.quick-menu {
  margin-top: 30px;
  grid-area: quick-menu;
  height: fit-content;
  align-items: center;
  text-align: center;
  display: flex;
  flex-direction: column;
  min-height: 80px !important;
}


/* 메뉴 리스트 wrapper */
.menu-list {
  margin-top: 30px;
  margin-bottom: 13px;
  display: flex;
  flex-direction: column;
  gap: 18px;
  padding: 5px;
  align-items: center;
  width: 100%;
}

.menu-item,
.edit-button {
  width: 100%;
  min-height: 65px;
  max-width: 300px;
  box-sizing: border-box;
  padding: 10px 15px;
  border-radius: 13px;
  font-size: 14px;
  text-align: center;
  box-shadow: 0 0 4px 3px rgba(0, 0, 0, 0.06);
  height: 45px;
  display: flex;
  justify-content: center;
  align-items: center;
}

/* 개별 효과는 따로 */
.menu-item {
  background-color: #ffffff;
  color: #7D7D7D;
  cursor: pointer;
  word-break: break-word;
}
.menu-item:hover {
  background-color: #00a8e8;
  color: #fff;
}

.edit-button {
  background-color: #D3D3D3;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s;
  margin-bottom: 10px;
}
.edit-button:hover {
  background-color: #000000;
  color: white;
}
.box {
  background: #fff;
  border-radius: 15px;
  padding: 20px;
  min-height: 200px;
  box-shadow: 1px 1px 20px 1px rgba(0, 0, 0, 0.05);
  font-size: 17px;
  font-weight: bold;
}
</style>
