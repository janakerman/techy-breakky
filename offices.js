'use strict'
const AWS = require('aws-sdk');
const responses = require('src/js/responses')

const documentClient = new AWS.DynamoDB.DocumentClient({apiVersion: '2012-08-10'});

const validateCreate = input => input.name && input.items.length > 0

/**
 * Create an office.
 */
module.exports.createOffice = async (event, context) => {
    console.log(event)

    const payload = event.body ? JSON.parse(event.body) : null
    console.log(`Body: ${JSON.stringify(payload)}`)
    if (!validateCreate(payload)) return responses.inputError400()

    const params = {
        TableName : 'TechyBrekky',
        Item: {
            PartitionKey: `OFFICE`,
            SortKey: `OFFICE-${payload.name}`,
            Data: '0',
            Items: payload.items
        }
    }

    await documentClient.put(params).promise()

    const response = responses.success200()
    console.log(`Response: ${JSON.stringify(response)}`)
    return response
}

/**
 * Get all offices.
 */
module.exports.getAll = async (event, context) => {
    console.log(event)

    const params = {
        TableName: 'TechyBrekky',
        KeyConditionExpression: 'PartitionKey = :key AND begins_with(SortKey, :bw)',
        ExpressionAttributeValues: {
            ':key': 'OFFICE',
            ':bw': 'OFFICE-'
        }
    };

    let orders = await documentClient.query(params).promise()
    orders = orders.Items.map(o => ({ officeName: o.PartitionKey, items: o.Items}))

    const response = responses.success200(orders)
    console.log(`Response: ${JSON.stringify(response)}`)
    return response
}
