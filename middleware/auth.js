const jwt = require('jsonwebtoken')

const admin = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]
    if (!token) {
      return res.json({message: "Auth error!"})
    }
    const decoded = jwt.verify(token, process.env.KEY)
    if (decoded.role === 'admin') {
      req.user = decoded
      next()
    } else {
      return res.status(401).json({message: "You don't have access"})
    }
  } catch (error) {
    res.status(500).json(error)
  }
}


module.exports = {
  admin
}