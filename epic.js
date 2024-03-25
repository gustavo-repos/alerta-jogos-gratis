const FreeGame = require('./models/freeGame');
var fs = require('fs');

const { sendNotification } = require('./notifications')

process.env.CHROME_BIN = '/usr/bin/chromium-browser';
process.env.CHROME_PATH = '/usr/bin/chromium-browser';
process.env.PUPPETEER_SKIP_CHROMIUM_DOWNLOAD = true;

const { launchOptions, headerOptions } = require('./puppeteerOptions')
const puppeteer = require('puppeteer-core')

const getFreeGames = async () => {

    var freeGames = [];

    async function extractHrefValues(url) {
        const browser = await puppeteer.launch(launchOptions)
        const page = await browser.newPage()
        await page.setExtraHTTPHeaders(headerOptions); 
        await page.goto(url, { waitUntil: 'load', timeout: 0 });

        await page.waitForSelector('.css-g3jcms');

        const hrefValues = await page.evaluate(() => {
            const elements = document.querySelectorAll('.css-g3jcms');
            const hrefs = [];
            for (let i = 0; i < elements.length; i++) {
              hrefs.push(elements[i].href);
            }
            return hrefs;
          });
      
        await browser.close()
      
        return hrefValues
    }

    var links = await extractHrefValues('https://store.epicgames.com/pt-BR/browse?sortBy=releaseDate&sortDir=DESC&priceTier=tierFree&category=Game&count=300&start=0')

    async function scrapData(url) {
        //const browser = await puppeteer.launch(launchOptions)
        const page = await browser.newPage()
        await page.setExtraHTTPHeaders(headerOptions); 
        await page.goto(url, { waitUntil: 'load', timeout: 0 });

        console.log(url)
        await page.waitForSelector('.css-1mzagbj', {timeout: 0})
        await page.waitForSelector('.css-vs1xw0', {timeout: 0})
        //await page.waitForSelector('.css-1bbjmcj')
        
        var imgClassName
        try {
            await page.waitForSelector('.css-1bbjmcj', {timeout: 30000})
            imgClassName = '.css-1bbjmcj'
        } catch (error) {
            imgClassName = '.css-7i770w'
        } 

        const data = await page.evaluate((imgClassName) => {

            const title = document.querySelector('.css-1mzagbj').textContent

            var elements

            elements = document.querySelector('.css-vs1xw0').childNodes
            const genres = []
            for (let j = 0; j < elements.length; j++) {
                genres.push(elements[j].textContent);
            }

            elements = document.querySelectorAll(imgClassName);
            const srcs = []
            for (let j = 0; j < elements.length; j++) {
                srcs.push(elements[j].src);
            }

            return [title, genres.join(' - '), srcs]

        })
        
        //await browser.close()
        
        return data
    }
    
    var browser = await puppeteer.launch(launchOptions)
    //for (var i = 0; i < links.length; i++) {
    //for (var i = 0; i < 180; i++) {
    for (var i = 0; i < 10; i++) {
        var scrapedData = await scrapData(links[i])        

        var freeGame = {
            title: scrapedData[0], 
            site: "Epic", 
            link: links[i],
            genre: scrapedData[1],
            images: scrapedData[2],
          }
          freeGames.push(freeGame)
    }
    await browser.close()
    return freeGames;
}

async function sendEpicGames() {


    // var test = await getFreeGames()
    // console.log(test) 

    var date = new Date()

    fs.appendFileSync('./log.txt', `ATUALIZAÇÃO ${date.toLocaleDateString()} ${parseInt(date.getHours()) - 3}:${date.getMinutes()}\n`)

    var freeGames = await getFreeGames()

    var newGames = []

    for (var i = 0; i < freeGames.length; i++) {

        await (new FreeGame(freeGames[i])).save()
          .then(() => {
            newGames.push(freeGames[i])
          })
          .catch(err => {
            if (!err.code === 11000) {
              console.log(err);
            }
            
           });
        
    }

    if (newGames.length > 0) {
        for (var i = 0; i < newGames.length; i++) {
          fs.appendFileSync('./log.txt', `Adicionado o jogo ${newGames[i].title} (${newGames[i].site}).\n`)
          sendNotification(`O jogo ${newGames[i].title} foi adicionado na plataforma ${newGames[i].site}!`)
          console.log(`Adicionado o jogo ${newGames[i].title} (${newGames[i].site}).`)
        }
      } else {
        fs.appendFileSync('./log.txt', `Nenhum jogo novo adicionado na Epic.\n`)
        console.log("Nenhum jogo novo adicionado na Epic.")
      }


      await FreeGame.find({ "site": "Epic"}) 
      .then(async result => {
        for (var i = 0; i < result.length; i++) {
          var gameWasRemoved = true;
          for (var j = 0; j < freeGames.length; j++) {
            if ((result[i].title === freeGames[j].title) && (result[i].site === freeGames[j].site)) {
              gameWasRemoved = false;
            }    
          }
          if (gameWasRemoved) {
            await FreeGame.findOneAndDelete({ "title": result[i].title, "site": result[i].site })
              .then(result => {
                fs.appendFileSync('./log.txt', `Removido o jogo ${result.title} (${result.site}).\n`)
                console.log(`Removido o jogo ${result.title} (${result.site}).`)
              })
              .catch(err => {
                console.log(err)
              })
          }
        }
      })
      .catch(err => {
        console.log(err)
      });
  
    fs.appendFileSync('./log.txt', `Fim da atualização\n\n`)

}

module.exports = { sendEpicGames };