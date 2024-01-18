const router = require('express').Router()

router.use('/auth', require('./routers/auth'))
router.use('/badword', require('./routers/badWord'))
router.use('/keyword', require('./routers/keyWord'))
router.use('/message', require('./routers/messages'))
router.use('/advertising', require('./routers/advertising'))
router.use('/statistic/msg', require('./routers/message.statistic'))

router.use('/upload', require('./routers/helper'))


module.exports = router