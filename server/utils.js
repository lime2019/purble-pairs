/**
 * 工具函数
 */

const jwt = require('jsonwebtoken')

const { JWTToken : secret } = require("./config")

/**
 * @param {json} payload Token载荷
 */
function generateToken(payload ){
  // 生成两个小时内有效的token
  const token = jwt.sign( payload,secret,{
      expiresIn : 60*60*24
  })
  return token
}

module.exports = {
  generateToken
}