## Winston-SQS

A custom transport for the [Winston NodeJS library](https://github.com/winstonjs/winston) to forward log data to SQS.

## Usage

To use this transport, simply define it in the `transports` array in the Winston configuration

```javascript
winston.createLogger({
    defaultMeta: {
        ...
    },
    format: winston.format.json(),
    transports: [
      new winston.transports.Console({ level: 'info' }),
      new SQSTransport({
        level: 'info',
        queueUrl: 'https://sqs.us-west-2.amazonaws.com/065449192183/CloudAuditEvents',
      }),
    ],
});
```

## Configuration

You can pass in any data you would normally pass into a Winston transport, as well as the following optional attributes

- awsAccessKeyId
- awsSecretAccessKey
- region

The only required attribute is the following

- queueUrl

Which represents the Queue you are intending to publish to.
