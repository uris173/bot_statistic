const router = require('express').Router()

router.use('/auth', require('./routers/auth'))
router.use('/badword', require('./routers/badWord'))
router.use('/keyword', require('./routers/keyWord'))
router.use('/message', require('./routers/messages'))
router.use('/statistic/msg', require('./routers/message.statistic'))


module.exports = router