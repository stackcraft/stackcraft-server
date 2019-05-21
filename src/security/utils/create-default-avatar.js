import gm from 'gm'
import fs from 'fs'

import nanoid from 'nanoid'

import first from 'lodash/first'
import reduce from 'lodash/reduce'
import sample from 'lodash/sample'
import slice from 'lodash/slice'
import split from 'lodash/split'
import toUpper from 'lodash/toUpper'
import trim from 'lodash/trim'

const generateAvatar = (name, callback) => {
  const colors = [
    '#e74c3c',
    '#e67e22',
    '#f1c40f',
    '#2ecc71',
    '#3498db',
    '#9b59b6',
  ]

  const width = 200
  const height = 200

  const getInitials = fullName => {
    const firstElemIndex = 0
    const initialsLength = 2
    return toUpper(
      reduce(
        slice(split(trim(fullName), ' '), firstElemIndex, initialsLength),
        (result, namePart) => result + first(namePart),
        '',
      ),
    )
  }

  const bgColor = sample(colors)
  const fontColor = '#fff'
  const text = getInitials(name)
  const fontSize = 96
  const textPosition = 0
  const font = `${__dirname}/../assets/font.ttf`

  gm(width, height, bgColor)
    .fill(fontColor)
    .font(font)
    .drawText(textPosition, textPosition, text, 'Center')
    .fontSize(fontSize)
    .toBuffer('JPG', (error, buffer) => {
      if (error) {
        return callback(error, null)
      }
      return callback(null, buffer)
    })
}

/**
 * Generate default avatar for user
 *
 * @param {string} fullName User's fullname
 *
 * @returns {string} Avatar url
 */
const createDefaultAvatar = async fullName => {
  const server = `${process.env.SERVER_HOST}:${process.env.SERVER_PORT}`

  const filePath = 'files'
  const fileNameLength = 16
  const fileName = `${nanoid(fileNameLength)}.jpg`

  await generateAvatar(fullName, async (generatingError, buffer) => {
    if (generatingError) {
      throw new Error(`Generating avatar error: ${generatingError}`)
    }

    await fs.writeFile(
      `${process.cwd()}/${filePath}/${fileName}`,
      buffer,
      savingError => {
        if (savingError) {
          throw new Error(`Saving avatar error: ${generatingError}`)
        }
      },
    )
  })

  return `http://${server}/${filePath}/${fileName}`
}

export default createDefaultAvatar
