require('dotenv').config()
const express = require('express')
const app = express()
const mongoose = require('mongoose')
const cors = require('cors')
const http = require('http')
const server = http.createServer(app)
const { initSocket } = require('./socket')
const router = require('./routes')

initSocket(server)
require('./bot/bot')

app.use(cors())
app.use(express.json());
app.use(router)

const PORT = 3010

const dev = async () => {
  try {
    mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB connected!'))
    .catch(error => console.log(error))
    server.listen(PORT, () => console.log(`Server is running on ${PORT} PORT`))
  } catch (error) {
    console.log(error);
  }
}

dev()