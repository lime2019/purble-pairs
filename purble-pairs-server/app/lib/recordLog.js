const { addDocument } = require("../db/db_handle")

/**
 * 
 * @param {object} log 
 */
module.exports = (log) => {
  await addDocument("purble_pairs_log",log)
}