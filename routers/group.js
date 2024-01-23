const router = require('express').Router()
const { admin } = require('../middleware/auth')
const {
  all
} = require('../controllers/group')

router.get('/', admin, all)


module.exports = router