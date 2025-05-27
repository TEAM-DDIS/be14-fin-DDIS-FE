<template>
  <div class="org-page">
    <h1 class="page-title">조직 및 직무 소개</h1>

    <!-- 수평 정렬용 컨테이너 -->
    <div class="division-container">
      <div class="division-section" v-for="division in divisions" :key="division.name">
        <h2 class="division-title">{{ division.name }}</h2>
        <div class="department-grid">
          <div class="department-card" v-for="dept in division.departments" :key="dept.name">
            <h3 class="department-name">{{ dept.name }}</h3>
            <p class="description">{{ dept.description }}</p>
            <div class="tags">
              <span class="tag" v-for="tag in dept.tags" :key="tag"># {{ tag }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <button class="edit-button">편집</button>
  </div>
</template>

<script setup>
const divisions = [
  {
    name: '개발본부',
    departments: [
      {
        name: 'PC게임 개발부서',
        description: '고사양 환경을 기반으로 몰입감 높은 게임을 기획·개발하는 부서. 다양한 분야의 전문가가 협업하여 고품질 게임을 완성합니다.',
        tags: ['PC 개발팀', 'PC게임 기획팀']
      },
      {
        name: '아트부서',
        description: '게임의 시각적 완성도를 책임지는 부서로, 캐릭터, 배경, UI 등 전반적인 그래픽 요소를 제작합니다.',
        tags: ['PC 개발팀', 'PC게임 기획팀']
      }
    ]
  },
  {
    name: '경영지원본부',
    departments: [
      {
        name: '인사부서',
        description: '채용, 인사 평가, 조직 운영 등 인사 전반을 담당하며 인사 정책을 기획하고 실행하는 부서입니다.',
        tags: ['채용팀', '인사 평가팀']
      },
      {
        name: '재무회계부서',
        description: '회사의 자금 흐름을 관리하고, 정확한 회계처리를 수행하는 부서입니다.',
        tags: ['급여 정산팀', '세무 관리팀']
      }
    ]
  },
  {
    name: '사업본부',
    departments: [
      {
        name: '영업부서',
        description: '고객과의 접점을 통해 제품과 서비스를 제안하고 판매 전략을 수립하는 부서입니다.',
        tags: ['B2B 영업팀', 'B2C 영업팀']
      },
      {
        name: '마케팅부서',
        description: '브랜드 인지도 향상과 제품 홍보를 위한 전략을 수립하는 부서입니다.',
        tags: ['퍼포먼스팀', '콘텐츠 마케팅팀']
      }
    ]
  }
]
</script>

<style scoped>
.org-page {
  padding: 40px;
}

.page-title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 30px;
}

.division-container {
  display: flex;           /* 수평 정렬 */
  gap: 40px;               /* 본부 간 간격 */
  justify-content: flex-start; /* 왼쪽 정렬 */
}

.division-section {
  flex: 1 1 0;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.division-title {
  background-color: #00a8e8;
  color: white;
  font-size: 16px;
  font-weight: bold;
  text-align: center;
  padding: 10px 5px;
  border-radius: 15px;
  width: 140px;
  margin-bottom: 30px;
}

.department-grid {
  display: flex;
  gap: 40px;
  flex-wrap: wrap;
  justify-content: center;
}

.department-card {
  background: #f2f2f2;
  border-radius: 12px;
  padding: 20px;
  width: 240px;
  height: 200px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.department-name {
  font-weight: bold;
  margin-bottom: 8px;
  text-align: center;
}

.description {
  font-size: 14px;
  color: #3c3c3c;
  margin-bottom: 20px;
  text-align: center;
  padding: 8px 0px;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  justify-content: center;
}

.tag {
  background-color: #3f3f3f;
  border-radius: 12px;
  padding: 4px 8px;
  font-size: 12px;
  color: #ffffff;
}

.edit-button {
  position: absolute;
  top: 24px;
  right: 24px;
  background-color: white;
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 8px 20px;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}
</style>
