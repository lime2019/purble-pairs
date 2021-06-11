const db = require("./index")

class dbHandle{
  /**
   * 新增一条记录
   * @param {string} collectionName 
   * @param {object} addObj 
   * @returns {object}
   */
  async addDocument(collectionName,addObj){
    const collection = db.collection(collectionName)
    addObj.createTime = new db.serverDate()
    const addResult = await collection.add(addObj)
    delete addObj.createTime
    return addResult
  }
  /**
   * 
   * @param {string} collectionName 
   * @param {string} id 
   * @param {object} updateObj 
   * @returns 
   */
  async updateDocumentById(collectionName,id,updateObj){
    const updateResult = db.collection(collectionName).doc(id).update(updateObj)
    return updateResult
  }
  /**
   * 更新文档记录
   * @param {string} collectionName 
   * @param {object} updateObj 
   * @param {objec} query 
   * @returns {object}
   */
  async updateDocument(collectionName,updateObj,query){
    const updateResult = db.collection(collectionName).where(query).update(updateObj)
    return updateResult
  }
  async readDocument(collectionName,query){
    const readResult = await db.collection(collectionName).limit(1).where(query).get()
    return readResult
  }
  /**
   * 读取文档
   * @param {sting} collectionName 
   * @param {object} query 
   * @param {object} options 
   * @returns 
   */
  async readDocuments(collectionName,limitNumber = 10,skipNumber = 0,query,fields = {},orderField = "_id",orderType = "desc"){
    const readResult = await db.collection(collectionName).limit(limitNumber).skip(skipNumber).where(query).field(fields).orderBy(orderField,orderType).get()
    return readResult
  }
  /**
   * 删除文档
   * @param {string} collectionName 
   * @param {object} query 
   * @returns 
   */
  async deleteDocument(collectionName,query){
    const deleteResult = await db.collection(collectionName).where(query).remove()
    return deleteResult
  }
  /**
   * 统计文档数量
   * @param {string} collectionName 
   * @param {object} query 
   * @returns 
   */
  async countDocument(collectionName,query){
    const countResult = await db.collection(collectionName).count()
    return countResult
  }
}

module.exports = new dbHandle()