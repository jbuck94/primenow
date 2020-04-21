const puppeteer = require("puppeteer-extra");
const RecaptchaPlugin = require("puppeteer-extra-plugin-recaptcha");
const Client = require("@infosimples/node_two_captcha");
const cron = require("node-cron");
const { sendIt } = require("./mail");
const secrets = require("./secrets.json");

// Declare your client
const captchaclient = new Client(secrets.two_captcha_key, {
  timeout: 60000,
  polling: 5000,
  throwErrors: true,
});

const escapeXpathString = (str) => {
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

const solveCaptcha = async (page) => {
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
      url: theimage,
    });

    await page.focus("#auth-captcha-guess");
    await page.keyboard.type(response._text);

    await Promise.all([page.click("#signInSubmit"), page.waitForNavigation()]);
  } catch (e) {
    console.log("2captcha error: ", e);
  }
};

cron.schedule("*/5 * * * *", async () => {
  console.log("STARTING");
  const browser = await puppeteer.launch({
    headless: false,
    // executablePath: "chromium-browser",
  });
  const page = await browser.newPage();

  const filename = getFileName();

  await page.setViewport({ width: 1400, height: 926 });
  await page.goto("https://primenow.amazon.com/home");

  // enter zip code and submit
  await page.focus("#lsPostalCode");
  await page.keyboard.type(secrets.delivery_zip_code);
  await page.click(".postalCodeSearchButton");

  await Promise.all([
    page.click(".postalCodeSearchButton"),
    page.waitForNavigation(),
  ]);

  console.log("moved to", page.url());

  await Promise.all([
    page.click("[class*='page_header_drop_menu_trigger__pullArrowLeft__']"),
    page.waitForNavigation(),
  ]);

  console.log("moved to", page.url());

  await page.focus("#ap_email");
  await page.keyboard.type("jamie.william.buck@gmail.com");
  await page.focus("#ap_password");
  await page.keyboard.type("WaIters098)(*");
  await Promise.all([page.click("#signInSubmit"), page.waitForNavigation()]);

  // first try
  if (page.url().includes("/signin")) {
    await solveCaptcha(page);
  }

  // second try
  if (page.url().includes("/signin")) {
    await solveCaptcha(page);
  }

  // 3 strike urrr out
  if (page.url().includes("/signin")) {
    await solveCaptcha(page);
  }

  console.log("moved to", page.url());

  await Promise.all([
    page.click("[aria-label='Cart']"),
    page.waitForNavigation(),
  ]);
  console.log("moved to", page.url());

  const emptyCartText = (await page.content()).match(
    /Your Shopping Cart is empty./gi
  );

  if (emptyCartText) {
    console.log("Your cart is empty");
    return browser.close();
  } else {
    await Promise.all([
      page.click(".cart-checkout-button"),
      page.waitForNavigation(),
    ]);
  }

  console.log("moved to", page.url());

  const noDeliveriesText = (await page.content()).match(
    /No delivery windows available. New windows are released throughout the day./gi
  );

  if (noDeliveriesText) {
    console.log("you're outta luck, no delivery windows");
    return browser.close();
  } else {
    await page.screenshot({
      path: `./tmp/${filename}`,
      fullPage: true,
    });
    const currentURL = page.url();
    await browser.close();

    await sendIt(filename, currentURL);
  }
});
