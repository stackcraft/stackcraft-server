/**
 * Remove refresh token from database on user logout
 */

const logOut = async (parent, args, { models: { User }, currentUser }) => {
  const { id } = currentUser
  const user = await User.findOne({
    where: {
      id,
    },
  })
  await user.update({
    token: null,
  })
  return user
}

export default logOut
