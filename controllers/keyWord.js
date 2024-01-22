const KeyWord = require('../models/key-words')
const Messages = require('../models/messages')

const all = async (req, res) => {
  let { word, page, limit } = req.query
  limit = limit || 20
  let skip = (page || 1 - 1) * limit

  let fil = {}
  word ? fil = {word: {$regex: new RegExp(word), $options: 'i'}} : fil;

  const count = await KeyWord.find({...fil}).count();
  let keyWord = await KeyWord.find({...fil})
  .sort({_id: -1})
  .limit(limit)
  .skip(skip)
  .lean();

  keyWord = await Promise.all(keyWord.map(async val => {  
    let messagesCount = await Messages.find({
      text: {
        $regex: new RegExp(val.word), $options: 'i'
      }
    }).count()
    val.count = messagesCount

    return val
  }))

  res.status(200).json({count, keyWord})
}

const create = async (req, res) => {
  let keyWords = await Promise.all(req.body.words.map(async val => {
    let findKeyWord = await KeyWord.findOne({word: val})
    if (!findKeyWord) {
      const newKeyWord = await new KeyWord({word: val}).save()
      return newKeyWord
    }
  }))
  keyWords = keyWords.filter(val => val === null)

  res.status(201).json(keyWords)
}

const getOne = async (req, res) => {
  const keyWord = await KeyWord.findById(req.params.id)
  res.status(200).json(keyWord)
}

const changeStatus = async (req, res) => {
  const findKeyWord = await KeyWord.findById(req.params.id)
  let keyWord = await KeyWord.findByIdAndUpdate(req.params.id, {$set: {status: !findKeyWord.status}}, {new: true})
  res.status(200).json(keyWord)
}

const update = async (req, res) => {
  const { _id, word } = req.body
  const findKeyWord = await KeyWord.findOne({word, _id: {$ne: _id}})
  if (findKeyWord) return res.status(200).json({message: 'Такое слово уже существует!'})

  let keyWord = await KeyWord.findByIdAndUpdate(_id, {$set: {word}}, {new: true})
  res.status(200).json(keyWord)
}

const remove = async (req, res) => {
  await KeyWord.findByIdAndDelete(req.params.id)
  res.status(200).json({message: 'Удалено!'})
}


module.exports = {
  all,
  create,
  getOne,
  changeStatus,
  update,
  remove
}