'use strict'

module.exports.inputError400 = () => ({ statusCode: 400, body: JSON.stringify({ statusCode: 400, reason: 'Invalid input parameters'})})
module.exports.success200 = payload => ({ statusCode: 200, body: JSON.stringify(payload) })


