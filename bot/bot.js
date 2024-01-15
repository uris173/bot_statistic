const TelegramBot = require("node-telegram-bot-api");

const bot = new TelegramBot(process.env.TOKEN, {
  polling: true
})

const sliceIntoChunks = (arr, chunkSize) => {
  const res = [];
  for (let i = 0; i < arr.length; i += chunkSize) {
    const chunk = arr.slice(i, i + chunkSize);
    res.push(chunk);
  }
  return res;
}
const commands = ['/start']
const url = ''
const adminId = 664971362


module.exports = {
  sliceIntoChunks,
  bot,
  commands,
  url,
  adminId
}