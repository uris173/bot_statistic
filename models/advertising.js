const { Schema, model } = require('mongoose')

const advertising = new Schema({
  text: String,
  photo: String,
  status: {
    type: Boolean,
    default: false
  }
})


module.exports = model('advertising', advertising)