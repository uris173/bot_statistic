const router = require('express').Router()
const { admin } = require('../middleware/auth')
const {
  all,
  create
} = require('../controllers/advertiseign')

router.get('/', admin, all)
router.post('/', admin, create)


module.exports = router