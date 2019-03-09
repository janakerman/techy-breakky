'use strict'
const AWS = require('aws-sdk');

const dynamodb = new AWS.DynamoDB({apiVersion: '2012-08-10'});

const inputError = () => ({ statusCode: 400, body: JSON.stringify({ statusCode: 400, reason: 'Invalid input parameters'})})
const success = () => ({ statusCode: 200 })

const validateMakeOrder = input =>
    input.username &&
    input.breakfastId && Number.isInteger(input.breakfastId) &&
    input.itemId && Number.isInteger(input.itemId)
const validateDeleteOrder = input =>
    input.username &&
    input.breakfastId && Number.isInteger(input.breakfastId)

module.exports.makeOrder = async (event, context) => {
    console.log(event)

    const body = event.body ? JSON.parse(event.body) : null
    console.log(`Body: ${JSON.stringify(body)}`)
    if (!body || !validateMakeOrder(body)) return inputError()

    const params = {
        TableName : 'orders',
        Item: {
            username: {
                S: body.username
            },
            breakfastId: {
                N: body.breakfastId.toString()
            },
            itemId: {
                N: body.itemId.toString()
            }
        }
    }

    await dynamodb.putItem(params).promise()

    const response = success()
    console.log(`Response: ${JSON.stringify(response)}`)
    return response
}

module.exports.deleteOrder = async (event, context) => {
    console.log(event)

    const body = event.body ? JSON.parse(event.body) : null
    console.log(`Body: ${JSON.stringify(body)}`)
    if (!body || !validateDeleteOrder(body)) return inputError()

    const params = {
        TableName : 'orders',
        Key: {
            username: {
                S: body.username
            },
            breakfastId: {
                N: body.breakfastId.toString()
            }
        }
    }

    await dynamodb.deleteItem(params).promise()

    const response = { statusCode: 200 }
    console.log(`Response: ${JSON.stringify(response)}`)
    return  response
}
