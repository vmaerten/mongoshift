<script setup lang="ts">
/**
 * mongoshift homepage hero.
 * Aesthetic: developer-first control panel. Terminal DNA, dense typography,
 * violet as a signal color. Every element carries migration motifs
 * (timestamps, blocks, diff markers, line numbers).
 */
import { ref, onMounted } from "vue";

const mounted = ref(false);
onMounted(() => {
  mounted.value = true;
});

const features = [
  {
    id: "M01",
    title: "Dry-run mode",
    desc: "Preview migrations without touching your changelog.",
    glyph: "◐",
  },
  {
    id: "M02",
    title: "Stored logs",
    desc: "Every migration's output lives in its changelog entry.",
    glyph: "▤",
  },
  {
    id: "M03",
    title: "File-hash drift",
    desc: "Detect edited migrations before they cause chaos.",
    glyph: "◈",
  },
  {
    id: "M04",
    title: "Custom templates",
    desc: "Enforce team conventions with your own template files.",
    glyph: "⬚",
  },
  {
    id: "M05",
    title: "TypeScript-native",
    desc: "Written in TS, ships .d.ts, runs .ts migrations.",
    glyph: "⌘",
  },
  {
    id: "M06",
    title: "ESM-only",
    desc: "Modern Node 24+ with native ECMAScript modules.",
    glyph: "▷",
  },
];

const terminalSteps = [
  { cmd: "pnpm add mongoshift mongodb", comment: "" },
  { cmd: "npx mongoshift init", comment: "# creates mongoshift.config.ts + migrations/" },
  { cmd: 'npx mongoshift create "add users"', comment: "# creates 20260405-add_users.ts" },
  { cmd: "npx mongoshift up", comment: "# applies all pending" },
];
</script>

<template>
  <div class="home-root" :class="{ 'is-mounted': mounted }">
    <!-- ========================================================== -->
    <!-- Hero                                                         -->
    <!-- ========================================================== -->
    <section class="hero" aria-labelledby="hero-headline">
      <!-- Migration block indicator: a fake "block" marker, like a commit -->
      <div class="block-indicator" aria-hidden="true">
        <span class="block-dot"></span>
        <span class="block-label">block</span>
        <span class="block-ts">20260405_0907</span>
        <span class="block-sep">·</span>
        <span class="block-ver">v0.1.0</span>
        <span class="block-sep">·</span>
        <span class="block-status">ready</span>
      </div>

      <div class="hero-grid">
        <div class="hero-copy">
          <p class="eyebrow"><span class="eyebrow-mark">→</span> MongoDB migrations</p>
          <h1 id="hero-headline" class="headline">
            MongoDB migrations
            <span class="headline-accent">with receipts.</span>
          </h1>
          <p class="sub">
            Dry-run before you commit. Persist every log line in the changelog. Detect edited
            migrations before they rewrite history.
          </p>
          <div class="cta-row">
            <a class="cta cta-primary" href="/guide/getting-started">
              <span>Get started</span>
              <span class="cta-arrow" aria-hidden="true">→</span>
            </a>
            <a
              class="cta cta-secondary"
              href="https://github.com/vmaerten/mongoshift"
              target="_blank"
              rel="noopener"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 16 16"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"
                />
              </svg>
              <span>GitHub</span>
            </a>
          </div>

          <!-- Install row: three package managers, monospace, tight -->
          <div class="install-row" aria-label="Install">
            <div class="install-grid">
              <span class="pm-tag">pnpm</span>
              <code>pnpm add mongoshift mongodb</code>
            </div>
          </div>
        </div>

        <!-- ==================================================== -->
        <!-- Code window                                            -->
        <!-- ==================================================== -->
        <div class="code-window" aria-label="Example migration file">
          <div class="code-titlebar">
            <div class="code-dots" aria-hidden="true">
              <span class="dot dot-1"></span>
              <span class="dot dot-2"></span>
              <span class="dot dot-3"></span>
            </div>
            <div class="code-filename">
              <span class="file-icon">ts</span>
              20260405090703-add_users.ts
            </div>
            <div class="code-status">
              <span class="status-led"></span>
              <span>live</span>
            </div>
          </div>
          <div class="code-body">
            <pre
              class="code-pre"
            ><span class="ln">1</span><span class="tok k">import</span> <span class="tok p">{</span> <span class="tok t">Db</span><span class="tok p">,</span> <span class="tok t">MongoClient</span> <span class="tok p">}</span> <span class="tok k">from</span> <span class="tok s">"mongodb"</span><span class="tok p">;</span>
<span class="ln">2</span><span class="tok k">import</span> <span class="tok p">{</span> <span class="tok t">MigrationContext</span> <span class="tok p">}</span> <span class="tok k">from</span> <span class="tok s">"mongoshift"</span><span class="tok p">;</span>
<span class="ln">3</span>
<span class="ln">4</span><span class="tok k">export</span> <span class="tok k">const</span> <span class="tok fn">up</span> <span class="tok o">=</span> <span class="tok k">async</span> <span class="tok p">(</span>
<span class="ln">5</span>  <span class="tok v">db</span><span class="tok p">:</span> <span class="tok t">Db</span><span class="tok p">,</span>
<span class="ln">6</span>  <span class="tok v">client</span><span class="tok p">:</span> <span class="tok t">MongoClient</span><span class="tok p">,</span>
<span class="ln">7</span>  <span class="tok v">ctx</span><span class="tok p">:</span> <span class="tok t">MigrationContext</span><span class="tok p">,</span>
<span class="ln">8</span><span class="tok p">)</span> <span class="tok o">=&gt;</span> <span class="tok p">{</span>
<span class="ln">9</span>  <span class="tok v">ctx</span><span class="tok p">.</span><span class="tok pr">logger</span><span class="tok p">.</span><span class="tok fn">log</span><span class="tok p">(</span><span class="tok s">"creating users"</span><span class="tok p">);</span>
<span class="ln">10</span>  <span class="tok k">if</span> <span class="tok p">(</span><span class="tok v">ctx</span><span class="tok p">.</span><span class="tok pr">dryRun</span><span class="tok p">)</span> <span class="tok k">return</span><span class="tok p">;</span>
<span class="ln">11</span>  <span class="tok k">await</span> <span class="tok v">db</span><span class="tok p">.</span><span class="tok fn">createCollection</span><span class="tok p">(</span><span class="tok s">"users"</span><span class="tok p">);</span>
<span class="ln">12</span><span class="tok p">};</span></pre>
          </div>
          <div class="code-footer">
            <span class="hash-label">sha256</span>
            <span class="hash-value">a7b2…c891</span>
            <span class="sep">·</span>
            <span>142 bytes</span>
          </div>
        </div>
      </div>
    </section>

    <!-- ========================================================== -->
    <!-- Features grid                                                -->
    <!-- ========================================================== -->
    <section class="features" aria-labelledby="features-heading">
      <header class="section-header">
        <span class="section-tag">// features</span>
        <h2 id="features-heading" class="section-title">Six deliberate decisions.</h2>
      </header>
      <div class="feature-grid">
        <article
          v-for="(f, i) in features"
          :key="f.id"
          class="feature-card"
          :style="{ '--delay': `${i * 40}ms` }"
        >
          <div class="feature-top">
            <span class="feature-id">{{ f.id }}</span>
            <span class="feature-glyph" aria-hidden="true">{{ f.glyph }}</span>
          </div>
          <h3 class="feature-title">{{ f.title }}</h3>
          <p class="feature-desc">{{ f.desc }}</p>
          <div class="feature-underline" aria-hidden="true"></div>
        </article>
      </div>
    </section>

    <!-- ========================================================== -->
    <!-- Get started CTA                                              -->
    <!-- ========================================================== -->
    <section class="get-started" aria-labelledby="gs-heading">
      <header class="section-header">
        <span class="section-tag">// get started</span>
        <h2 id="gs-heading" class="section-title">Four commands. Running migrations.</h2>
      </header>
      <div class="terminal" aria-label="Getting started commands">
        <div class="terminal-bar" aria-hidden="true">
          <span class="term-dot term-dot-1"></span>
          <span class="term-dot term-dot-2"></span>
          <span class="term-dot term-dot-3"></span>
          <span class="term-title">~/my-project</span>
        </div>
        <pre class="terminal-body"><span
            v-for="(s, i) in terminalSteps"
            :key="i"
            class="term-line"
          ><span class="term-prompt">$</span> <span class="term-cmd">{{ s.cmd }}</span><span v-if="s.comment" class="term-comment">  {{ s.comment }}</span>
</span></pre>
      </div>
      <div class="gs-cta">
        <a class="cta cta-primary" href="/guide/getting-started">
          <span>Read the full guide</span>
          <span class="cta-arrow" aria-hidden="true">→</span>
        </a>
      </div>
    </section>

    <!-- ========================================================== -->
    <!-- Footer                                                       -->
    <!-- ========================================================== -->
    <footer class="home-footer" role="contentinfo">
      <div class="footer-left">
        <span class="footer-mark" aria-hidden="true">◆</span>
        <span class="footer-name">mongoshift</span>
        <span class="footer-sep">·</span>
        <span class="footer-ver">v0.1.0</span>
      </div>
      <nav class="footer-links" aria-label="Footer">
        <a href="https://github.com/vmaerten/mongoshift" target="_blank" rel="noopener">GitHub</a>
        <span class="footer-sep">·</span>
        <a href="https://www.npmjs.com/package/mongoshift" target="_blank" rel="noopener">npm</a>
        <span class="footer-sep">·</span>
        <a
          href="https://github.com/vmaerten/mongoshift/blob/main/LICENSE"
          target="_blank"
          rel="noopener"
          >MIT</a
        >
      </nav>
    </footer>
  </div>
</template>

<style scoped>
/* =====================================================================
   Layout & scaffold
   ===================================================================== */

.home-root {
  --page-max: 1200px;
  --page-pad: clamp(20px, 4vw, 48px);
  --section-gap: clamp(64px, 8vw, 112px);

  max-width: var(--page-max);
  margin: 0 auto;
  padding: 0 var(--page-pad) 96px;
  color: var(--vp-c-text-1);
  font-feature-settings: "ss01", "cv11";
}

/* =====================================================================
   Block indicator (migration-themed "ribbon" above the hero)
   ===================================================================== */

.block-indicator {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font-family: var(--vp-font-family-mono);
  font-size: 11.5px;
  font-weight: 500;
  letter-spacing: 0.04em;
  color: var(--vp-c-text-3);
  padding: 6px 14px 6px 12px;
  margin-top: 40px;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 999px;
  opacity: 0;
  transform: translateY(-4px);
  transition:
    opacity 0.6s ease 0.05s,
    transform 0.6s ease 0.05s;
}
.is-mounted .block-indicator {
  opacity: 1;
  transform: translateY(0);
}
.block-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--ms-violet-500);
  box-shadow: 0 0 0 3px var(--ms-signal-weak);
  animation: pulse 2.4s ease-in-out infinite;
}
@keyframes pulse {
  50% {
    box-shadow: 0 0 0 6px transparent;
  }
}
.block-label {
  color: var(--vp-c-text-2);
}
.block-ts,
.block-ver {
  color: var(--vp-c-text-1);
  font-weight: 600;
}
.block-sep {
  opacity: 0.4;
}
.block-status {
  color: var(--ms-added);
  font-weight: 600;
  text-transform: uppercase;
  font-size: 10.5px;
  letter-spacing: 0.08em;
}

/* =====================================================================
   Hero section
   ===================================================================== */

.hero {
  position: relative;
  padding: 28px 0 var(--section-gap);
}

/* Dotted grid background - a subtle "data grid" atmosphere */
.hero::before {
  content: "";
  position: absolute;
  top: 0;
  left: -40px;
  right: -40px;
  bottom: 0;
  pointer-events: none;
  z-index: 0;
  background-image: radial-gradient(circle at center, var(--vp-c-divider) 1px, transparent 1px);
  background-size: 28px 28px;
  mask-image: radial-gradient(ellipse 60% 50% at 50% 30%, black 20%, transparent 70%);
  -webkit-mask-image: radial-gradient(ellipse 60% 50% at 50% 30%, black 20%, transparent 70%);
  opacity: 0.5;
}

.hero-grid {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: 1fr;
  gap: 56px;
  margin-top: 28px;
}
@media (min-width: 960px) {
  .hero-grid {
    grid-template-columns: minmax(0, 1.05fr) minmax(0, 1fr);
    gap: 72px;
    align-items: center;
  }
}

/* -------- Hero copy ------------------------------------------------- */

.hero-copy {
  opacity: 0;
  transform: translateY(8px);
  transition:
    opacity 0.7s ease 0.12s,
    transform 0.7s ease 0.12s;
}
.is-mounted .hero-copy {
  opacity: 1;
  transform: translateY(0);
}

.eyebrow {
  font-family: var(--vp-font-family-mono);
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: var(--vp-c-text-2);
  display: inline-flex;
  align-items: center;
  gap: 10px;
  margin: 0 0 20px;
}
.eyebrow-mark {
  color: var(--ms-violet-500);
  font-weight: 700;
}
.dark .eyebrow-mark {
  color: var(--ms-violet-400);
}

.headline {
  margin: 0;
  font-family: var(--vp-font-family-base);
  font-weight: 700;
  letter-spacing: -0.03em;
  line-height: 1.04;
  font-size: clamp(40px, 6.2vw, 72px);
  color: var(--vp-c-text-1);
}
.headline-accent {
  display: block;
  color: var(--vp-c-text-1);
  position: relative;
}
.headline-accent::after {
  content: "";
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0.08em;
  height: 0.18em;
  background: var(--ms-violet-500);
  opacity: 0.22;
  z-index: -1;
  border-radius: 2px;
}
.dark .headline-accent::after {
  background: var(--ms-violet-400);
  opacity: 0.28;
}

.sub {
  margin: 26px 0 0;
  font-size: 17px;
  line-height: 1.55;
  color: var(--vp-c-text-2);
  max-width: 46ch;
  font-weight: 400;
}
@media (min-width: 960px) {
  .sub {
    font-size: 18px;
  }
}

/* -------- CTAs ------------------------------------------------------ */

.cta-row {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 32px;
}
.cta {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 11px 18px;
  font-size: 14px;
  font-weight: 600;
  border-radius: 8px;
  border: 1px solid transparent;
  text-decoration: none !important;
  transition:
    transform 0.15s ease,
    background 0.15s ease,
    border-color 0.15s ease,
    color 0.15s ease;
  letter-spacing: -0.005em;
  font-family: var(--vp-font-family-base);
}
.cta-primary {
  background: var(--ms-violet-500);
  color: #ffffff;
  border-color: var(--ms-violet-500);
  box-shadow:
    0 1px 0 rgba(0, 0, 0, 0.05),
    inset 0 1px 0 rgba(255, 255, 255, 0.12);
}
.cta-primary:hover {
  background: var(--ms-violet-400);
  border-color: var(--ms-violet-400);
  transform: translateY(-1px);
}
.cta-arrow {
  display: inline-block;
  font-family: var(--vp-font-family-mono);
  transition: transform 0.15s ease;
}
.cta-primary:hover .cta-arrow {
  transform: translateX(3px);
}
.cta-secondary {
  background: transparent;
  color: var(--vp-c-text-1);
  border-color: var(--vp-c-divider);
}
.cta-secondary:hover {
  border-color: var(--vp-c-text-2);
  background: var(--vp-c-bg-soft);
}

/* -------- Install row ---------------------------------------------- */

.install-row {
  margin-top: 36px;
  max-width: 46ch;
}
.install-grid {
  display: grid;
  grid-template-columns: auto 1fr;
  align-items: center;
  gap: 0;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg-soft);
  overflow: hidden;
}
.pm-tag {
  font-family: var(--vp-font-family-mono);
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--vp-c-text-2);
  padding: 12px 14px;
  background: var(--vp-c-bg-alt);
  border-right: 1px solid var(--vp-c-divider);
}
.install-grid code {
  font-family: var(--vp-font-family-mono);
  font-size: 13px;
  font-weight: 500;
  color: var(--vp-c-text-1);
  padding: 12px 16px;
  background: transparent;
  border: none;
  white-space: nowrap;
  overflow-x: auto;
}

/* =====================================================================
   Code window (hero right side)
   ===================================================================== */

.code-window {
  --code-bg: #0a0c0f;
  --code-fg: #d4d4d4;
  --code-border: #1e2228;
  --code-ln: #3f4652;
  --code-ln-bg: #0d1014;
  --code-titlebar: #13171c;

  position: relative;
  border-radius: 10px;
  border: 1px solid var(--code-border);
  background: var(--code-bg);
  overflow: hidden;
  font-family: var(--vp-font-family-mono);
  box-shadow:
    0 1px 2px rgba(0, 0, 0, 0.08),
    0 24px 60px -20px rgba(0, 0, 0, 0.25),
    0 0 0 1px rgba(139, 92, 246, 0);
  opacity: 0;
  transform: translateY(12px) scale(0.98);
  transition:
    opacity 0.75s ease 0.22s,
    transform 0.75s ease 0.22s;
}
.is-mounted .code-window {
  opacity: 1;
  transform: translateY(0) scale(1);
}
.dark .code-window {
  box-shadow:
    0 1px 2px rgba(0, 0, 0, 0.4),
    0 24px 60px -20px rgba(0, 0, 0, 0.6),
    0 0 0 1px rgba(139, 92, 246, 0.08);
}

/* Violet corner accent - subtle migration glyph */
.code-window::before {
  content: "";
  position: absolute;
  top: 0;
  right: 0;
  width: 140px;
  height: 140px;
  background: radial-gradient(circle at top right, rgba(139, 92, 246, 0.14), transparent 60%);
  pointer-events: none;
}

.code-titlebar {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 16px;
  padding: 10px 14px;
  background: var(--code-titlebar);
  border-bottom: 1px solid var(--code-border);
}
.code-dots {
  display: flex;
  gap: 6px;
}
.dot {
  width: 11px;
  height: 11px;
  border-radius: 50%;
  border: 0.5px solid rgba(0, 0, 0, 0.3);
}
.dot-1 {
  background: #e84e3d;
}
.dot-2 {
  background: #f5be40;
}
.dot-3 {
  background: #5ecc58;
}
.code-filename {
  font-size: 12px;
  font-weight: 500;
  color: #9ca3af;
  text-align: center;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  justify-content: center;
}
.file-icon {
  font-family: var(--vp-font-family-mono);
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.05em;
  padding: 2px 5px;
  border-radius: 3px;
  background: rgba(139, 92, 246, 0.22);
  color: #c4b5fd;
  border: 1px solid rgba(139, 92, 246, 0.35);
  text-transform: uppercase;
}
.code-status {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 10.5px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #6b7280;
}
.status-led {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #5ecc58;
  box-shadow: 0 0 8px rgba(94, 204, 88, 0.6);
  animation: pulse 2s ease-in-out infinite;
}

.code-body {
  padding: 16px 0 18px;
  overflow-x: auto;
}
.code-pre {
  margin: 0;
  padding: 0;
  font-family: var(--vp-font-family-mono);
  font-size: 13px;
  line-height: 1.7;
  color: var(--code-fg);
  tab-size: 2;
  white-space: pre;
}
.ln {
  display: inline-block;
  width: 2.4em;
  padding-right: 1.1em;
  text-align: right;
  color: var(--code-ln);
  user-select: none;
  font-size: 11px;
  font-weight: 500;
}

/* Syntax token colors - Vitesse-dark inspired */
.tok.k {
  color: #cb7676; /* keywords */
}
.tok.t {
  color: #5da994; /* types */
}
.tok.s {
  color: #c98a7d; /* strings */
}
.tok.fn {
  color: #80a665; /* function names */
}
.tok.v {
  color: #bd976a; /* variables */
}
.tok.pr {
  color: #b8a965; /* properties */
}
.tok.p {
  color: #666666; /* punctuation */
}
.tok.o {
  color: #cb7676; /* operators */
}

.code-footer {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 14px;
  border-top: 1px solid var(--code-border);
  font-size: 10.5px;
  font-weight: 500;
  color: #6b7280;
  background: #0b0e11;
  letter-spacing: 0.02em;
}
.hash-label {
  text-transform: uppercase;
  letter-spacing: 0.1em;
  font-size: 9.5px;
  font-weight: 600;
  color: #4b5563;
}
.hash-value {
  color: #9ca3af;
  font-weight: 600;
}
.code-footer .sep {
  opacity: 0.4;
}

/* =====================================================================
   Section scaffolding (shared)
   ===================================================================== */

.section-header {
  margin-bottom: 40px;
}
.section-tag {
  display: inline-block;
  font-family: var(--vp-font-family-mono);
  font-size: 12px;
  font-weight: 500;
  color: var(--vp-c-text-3);
  margin-bottom: 12px;
  letter-spacing: 0.02em;
}
.section-title {
  font-family: var(--vp-font-family-base);
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 1.15;
  font-size: clamp(28px, 3.8vw, 40px);
  color: var(--vp-c-text-1);
  margin: 0;
}

/* =====================================================================
   Features grid
   ===================================================================== */

.features {
  padding-bottom: var(--section-gap);
  border-top: 1px solid var(--vp-c-divider);
  padding-top: var(--section-gap);
}

.feature-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0;
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  overflow: hidden;
  background: var(--vp-c-bg-soft);
}
@media (min-width: 640px) {
  .feature-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (min-width: 960px) {
  .feature-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

.feature-card {
  position: relative;
  padding: 26px 24px 30px;
  background: var(--vp-c-bg);
  border-right: 1px solid var(--vp-c-divider);
  border-bottom: 1px solid var(--vp-c-divider);
  transition: background 0.25s ease;
  opacity: 0;
  transform: translateY(8px);
  transition:
    opacity 0.6s ease var(--delay, 0ms),
    transform 0.6s ease var(--delay, 0ms),
    background 0.2s ease;
}
.is-mounted .feature-card {
  opacity: 1;
  transform: translateY(0);
}
/* Remove right/bottom borders on edge cells for a clean grid */
@media (min-width: 960px) {
  .feature-card:nth-child(3n) {
    border-right: none;
  }
  .feature-card:nth-child(n + 4) {
    border-bottom: none;
  }
}
@media (min-width: 640px) and (max-width: 959px) {
  .feature-card:nth-child(2n) {
    border-right: none;
  }
  .feature-card:nth-child(n + 5) {
    border-bottom: none;
  }
}
@media (max-width: 639px) {
  .feature-card {
    border-right: none;
  }
  .feature-card:last-child {
    border-bottom: none;
  }
}
.feature-card:hover {
  background: var(--vp-c-bg-soft);
}
.feature-card:hover .feature-underline {
  transform: scaleX(1);
}

.feature-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 18px;
}
.feature-id {
  font-family: var(--vp-font-family-mono);
  font-size: 11px;
  font-weight: 600;
  color: var(--vp-c-text-3);
  letter-spacing: 0.06em;
}
.feature-glyph {
  font-size: 18px;
  color: var(--ms-violet-500);
  line-height: 1;
}
.dark .feature-glyph {
  color: var(--ms-violet-400);
}
.feature-title {
  font-family: var(--vp-font-family-base);
  font-size: 17px;
  font-weight: 600;
  letter-spacing: -0.01em;
  color: var(--vp-c-text-1);
  margin: 0 0 8px;
}
.feature-desc {
  font-size: 14px;
  line-height: 1.55;
  color: var(--vp-c-text-2);
  margin: 0;
}
.feature-underline {
  position: absolute;
  left: 24px;
  right: 24px;
  bottom: 16px;
  height: 2px;
  background: var(--ms-violet-500);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.3s ease;
}
.dark .feature-underline {
  background: var(--ms-violet-400);
}

/* =====================================================================
   Get started CTA (terminal)
   ===================================================================== */

.get-started {
  padding-bottom: var(--section-gap);
  border-top: 1px solid var(--vp-c-divider);
  padding-top: var(--section-gap);
}

.terminal {
  border: 1px solid #1E2228;
  border-radius: 10px;
  overflow: hidden;
  background: #0A0C0F;
  box-shadow:
    0 1px 2px rgba(0, 0, 0, 0.08),
    0 16px 40px -16px rgba(0, 0, 0, 0.18);
}
.dark .terminal {
  box-shadow:
    0 1px 2px rgba(0, 0, 0, 0.4),
    0 16px 40px -16px rgba(0, 0, 0, 0.5),
    0 0 0 1px rgba(139, 92, 246, 0.08);
}

.terminal-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  background: #13171C;
  border-bottom: 1px solid #1E2228;
}
.term-dot {
  width: 11px;
  height: 11px;
  border-radius: 50%;
  border: 0.5px solid rgba(0, 0, 0, 0.3);
}
.term-dot-1 { background: #E84E3D; }
.term-dot-2 { background: #F5BE40; }
.term-dot-3 { background: #5ECC58; }
.term-title {
  margin-left: auto;
  margin-right: auto;
  padding-right: 36px;
  font-family: var(--vp-font-family-mono);
  font-size: 11.5px;
  font-weight: 500;
  color: #9CA3AF;
  letter-spacing: 0.01em;
}

.terminal-body {
  margin: 0;
  padding: 18px 18px 20px;
  font-family: var(--vp-font-family-mono);
  font-size: 13.5px;
  line-height: 1.9;
  color: #D4D4D4;
  overflow-x: auto;
  white-space: pre;
}
.term-line {
  display: block;
}
.term-prompt {
  color: var(--ms-violet-400);
  font-weight: 600;
  user-select: none;
  margin-right: 0.5em;
}
.term-cmd {
  color: #E5E7EB;
  font-weight: 500;
}
.term-comment {
  color: #6B7280;
  font-weight: 400;
}

.gs-cta {
  margin-top: 28px;
  display: flex;
  justify-content: center;
}
.gs-cta .cta {
  padding: 12px 22px;
  font-size: 14.5px;
}

/* =====================================================================
   Home footer
   ===================================================================== */

.home-footer {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 28px 0 0;
  border-top: 1px solid var(--vp-c-divider);
  font-family: var(--vp-font-family-mono);
  font-size: 12px;
  color: var(--vp-c-text-2);
}
.footer-left {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}
.footer-mark {
  color: var(--ms-violet-500);
}
.dark .footer-mark {
  color: var(--ms-violet-400);
}
.footer-name {
  font-weight: 600;
  color: var(--vp-c-text-1);
}
.footer-ver {
  color: var(--vp-c-text-3);
  font-weight: 500;
}
.footer-sep {
  opacity: 0.35;
}
.footer-links {
  display: inline-flex;
  align-items: center;
  gap: 12px;
}
.footer-links a {
  color: var(--vp-c-text-2);
  text-decoration: none;
  font-weight: 500;
  transition: color 0.15s ease;
}
.footer-links a:hover {
  color: var(--ms-violet-500);
}
.dark .footer-links a:hover {
  color: var(--ms-violet-400);
}

/* =====================================================================
   Reduced motion
   ===================================================================== */

@media (prefers-reduced-motion: reduce) {
  .home-root *,
  .home-root *::before,
  .home-root *::after {
    animation: none !important;
    transition: none !important;
  }
  .home-root .block-indicator,
  .home-root .hero-copy,
  .home-root .code-window,
  .home-root .feature-card {
    opacity: 1 !important;
    transform: none !important;
  }
}
</style>
