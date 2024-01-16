const {
  bot,
  
} = require('../bot')
const { groupMessage } = require('../on-message/group')
const {

} = require('../on-message/main')

bot.on('message', async msg => {
  let type = msg.chat.type
  let chatId = msg.chat.id

  if (type === 'group' || type === 'supergroup')
    await groupMessage(chatId, msg)
})