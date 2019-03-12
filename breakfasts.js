'use strict'
const AWS = require('aws-sdk')
const responses = require('src/main/js/responses')
const moment = require('moment')

const documentClient = new AWS.DynamoDB.DocumentClient({apiVersion: '2012-08-10'});

const validateCreate = input => input.date && moment(input.date, 'YYYY-MM-DD', true).isValid()
    && input.office

/**
 * Create an office.
 */
module.exports.createBreakfast = async (event, context) => {
    console.log(event)

    const payload = event.body ? JSON.parse(event.body) : null
    console.log(`Body: ${JSON.stringify(payload)}`)
    if (!validateCreate(payload)) return responses.inputError400()

    const params = {
        TableName : 'TechyBrekky',
        Item: {
            PartitionKey: `BREAKFAST-${payload.office}-${payload.date}`,
            SortKey: `BREAKFAST-${payload.office}-${payload.date}`,
            Data: 'x',
            Date: payload.date,
            Office: payload.office
        },
        ConditionExpression: 'attribute_not_exists(PartitionKey) AND attribute_not_exists(SortKey)'
    }

    await documentClient.put(params).promise()

    const response = responses.success200()
    console.log(`Response: ${JSON.stringify(response)}`)
    return response
}

// TODO: Get breakfasts for office
// TODO: Get breakfast
// TODO: Delete breakfast
