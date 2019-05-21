import jwt from 'jsonwebtoken'

const createToken = ({ id }, secret, options) => {
  const token = jwt.sign({ id }, secret, options)
  return token
}

export default createToken
