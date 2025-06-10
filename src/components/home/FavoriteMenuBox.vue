<!-- 자주 쓰는 메뉴 박스 -->
<template>
  <div class="box quick-menu">
    <div class="title">자주 쓰는 메뉴</div>

    <!-- 메뉴 목록 -->
    <div class="menu-list">
      <div
        class="menu-item"
        v-for="menu in favorites"
        :key="menu.menuId"
        @click="goTo(menu.menuPath)"
      >
        {{ menu.menuName }}
      </div>
    </div>

    <!-- 편집 버튼 -->
    <button class="edit-button" @click="$emit('edit')">메뉴 편집</button>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router' // ✅ 이 줄 추가
import axios from 'axios'
import { useUserStore } from '@/stores/user'

const emit = defineEmits(['edit'])
const router = useRouter()             // ✅ 이제 오류 없이 동작

const userStore = useUserStore()
const favorites = ref([])

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
    favorites.value = data.sort((a, b) => a.displayOrder - b.displayOrder)
  } catch (err) {
    console.error('자주 쓰는 메뉴 불러오기 실패:', err)
  }
}

function goTo(menuPath) {
  router.push(menuPath)
}

onMounted(fetchFavorites)
defineExpose({ fetchFavorites })
</script>


<style scoped>
.quick-menu {
  grid-area: quick-menu;
  height: fit-content;
  align-items: center;
  text-align: center;
  display: flex;
  flex-direction: column;
  min-height: 80px !important;
}
.edit-button {
  /* margin-top: 30px; */
  background-color: #D3D3D3;
  border: none;
  border-radius: 13px;
  padding: 7px;
  cursor: pointer;
  transition: background-color 0.2s;
  min-height: 60px;
  width: 100%;
  font-weight: 600;
  box-shadow: 0px 0px 5px 1px rgba(0, 0, 0, 0.08);
  margin-bottom: 10px;

}
.edit-button:hover {
  background-color: #000000;
  color: white;
}
.menu-list {
  margin-top: 30px;
  margin-bottom: 13px;
  display: flex;
  flex-direction: column;
  gap: 18px;
  padding: 5px;
  align-items: center;
}
.menu-item {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 7px;
  background-color: #ffffff;
  color: #7D7D7D;
  border-radius: 13px;
  box-shadow: 0px 0px 4px 3px rgba(0, 0, 0, 0.06);
  font-size: 14px;
  text-align: center;
  height:45px;
  width: 90%;
  cursor: pointer;

}
.menu-item:hover {
  background-color: #00a8e8;
  color:#fff;
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
