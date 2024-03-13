const FreeGame = require('./models/freeGame');
const { gameData } = require('./freeGameTest')
var fs = require('fs');
const { makeRequest } = require('./scraper')

async function getFreeGames() {
  try {
    const url = "https://www.gog.com/partner/free_games";
    const document = await makeRequest(url);

    const baseUrl = document.baseURI; // Obtém o URL base da página
    console.log(baseUrl)

    const links = Array.from(document.getElementsByClassName('product-row__link')).map(element => {
      element.href
    });
    
    const freeGames = [];

    for (const link of links) {
      const info = await makeRequest(link).then(parsedDocument => {
        function findDetail(detailName) {
          const classList = parsedDocument.getElementsByClassName('system-requirements__label ng-binding');
          for (const element of classList) {
            if (element.innerText === detailName) {
              return element.nextElementSibling.innerText;
            }
          }
          return '-';
        }

        function getImages() {
          const imagesClassArray = parsedDocument.getElementsByClassName('productcard-thumbnails-slider__image');
          const imagesSrc = Array.from(imagesClassArray, element => element.src);
          return imagesSrc;
        }

        return {
          title: parsedDocument.querySelector('h1').innerText,
          site: "Gog",
          link: link,
          genre: parsedDocument.getElementsByClassName('details__content table__row-content')[0].innerText,
          system: parsedDocument.getElementsByClassName('details__content table__row-content')[2].innerText,
          processor: findDetail('Processor:'),
          memory: findDetail('Memory:'),
          images: getImages(),
          graphics: findDetail('Graphics:'),
        };
      });

      freeGames.push(info);
    }

    return freeGames;
  } catch (error) {
    console.error(error);
    return [];
  }
}

async function sendGames() {

  var date = new Date();  

  fs.appendFileSync('./log.txt', `ATUALIZAÇÃO ${date.toLocaleDateString()} ${parseInt(date.getHours()) - 3}:${date.getMinutes()}\n`)

  var freeGames = await getFreeGames();

  //início dummy content
    // var freeGames = gameData;

    // if (counter == 1) {
    //   freeGames[0].title = 'Zeldinha';
    // }

    // counter++
    //fim dump content

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


module.exports = { sendGames };