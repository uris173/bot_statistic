const Advertising = require('../models/advertising')
const Group = require('../models/group')
const { bot, url } = require('../bot/bot')
const axios = require('axios')
const batchSize = 1
let offset = 0
let isSending = false

const filterTags = (text, tagsToRemove = ['p','pre']) => {
  const tagsPattern = new RegExp(`<(${tagsToRemove.join('|')})(\\s[^>]*)?>|<\/(${tagsToRemove.join('|')})>`, 'gi');  
  const filteredText = text.replace(tagsPattern, '');  
  return filteredText;
}

const all = async (req, res) => {
  let { text, group, page, limit } = req.query
  limit = limit || 20
  let skip = (page || 1 - 1) * limit

  let fil = {}
  text ? fil = {...fil, text: {$regex: new RegExp(text), $options: 'i'}} : fil;
  group ? fil = {...fil, sendedMessage: {$elemMatch: {_id: group}}} : fil

  const count = await Advertising.find({...fil}).count();
  let advertising = await Advertising.find({...fil})
  // .populate({path: 'sendedGroups._id'})
  .sort({_id: -1})
  .limit(limit)
  .skip(skip)
  .lean();

  advertising = await Promise.all(advertising.map(async val => {
    const updatedSendedGroups = await Promise.all(val.sendedGroups.map(async el => {
      const response = await axios.get(`https://api.telegram.org/bot${process.env.TOKEN}/getChat?chat_id=${el.chatId}`);
      el.name = response.data.result.title;  
      return el;
    }));
    val.sendedGroups = updatedSendedGroups;

    return val
  }))

  res.status(200).json({count, advertising})
}

const create = async (req, res) => {
  const newAdvertising = await new Advertising({...req.body}).save()
  let advertising = await Advertising.findById(newAdvertising._id).lean()
  advertising.text = filterTags(advertising.text)
  await sendMessageToGroups(advertising)
  res.status(201).json({advertising, message: 'Рассылка началась!'})
}

const sendMessageToGroups = async (data) => {
  if (isSending) return

  try {
    const startIndex = offset * batchSize
    const endIndex = startIndex + batchSize
    let groups = data.sendedGroups.slice(startIndex, endIndex)

    groups.forEach(val => {
      sendMessage(val.chatId, data)
    })
    offset += batchSize

    if (offset >= data.sendedGroups.length) {
      offset = 0
      isSending = false
    } else {
      setTimeout(() => {
        sendMessageToGroups(data)
      }, 500)
    }
  } catch (error) {
    console.error('Ошибка при получении пользователей из базы данных:', err);
    isSending = false;
  }
}

const sendMessage = (chatId, data) => {
  if (data.photo) {
    bot.sendPhoto(`${url}/${data.photo}`, chatId, {
      caption: data.text,
      parse_mode: 'HTML'
    })
    .then(async result => {
      let messageId = result.message_id
      let chatId = result.chat.id

      let findChat = await Advertising.findOne({_id: data._id, sendedMessage: {
        $elemMatch: {messageId, chatId}
      }})
      if (!findChat) {
        await Advertising.updateOne({_id: data._id}, {$push: {
          sendedMessage: {chatId, messageId}
        }})
      }
    }).catch((error) => {
      if (error.response && error.response.statusCode === 403) {
        console.log(`Пользователь с ID ${chatId} заблокировал бота.`);
      } else {
        console.error(`Ошибка при отправке сообщения пользователю с ID ${chatId}:`, error);
      }
    });
  } else {
    bot.sendMessage(chatId, data.text, {
      parse_mode: 'HTML'
    }).then(async result => {
      let messageId = result.message_id
      let chatId = result.chat.id

      let findChat = await Advertising.findOne({_id: data._id, sendedMessage: {
        $elemMatch: {messageId, chatId}
      }})
      if (!findChat) {
        await Advertising.updateOne({_id: data._id}, {$push: {
          sendedMessage: {chatId, messageId}
        }})
      }
    }).catch((error) => {
      if (error.response && error.response.statusCode === 403) {
        console.log(`Пользователь с ID ${chatId} заблокировал бота.`);
      } else {
        console.error(`Ошибка при отправке сообщения пользователю с ID ${chatId}:`, error);
      }
    });
  }
};

const getOne = async (req, res) => {
  const advertiseign = await Advertising.findById(req.params.id)
  res.status(200).json(advertiseign)
}

const update = async (req, res) => {
  const {_id, text, photo} = req.body

  let advertising = await Advertising.findByIdAndUpdate(_id, {$set: {text, photo}}, {new: true}).lean()
  await editMessageFromGroup(advertising)
  res.status(200).json(advertising)
}

const editMessageFromGroup = async (data) => {
  if (isSending) return

  try {
    const startIndex = offset * batchSize
    const endIndex = startIndex + batchSize
    let groups = data.sendedMessage.slice(startIndex, endIndex)

    groups.forEach(val => {
      editMessage(val.chatId, val.messageId, data)
    })
    offset += batchSize

    if (offset >= data.sendedMessage.length) {
      offset = 0
      isSending = false
    } else {
      setTimeout(() => {
        editMessageFromGroup(data)
      }, 500)
    }
  } catch (error) {
    console.error('Ошибка при получении пользователей из базы данных:', err);
    isSending = false;
  }
}

const editMessage = (chatId, messageId, data) => {
  if (data.photo) {
    bot.editMessageMedia({
      type: 'photo',
      media: `${url}/${data.photo}`,
      caption: data.text,
      parse_mode: 'HTML'
    }, {chat_id: chatId, message_id: messageId})
    .catch((error) => {
      if (error.response && error.response.statusCode === 403) {
        console.log(`Пользователь с ID ${chatId} заблокировал бота.`);
      } else {
        console.error(`Ошибка при отправке изменнении фото с ID ${chatId}:`, error);
      }
    });
  } else {
    bot.editMessageText(data.text, {
      chat_id: chatId,
      message_id: messageId,
      parse_mode: 'HTML'
    })
    .catch((error) => {
      if (error.response && error.response.statusCode === 403) {
        console.log(`Пользователь с ID ${chatId} заблокировал бота.`);
      } else {
        console.error(`Ошибка при отправке изменнении текста с ID ${chatId}:`, error);
      }
    });
  }
}

const remove = async (req, res) => {
  const advertising = await Advertising.findById(req.params.id)
  await deleteMessage(advertising)
  await Advertising.findByIdAndDelete(req.params.id)
  res.status(200).json({message: 'Удалено!'})
}

const deleteMessage = async (data) => {
  if (isSending) return

  try {
    const startIndex = offset * batchSize
    const endIndex = startIndex + batchSize
    let groups = data.sendedMessage.slice(startIndex, endIndex)

    groups.forEach(val => {
      bot.deleteMessage(val.chatId, val.messageId)
    })
    offset += batchSize

    if (offset >= data.sendedMessage.length) {
      offset = 0
      isSending = false
    } else {
      setTimeout(() => {
        deleteMessage(data)
      }, 500)
    }
  } catch (error) {
    console.error('Ошибка при удалении сообщения из базы:', err);
    isSending = false;
  }
}


module.exports = {
  all,
  create,
  getOne,
  update,
  remove
}