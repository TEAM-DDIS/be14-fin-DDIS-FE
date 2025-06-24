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
    <BaseToast ref="toastRef" />

</template>

<script setup>
import { onMounted, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { useUserStore } from '@/stores/user'
import { HR_ONLY_PATHS } from '@/constants/hronlypaths.js'
import BaseToast from '@/components/toast/BaseToast.vue'
// 사용자 인증 정보
const userStore = useUserStore()
const token = useUserStore().accessToken
const toastRef = ref(null)

function showToast(msg) {
  toastRef.value?.show(msg)
}
// HR 권한 여부 계산
const isHrTeam = computed(() => {
  try {
    const payload = JSON.parse(
      atob(userStore.accessToken.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))
    )
    return payload.deptName === '인사부서' || payload.auth?.includes('ROLE_HR')
  } catch {
    return false
  }
})

// 라우터 인스턴스
const router = useRouter()

// 자주 쓰는 메뉴 리스트
const favorites = ref([])

// 자주 쓰는 메뉴 API 불러오기
const fetchFavorites = async () => {
  try {
    const { data } = await axios.get(
      'https://api.isddishr.site/menus/favorites/me',
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    )

    // HR 권한에 따라 필터링 및 정렬
    favorites.value = data
      .sort((a, b) => a.displayOrder - b.displayOrder)
      .filter(m => !(HR_ONLY_PATHS.includes(m.menuPath) && !isHrTeam.value))

  } catch (err) {
    console.error('자주 쓰는 메뉴 불러오기 실패:', err)
    showToast('자주 쓰는 메뉴 데이터를 불러올 수 없습니다.')
  }
}

// 메뉴 클릭 시 이동
function goTo(menuPath) {
  router.push(menuPath)
}

// 외부에서 fetchFavorites 접근 가능하게
defineExpose({ fetchFavorites })

// 마운트 시 자동 호출
onMounted(fetchFavorites)
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
  max-height: 550px;
  overflow-y: auto;
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
  background-color: var(--bg-box);
  color: var(--text-sub);
  cursor: pointer;
  word-break: break-word;
  transition: background-color 0.2s, color 0.2s;
}
.menu-item:hover {
  background-color: var(--primary);
  color: #fff;
}

.edit-button {
  background-color: var(--bg-menu-btn-hover);
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s;
  margin-bottom: 10px;
  color: var(--text-main);
}
.edit-button:hover {
  background-color: var(--primary);
  color: var(--text-main);
}
.box {
  background: var(--bg-box);
    color: var(--text-main);
  border-radius: 15px;
  padding: 20px;
  min-height: 200px;
  box-shadow: 1px 1px 20px 1px rgba(0, 0, 0, 0.05);
  font-size: 17px;
  font-weight: bold;
}

.menu-list::-webkit-scrollbar {
  width: 6px;
}
.menu-list::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 10px;
}
</style>
