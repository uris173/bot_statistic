const router = require('express').Router()

router.use('/auth', require('./routers/auth'))
router.use('/badword', require('./routers/badWord'))
router.use('/keyword', require('./routers/keyWord'))
router.use('/statistic/msg', require('./routers/messate.statistic'))


module.exports = router