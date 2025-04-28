const { defineConfig } = require("cypress");
const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
puppeteer.use(StealthPlugin());

module.exports = defineConfig({
  projectId: "7afdkj",
  defaultCommandTimeout: 120000,
  retries: {
    runMode: 2,
    openMode: 1,
  },
  userAgent:
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36",
  headers: {
    bmirak: "webbm",
    bmiyek: "815CF50C4487BD4863911B8D2AA83671",
  },
  e2e: {
    setupNodeEvents(on, config) {
      on("task", {
        log(message) {
          console.log(message + "\n\n");
          return null;
        },
        async clearBrowserSessions() {
          const browser = await puppeteer.launch();
          const pages = await browser.pages();
          await Promise.all(pages.map((page) => page.deleteCookie()));
          await browser.close();
          return null;
        },
      });
    },
    chromeWebSecurity: false,
    experimentalModifyObstructiveThirdPartyCode: true,
    experimentalSessionAndOrigin: true,
    includeShadowDom: true,
    baseUrl: "https://www.irctc.co.in",
    requestTimeout: 180000,
    responseTimeout: 180000,
    env: {
      CYPRESS_PROXY: "socks4://103.105.40.13:4145",
      COOKIE_STRATEGY: "persist",
    },
    viewportWidth: 1478,
    viewportHeight: 1056,
  },
});
