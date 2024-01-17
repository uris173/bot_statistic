const { Schema, model } = require('mongoose')

const keyWord = new Schema({
  word: String,
  status: {
    type: Boolean,
    default: true
  }
})


module.exports = model('keyword', keyWord)