const router = require('express').Router()

router.use('/auth', require('./routers/auth'))
router.use('/badword', require('./routers/badWord'))


module.exports = router