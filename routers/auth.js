const router = require('express').Router()
const { admin } = require('../middleware/auth')
const {
  addAdmin,
  login,
  userVerify
} = require('../controllers/auth')

router.get('/admin', addAdmin)
router.post('/login', login)
router.get('/verify', admin, userVerify)


module.exports = router