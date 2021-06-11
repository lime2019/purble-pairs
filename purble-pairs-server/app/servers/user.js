const bcrypt = require("bcrypt")
const { readDocument, addDocument } = require("../db/db_handle")
const db = require("../db/index")
const _ = db.command

class UserCtl{
  async getUsersByPoints(){
    // 获取游戏积分最高十人
    const userList = await readDocument("purble_pairs_user",10,0,{ userPoints : _.gte(0) },{userName : true,userPoints : true,userOnlineStatus : true},"userPoints",)
    return userList.data
  }
  async createUser(userInfo){
    const { userName,userAccount } = userInfo
    let createResult = {}
    const getUserByName = await readDocument("purble_pairs_user",{ userName })
    const getUserByAccount = await readDocument("purble_pairs_user",{ userAccount })
    if(getUserByAccount.data.length !== 0){
      createResult.flag = false
      createResult.message = "该账号已存在" 
    }else if(getUserByName.data.length !== 0){
      createResult.flag = false
      createResult.message = "该昵称已存在" 
    }else{
      createResult.flag = true
      const salt = bcrypt.genSaltSync(10)
      const encryptPassword = bcrypt.hashSync( userInfo.userPassword , salt)
      userInfo.userPassword = encryptPassword
      await addDocument("purble_pairs_user",userInfo)
    }
    return createResult
  }
  async userLogIn(userInfo){
    const { userAccount,userPassword } = userInfo
    const getUserInfo = await readDocument("purble_pairs_user",{userAccount})
    let logInResult = {
      flag : false
    }
    if(getUserInfo.data.length !== 0){
      const user = getUserInfo.data[0]
      const correct = bcrypt.compareSync(userPassword,user.userPassword)
      if(correct){
        logInResult.flag = true
        delete user.userPassword
        delete user.createTime
        logInResult.userInfo = user
      }
    }
    if(!logInResult.flag){
      logInResult.message = "账号或密码错误..."
    }
    return logInResult
  }
}

module.exports = new UserCtl()