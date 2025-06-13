<template>
  <div class="fuzzy-filter">
    <input
      type="text"
      v-model="filterText"
      placeholder="내용 검색…"
      @input="onFilterChanged"
    />
  </div>
</template>

<script>
export default {
  data() {
    return {
      filterText: ''
    };
  },
  methods: {
    // 필터 텍스트 변경 시 AG Grid에 알림
    onFilterChanged() {
      this.params.filterChangedCallback();
    }
  },
  // AG Grid 필터 라이프사이클
  init(params) {
    this.params = params;
  },
  isFilterActive() {
    return this.filterText.trim() !== '';
  },
  doesFilterPass({ data }) {
    const value = data[this.params.colDef.field] || '';
    return value.toString().toLowerCase().includes(this.filterText.toLowerCase());
  },
  getModel() {
    return this.isFilterActive() ? this.filterText : null;
  },
  setModel(model) {
    this.filterText = model || '';
  }
};
</script>

<style scoped>
.fuzzy-filter input {
  width: 100%;
  padding: 6px;
  border: 1px solid #00a8e8;
  border-radius: 4px;
}
</style>
