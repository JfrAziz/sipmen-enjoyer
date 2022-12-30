/**
 * 
 * @param {*} page 
 * @param {*} selector 
 * @param {*} value 
 */
export const fillInput = async (page, selector, value) => {
  await page.waitForSelector(selector);

  const el = await page.$eval(selector, (e) => e.nodeName.toLowerCase())

  el === "select"
    ? await page.select(selector, value)
    : await page.type(selector, value)
}

export const uploadFile = async (page, selector, filePath) => {
  await page.waitForSelector(selector);

  const inputUploadHandle = await page.$(selector);

  await inputUploadHandle.uploadFile(filePath)
}