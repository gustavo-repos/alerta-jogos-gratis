const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userPushTokenSchema = new Schema({
    token: {
        type: String,
        required: true,
        unique: true,
      },
}, { timestamps: true });

// userPushTokenSchema.pre('save', async function(next) {
//     const existingToken = await this.constructor.findOne({ userId: this.userId });
//     if (existingToken) {
//       existingToken.token = this.token;
//       await existingToken.save();
//       console.log('Token de notificação push atualizado para o usuário:', this.userId);
//       next(new Error('Token atualizado'));
//     } else {
//       next();
//     }
//   });

const UserToken = mongoose.model('UserToken', userPushTokenSchema);
module.exports = UserToken;