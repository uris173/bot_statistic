const { Schema, model } = require('mongoose')

const user = new Schema({
  login: String,
  role: String,
  password: String
})


module.exports = model('user', user)