const Advertising = require('../models/advertising')
const Group = require('../models/group')
const { bot, url } = require('../bot/bot')
const batchSize = 5
let offset = 0
let isSending = false

const filterTags = (text, tagsToRemove = ['p','pre']) => {
  const tagsPattern = new RegExp(`<(${tagsToRemove.join('|')})(\\s[^>]*)?>|<\/(${tagsToRemove.join('|')})>`, 'gi');  
  const filteredText = text.replace(tagsPattern, '');  
  return filteredText;
}

const all = async (req, res) => {
  let { text, page, limit } = req.query
  limit = limit || 20
  let skip = (page || 1 - 1) * limit

  let fil = {}
  text ? fil = {text: {$regex: new RegExp(text), $options: 'i'}} : fil;

  const count = await Advertising.find({...fil}).count();
  let advertising = await Advertising.find({...fil})
  .sort({_id: -1})
  .limit(limit)
  .skip(skip)
  .lean();

  res.status(200).json({count, advertising})
}

const create = async (req, res) => {
  const newAdvertising = await new Advertising({...req.body}).save()
  let advertising = await Advertising.findById(newAdvertising._id).lean()
  advertising.text = filterTags(advertising.text)
  let response = await getAdvertising(advertising)
  if (response.ok) {
    res.status(201).json({advertising, ...response})
  }
}

const getAdvertising = async (msg) => {
  return await sendMessageToGroups(msg)
}

const sendMessageToGroups = async (data) => {
  if (isSending) return

  try {
    let group = await Group.find()
    .skip(offset)
    .limit(batchSize)

    group.forEach(val => {
      sendMessage(val.groupId, data)
    })
    offset += batchSize

    if (offset >= await Group.countDocuments()) {
      offset = 0
      isSending = false
      return {message: 'Рассылка закончена!', ok: true}
    } else {
      setTimeout(() => {
        sendMessageToGroups(data)
      }, 2000)
    }
  } catch (error) {
    console.error('Ошибка при получении пользователей из базы данных:', err);
    isSending = false;
    return {message: `Произошла ошибка!\nОшибка: ${err}`, ok: true}
  }
}

const sendMessage = (chatId, data) => {
  if (data.photo) {
    bot.sendPhoto(`${url}/${data.photo}`, chatId, {
      caption: data.text,
      parse_mode: 'HTML'
    })
    .catch((error) => {
      if (error.response && error.response.statusCode === 403) {
        console.log(`Пользователь с ID ${chatId} заблокировал бота.`);
      } else {
        console.error(`Ошибка при отправке сообщения пользователю с ID ${chatId}:`, error);
      }
    });
  } else {
    bot.sendMessage(chatId, data.text, {
      parse_mode: 'HTML'
    })
    .catch((error) => {
      if (error.response && error.response.statusCode === 403) {
        console.log(`Пользователь с ID ${chatId} заблокировал бота.`);
      } else {
        console.error(`Ошибка при отправке сообщения пользователю с ID ${chatId}:`, error);
      }
    });
  }
};


module.exports = {
  all,
  create
}