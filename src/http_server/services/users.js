export const users = []

export const registerUser = async (user) => {
  const { name, password } = user
  const index = users.length
  console.log(`index: ${index}, name: ${name}, password: ${password}`)
  try {
    if (typeof name === 'string' && typeof password === 'string') {
      const newUser = {index, name, password}
      users.push(newUser)
      console.log(`users pushed`)
      return Promise.resolve(newUser)
    // } else Promise.reject('login and password should be strings')
    }
  } catch {
    console.log(`error: ${error}`)
  }
}