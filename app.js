
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser')
const FreeGame = require('./models/freeGame');
var fs = require('fs');

const { sendGames } = require('./gog')
const { getFirstInterval } = require('./time')

const app = express();

app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.urlencoded({
    extended: true
  }));
app.use(bodyParser.json());

// autoriza o app, mudar localhost para http://54.233.108.176:3002/games (aws)
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'http://localhost:8081');
    //res.header('Access-Control-Allow-Origin', 'http://54.233.108.176:3002');
    res.header('Access-Control-Allow-Methods', 'GET');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

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
    sendGames()
        .then(() => {
            res.redirect('/')
        })
        .catch(err => {
            console.log(err);
        });
});




var interval = (getFirstInterval(20 + 3, 0) * 1000); // +3 para aws, na hora

var timing = function(){
    var timer = setInterval(function() {
        console.log('=== ATUALIZANDO ===')
        sendGames();
        interval = 43200000; // 86400000 = 1 dia em milisegundos , fazer pela metade (43200000) 8 da manha e 8 da noite
        clearInterval(timer);
        timing();
    }, interval);
}

//sendGames()
timing();


// retirar essa parte do código
// const webpush = require('web-push');

// const vapidKeys = webpush.generateVAPIDKeys();

// console.log('Public Key:', vapidKeys.publicKey);
// console.log('Private Key:', vapidKeys.privateKey);

