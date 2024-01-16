const { Server } = require('socket.io')

let io;

function initSocket(server) {
  io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
      credentials: true
    }
  })

  io.on('connection', (socket) => {
    console.log('Socket.io client connected!');

    socket.on('disconnect', () => {
      console.log('Socket.io client disconnected!');
    })
  });
}

function getSocket() {
  return new Promise((resolve, reject) => {
    if (io) {
      resolve(io)
    } else {
      reject(new Error('Socket.io has not been initialized yet.'))
    }
  })
}


module.exports = { initSocket, getSocket }