import { combineResolvers } from 'graphql-resolvers'

import nanoid from 'nanoid'

import isAuthenticated from '../../core/validators/is-authenticated'
import createDefaultAvatar from '../utils/create-default-avatar'

import pubsub from '../../core/utils/pub-sub'
import { USER_ADDED } from '../constants'

/**
 * Add new user
 */
const addUser = combineResolvers(
  isAuthenticated,
  async (parent, { email, firstName, lastName }, { models: { User } }) => {
    const user = await User.findOne({
      where: {
        email,
      },
    })

    /**
     * Email should be unique, check if new user's email is already exists in
     * our system
     */

    if (user) {
      throw new Error('User already exists')
    }
    /**
     * Generate password
     */

    const defaultPasswordLength = 8
    const password = nanoid(defaultPasswordLength)

    /**
     * Generate avatar
     */

    const avatar = await createDefaultAvatar(`${firstName} ${lastName}`)
    const newUser = await new User({
      email,
      firstName,
      lastName,
      avatar,
      password,
    }).save()

    pubsub.publish(USER_ADDED, {
      user: newUser,
    })
    return newUser
  },
)

export default addUser
