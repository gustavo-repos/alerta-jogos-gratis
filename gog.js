var puppeteer = require('puppeteer');
const FreeGame = require('./models/freeGame');
const { gameData } = require('./freeGameTest')
var fs = require('fs');

var counter = 0;

// var newGames = [];

const getFreeGames = async () => {

    var freeGames = [];

    const browser = await puppeteer.launch({
      headless: true, // mudar
      defaultViewport: null,
    });
  
    // Open a new page
    const page = await browser.newPage();
  
    // On this new page:
    await page.goto("https://www.gog.com/partner/free_games", {
      waitUntil: "domcontentloaded",
    });
  
    // Get page data
    const links = await page.evaluate(() => {

      let data = [];
      let elements = document.getElementsByClassName('product-row__link');

      for (var element of elements) {
          data.push(element.href);
    }
      
       return data;

    });


     for (var i = 0; i < links.length; i++) {

      var url = links[i];
      await page.goto(`${url}`, {
        waitUntil: "domcontentloaded",
      });

      var info = await page.evaluate (() => {

        function findDetail(detailName) {

          var data = '-';
          var classList = document.getElementsByClassName('system-requirements__label ng-binding')
        
          for (var j = 0; j < classList.length; j++) {
            if (classList[j].innerText == detailName && data == '-') {

                data = classList[j].nextElementSibling.innerText
                
            }

          }
        
          return data
        
        }

        var freeGame = {

          title: document.querySelector('h1').innerText, 
          site: "Gog", 
          link: document.location.href,
          genre: document.getElementsByClassName('details__content table__row-content')[0].innerText,
          system: document.getElementsByClassName('details__content table__row-content')[2].innerText,

          processor: findDetail('Processor:'),

          memory: findDetail('Memory:'),

          graphics: findDetail('Graphics:'),



        }
      
        return freeGame;

        })

        freeGames.push(info)

      }


  
    await browser.close();


    return freeGames;

};

async function sendGames() {

  var date = new Date();  

  fs.appendFileSync('./log.txt', `ATUALIZAÇÃO ${date.toLocaleDateString()} ${parseInt(date.getHours()) - 3}:${date.getMinutes()}\n`)

  //var freeGames = await getFreeGames();

  var freeGames = gameData;

  if (counter == 1) {
    freeGames[0].title = 'Zeldinha';
  }

  counter++

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
      console.log(`Adicionado o jogo ${newGames[i].title} (${newGames[i].site}).`)
    }
  } else {
    fs.appendFileSync('./log.txt', `Nenhum jogo novo adicionado.\n`)
    console.log("Nenhum jogo novo adicionado.")
  }


  await FreeGame.find({ "site": "Gog"}) // MUDAR PARA AS OUTRAS PLATAFORMAS 
    .then(result => {
      for (var i = 0; i < result.length; i++) {
        var gameWasRemoved = true;
        for (var j = 0; j < freeGames.length; j++) {
          if ((result[i].title === freeGames[j].title) && (result[i].site === freeGames[j].site)) {
            gameWasRemoved = false;
          }    
        }
        if (gameWasRemoved) {
          FreeGame.findOneAndDelete({ "title": result[i].title, "site": result[i].site })
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

    fs.appendFileSync('./log.txt', `\n`)


}


module.exports = { sendGames };