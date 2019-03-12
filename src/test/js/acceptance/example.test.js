const http = require('http');

describe('hi', () => {

    beforeAll(() => {

    })

    test('adds 1 + 2 to equal 3', async () => {
        http.get({path: url}, response => {
            let data = '';
            response.on('data', _data => (data += _data));
            response.on('end', () => resolve(data));
        });
    });
})