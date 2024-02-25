import { registerUser, getUserByWsId, sendRegMessage } from '../services/users.js'
import { createRoom, addUserToRoom, addShipsToUser } from '../services/rooms.js'
import { handleAttackMessage } from '../services/battlefield.js'

export const handleMessage = async (ws, message) => {
  let data
  if (message.data) data = JSON.parse(message.data)
  try {
    if (message.type === 'reg') {
      const user = data
      await registerUser(ws, user)
      .then(async (user) => {
        await sendRegMessage(ws, user, false, '')
        console.log(`Registered new user "${user.name}"`)
      })
      .catch((error) => sendRegMessage(ws, user, true, error))
    } else if (message.type === 'create_room') {
        const user = await getUserByWsId(ws.id)
        await createRoom(user)
    } else if (message.type === 'add_user_to_room') {
        const roomIndex = data.indexRoom
        const user = await getUserByWsId(ws.id)
        await addUserToRoom(roomIndex, user)
    } else if (message.type === 'add_ships') {
      addShipsToUser(data)
    } else if (message.type === 'attack') {
      handleAttackMessage(data)
    }
  } catch (error) {
    console.log(`Error handling message: ${error}`)
  }
}