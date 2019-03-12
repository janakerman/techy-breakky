const axios = require('axios');

describe('Example acceptance tests', () => {

    beforeAll(async () => {
        const apiGatewayEndpoint = await global.apiGatewayEndpoint
        this.addOfficeEndpoint = `${apiGatewayEndpoint}/offices`
    })

    test('Create and get offices', async () => {
        const createResponse = await axios.post(this.addOfficeEndpoint, {
            name: 'London Office',
            items: ['Bacon Sandwich']
        })
        expect(createResponse.status).toBe(200)

        const getResponse = await axios.get(this.addOfficeEndpoint)
        expect(getResponse.data.length).toBe(1)
    })
})