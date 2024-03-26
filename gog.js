const FreeGame = require('./models/freeGame');
const UpdateLog = require('./models/updateLog');
const { makeRequest } = require('./scraper');
var date;
var startTime;
var endTime;
var log = [];

const { sendNotification } = require('./notifications');

const getFreeGames = async () => {
    date = new Date();
    startTime = date.getTime();
    log.push(`Início da atualização da Gog ${date.toLocaleDateString("en-GB")} às ${parseInt(date.getHours()) - 3}:${String(date.getMinutes()).padStart(2, "0")}`);

    var freeGames = [];

    const mainPage = await makeRequest('https://www.gog.com/partner/free_games');

    let elements = mainPage.getElementsByClassName('product-row__link');

    let links = [];
    for (var element of elements) {
        links.push('https://www.gog.com' + element.href);
    }

    for (var i = 0; i < links.length; i++) {
        const gamePage = await makeRequest(links[i]);

        function getImages() {
            var imagesclassArray = gamePage.getElementsByClassName('productcard-thumbnails-slider__image');
            var imagesSrc = [];
            for (var j = 0; j < imagesclassArray.length; j++) {
                imagesSrc.push(imagesclassArray[j].src);
            }
            return imagesSrc;
        }

        var freeGame = {
            title: gamePage.querySelector('h1').textContent.trim(),
            site: "Gog",
            link: links[i],
            genre: gamePage.getElementsByClassName('details__content table__row-content')[0].textContent.replace(/\s+/g, ' '),
            images: getImages(),
        };
        freeGames.push(freeGame);
    }
    date = new Date();
    endTime = date.getTime();
    log.push(`O scrap durou ${(endTime - startTime) / 1000}s.`);
    return freeGames;
};

async function sendGogGames() {
    var freeGames = await getFreeGames();
    var newGames = [];

    for (var i = 0; i < freeGames.length; i++) {
        await (new FreeGame(freeGames[i])).save()
            .then(() => {
                newGames.push(freeGames[i]);
            })
            .catch(err => {
                if (!err.code === 11000) {
                    console.log(err);
                }
            });
    }

    if (newGames.length > 0) {
        for (var i = 0; i < newGames.length; i++) {
            log.push(`Adicionado o jogo ${newGames[i].title} (${newGames[i].site}).`);
            sendNotification(`O jogo ${newGames[i].title} foi adicionado na plataforma ${newGames[i].site}!`);
        }
    } else {
        log.push(`Nenhum jogo novo adicionado na Gog.`);
    }

    await FreeGame.find({ "site": "Gog" })
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
                            log.push(`Removido o jogo ${result.title} (${result.site}).`);
                        })
                        .catch(err => {
                            console.log(err);
                        });
                }
            }
        })
        .catch(err => {
            console.log(err);
        });

    log.push(`Fim da atualização da Gog.`);
    console.log(log);
    await new UpdateLog({ log }).save();
}

module.exports = { sendGogGames };
