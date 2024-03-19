
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser')
const FreeGame = require('./models/freeGame');
var fs = require('fs');
const UserToken = require('./models/userPushToken');

const { sendNotification } = require('./notifications')
const { sendGogGames } = require('./gog')
const { getFreeGames } = require('./epic')
const { getFirstInterval } = require('./time')

const { main } = require('./newScrapper')


const app = express();

app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.urlencoded({
    extended: true
  }));
app.use(bodyParser.json());

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'http://localhost:8081');
    res.header('Access-Control-Allow-Methods', 'GET');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

// app.use((req, res, next) => {
//     res.header('Access-Control-Allow-Origin', 'http://54.233.108.176:3002/');
//     res.header('Access-Control-Allow-Methods', 'POST');
//     res.header('Access-Control-Allow-Headers', 'Content-Type');
//     next();
// });

app.set('view engine', 'ejs');

const dbURI = 'mongodb+srv://glitchlevel:Hra4cJVdASMkzGeT@cluster0.rzdfjch.mongodb.net/glitchlevel?retryWrites=true&w=majority';
mongoose.connect(dbURI)
    .then((result) => app.listen(3002))
    .catch((err) => console.log(err));


app.get('/', (req, res) => {
    res.render('index');
});

app.get('/games', (req, res) => {
    FreeGame.find()
        .then(result => {
            res.json({ games: result} );
        })
        .catch(err => {
            console.log(err);
        });
});

app.get('/log', (req, res) => {
    var log = fs.readFileSync('./log.txt').toString()
    res.json({ log });
});

app.get('/scan', (req, res) => {
    sendGogGames()
        .then(() => {
            res.redirect('/')
        })
        .catch(err => {
            console.log(err);
        });
});

app.get('/message', (req, res) => {
    sendNotification('Teste de mensagem.')
        .then(() => {
            res.redirect('/')
        })
        .catch(err => {
            console.log(err);
        });
})

// app.post('/pushtokens', (req, res) => {
//     const token = new UserToken(req.body);
//     console.log(req.body)
//     token.save()
//       .then(() => {
//           console.log('token salvo')
//       })
//       .catch(err => {
//         console.log(err);
//       });
// })

app.post('/pushtokens', (req, res) => {
    UserToken.init()
        .then( async ()=>{
            const token = new UserToken(req.body);
            const result = await token.save();
            res.json(result);
        })
        .catch((err) => {
            res.json(err.message);
        });
})

// const token = new UserToken({
//     userId: 'idTeste', 
//     token: 'ExponentPushToken[w8wiJrAdfoMEosnr6WWyw0]'
// })
//     token.save()
//         .then(() => {
//             console.log('token salvo')
//         })
//         .catch(err => {
//             //res.json({ err: err.message });
//             console.log(err);
// });


var interval = (getFirstInterval(20 + 3, 0) * 1000); // +3 para aws, na hora

var timing = function(){
    var timer = setInterval(function() {
        console.log('=== ATUALIZANDO ===')
        sendGogGames();
        interval = 43200000; // 86400000 = 1 dia em milisegundos , fazer pela metade (43200000) 8 da manha e 8 da noite
        clearInterval(timer);
        timing();
    }, interval);
}

timing();







// SCRAP

const puppeteer = require('puppeteer-core')

async function extractHrefValues(url) {
    const browser = await puppeteer.launch({executablePath: '/usr/bin/google-chrome'})
    const page = await browser.newPage()

    await page.setExtraHTTPHeaders({ 
		'user-agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36', 
		'upgrade-insecure-requests': '1', 
		'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8', 
		'accept-encoding': 'gzip, deflate, br', 
		'accept-language': 'en-US,en;q=0.9,en;q=0.8' 
	}); 
  
    await page.goto(url);

    const hrefValues = await page.evaluate(() => {
        var aTags = document.getElementsByTagName('a')
        var links = []
        for (var i = 0; i < aTags.length; i++) {
            links.push(aTags[i].href)
        }
        return links
    })
  
    await browser.close()
  
    return hrefValues
}

extractHrefValues('https://store.epicgames.com/pt-BR/free-games')
    .then(result => {
        console.log(result)
    })