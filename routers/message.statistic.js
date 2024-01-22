const router = require('express').Router()
const { admin } = require('../middleware/auth')
const {
  all,
  dailyStatistic,
  weeklyStatistic,
  mothlyStatistic,
  yeary
} = require('../controllers/message.statistic')

router.get('/all', admin, all)
router.get('/daily', admin, dailyStatistic)
router.get('/weekly', admin, weeklyStatistic)
router.get('/monthly', admin, mothlyStatistic)
router.get('/yearly', admin, yeary)


module.exports = router