const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const updateLogSchema = new Schema({
    token: {
        type: Array,
      },
}, { timestamps: true });

const UpdateLog = mongoose.model('UpdateLog', updateLogSchema);
module.exports = UpdateLog;