const BadWord = require('../models/bad-words')

const all = async (req, res) => {
  let { word, page, limit } = req.query
  limit = limit || 20
  page = page || 1
  let skip = (page - 1) * limit

  let fil = {}
  word ? fil = {title: {$regex: new RegExp(word), $options: 'i'}} : fil

  const count = await BadWord.find({...fil}).count()
  const badWord = await BadWord.find({...fil})
  .sort({_id: -1})
  .limit(limit)
  .skip(skip)
  .lean();

  res.status(200).json({count, badWord})
}

const create = async (req, res) => {
  let badWords = await Promise.all(req.body.words.map(async val => {
    let findBadWord = await BadWord.findOne({word: val})
    if (!findBadWord) {
      const newBadWord = await new BadWord({word: val}).save()
      return newBadWord
    } else {
      return null
    }
  }))
  badWords = keyWords.filter(val => val !== null)

  res.status(201).json(badWords)
}

const getOne = async (req, res) => {
  const badWord = await BadWord.findById(req.params.id)
  res.status(200).json(badWord)
}

const changeStatus = async (req, res) => {
  const findBadWord = await BadWord.findById(req.params.id)
  let badWord = await BadWord.findByIdAndUpdate(req.params.id, {$set: {status: !findBadWord.status}}, {new: true})
  res.status(200).json(badWord)
}

const update = async (req, res) => {
  const { _id, word } = req.body
  const findBadWord = await BadWord.findOne({word, _id: {$ne: _id}})
  if (findBadWord) return res.status(200).json({message: 'Такое слово уже существует!'})

  let badWord = await BadWord.findByIdAndUpdate(_id, {$set: {word}}, {new: true})
  res.status(200).json(badWord)
}

const remove = async (req, res) => {
  await BadWord.findByIdAndDelete(req.params.id)
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