<template>
  <div class="modal-overlay">
    <div class="modal-container">

      <!-- 헤더 -->
      <div class="modal-header">
        <span>메뉴 편집</span>
        <button class="close-btn" @click="$emit('close', { updated: true })">×</button>
      </div>

      <!-- 본문 -->
      <div class="modal-body">
        <div class="column-left">
          <Sidebar
            :topLevelMenus="topMenus"
            :selectedId="selectedTopId"
            @select="onSelectTop"
          />
        </div>

        <div class="column-middle" v-if="currentSections.length">
          <SubSidebar
            :sections="currentSections"
            :key="selectedTopId"
            @add-favorite="addFavorite"
          />
        </div>

        <div class="column-arrows">
          <img class="arrows" src="@/assets/icons/Polygon-2.svg" />
        </div>

        <div class="column-right">
          <FavoriteMenu ref="favoriteRefEl" />
        </div>
      </div>

    </div>
  </div>
  <BaseToast ref="toastRef" />

</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import axios from 'axios'
import Sidebar from './MenuSidebar.vue'
import SubSidebar from './MenuSubSidebar.vue'
import FavoriteMenu from './FavoriteMenu.vue'
import { HR_ONLY_PATHS } from '@/constants/hronlypaths.js'
import BaseToast from '@/components/toast/BaseToast.vue'
const userStore = useUserStore()
const token = useUserStore().accessToken
const toastRef = ref(null)

function showToast(msg) {
  toastRef.value?.show(msg)
}
const allMenus = ref([])
const selectedTopId = ref(null)
const favoriteRefEl = ref()

const topMenus = computed(() =>
  allMenus.value.filter(m => m.parentMenuId === null)
)

const childMap = ref({})

const isHrTeam = computed(() => {
  try {
    const payload = JSON.parse(
      atob(userStore.accessToken.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))
    )
    return (
      payload.deptName === '인사부서' ||
      payload.auth?.includes('ROLE_HR')
    )
  } catch {
    return false
  }
})

onMounted(async () => {
  try {
    const { data } = await axios.get('http://localhost:8000/menus', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    const filtered = !isHrTeam.value
      ? data.filter(m => !HR_ONLY_PATHS.includes(m.menuPath))
      : data

    allMenus.value = filtered

    const map = {}
    filtered.forEach(menu => {
      if (menu.parentMenuId !== null) {
        if (!map[menu.parentMenuId]) map[menu.parentMenuId] = []
        map[menu.parentMenuId].push(menu)
      }
    })
    childMap.value = map
    selectedTopId.value = topMenus.value[0]?.menuId ?? null
  } catch (err) {
    console.error('메뉴 불러오기 실패:', err)
    showToast('메뉴 데이터를 불러올 수 없습니다.')
  }
})

function onSelectTop(id) {
  selectedTopId.value = id
}

const currentSections = computed(() => {
  const mids = childMap.value[selectedTopId.value] || []

  if (mids.length === 0) {
    const selectedTop = allMenus.value.find(m => m.menuId === selectedTopId.value)
    if (selectedTop) {
      return [{
        name: selectedTop.menuName,
        children: [selectedTop]
      }]
    }
    return []
  }

  return mids.map(mid => ({
    name: mid.menuName,
    children: childMap.value[mid.menuId] || []
  }))
})

async function addFavorite(menuItem) {
  const favoriteRef = favoriteRefEl.value
  if (!favoriteRef) {
    console.warn('FavoriteMenu ref가 없습니다')
    return
  }

  const currentList = favoriteRef.getList()
  const isDup = currentList.find(m => m.menuId === menuItem.menuId)
  if (isDup) {
    showToast('이미 추가된 메뉴입니다.')
    return
  }

  try {
    await axios.post('http://localhost:8000/menus/favorites', {
      menuId: menuItem.menuId,
      displayOrder: currentList.length + 1
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    })
    await favoriteRef.fetchFavorites()
  } catch (err) {
    console.error('즐겨찾기 추가 실패:', err)
    showToast('추가에 실패했습니다.')
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-container {
  background: #fff;
  width: 770px;
  height: 700px;
  border-radius: 16px;
  display: flex;
  flex-direction: column;
}

.modal-header {
  height: 30px;
  border-radius: 16px 16px 0px 0px;
  padding: 15px;
  font-weight: bold;
  font-size: 18px;
  background: #fff;
  display: flex;
  justify-content: space-between;
}

.modal-body {
  flex-direction: row;
  display: flex;
  width: 100%;
  height: 100%;
  flex-grow: 1;
  position: relative;
}

.arrows {
  padding-left: -5px;
  margin-left: -40px;
  position: absolute;
  width: 110px;
  height: 110px;
  z-index: 10;
  pointer-events: none;
}

.close-btn {
  font-size: 30px;
  border: none;
  background: transparent;
  cursor: pointer;
}
.close-btn:hover {
  color: #00a8e8;
}
</style>
