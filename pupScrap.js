const puppeteer = require('puppeteer-core');

async function extractHrefValues(url) {
    const browser = await puppeteer.launch({
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-infobars',
          '--window-position=0,0',
          '--ignore-certifcate-errors',
          '--ignore-certifcate-errors-spki-list',
          '--user-agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3312.0 Safari/537.36"'
        ]
    });

  const page = await browser.newPage();

  await page.goto(url);

  const hrefValues = await page.$$eval('.css-g3jcms', links => links.map(link => link.href));

  await browser.close();

  return hrefValues;
}

module.exports = { extractHrefValues };