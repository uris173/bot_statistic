const router = require('express').Router()
const { admin } = require('../middleware/auth')
const {
  all
} = require('../controllers/messages')

router.get('/', all)


module.exports = router