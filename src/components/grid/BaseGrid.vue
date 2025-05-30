<template>
  <ag-grid-vue
    class="ag-theme-alpine custom-theme"
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
import { defineProps, defineEmits, ref } from 'vue'
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
  .custom-theme {
    --ag-background-color: #ffffff;
    --ag-foreground-color: #1F2937;
    --ag-header-background-color: #F9FAFB;
    --ag-header-foreground-color: #374151;
    --ag-row-hover-color: #F3F4F6;
    --ag-row-border-color: #E5E7EB;
  }
  .custom-theme .ag-header-cell-label {
    justify-content: center;
  }
  .custom-theme .ag-row-hover .ag-cell {
    background-color: var(--ag-row-hover-color) !important;
  }
  .custom-theme .ag-body-viewport::-webkit-scrollbar {
    height: 6px;
  }
  .custom-theme .ag-body-viewport::-webkit-scrollbar-thumb {
    background-color: #CBD5E1;
    border-radius: 3px;
  }
  .custom-theme .ag-body-viewport::-webkit-scrollbar-track {
    background: transparent;
  }
</style>
