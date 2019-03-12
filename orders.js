'use strict'
const AWS = require('aws-sdk');
const responses = require('src/main/js/responses')

const documentClient = new AWS.DynamoDB.DocumentClient({apiVersion: '2012-08-10'});

const validateMakeOrder = input => input.userId && input.breakfastId && input.item
const validateDeleteOrder = input => input.userId && input.breakfastId
const validateGetOrders = input => !!input.breakfastId


/**
 * Create an order.
 */
module.exports.create = async (event, context) => {
    console.log(event)

    const payload = event.body ? JSON.parse(event.body) : null
    console.log(`Body: ${JSON.stringify(payload)}`)
    if (!validateMakeOrder(payload)) return responses.inputError400()

    // TODO: Check existance of breakfast & item

    const params = {
        TableName : 'TechyBrekky',
        Item: {
            PartitionKey: `BREAKFAST-${payload.breakfastId}`,
            SortKey: `USER-${payload.userId}`,
            Data: payload.item
        }
    }

    await documentClient.put(params).promise()

    const response = responses.success200()
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
    if (!query || !validateGetOrders(query)) return responses.inputError400()

    const params = {
        TableName : 'TechyBrekky',
        ExpressionAttributeValues: {
            ':id': `BREAKFAST-${query.breakfastId}`,
            ':bw': 'USER-'
        },
        KeyConditionExpression: 'PartitionKey = :id AND begins_with(SortKey, :bw)',
    };

    let orders = await documentClient.query(params).promise()
    orders = orders.Items.map(o => ({ breakfastId: o.PartitionKey.replace('^BREAKFAST-', ''), userId: o.SortKey.replace('^USER-', ''), item: o.Item}))

    const response = responses.success200(orders)
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
    if (!payload || !validateDeleteOrder(payload)) return responses.inputError400()

    const params = {
        TableName : 'TechyBrekky',
        Key: {
            PartitionKey: `BREAKFAST-${payload.breakfastId}`,
            SortKey: `USER-${payload.userId}`
        }
    }

    await documentClient.delete(params).promise()

    const response = responses.success200()
    console.log(`Response: ${JSON.stringify(response)}`)
    return response
}
