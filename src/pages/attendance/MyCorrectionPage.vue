<template>
    <h1 class="page-title">내 출근 정정 관리</h1>
    <div class="my-correction-page">
        <!-- 겹치는 탭 -->
        <div class="tab-wrapper">
            <div class="tab-menu">
                <button
                :class="{ active: activeTab === 'used' }"
                @click="activeTab = 'used'"
                >
                정정내역
                </button>
                <button
                :class="{ active: activeTab === 'regist' }"
                @click="activeTab = 'regist'"
                >
                신청내역
                </button>
            </div>
        </div>
        <!-- 탭 내용 -->
        <div class="tab-content">
            <MyCorrectionUsedCard v-if="activeTab === 'used'"/>
            <MyCorrectionRegistCard v-if="activeTab === 'regist'"/>
        </div>
    </div>
</template>

<script setup>
    import { ref } from 'vue'
    import MyCorrectionRegistCard from '@/components/correction/MyCorrectionRegistCard.vue';
    import MyCorrectionUsedCard from '@/components/correction/MyCorrectionUsedCard.vue';

    const activeTab = ref('used')
</script>

<style scoped>
    .page-title {
        margin-left: 20px;
        margin-bottom: 30px;
        color: var(--primary);
    }

    .desc {
        display: block;
        margin-bottom: 10px;
        font-size: 18px;
    }

    .my-correction-page {
        padding: 20px;
    }

    .my-leave-regist-card {
        margin-bottom: 50px;
    }

    /* 🔷 겹쳐지는 탭 스타일 */
    .tab-wrapper {
        position: relative;
        z-index: 2;
    }

    .tab-menu {
        display: flex;
        align-items: flex-end;
        gap: 0;
        position: relative;
        
    }

    /* 기본 탭 버튼 */
    .tab-menu button {
        font-size: 18px;
        padding: 10px 30px;
        border: none;
        border-bottom: none;
        background-color: #C8C8C8;
        color: var(--bg-main);
        cursor: pointer;
        border-top-left-radius: 12px;
        border-top-right-radius: 12px;
        position: relative;
        z-index: 1;
        margin-right: -20px; /* ✅ 가로 겹치기 */
        transition: all 0.2s ease;
    }

    /* 선택된 탭 위로 */
    .tab-menu button.active {
        background: var(--bg-box);
        color: var(--modal-text);
        z-index: 3;
    }
</style>
