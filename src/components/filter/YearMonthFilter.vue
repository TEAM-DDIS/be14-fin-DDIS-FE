<template>
  <select v-model="selected" @change="onFilterChanged">
    <option value="">전체</option>
    <option v-for="opt in options" :key="opt" :value="opt">{{ opt }}</option>
  </select>
</template>

<script>
export default {
  data() {
    return {
      selected: '',
      options: []
    };
  },
  methods: {
    // 필터 값 변경 시 AG Grid에 알림
    onFilterChanged() {
      this.params.filterChangedCallback();
    }
  },
  // AG Grid 필터 라이프사이클
  init(params) {
    this.params = params;
    // colDef.filterParams.options에서 옵션 리스트 할당
    this.options = params.filterParams.options || [];
  },
  isFilterActive() {
    return this.selected.trim() !== '';
  },
  doesFilterPass({ data }) {
    return (
      this.selected === '' ||
      data[this.params.colDef.field] === this.selected
    );
  },
  getModel() {
    return this.isFilterActive() ? this.selected : null;
  },
  setModel(model) {
    this.selected = model || '';
  }
};
</script>

<style scoped>
select {
  width: 100%;
  padding: 6px;
  border: 1px solid #00a8e8;
  border-radius: 4px;
}
</style>
