import moment from 'moment'

import createToken from '../utils/create-token'
import validatePassword from '../utils/validate-password'

/**
 * Log in
 *
 * User logs in to the application, passing the email and the password to the
 * server. The server verify the authenticity of the login / password. In case
 * of success, it generates and sends the client two tokens (access token and
 * refresh token) and the time of access token's death (tokenExpires field in
 * unix timestamp). User id is adding to the token payload
 */

const logIn = async (
  parent,
  { email, password },
  { models: { User }, secret },
) => {
  const user = await User.findOne({
    where: {
      email,
    },
  })

  /**
   * Check if user is not exists in the system
   */

  if (!user) {
    throw new Error('No user found with this email')
  }

  const isValid = await validatePassword(password, user.password)

  if (!isValid) {
    throw new Error('Invalid password')
  }
  const refreshToken = createToken(user, secret, {
    algorithm: 'HS512',
    expiresIn: '7d',
  })

  /**
   * Save user's refresh token in database
   */

  await user.update({
    token: refreshToken,
  })

  /**
   * Access token life time in minutes
   */

  const tokenLifeTime = 30

  return {
    accessToken: createToken(user, secret, {
      algorithm: 'HS256',
      expiresIn: `${tokenLifeTime}m`,
    }),
    refreshToken,
    tokenExpires: moment()
      .add(tokenLifeTime, 'minutes')
      .toDate(),
  }
}

export default logIn
