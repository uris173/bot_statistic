const Message = require('../models/messages')
const Group = require('../models/group')
const KeyWord = require('../models/key-words')
const { getStatisticArray } = require('../helpers/helper')
const axios = require('axios')

const all = async (req, res) => {
  let keyWordCount = await KeyWord.find().count()
  let keyWords = await KeyWord.find({status: true}).lean()
  keyWords = keyWords.map(val => new RegExp(val.word, 'i'))
  const groupsCount = await Group.find().count()

  let groups = await Message.aggregate([
    {
      $group: {
        _id: '$group',
        msgCount: {$sum: 1}
      }
    },
    {
      $sort: {msgCount: -1}
    },
    {
      $limit: 5
    }
  ])
  groups = await Promise.all(groups.map(async val => {
    let group = await Group.findById(val._id)
    let res = await axios.get(`https://api.telegram.org/bot${process.env.TOKEN}/getChat?chat_id=${group.groupId}`)
    val.groupName = res.data.result.title
    val.keyWordMsg = await Message.find({group: val._id, text: {$in: keyWords}}).count()
    if (res.data.result.join_to_send_messages) 
      val.link = res.data.result.invite_link

    return val
  }))

  const allMessages = await Message.find().count()
  const keyWordMessages = await Message.find({text: {$in: keyWords}}).count()

  res.status(200).json({
    keyWords: keyWordCount,
    groupsCount,
    groupsInfo: groups,
    messages: allMessages,
    keyWordMessages
  })
}

const shortWay = async (fil, number, wordsArr, type) => {
  let wordsFil = { status: true }
  wordsArr ? {...wordsFil, word: {$in: wordsArr}} : wordsFil
  let keyWord = await KeyWord.find(wordsFil).lean()
  let words = keyWord.map(val => new RegExp(val.word, 'i'))

  let messages = await Message.find({...fil}).lean()
  messages = getStatisticArray(messages, number, type)

  let keyWordMessages = await Message.find({
    ...fil, 
    text: {$in: words}
  }).lean()
  keyWordMessages = getStatisticArray(keyWordMessages, number, type)

  return {messages, keyWordMessages}
}

const dailyStatistic = async (req, res) => {
  let startDay = new Date()
  let endDay = new Date()
  startDay.setHours(0, 0, 0, 0)
  endDay.setHours(29, 59, 59, 999)

  let fil = {
    createdAt: {$gte: startDay, $lt: endDay},
  }

  let keyWord = await KeyWord.find({status: true}).lean()
  let words = keyWord.map(val => new RegExp(val.word, 'i'))

  const messages = await Message.find({...fil}).count()
  const keyWordMessages = await Message.find({
    ...fil, 
    text: {$in: words}
  }).count()

  res.status(200).json({messages, keyWordMessages})
}

const weeklyStatistic = async (req, res) => {
  let startDate = new Date();
  let endDate = new Date();
  startDate.setDate(startDate.getDate() - startDate.getDay() -1);
  endDate.setDate(endDate.getDate() + (7 - endDate.getDay()));

  const { groups, words } = req.query
  let fil = {
    createdAt: {
      $gte: startDate, 
      $lte: endDate
    }
  }
  groups ? fil = {...fil, groupId: {$in: groups}} : fil

  let data = await shortWay(fil, 7, words || null, 'week')
  res.status(200).json(data)
}

const mothlyStatistic = async (req, res) => {
  let {groups, words, month, year} = req.query
  
  const date = new Date()
  const currentYear = parseInt(year) || date.getFullYear()
  const currentMonth = parseInt(month) || date.getMonth()
  let daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()

  let fil = {
    createdAt: {
      $gte: new Date(currentYear, currentMonth, 1),
      $lte: new Date(currentYear, currentMonth +1, 0)
    }
  }
  groups ? fil = {...fil, groupId: {$in: groups}} : fil

  let data = await shortWay(fil, daysInMonth, words || null, 'month')
  res.status(200).json(data)
}

const yeary = async (req, res) => {
  let {groups, words, year} = req.query
  const date = new Date()
  const currentYear = parseInt(year) || date.getFullYear()

  let fil = {
    createdAt: {
      $gte: new Date(currentYear, 0, 1),
      $lte: new Date(currentYear + 1, 0, 1)
    },
  }
  groups ? fil = {...fil, groupId: {$in: groups}} : fil

  let data = await shortWay(fil, 12, words || null, 'year')
  res.status(200).json(data)
}


module.exports = {
  all,
  dailyStatistic,
  weeklyStatistic,
  mothlyStatistic,
  yeary
}