const router = require('express').Router()
const { admin } = require('../middleware/auth')
const {
  all,
  replyToMessage,
  deleteMessage
} = require('../controllers/messages')

router.get('/', admin, all)
router.post('/reply', admin, replyToMessage)
router.delete('/:id', admin, deleteMessage)


module.exports = router