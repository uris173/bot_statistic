const User = require('../models/user')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const addAdmin = async (req, res) => {
  const findAdmin = await User.findOne({login: 'admin'})
  if (findAdmin) return res.status(200).json({message: 'Администратор уже существует!'})

  let password = await bcrypt.hash('admin', 7)
  await new User({login: 'admin', password, role: 'admin'}).save()
  res.status(200).json({message: 'Администратор создан!'})
}

const login = async (req, res) => {
  const { login, password } = req.body

  let admin = await User.findOne({login})
  if (!admin) return res.status(404).json({message: 'Пользователь не найден!'})

  const validPass = bcrypt.compare(password, admin.password)
  if (!validPass) return res.status(403).json({message: 'Неверный пароль!'})

  const payload = {
    id: admin._id,
    login: admin.login,
    role: admin.role
  }

  const token = jwt.sign(payload, process.env.SECRET, {expiresIn: '1d'})
  res.status(200).json({
    token,
    user: payload
  })
}

const userVerify = async (req, res) => {
  const admin = await User.findById(req.user.id)
  if (!admin) return res.status(404).json({message: 'Пользователь не найден!'})

  const payload = {
    id: admin._id,
    login: admin.login,
    role: admin.role
  }
  res.status(200).json(payload)
}


module.exports = {
  addAdmin,
  login,
  userVerify
}