const {
  bot,
} = require('../bot')
const BadWord = require('../../models/bad-words')
const Group = require('../../models/group')
const Message = require('../../models/messages')
const { getSocket  } = require('../../socket')

const groupEvents = async () => {
  const io = await getSocket()

  const messageFilter = async (groupId, from, messageId) => {
    bot.deleteMessage(groupId, messageId)
    let user = `[${from.first_name}](tg://user?id=${from.id})`
    bot.sendMessage(groupId, `${user} В этой группе запрещен мат`, {
      parse_mode: 'MarkdownV2'
    })
  }

  const newGroup = async (groupId, username, from) => {
    let newGroup = await new Group({groupId, username}).save()
    const newMessage = await new Message({group: newGroup._id, chatId: from.id, username: from.username || from.first_name}).save()
    const message = await Message.findById(newMessage._id).populate({path: 'group'})
    io.emit('message', message)
  }

  const onMessage = async (groupId, from) => {
    const group = await Group.findOne({groupId})
    const newMessage = await new Message({group: group._id, chatId: from.id, username: from.username || from.first_name}).save()
    const message = await Message.findById(newMessage._id).populate({path: 'group'})
    io.emit('message', message)
  }


  return {
    messageFilter,
    newGroup,
    onMessage
  }
} 

const groupMessage = async (groupId, msg) => {
  let event = await groupEvents()
  const word = msg.text
  const badWord = await BadWord.findOne({word})
  const group = await Group.findOne({groupId})

  if (badWord)
    return await event.messageFilter(groupId, msg.from, msg.message_id)
  if (!group) 
    return await event.newGroup(groupId, msg.chat.username || '', msg.from)
  
  await event.onMessage(groupId, msg.from)
}


module.exports = {
  groupMessage
}