const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const freeGameSchema = new Schema({
    title: {
        type: String,
        required: true,
        //unique : true
    },
    site: {
        type: String,
        required: true
    },
    link: {
        type: String,
        required: true
    },
    genre: {
        type: String,
        required: true
    },
    system: {
        type: String,
        required: true
    },
    processor: {
        type: String,
        required: true
    },
    memory: {
        type: String,
        required: true
    },
    images: {
        type: Array,
        required: true
    },
    graphics: {
        type: String,
        required: true
    }
    
}, { timestamps: true });

freeGameSchema.pre('validate', function(next) {

    FreeGame.find({ title: this.title })
        .then(result => {
            if (result.length > 0) {
                for (var i = 0; i < result.length; i++) {
                    if (result[i].site == this.site) {
                        return next(new Error(`Já existe o jogo desta plataforma`));
                    }
                }
            } 
            next()
        })
        .catch(err => { 
            console.log(err)
            next()
        })

});

const FreeGame = mongoose.model('FreeGame', freeGameSchema);
module.exports = FreeGame;
