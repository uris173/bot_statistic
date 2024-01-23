const axios = require('axios')
const Group = require('../models/group')

const all = async (req, res) => {
  let { page, limit } = req.query
  limit = limit || 20
  page = page || 1
  let skip = (page - 1) * limit

  let count = await Group.find().count()
  let groups = await Group.find()
  .sort({_id: -1})
  .limit(limit)
  .skip(skip)
  .lean()

  groups = await Promise.all(groups.map(async val => {
    let res = await axios.get(`https://api.telegram.org/bot${process.env.TOKEN}/getChat?chat_id=${val.groupId}`)
    val.name = res.data.result.title

    return val
  }))

  res.status(200).json({count, groups})
}


module.exports = {
  all
}