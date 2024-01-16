
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


// const blog_all_get = (req, res) => {
//     Blog.find().sort({ createdAt: -1 })
//     .then(result => {
//       res.json({ blogs: result} );
//     })
//     .catch(err => {
//       console.log(err);
//     });
//   };




var interval = (getFirstInterval(10, 0) * 1000);

var timing = function(){
    var timer = setInterval(function() {
        console.log('=== ATUALIZANDO ===')
        sendGames();
        interval = 43200000; // 86400000 = 1 dia em milisegundos , fazer pela metade 10 da manha e 10 da noite
        clearInterval(timer);
        timing();
    }, interval);
}

sendGames()
timing();



