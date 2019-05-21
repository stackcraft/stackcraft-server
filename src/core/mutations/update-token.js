import moment from 'moment'

import { AuthenticationError } from 'apollo-server-koa'

import createToken from '../utils/create-token'

/**
 * Mutation is performed when the access token expires. Access and refresh
 * tokens are updated and returned to the user with an access token's lifetime.
 * Refresh token is saved in the database
 */

const updateToken = async (parent, { token }, { models: { User }, secret }) => {
  const user = await User.findOne({
    where: {
      token,
    },
  })
  if (!user) {
    throw new AuthenticationError('Invalid refresh token')
  }

  const newRefreshToken = createToken(user, secret, {
    algorithm: 'HS512',
    expiresIn: '7d',
  })
  await user.update({
    token: newRefreshToken,
  })

  /*
   * Access token life time in minutes
   */
  const tokenLifeTime = 30

  return {
    accessToken: createToken(user, secret, {
      algorithm: 'HS256',
      expiresIn: `${tokenLifeTime}m`,
    }),
    refreshToken: newRefreshToken,
    tokenExpires: moment()
      .add(tokenLifeTime, 'minutes')
      .toDate(),
  }
}

export default updateToken
