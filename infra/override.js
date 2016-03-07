var override = function override(object, methodName, callback) {
  object[methodName] = callback(object[methodName])
}

module.exports = override;