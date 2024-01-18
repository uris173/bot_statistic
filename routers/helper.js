const router = require('express').Router()
const {
  upload
} = require('../helpers/helper')

router.post('/upload', upload)


module.exports = router