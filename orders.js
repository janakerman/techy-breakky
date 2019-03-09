'use strict'
const AWS = require('aws-sdk');

const dynamodb = new AWS.DynamoDB({apiVersion: '2012-08-10'});
const documentClient = new AWS.DynamoDB.DocumentClient({apiVersion: '2012-08-10'});

const inputError = () => ({ statusCode: 400, body: JSON.stringify({ statusCode: 400, reason: 'Invalid input parameters'})})
const success = payload => ({ statusCode: 200, body: JSON.stringify(payload) })

const validateMakeOrder = input =>
    input.username &&
    input.breakfastId && Number.isInteger(input.breakfastId) &&
    input.itemId && Number.isInteger(input.itemId)
const validateDeleteOrder = input =>
    input.username &&
    input.breakfastId && Number.isInteger(input.breakfastId)
const validateGetOrders = input => {
    const num = parseInt(input.breakfastId)
    return input.breakfastId && !isNaN(num) && Number.isInteger(num)
}

/**
 * Create an order.
 */
module.exports.create = async (event, context) => {
    console.log(event)

    const payload = event.body ? JSON.parse(event.body) : null
    console.log(`Body: ${JSON.stringify(payload)}`)
    if (!validateMakeOrder(payload)) return inputError()

    const params = {
        TableName : 'Orders',
        Item: {
            Username: payload.username,
            BreakfastId: payload.breakfastId,
            ItemId: payload.itemId
        }
    }

    await documentClient.put(params).promise()

    const response = success()
    console.log(`Response: ${JSON.stringify(response)}`)
    return response
}

/**
 * Get orders for a given breakfast.
 */
module.exports.get = async (event, context) => {
    console.log(event)

    const query = event.queryStringParameters
    console.log(`Query: ${JSON.stringify(query)}`)
    if (!query || !validateGetOrders(query)) return inputError()

    const params = {
        TableName : 'Orders',
        ExpressionAttributeValues: {
            ':id': parseInt(query.breakfastId),
        },
        KeyConditionExpression: 'BreakfastId = :id',
    };

    let orders = await documentClient.query(params).promise()
    orders = orders.Items.map(o => ({ breakfastId: o.BreakfastId, username: o.Username, itemId: o.ItemId}))

    const response = success(orders)
    console.log(`Response: ${JSON.stringify(response)}`)
    return response
}

/**
 * Delete an order.
 */
module.exports.delete = async (event, context) => {
    console.log(event)

    const payload = event.body ? JSON.parse(event.body) : null
    console.log(`Body: ${JSON.stringify(payload)}`)
    if (!payload || !validateDeleteOrder(payload)) return inputError()

    const params = {
        TableName : 'Orders',
        Key: {
            Username: payload.username,
            BreakfastId: payload.breakfastId
        }
    }

    await documentClient.delete(params).promise()

    const response = success()
    console.log(`Response: ${JSON.stringify(response)}`)
    return response
}
