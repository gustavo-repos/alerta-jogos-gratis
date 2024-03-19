const FreeGame = require('./models/freeGame');
var fs = require('fs');
const { makeRequest, getData } = require('./scraper')
const { sendNotification } = require('./notifications')

const { main } = require('./customScraper')

const getFreeGames = async () => {

getData('store.epicgames.com','/en-US/free-games')







    // var freeGames = [];
    // const mainPage = await extractHrefValues('https://store.epicgames.com/pt-BR/browse?sortBy=releaseDate&sortDir=DESC&priceTier=tierFree&category=Game&count=40&start=0')
    // console.log(mainPage)
    // let elements = mainPage.getElementsByClassName('css-g3jcms')

    // let links = [];
    // for (var element of elements) {
    //     links.push(element.href);
    // }
    // console.log(elements.length)
    // console.log(links)

//     // for (var i = 0; i < 1; i++) {
//     for (var i = 0; i < links.length; i++) {
//         const gamePage =  await makeRequest(links[i])

//           function getImages() {
//             var imagesclassArray = gamePage.getElementsByClassName('productcard-thumbnails-slider__image')
//             var imagesSrc = []
//             for (var j = 0; j < imagesclassArray.length; j++) {
//               imagesSrc.push(imagesclassArray[j].src)
//             }
//             return imagesSrc
//           }

//           var freeGame = {
//             title: gamePage.querySelector('h1').textContent.trim(), 
//             site: "Gog", 
//             link: links[i],
//             genre: gamePage.getElementsByClassName('details__content table__row-content')[0].textContent.replace(/\s+/g, ' '),
//             // .replace(/\s/g, '').replace(/-/g, ' - ')
//             system: gamePage.getElementsByClassName('table__row-content')[2].textContent.trim(),
//             images: getImages(),
//           }
//           //console.log(gamePage.getElementsByClassName('details__content table__row-content')[0].textContent.replace(/\s+/g, ' '))
//           freeGames.push(freeGame)
//     }

//     return freeGames;

}

// async function sendEpicGames() {

//   var date = new Date();  

//   fs.appendFileSync('./log.txt', `ATUALIZAÇÃO ${date.toLocaleDateString()} ${parseInt(date.getHours()) - 3}:${date.getMinutes()}\n`)

//   var freeGames = await getFreeGames();

//   //início dummy content
//     // var freeGames = gameData;

//     // if (counter == 1) {
//     //   freeGames[0].title = 'Zeldinha';
//     // }

//     // counter++
//     //fim dump content

//   var newGames = []

//   for (var i = 0; i < freeGames.length; i++) {

//       await (new FreeGame(freeGames[i])).save()
//         .then(() => {
//           newGames.push(freeGames[i])
//         })
//         .catch(err => {
//           if (!err.code === 11000) {
//             console.log(err);
//           }
          
//          });
      
//   }

//   if (newGames.length > 0) {
//     for (var i = 0; i < newGames.length; i++) {
//       fs.appendFileSync('./log.txt', `Adicionado o jogo ${newGames[i].title} (${newGames[i].site}).\n`)
//       sendNotification(`O jogo ${newGames[i].title} foi adicionado na plataforma ${newGames[i].site}!`)
//       console.log(`Adicionado o jogo ${newGames[i].title} (${newGames[i].site}).`)
//     }
//   } else {
//     fs.appendFileSync('./log.txt', `Nenhum jogo novo adicionado.\n`)
//     console.log("Nenhum jogo novo adicionado.")
//   }


//   await FreeGame.find({ "site": "Gog"}) 
//     .then(async result => {
//       for (var i = 0; i < result.length; i++) {
//         var gameWasRemoved = true;
//         for (var j = 0; j < freeGames.length; j++) {
//           if ((result[i].title === freeGames[j].title) && (result[i].site === freeGames[j].site)) {
//             gameWasRemoved = false;
//           }    
//         }
//         if (gameWasRemoved) {
//           await FreeGame.findOneAndDelete({ "title": result[i].title, "site": result[i].site })
//             .then(result => {
//               fs.appendFileSync('./log.txt', `Removido o jogo ${result.title} (${result.site}).\n`)
//               console.log(`Removido o jogo ${result.title} (${result.site}).`)
//             })
//             .catch(err => {
//               console.log(err)
//             })
//         }
//       }
//     })
//     .catch(err => {
//       console.log(err)
//     });

//   fs.appendFileSync('./log.txt', `Fim da atualização\n\n`)

// }


module.exports = { getFreeGames }