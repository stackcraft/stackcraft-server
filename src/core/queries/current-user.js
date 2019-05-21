/**
 * Get current user
 */

const currentUser = async (
  parent,
  args,
  { models: { User }, currentUser: current },
) => {
  if (!current) {
    return null
  }
  const { id } = current
  const user = await User.findOne({
    where: {
      id,
    },
  })
  return user
}

export default currentUser
