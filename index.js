import puppeteer from 'puppeteer';
import * as dotenv from 'dotenv';
import logger from './logger.js';

// environment variables
dotenv.config();

/**
 * 
 * @param {*} page 
 */
const checkError = async (page) => {
  const errorMessage = await page.$eval('div.alert', el => el.textContent)
    .catch(() => false)

  if (errorMessage) throw Error(errorMessage.trim());
}


/**
 * 
 * @param {*} browser 
 */
const login = async (browser) => {
  const page = await browser.newPage();

  logger.info(`Navigating to ${process.env.SIPMEN_URL}`)

  await page.goto(process.env.SIPMEN_URL);

  await page.waitForSelector('#email');

  await page.waitForSelector('#password');

  await page.type('#email', process.env.SIPMEN_USERNAME);

  await page.type('#password', process.env.SIPMEN_PASSWORD);

  await page.$eval('form', form => form.submit());

  await page.waitForNavigation();

  await checkError(page)

  logger.info(`Logged in with username: ${process.env.SIPMEN_USERNAME}`);

  await page.close()
};


/**
 * Running scripts
 */
(async () => {
  const browser = await puppeteer.launch({ headless: process.env.HEADLESS.toLowerCase() === 'true' });

  await login(browser).catch((error) => {
    logger.error(error.message);

    process.exit();
  });

  const page = await browser.newPage();

  await page.goto(process.env.SIPMEN_URL);

  await browser.close()
})();