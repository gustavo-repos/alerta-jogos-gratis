// SCRAP

process.env.CHROME_BIN = '/usr/bin/chromium-browser';
process.env.CHROME_PATH = '/usr/bin/chromium-browser';
process.env.PUPPETEER_SKIP_CHROMIUM_DOWNLOAD = true;

const { launchOptions, headerOptions } = require('./puppeteerOptions')
const puppeteer = require('puppeteer-core')

async function extractHrefValues(url) {
    const browser = await puppeteer.launch(launchOptions)
    const page = await browser.newPage()
    await page.setExtraHTTPHeaders(headerOptions); 
    await page.goto(url);

    const hrefValues = await page.evaluate(() => {
        var elements = document.getElementsByTagName('a')
        var links = []
        for (var i = 0; i < elements.length; i++) {
            links.push(elements[i].href)
        }
        return links
    })
  
    await browser.close()
  
    return hrefValues
}

extractHrefValues('https://store.epicgames.com/en-US/free-games')
    .then(result => {
        console.log(result)
    })