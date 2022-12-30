import * as path from 'path'
import XLSX from './excel.js';
import logger from './logger.js';
import puppeteer from 'puppeteer';
import * as data from "./data.js";
import * as utils from "./utils.js";
import * as control from "./control.js"


/**
 * 
 * @param {*} page 
 */
export const checkError = async (page) => {
  const errorMessage = await page.$eval('div.alert-danger', el => el.textContent)
    .catch(() => false)

  if (errorMessage) throw Error(errorMessage.trim());
}

/**
 * 
 * @param {*} page 
 * @param {*} selector 
 */
export const waitOptions = async (page, selector) => {
  let totalOptions = 1;

  while (totalOptions <= 1) {
    await utils.delay(100);

    totalOptions = (await page.$$(selector)).length
  }
}


/**
 * 
 * @param {*} browser 
 */
export const login = async (browser) => {
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
 * 
 * @param {*} browser 
 * @param {*} item 
 */
const inputDistribution = async (browser, item) => {
  logger.info(`[${item.kecamatan}] ${item.koseka_name}`)

  const page = await browser.newPage();

  await page.goto(`${process.env.SIPMEN_URL}/alokasi-ke-koseka/tambah`);

  await control.fillInput(page, "#no_surat", item.bast_no);

  await control.fillInput(page, "#tanggal_surat", item.date);

  await control.fillInput(page, "#kd_kab", item.kode_kabupaten);

  await waitOptions(page, "#kd_kec option");

  await control.fillInput(page, "#kd_kec", item.kode_kecamatan);

  await control.fillInput(page, "#nama_koseka", item.koseka_name);

  await control.fillInput(page, "#pejabat_tt", item.sender);

  await control.fillInput(page, "#nip_pejabat_tt", item.sender_nip);

  await Array(7).fill(1).reduce((p, spec) => p.then(() => page.click('button[onclick="add_baris()"]')), Promise.resolve(null));

  const DOKUMEN_NAMES = [
    { name: "PEDOMAN PENDATAAN", value: item.pedoman },
    { name: "REGSOSEK K", value: item.k },
    { name: "REGSOSEK VK1", value: item.vk1 },
    { name: "REGSOSEK VK2", value: item.vk2 },
    { name: "PETA WS", value: item.ws },
    { name: "REGSOSEK Pitem", value: item.pitem },
    { name: "REGSOSEK XK", value: item.xk },
    { name: "BANR", value: item.banr },
  ];

  await (await page.$$('select[name="kd_dokumen[]"]'))
    .reduce((prev, el, idx) => prev.then(() => el.select(DOKUMEN_NAMES[idx].name)), Promise.resolve(null));

  await (await page.$$('input[name="jumlah_dokumen[]"]'))
    .reduce((prev, el, idx) => prev.then(() => el.type(DOKUMEN_NAMES[idx].value)), Promise.resolve(null));

  await page.$eval('#formId', form => form.submit());

  await page.waitForNavigation();

  await checkError(page)
    .then(() => logger.info(`[${item.kecamatan}] ${item.koseka_name} - Inserted`))
    .catch(error => logger.error(`[${item.kecamatan}] ${item.koseka_name} - ${error.message}`))

  await page.close();
}

/**
 * 
 * @param {*} browser 
 */
export const distribution = async (browser) => {
  const distributionData = await data.fromCsv(path.join(process.cwd(), "data/distribusi.csv"));

  logger.info(`${distributionData.length} distribution data loaded`);

  logger.info(`Inserting ${distributionData.length} distribution data to SIPMEN...`);

  await distributionData
    .reduce((prev, item) => prev.then(() => inputDistribution(browser, item)), Promise.resolve(null));
}


/**
 * 
 * @param {*} browser 
 * @param {*} item 
 */
const inputPenerimaan = async (browser, item) => {
  const DOKUMEN_NAMES = [
    { name: "REGSOSEK VK1(set)", key: 'vk1' },
    { name: "REGSOSEK VK2(set)", key: 'vk2' },
    { name: "REGSOSEK PSLS(set)", key: 'psls' },
    { name: "REGSOSEK K(set)", key: 'k' },
    { name: "REGSOSEK XK(set)", key: 'xk' },
    { name: "PETA WS(lembar)", key: 'ws' },
    { name: "BANR(set)", key: 'banr' },
  ];

  const workbook = XLSX.utils.book_new()

  const worksheetData = [];

  DOKUMEN_NAMES.forEach(dok => {
    worksheetData.push({
      'Kode Wilayah': Number(item.kode_wilayah),
      'SLS': item.sub_sls,
      'Nama Petugas Penerimaan': item.penerima,
      'Tanggal': item.date,
      'Jenis Dokumen': dok.name,
      'Jumlah Diterima': Number(item[`${dok.key}_in`]),
      'Jumlah Terpakai': Number(item[`${dok.key}_used`])
    })
  })

  const worksheet = XLSX.utils.json_to_sheet(worksheetData);

  XLSX.utils.book_append_sheet(workbook, worksheet, "Worksheet");

  const fileName = path.join(process.cwd(), "data", "penerimaan", `${item.id_sls}.xlsx`);

  XLSX.writeFile(workbook, fileName, { compression: true });

  const page = await browser.newPage();

  await page.goto(`${process.env.SIPMEN_URL}/sipmen-terima-kab/importExcel`);

  /**
   * ID SLS : 18050140010001
   * - 18  : (0, 2)  ->  provinsi
   * - 05  : (2, 4)  ->  kabupaten
   * - 014 : (4, 7)  ->  kecamatan
   * - 001 : (7, 10) ->  desa
   */
  await waitOptions(page, "#kd_kab option");

  await control.fillInput(page, "#kd_kab", item.id_sls.slice(2, 4));

  await waitOptions(page, "#kd_kec option");

  await control.fillInput(page, "#kd_kec", item.id_sls.slice(4, 7));

  await waitOptions(page, "#kd_desa option");

  await control.fillInput(page, "#kd_desa", item.id_sls.slice(7, 10));

  await control.uploadFile(page, "#file", fileName)

  await page.$eval('#form_submit', form => form.submit());

  await page.waitForNavigation();

  await checkError(page)
    .then(() => logger.info(`[(${item.kode_kec}) ${item.kecamatan} - (${item.kode_desa}) ${item.desa}] ${item.id_sls} inserted`))
    .catch(error => logger.error(`[(${item.kode_kec}) ${item.kecamatan} - (${item.kode_desa}) ${item.desa}] ${item.id_sls} - ${error.message}`))

  await utils.delay(1000);

  await page.close();

}


/**
 * 
 * @param {*} browser 
 */
export const penerimaan = async (browser) => {
  const datasources = await data.fromCsv(path.join(process.cwd(), "data/penerimaan.csv"));

  logger.info(`${datasources.length} penerimaan data loaded`);

  logger.info(`Inserting ${datasources.length} penerimaan data to SIPMEN...`);

  await datasources
    .reduce((prev, item) => prev.then(() => inputPenerimaan(browser, item)), Promise.resolve(null));
}

/**
 * launch sipmen browser
 * 
 * @param {*} callback 
 */
export const launch = async (callback) => {
  logger.info('Launching Browser...')

  const browser = await puppeteer.launch({ headless: process.env.HEADLESS.toLowerCase() === 'true' });

  await login(browser).catch((error) => {
    logger.error(error.message);

    process.exit();
  });

  await callback(browser);

  logger.info('Clossing Browser...')

  await browser.close()
};