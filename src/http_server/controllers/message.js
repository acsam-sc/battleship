import { registerUser } from '../services/users.js'

const sendRegMessage = async (ws, data, error, errorText) => {
  console.log(`sendRegMessage data: ${JSON.stringify(data)}`)
  const { name, index } = data
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
      const newUser = await registerUser(user)
      // await registerUser(user)
      // console.log(`newUser: ${JSON.stringify(newUser)}`)
      await sendRegMessage(ws, newUser, false, '')
    }
  } catch (error) {
    console.log(`Error handling message: ${error}`)
  }
}