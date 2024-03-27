const FreeGame = require('./models/freeGame')
const UpdateLog = require('./models/updateLog');
var date
var startTime
var endTime
var log = []

const { sendNotification } = require('./notifications')

process.env.CHROME_BIN = '/usr/bin/chromium-browser';
process.env.CHROME_PATH = '/usr/bin/chromium-browser';
process.env.PUPPETEER_SKIP_CHROMIUM_DOWNLOAD = true;

const { launchOptions, headerOptions } = require('./puppeteerOptions')
const puppeteer = require('puppeteer-core')

const getFreeGames = async () => {

    date = new Date()
    startTime = date.getTime()

    log.push(`Início da atualização da Epic ${date.toLocaleDateString("en-GB")} às ${parseInt(date.getHours()) - 3}:${String(date.getMinutes()).padStart(2, "0")}`)

    async function extractHrefValues(url) {
        const browser = await puppeteer.launch(launchOptions)

        try {
          const page = await browser.newPage()
          await page.setCacheEnabled(false)
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
          })
          return hrefValues
        } catch (error) {
            console.log(error);
        } finally {
            await browser.close()
        }
        
    }

    var links = await extractHrefValues('https://store.epicgames.com/pt-BR/browse?sortBy=releaseDate&sortDir=DESC&priceTier=tierFree&category=Game&count=300&start=0')

    async function scrapData(urls) {
      const freeGames = [];
  
      let browser;
      try {
          for (let i = 0; i < urls.length; i++) {
              // if(!browser) {
              //   browser = await puppeteer.launch(launchOptions)
              // }
              browser = await puppeteer.launch(launchOptions)
              const page = await browser.newPage();
              await page.setCacheEnabled(false);
              await page.setExtraHTTPHeaders(headerOptions);
              page.setDefaultNavigationTimeout(0);
  
              console.log(urls[i]);
              await page.goto(urls[i], { waitUntil: 'load', timeout: 0 });
              await page.waitForSelector('.css-1mzagbj', { timeout: 0 });
              await page.waitForSelector('.css-vs1xw0', { timeout: 0 });
              try {
                  await page.waitForSelector('.css-1bbjmcj', { timeout: 0 });
              } catch (error) {
                  await page.waitForSelector('.css-7i770w', { timeout: 0 });
              }
  
              const data = await page.evaluate(() => {
                  const title = document.querySelector('.css-1mzagbj').textContent;
                  const elements = document.querySelector('.css-vs1xw0').childNodes;
                  const genres = [];
                  for (let j = 0; j < elements.length; j++) {
                      genres.push(elements[j].textContent);
                  }
  
                  let elementsToQuery;
                  if (document.querySelectorAll('.css-1bbjmcj').length > 0) {
                      elementsToQuery = document.querySelectorAll('.css-1bbjmcj');
                  } else {
                      elementsToQuery = document.querySelectorAll('.css-7i770w');
                  }
                  const srcs = [];
                  for (let j = 0; j < elementsToQuery.length; j++) {
                      srcs.push(elementsToQuery[j].src);
                  }
  
                  return {
                      title: title,
                      site: "Epic",
                      link: document.location.href,
                      genre: genres.join(' - '),
                      images: srcs,
                  };
              });
  
              freeGames.push(data);
              await page.close(); // Fecha a página após a conclusão da iteração
              await browser.close()
          }
      } catch (error) {
          console.log(error);
      } finally {
          // if (browser) {
          //     await browser.close();
          // }
      }
  
      return freeGames;
  }
  
  
        
      
    
    //var browser = await puppeteer.launch(launchOptions)
    //console.log('Tamanho de link: '+links.length)
    //for (var i = 0; i < 180; i++) { 
    //var browserOpen = await puppeteer.launch(launchOptions)
    //for (var i = 48; i < 58; i++) {

    // for (var i = 0; i < links.length; i++) {
    //     var scrapedData = await scrapData(links[i])        

    //     var freeGame = {
    //         title: scrapedData[0], 
    //         site: "Epic", 
    //         link: links[i],
    //         genre: scrapedData[1],
    //         images: scrapedData[2],
    //       }
    //       freeGames.push(freeGame)

    // }

    var result = scrapData(links)

    date = new Date()
    endTime = date.getTime()
    log.push(`O scrap durou ${(endTime - startTime)/1000}s.`)
    
    return result;
}

async function sendEpicGames() {

    // var test = await getFreeGames()
    // console.log(test) 

    //fs.appendFileSync('./log.txt', `ATUALIZAÇÃO ${date.toLocaleDateString()} ${parseInt(date.getHours()) - 3}:${date.getMinutes()}\n`)

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
          //fs.appendFileSync('./log.txt', `Adicionado o jogo ${newGames[i].title} (${newGames[i].site}).\n`)
          log.push(`Adicionado o jogo ${newGames[i].title} (${newGames[i].site}).`)
          sendNotification(`O jogo ${newGames[i].title} foi adicionado na plataforma ${newGames[i].site}!`)
          console.log(`Adicionado o jogo ${newGames[i].title} (${newGames[i].site}).`)
        }
      } else {
        //fs.appendFileSync('./log.txt', `Nenhum jogo novo adicionado na Epic.\n`)
        log.push(`Nenhum jogo novo adicionado na Epic.`)
        //console.log("Nenhum jogo novo adicionado na Epic.")
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
                //fs.appendFileSync('./log.txt', `Removido o jogo ${result.title} (${result.site}).\n`)
                log.push(`Removido o jogo ${result.title} (${result.site}).`)
                //console.log(`Removido o jogo ${result.title} (${result.site}).`)
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
  
    log.push(`Fim da atualização da Epic.`)
    //fs.appendFileSync('./log.txt', `Fim da atualização\n\n`)

    console.log(log)
    await new UpdateLog({log}).save()

}

module.exports = { sendEpicGames };