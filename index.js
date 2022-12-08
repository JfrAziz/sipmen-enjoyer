import * as dotenv from 'dotenv';
import puppeteer from 'puppeteer';
import logger from './src/logger.js';
import * as data from "./src/data.js";
import * as sipmen from "./src/sipmen.js";

// environment variables
dotenv.config();

/**
 * Running scripts
 */
(async () => {
  const browser = await puppeteer.launch({ headless: process.env.HEADLESS.toLowerCase() === 'true' });

  await sipmen.login(browser).catch((error) => {
    logger.error(error.message);

    process.exit();
  });

  const distributionData = await data.fromCsv("data/distribusi.csv");

  logger.info(`${distributionData.length} distribution data loaded`);

  logger.info(`Inserting ${distributionData.length} distribution data to SIPMEN...`);

  await distributionData
    .reduce((prev, item) => prev.then(() => sipmen.inputDistribution(browser, item)), Promise.resolve(null));

  await browser.close()
})();