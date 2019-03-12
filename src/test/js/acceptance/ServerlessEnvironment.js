const NodeEnvironment = require('jest-environment-node')
const uuidv1 = require('uuid/v1')
const { spawn } = require('child_process')
const AWS = require('aws-sdk');
AWS.config.update({region:'eu-west-2'})


class ServerlessEnvironment extends NodeEnvironment {
    constructor(config, context) {
        super(config, context)
        // Generate a pseudo-unique stage name, shorten it due to AWS naming limits.
        this.stageName = `acceptance-${uuidv1().slice(0, 7)}`
    }

    async setup() {
        console.log(`Creating stack for acceptance tests. Stage name: ${this.stageName}`)
        await super.setup()
        await this.createServerlessStack()

        const endpoint = ServerlessEnvironment.getAPIGatewayEndpoint()
        console.log(`API Gateway endpoint: ${endpoint}`)
        this.global.apiGatewayEndpoint = endpoint
    }

    async teardown() {
        await this.destroyServerlessStack()

        console.log('Destroyed acceptance test stack')
        await super.teardown()
    }

    runScript(script) {
        return super.runScript(script)
    }

    createServerlessStack() {
        return this.runCommand('serverless', 'deploy', '--stage', this.stageName)
    }

     destroyServerlessStack() {
        return this.runCommand('serverless', 'remove', '--stage', this.stageName)
    }

    static async getAPIGatewayEndpoint() {
        const cloudformation = new AWS.CloudFormation({ apiVersion: '2010-05-15' })
        const stack = await cloudformation.describeStacks({ StackName: this.stageName }).promise()
        return stack.Stacks[0].Outputs.find(output => output.OutputKey === 'ServiceEndpoint').OutputValue
    }

    runCommand(command, ...args) {
        console.log(`Running command '${command} ${args.join(' ')}'`)
        const child = spawn(command, args);

        // Pipe sub-process output to the test output streams.
        child.stdout.pipe(process.stdout)
        child.stderr.pipe(process.stderr)

        return new Promise((resolve, reject) => {
            child.on('close', code => {
                console.log(`Finished running '${command} ${args.join(' ')}' ${(code === 0) ? 'suceeded' : 'failed'}`)
                if (code === 0) {
                    resolve()
                } else {
                    reject()
                }
            })
        })
    }
}

module.exports = ServerlessEnvironment