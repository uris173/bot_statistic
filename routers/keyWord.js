const router = require('express').Router()
const { admin } = require('../middleware/auth')
const {
  all,
  create,
  getOne,
  update,
  remove,
  changeStatus
} = require('../controllers/keyWord')

router.route('/')
.all(admin)
.get(all)
.post(create)
.put(update)

router.route('/:id')
.all(admin)
.get(getOne)
.delete(remove)

router.get('/status/:id', admin, changeStatus)


module.exports = router