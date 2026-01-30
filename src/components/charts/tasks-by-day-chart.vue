<template>
  <div class="chart-card">
    <header class="chart-card-header">
      <h3 class="chart-card-title">Completed this week</h3>
    </header>
    <div class="chart-card-body">
      <p class="chart-summary">{{ total }} task{{ total === 1 ? "" : "s" }} completed</p>
      <div v-if="data.length" class="chart-canvas-wrap">
        <canvas ref="canvasEl" aria-label="Tasks completed by day" />
      </div>
      <p v-else class="chart-empty">No completed tasks this week.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { watch, onMounted, onBeforeUnmount, ref, computed } from "vue";
import { Chart, registerables } from "chart.js";
import type { ChartConfiguration } from "chart.js";

Chart.register(...registerables);

export interface DayCountDatum {
  date: string;
  label: string;
  count: number;
}

const props = defineProps<{
  data: DayCountDatum[];
}>();

const canvasEl = ref<HTMLCanvasElement | null>(null);
let chart: Chart<"bar"> | null = null;

const total = computed(() => props.data.reduce((s, d) => s + d.count, 0));

const chartConfig = (): ChartConfiguration<"bar"> => {
  const labels = props.data.map((d) => d.label);
  const values = props.data.map((d) => d.count);
  const maxCount = Math.max(1, ...values);
  const tickMax = Math.ceil(maxCount / 2) * 2 || 2;

  return {
    type: "bar",
    data: {
      labels,
      datasets: [
        {
          label: "Tasks",
          data: values,
          backgroundColor: "rgba(96, 165, 250, 0.6)",
          borderColor: "rgba(96, 165, 250, 0.9)",
          borderWidth: 1
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false }
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: {
            color: "#9ca3af",
            font: { size: 10 },
            maxRotation: 45
          }
        },
        y: {
          min: 0,
          max: tickMax,
          ticks: {
            stepSize: 1,
            color: "#9ca3af",
            font: { size: 10 }
          },
          grid: { color: "rgba(55, 65, 81, 0.5)" }
        }
      }
    }
  };
};

function initChart() {
  if (!canvasEl.value || !props.data.length) return;
  chart = new Chart(canvasEl.value, chartConfig());
}

function updateChart() {
  if (!chart || !props.data.length) return;
  chart.data.labels = props.data.map((d) => d.label);
  chart.data.datasets[0].data = props.data.map((d) => d.count);
  chart.update("none");
}

onMounted(() => initChart());
onBeforeUnmount(() => {
  chart?.destroy();
  chart = null;
});

watch(
  () => props.data,
  () => {
    if (!props.data.length) {
      chart?.destroy();
      chart = null;
      return;
    }
    if (chart) updateChart();
    else initChart();
  },
  { deep: true }
);
</script>

<style scoped>
.chart-card {
  border-radius: 14px;
  border: 1px solid rgba(55, 65, 81, 0.85);
  background: radial-gradient(
    circle at top left,
    rgba(15, 23, 42, 0.96),
    rgba(15, 23, 42, 0.98)
  );
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-width: 0;
  max-height: 280px;
}

.chart-card-header {
  padding: 9px 11px;
  border-bottom: 1px solid rgba(31, 41, 55, 0.9);
}

.chart-card-title {
  margin: 0;
  font-size: 11px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #6b7280;
  font-weight: 600;
}

.chart-card-body {
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex-shrink: 0;
}

.chart-summary {
  margin: 0;
  font-size: 12px;
  color: #9ca3af;
}

.chart-canvas-wrap {
  height: 100px;
  width: 100%;
  min-height: 100px;
  max-height: 100px;
  position: relative;
  flex-shrink: 0;
}

.chart-canvas-wrap canvas {
  display: block;
  width: 100% !important;
  height: 100px !important;
}

.chart-empty {
  margin: 0;
  font-size: 12px;
  color: #6b7280;
}
</style>
