
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser')
const FreeGame = require('./models/freeGame');
const UpdateLog = require('./models/updateLog');
const UserToken = require('./models/userPushToken');

const { sendNotification } = require('./notifications')
const { getFirstInterval } = require('./time')

const { sendEpicGames } = require('./epic')
const { sendGogGames } = require('./gog')


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
    //var log = fs.readFileSync('./log.txt').toString()
    UpdateLog.find()
        .then(result => {
            res.json({ log: result })
        })
        .catch(err => {
            console.log(err);
        });
    //res.json({ log });
});

app.get('/scan', (req, res) => {
    Promise.all([
        sendGogGames(), 
        sendEpicGames()
    ])
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


var interval = (getFirstInterval(20 + 3, 0) * 1000); // +3 para aws, na hora

var timing = function(){
    var timer = setInterval(function() {
        //console.log('=== ATUALIZANDO ===')
        sendGogGames()
        sendEpicGames()
        interval = 43200000; // 86400000 = 1 dia em milisegundos , fazer pela metade (43200000) 8 da manha e 8 da noite
        clearInterval(timer);
        timing();
    }, interval);
}

timing()

//sendEpicGames()