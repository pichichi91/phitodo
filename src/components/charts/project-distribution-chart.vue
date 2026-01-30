<template>
  <div class="chart-card">
    <header class="chart-card-header">
      <h3 class="chart-card-title">Project distribution</h3>
    </header>
    <div class="chart-card-body">
      <div class="doughnut-wrapper">
        <canvas ref="canvasEl" aria-label="Project distribution donut chart" />
        <div class="doughnut-center" aria-hidden="true">
          <span class="doughnut-total">{{ totalFormatted }}</span>
          <span class="doughnut-label">PROJECT</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, watch, onMounted, onBeforeUnmount, ref } from "vue";
import { Chart, registerables } from "chart.js";
import type { ChartConfiguration } from "chart.js";
import { formatDurationShort } from "@/utils/date-format";

export interface ProjectDatum {
  projectName: string;
  totalSeconds: number;
  percentage: number;
}

const props = defineProps<{
  data: ProjectDatum[];
}>();

const SLICE_COLORS = [
  "rgba(167, 139, 250, 0.85)",
  "rgba(74, 222, 128, 0.85)",
  "rgba(250, 204, 21, 0.85)",
  "rgba(96, 165, 250, 0.85)",
  "rgba(248, 113, 113, 0.85)",
  "rgba(34, 211, 238, 0.85)"
];

const canvasEl = ref<HTMLCanvasElement | null>(null);
let chart: Chart<"doughnut"> | null = null;

const totalFormatted = computed(() => {
  const total = props.data.reduce((s, d) => s + d.totalSeconds, 0);
  return formatDurationShort(total);
});

const chartConfig = (): ChartConfiguration<"doughnut"> => {
  const labels = props.data.map((d) => `${d.projectName} ${Math.ceil(d.percentage)}%`);
  const values = props.data.map((d) => d.totalSeconds);
  const colors = props.data.map((_, i) => SLICE_COLORS[i % SLICE_COLORS.length]);

  return {
    type: "doughnut",
    data: {
      labels,
      datasets: [
        {
          data: values,
          backgroundColor: colors,
          borderColor: "rgba(15, 23, 42, 0.98)",
          borderWidth: 2,
          hoverOffset: 4
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: "65%",
      plugins: {
        legend: {
          display: true,
          position: "bottom",
          labels: {
            color: "#9ca3af",
            font: { size: 11 },
            padding: 8,
            usePointStyle: true
          }
        },
        tooltip: {
          callbacks: {
            label(context) {
              const seconds = context.raw as number;
              return `${context.label}: ${formatDurationShort(seconds)}`;
            }
          }
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
  const labels = props.data.map((d) => `${d.projectName} ${Math.ceil(d.percentage)}%`);
  const values = props.data.map((d) => d.totalSeconds);
  const colors = props.data.map((_, i) => SLICE_COLORS[i % SLICE_COLORS.length]);
  chart.data.labels = labels;
  chart.data.datasets[0].data = values;
  chart.data.datasets[0].backgroundColor = colors;
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
  height: 260px;
  position: relative;
}

.doughnut-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.doughnut-wrapper canvas {
  max-height: 100%;
  max-width: 100%;
}

.doughnut-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  pointer-events: none;
}

.doughnut-total {
  display: block;
  font-size: 16px;
  font-weight: 600;
  color: #e5e7eb;
}

.doughnut-label {
  display: block;
  font-size: 10px;
  letter-spacing: 0.05em;
  color: #6b7280;
  margin-top: 2px;
}
</style>
