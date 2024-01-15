const { Schema, model } = require('mongoose')

const group = new Schema({
  groupId: Number,
  username: String,
}, {timestamps: true})


module.exports = model('group', group)