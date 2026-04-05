import type { Theme } from "vitepress";
import DefaultTheme from "vitepress/theme";
import Hero from "./components/Hero.vue";
import "./custom.css";

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component("Hero", Hero);
  },
} satisfies Theme;
