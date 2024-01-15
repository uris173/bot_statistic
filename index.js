const express = require('express')
const app = express()
const mongoose = require('mongoose')
const cors = require('cors')
const http = require('http')
const server = http.createServer(app)
const { initSocket } = require('./socket')
require('dotenv').config()

initSocket(server)

app.use(cors())
app.use(express.json());

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