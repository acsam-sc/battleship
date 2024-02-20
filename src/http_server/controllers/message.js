import { registerUser } from '../services/users.js'

const sendRegMessage = async (ws, user, error, errorText) => {
  // console.log(`sendRegMessage data: ${JSON.stringify(user)}`)
  const { name, index } = user
  const message = JSON.stringify({
    type: "reg",
    data:
        JSON.stringify({
            name,
            index,
            error,
            errorText
        }),
    id: 0,
  })
  console.log(`sendRegMessage message: ${JSON.stringify(message)}`)
  try {
    ws.send(message)
  } catch (error) {
    console.log(`Error sending Reg Message: ${error}`)
  }
}

export const handleMessage = async (ws, message) => {
  try {
    if (message.type === 'reg') {
      const user = JSON.parse(message.data)
      await registerUser(ws.id, user)
      .then(user => {
        sendRegMessage(ws, user, false, '')
      })
      .catch((error) => sendRegMessage(ws, user, true, error))
      // console.log(`newUser: ${JSON.stringify(newUser)}`)
      // await sendRegMessage(ws, newUser, false, '')
    }
  } catch (error) {
    console.log(`Error handling message: ${error}`)
  }
}