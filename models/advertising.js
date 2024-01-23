const { Schema, model } = require('mongoose')

const advertising = new Schema({
  sendedGroups: [{
    _id: {
      type: Schema.Types.ObjectId,
      ref: 'group'
    },
    chatId: Number
  }],
  text: String,
  photo: String,
  sendedMessage: [{
    chatId: Number,
    messageId: Number,
  }]
}, {timestamps: true})


module.exports = model('advertising', advertising)