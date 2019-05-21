import { USER_DELETED } from '../constants'
import pubsub from '../../core/utils/pub-sub'

const userDeleted = {
  subscribe: () => pubsub.asyncIterator([USER_DELETED]),
  resolve: ({ user }) => user,
}

export default userDeleted
