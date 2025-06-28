<template>
  <ag-grid-vue
  :class="['custom-theme', 'ag-theme-alpine']"
    :style="`width:${width}; height:${height}`"
    :columnDefs="columnDefs"
    :rowData="rowData"
    :defaultColDef="defaultColDef"
    :pagination="pagination"
    :paginationPageSize="pageSize"
    rowSelection="multiple"
    @grid-ready="onGridReady"
    @rowClicked="e => emit('row-click', e)"
    @cellClicked="e => emit('cell-click', e)"
  />
</template>

<script setup>
import { AgGridVue } from 'ag-grid-vue3'
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community'
import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-alpine.css'

ModuleRegistry.registerModules([AllCommunityModule])

const props = defineProps({
  columnDefs:    { type: Array, required: true },
  rowData:       { type: Array, required: true },
  width:         { type: String, default: '100%' },
  height:        { type: String, default: '600px' },
  pagination:    { type: Boolean, default: true },
  pageSize:      { type: Number, default: 10 }
})
const emit = defineEmits(['ready','row-click','cell-click'])

const defaultColDef = {
  sortable: true,
  filter:   true,
  resizable:true,
}

function onGridReady(params) {
  emit('ready', params)
}
</script>

<style scoped>
.custom-theme :deep(.ag-header) {
  background-color: var(--bg-label-cell);
  color: var(--text-main);
  font-weight: bold;
}

.custom-theme :deep(.ag-row) {
  border-top: 1px solid var(--border-color);
}

.custom-theme :deep(.ag-cell) {
  border-right: 1px solid var(--border-color);
  border-bottom: 1px solid var(--border-color);
  color: var(--text-main);
}

/* 선택된 행 */
.custom-theme :deep(.ag-row.ag-row-selected) {
  background-color: var(--ag-primary);
  color: var(--text-on-primary);
}

/* 호버 강조 */
.custom-theme :deep(.ag-row:hover) {
  background-color: var(--ag-primary-hover);
}

/* 조건부 강조 (rowClass로 지정 가능) */
.custom-theme :deep(.highlight-row) {
  background-color: var(--ag-row-hover-color);
  font-weight: bold;
  /* color: var(--primary); */
}

.custom-theme :deep(.ag-cell a) {
  color: var(--ag-link-color) !important;
  text-decoration: underline;
}

.custom-theme :deep(.ag-cell a:hover) {
  color: var(--ag-link-hover-color) !important;
}

</style>
