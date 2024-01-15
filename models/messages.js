const { Schema, model } = require('mongoose')

const message = new Schema({
  chatId: Number,
  username: String,
  groupId: {
    type: Schema.Types.ObjectId,
    ref: 'group'
  },
}, {timestamps: true})


module.exports = model('message', message)