import bcrypt from 'bcrypt'

/**
 * Compare two passwords to validate
 */

const validatePassword = async (password, userPassword) => {
  const isValid = await bcrypt.compare(password, userPassword)
  return isValid
}

export default validatePassword
