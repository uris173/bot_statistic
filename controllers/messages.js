const { getMessage } = require('../bot/options/helper')
const KeyWord = require('../models/key-words')
const Message = require('../models/messages')
const axios = require('axios')
const { bot } = require('../bot/bot')

const all = async (req, res) => {
  let { words, groupId, page, limit } = req.query
  console.log(words);
  limit = limit || 20
  page = page || 1
  let skip = (page - 1) * limit

  let fil = {}
  words ? fil = {...fil, text: {$in: words.map(val => new RegExp(val, 'i'))}} : fil
  groupId ? fil = {...fil, group: groupId} : fil

  let count = await Message.find({...fil}).count()
  let messages = await Message.find({...fil})
  .populate({path: 'group'})
  .sort({_id: -1})
  .limit(limit)
  .skip(skip)
  .lean()

  messages = await Promise.all(messages.map(async val => {
    let res = await axios.get(`https://api.telegram.org/bot${process.env.TOKEN}/getChat?chat_id=${val.group.groupId}`)
    val.group.name = res.data.result.title
    val.group.link = res.data.result.invite_link
    val.message = val.group.username ? 
      `https://t.me/${val.group.username}/${val.msgId}` :
      `https://t.me/c/${val.group.groupId.toString().slice(4)}/${val.msgId}`

    return val
  }))

  res.status(200).json({count, messages})
}

const replyToMessage = async (req, res) => {
  const {_id, text} = req.body
  const message = await Message.findById(_id).populate('group')
  bot.sendMessage(message.group.groupId, text, {
    reply_to_message_id: message.msgId
  }).catch(error => {
    return res.status(501).json({message: 'Что-то пошло не так!', error})
  })
  res.status(201).json({message: 'Отвечено на сообщение!'})
}

const deleteMessage = async (req, res) => {
  const _id = req.params.id
  const message = await Message.findById(_id).populate('group')
  bot.deleteMessage(message.group.groupId, message.msgId)
  .catch(error => {
    return res.status(501).json({message: 'Что-то пошло не так!', error})
  })

  await Message.findByIdAndDelete(_id)
  res.status(200).json({message: 'Удалено!'})
}


module.exports = {
  all,
  replyToMessage,
  deleteMessage
}