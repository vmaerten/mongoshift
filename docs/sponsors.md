---
layout: page
title: Sponsors
---

<script setup>
import { VPTeamPage, VPTeamPageTitle, VPTeamPageSection } from "vitepress/theme";
</script>

<VPTeamPage>
  <VPTeamPageTitle>
    <template #title>Sponsor mongoshift</template>
    <template #lead>
      mongoshift is free and open-source under the MIT license. If your team
      relies on it, consider sponsoring its development.
    </template>
  </VPTeamPageTitle>

<div class="sponsors-cta">
  <a class="sponsor-button" href="https://github.com/sponsors/vmaerten" target="_blank" rel="noopener">
    Become a sponsor on GitHub →
  </a>
</div>

<VPTeamPageSection>
  <template #title>Why sponsor?</template>
  <template #lead>
    Your support directly funds maintenance, new features, bug fixes, and the
    long-term viability of the project. Sponsors get visibility on this page,
    in the README, and (for higher tiers) a direct channel for feature requests.
  </template>
</VPTeamPageSection>

## Tiers

### Gold — $100 / month

Logo on the homepage and in the README. Direct channel for feature requests.
_No gold sponsors yet._

### Silver — $50 / month

Logo on the sponsors page and in the README.
_No silver sponsors yet._

### Bronze — $10 / month

Name listed on the sponsors page.
_No bronze sponsors yet._

## One-time donations

Also welcome via [GitHub Sponsors](https://github.com/sponsors/vmaerten).

</VPTeamPage>

<style scoped>
.sponsors-cta {
  display: flex;
  justify-content: center;
  margin: 40px 0 56px;
}
.sponsor-button {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 14px 24px;
  background: var(--ms-violet-500, #8B5CF6);
  color: #FFFFFF;
  font-weight: 600;
  font-size: 15px;
  border-radius: 8px;
  text-decoration: none;
  transition: background 0.15s ease, transform 0.15s ease;
}
.sponsor-button:hover {
  background: #A78BFA;
  transform: translateY(-1px);
}
</style>
