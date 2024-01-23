const router = require('express').Router()
const { admin } = require('../middleware/auth')
const {
  all,
  create,
  getOne,
  update,
  remove
} = require('../controllers/advertiseign')

router.get('/', admin, all)
router.post('/', admin, create)
router.get('/:id', admin, getOne)
router.put('/', admin, update)
router.delete('/:id', admin, remove)


module.exports = router