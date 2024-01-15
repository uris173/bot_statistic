const { Schema, model } = require('mongoose')

const badWord = new Schema({
  word: String
})


module.exports = model('badword', badWord)