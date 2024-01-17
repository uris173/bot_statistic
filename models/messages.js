const { Schema, model } = require('mongoose')

const message = new Schema({
  chatId: Number,
  username: String,
  text: String,
  msgId: Number,
  group: {
    type: Schema.Types.ObjectId,
    ref: 'group'
  },
}, {timestamps: true})


module.exports = model('message', message)