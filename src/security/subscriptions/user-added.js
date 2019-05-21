import { USER_ADDED } from '../constants'
import pubsub from '../../core/utils/pub-sub'

const userAdded = {
  subscribe: () => pubsub.asyncIterator([USER_ADDED]),
  resolve: ({ user }) => user,
}

export default userAdded
