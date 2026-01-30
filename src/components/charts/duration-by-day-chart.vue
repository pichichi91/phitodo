<template>
  <div class="chart-card">
    <header class="chart-card-header">
      <h3 class="chart-card-title">Duration by day</h3>
    </header>
    <div class="chart-card-body">
      <canvas ref="canvasEl" aria-label="Duration by day bar chart" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { watch, onMounted, onBeforeUnmount, ref } from "vue";
import { Chart, registerables } from "chart.js";
import type { ChartConfiguration } from "chart.js";
import { formatDurationShort } from "@/utils/date-format";

Chart.register(...registerables);

export interface DayDatum {
  date: string;
  label: string;
  totalSeconds: number;
}

const props = defineProps<{
  data: DayDatum[];
}>();

const canvasEl = ref<HTMLCanvasElement | null>(null);
let chart: Chart<"bar"> | null = null;

const chartConfig = (): ChartConfiguration<"bar"> => {
  const labels = props.data.map((d) => d.label);
  const values = props.data.map((d) => d.totalSeconds / 3600);
  const maxHours = Math.max(1, ...values);
  const step = maxHours <= 24 ? 4 : maxHours <= 80 ? 20 : 40;
  const tickMax = Math.ceil(maxHours / step) * step;

  return {
    type: "bar",
    data: {
      labels,
      datasets: [
        {
          label: "Hours",
          data: values,
          backgroundColor: "rgba(167, 139, 250, 0.7)",
          borderColor: "rgba(167, 139, 250, 0.9)",
          borderWidth: 1
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label(context) {
              const hours = context.raw as number;
              const seconds = Math.round(hours * 3600);
              return formatDurationShort(seconds);
            }
          }
        }
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: {
            color: "#9ca3af",
            font: { size: 11 },
            maxRotation: 0
          }
        },
        y: {
          min: 0,
          max: tickMax,
          ticks: {
            stepSize: step,
            color: "#9ca3af",
            font: { size: 11 },
            callback(value) {
              return typeof value === "number" ? `${value}h` : value;
            }
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
  if (!chart || !canvasEl.value) return;
  chart.data.labels = props.data.map((d) => d.label);
  chart.data.datasets[0].data = props.data.map((d) => d.totalSeconds / 3600);
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
  height: 220px;
  position: relative;
}
</style>
