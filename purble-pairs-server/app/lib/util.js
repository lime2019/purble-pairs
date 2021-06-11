const jwt = require("jsonwebtoken")

const { tokenSecret } = require("../../config")

const generateToken = ( payload,expiresIn = 60*60*2 ) => {
  const token = jwt.sign( payload,tokenSecret,{
    expiresIn : expiresIn
  })
  return token
}

const verifyToken = (token) => {
  let validity = true
  jwt.verify(token,tokenSecret,(err, decoded) => {
    if(err){
      validity = false
    }
  })
  return validity
}

module.exports = {
  generateToken,
  verifyToken
}