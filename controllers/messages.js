const { getMessage } = require('../bot/options/helper')
const KeyWord = require('../models/key-words')
const Message = require('../models/messages')
const axios = require('axios')

const all = async (req, res) => {
  let { words, page, limit } = req.query
  limit = limit || 20
  let skip = (page || 1 - 1) * limit

  let keyWords = await KeyWord.find({status: true}).lean()
  let filterWords = words ?
  words.map(val => new RegExp(val, 'i')) :
  keyWords.map(val => new RegExp(val.word, 'i'))


  let count = await Message.find().count()
  let messages = await Message.find()
  .populate({path: 'group'})
  .sort({_id: -1})
  .limit(limit)
  .skip(skip)
  .lean()

  messages = await Promise.all(messages.map(async val => {
    // let groupResult = await axios.get(`https://api.telegram.org/bot${process.env.TOKEN}/getChat?chat_id=${val.group.groupId}`)
    // if (groupResult.data.result.join_to_send_messages) {
    //   val.group.inviteLink = groupResult.data.result.invite_link
    // }
    
    // let userResult = await axios.get(`https://api.telegram.org/bot${process.env.TOKEN}/getChat?chat_id=${val.chatId}`)
    // if (userResult.data.result.username) {
    //   val.userLink = `https://t.me/${userResult.data.result.username}`
    // }

    val.message = val.group.username ? 
      `https://t.me/${val.group.username}/${val.msgId}` :
      `https://t.me/c/${val.group.groupId}/${val.msgId}`

    return val
  }))

  res.status(200).json({count, messages})
}


module.exports = {
  all
}