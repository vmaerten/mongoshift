<script setup lang="ts">
import { ref, computed } from "vue";
import {
  activePm,
  setActivePm,
  buildRunCommand,
  buildInstallCommand,
  PM_OPTIONS,
  PM_LABELS,
  type PmChoice,
} from "./pm-state.js";
import { PM_LOGOS } from "./pm-logos.js";

const props = defineProps<{
  /** mongoshift subcommand (e.g. "init", "up --dry-run") */
  cmd?: string;
  /** install package list (e.g. "mongoshift mongodb"); if set, renders install commands */
  install?: string;
}>();

const currentCommand = computed(() => {
  if (props.install !== undefined) {
    return buildInstallCommand(activePm.value, props.install);
  }
  return buildRunCommand(activePm.value, props.cmd ?? "");
});

const copied = ref(false);
function copy() {
  if (typeof navigator === "undefined" || !navigator.clipboard) return;
  navigator.clipboard.writeText(currentCommand.value).then(() => {
    copied.value = true;
    setTimeout(() => (copied.value = false), 1400);
  });
}

function selectPm(pm: PmChoice) {
  setActivePm(pm);
}
</script>

<template>
  <div class="pm-command">
    <div class="pm-tabs" role="tablist">
      <button
        v-for="pm in PM_OPTIONS"
        :key="pm"
        :class="['pm-tab', { 'is-active': activePm === pm }]"
        role="tab"
        :aria-selected="activePm === pm"
        type="button"
        @click="selectPm(pm)"
      >
        <span class="pm-logo" v-html="PM_LOGOS[pm]"></span>
        <span class="pm-label">{{ PM_LABELS[pm] }}</span>
      </button>
    </div>
    <div class="pm-body">
      <code class="pm-cmd">{{ currentCommand }}</code>
      <button class="pm-copy" type="button" :aria-label="`Copy ${currentCommand}`" @click="copy">
        {{ copied ? "copied" : "copy" }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.pm-command {
  margin: 16px 0 20px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  overflow: hidden;
  background: var(--vp-c-bg-soft);
}

.pm-tabs {
  display: flex;
  gap: 0;
  background: var(--vp-c-bg-alt);
  border-bottom: 1px solid var(--vp-c-divider);
  overflow-x: auto;
}

.pm-tab {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  font-family: var(--vp-font-family-mono);
  font-size: 12px;
  font-weight: 600;
  color: var(--vp-c-text-3);
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  cursor: pointer;
  transition:
    color 0.15s ease,
    border-color 0.15s ease,
    background 0.15s ease;
  white-space: nowrap;
}
.pm-tab:hover {
  color: var(--vp-c-text-2);
  background: var(--vp-c-bg);
}
.pm-tab.is-active {
  color: var(--vp-c-text-1);
  border-bottom-color: var(--ms-violet-500, #8b5cf6);
  background: var(--vp-c-bg);
}

.pm-logo {
  display: inline-flex;
  align-items: center;
  width: 14px;
  height: 14px;
}
.pm-logo :deep(svg) {
  width: 14px;
  height: 14px;
  display: block;
}
.pm-label {
  letter-spacing: 0.01em;
}

.pm-body {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  background: var(--vp-c-bg);
}

.pm-cmd {
  flex: 1;
  font-family: var(--vp-font-family-mono);
  font-size: 13.5px;
  font-weight: 500;
  color: var(--vp-c-text-1);
  background: transparent;
  border: none;
  padding: 0;
  white-space: nowrap;
  overflow-x: auto;
}
.pm-cmd::before {
  content: "$ ";
  color: var(--ms-violet-500, #8b5cf6);
  font-weight: 700;
  user-select: none;
}
.dark .pm-cmd::before {
  color: var(--ms-violet-400, #a78bfa);
}

.pm-copy {
  font-family: var(--vp-font-family-mono);
  font-size: 10.5px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--vp-c-text-3);
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 4px;
  padding: 4px 10px;
  cursor: pointer;
  transition:
    color 0.15s ease,
    border-color 0.15s ease;
  flex-shrink: 0;
}
.pm-copy:hover {
  color: var(--ms-violet-500, #8b5cf6);
  border-color: var(--ms-violet-500, #8b5cf6);
}
.dark .pm-copy:hover {
  color: var(--ms-violet-400, #a78bfa);
  border-color: var(--ms-violet-400, #a78bfa);
}
</style>
