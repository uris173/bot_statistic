const router = require('express').Router()
const { admin } = require('../middleware/auth')
const {
  all,
  create,
  getOne,
  update,
  remove
} = require('../controllers/badWord')

router.route('/')
.all(admin)
.get(all)
.post(create)
.put(update)

router.route('/:id')
.all(admin)
.get(getOne)
.delete(remove)


module.exports = router