const puppeteer = require("puppeteer-extra");
const RecaptchaPlugin = require("puppeteer-extra-plugin-recaptcha");
const Client = require("@infosimples/node_two_captcha");
const cron = require("node-cron");
const { sendIt } = require("./mail");

// Declare your client
const captchaclient = new Client("c7a387f2ce9f7a6910e07068b370bf20", {
  timeout: 60000,
  polling: 5000,
  throwErrors: true
});

const escapeXpathString = str => {
  const splitedQuotes = str.replace(/'/g, `', "'", '`);
  return `concat('${splitedQuotes}', '')`;
};

const clickByText = async (page, text) => {
  const escapedText = escapeXpathString(text);
  const linkHandlers = await page.$x(`//a[contains(text(), ${escapedText})]`);

  if (linkHandlers.length > 0) {
    await linkHandlers[0].click();
  } else {
    throw new Error(`Link not found: ${text}`);
  }
};

const getFileName = () => `${new Date().toISOString()}.png`;

const fuckACaptcha = async page => {
  console.log("back to signin");
  await page.focus("#ap_password");
  await page.keyboard.type("WaIters098)(*");
  console.log("retyped pw");

  try {
    const theimage = await page.evaluate(
      () =>
        document.querySelector("#auth-captcha-image-container img").currentSrc // image selector
    );

    const response = await captchaclient.decode({
      url: theimage
    });

    await page.focus("#auth-captcha-guess");
    await page.keyboard.type(response._text);

    await Promise.all([page.click("#signInSubmit"), page.waitForNavigation()]);
  } catch (e) {
    console.log("2captchashit: ", e);
  }
};

cron.schedule("*/5 * * * *",async () => {
  console.log("STARTING");
  const browser = await puppeteer.launch({
    executablePath: "chromium-browser"
  });
  const page = await browser.newPage();

  const filename = getFileName();

  await page.setViewport({ width: 1400, height: 926 });
  await page.goto("https://primenow.amazon.com/home");

  // enter zip code and submit
  await page.focus("#lsPostalCode");
  await page.keyboard.type("02134");
  await page.click(".postalCodeSearchButton");

  await Promise.all([
    page.click(".postalCodeSearchButton"),
    page.waitForNavigation()
  ]);

  console.log("moved to a", page.url());

  await Promise.all([
    page.click(
      ".page_header_drop_menu_trigger__root__3JwZP.page_header_drop_menu_trigger__pullArrowLeft__2Ave_"
    ),
    page.waitForNavigation()
  ]);

  console.log("moved to b", page.url());

  await page.focus("#ap_email");
  await page.keyboard.type("jamie.william.buck@gmail.com");
  await page.focus("#ap_password");
  await page.keyboard.type("WaIters098)(*");
  await Promise.all([page.click("#signInSubmit"), page.waitForNavigation()]);

  // first try
  if (page.url().includes("/signin")) {
    await fuckACaptcha(page);
  }

  // second try
  if (page.url().includes("/signin")) {
    await fuckACaptcha(page);
  }

  // 3 strike urrr out
  if (page.url().includes("/signin")) {
    await fuckACaptcha(page);
  }

  console.log("moved to c", page.url());

  await Promise.all([
    page.click("[aria-label='Cart']"),
    page.waitForNavigation()
  ]);
  console.log("moved to d", page.url());

  await Promise.all([
    page.click(".cart-checkout-button"),
    page.waitForNavigation()
  ]);

  console.log("moved to e", page.url());

  const noDeliveriesText = (await page.content()).match(
    /No delivery windows available. New windows are released throughout the day./gi
  );

  if (noDeliveriesText) {
    console.log("shit outta luck");
    await browser.close();
  } else {
    console.log("lets goooo");
    await page.screenshot({
      path: `./tmp/${filename}`,
      fullPage: true
    });
    await browser.close();

    await sendIt(filename);
  }
});
