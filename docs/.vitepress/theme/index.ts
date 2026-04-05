import type { Theme } from "vitepress";
import DefaultTheme from "vitepress/theme";
import Hero from "./components/Hero.vue";
import PmCommand from "./components/PmCommand.vue";
import "./custom.css";

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component("Hero", Hero);
    app.component("PmCommand", PmCommand);
  },
} satisfies Theme;
