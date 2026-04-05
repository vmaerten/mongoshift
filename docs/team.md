---
layout: page
title: Team
---

<script setup>
import {
  VPTeamPage,
  VPTeamPageTitle,
  VPTeamMembers,
} from "vitepress/theme";

const members = [
  {
    avatar: "https://github.com/vmaerten.png",
    name: "Valentin Maerten",
    title: "Creator & maintainer",
    links: [
      { icon: "github", link: "https://github.com/vmaerten" },
      { icon: "x", link: "https://x.com/vmaerten" },
    ],
  },
];
</script>

<VPTeamPage>
  <VPTeamPageTitle>
    <template #title>The team behind mongoshift</template>
    <template #lead>
      An open-source MongoDB migration tool. Small today, open to contributors.
    </template>
  </VPTeamPageTitle>
  <VPTeamMembers size="medium" :members="members" />
</VPTeamPage>
