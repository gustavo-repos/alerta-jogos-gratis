const puppeteer = require('puppeteer-core')

const scrap = async function (url) {
    // Launch the browser and open a new blank page
    //const browser = await puppeteer.launch({executablePath: '/home/gustavo/snap/chromium'});
    const browser = await puppeteer.launch({executablePath: '/usr/bin/chromium-browser'});

    
    const page = await browser.newPage();
  
    await page.goto(url);
  
    const hrefValues = await page.$$eval('a', links => links.map(link => link.href));
  
    await browser.close();
  
    return hrefValues;
}

module.exports = { scrap }