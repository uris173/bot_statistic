const Message = require('../models/messages')
const Group = require('../models/group')
const KeyWord = require('../models/key-words')
const { getStatisticArray } = require('../helpers/helper')

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
  dailyStatistic,
  weeklyStatistic,
  mothlyStatistic,
  yeary
}