import Transport, { TransportStreamOptions } from 'winston-transport';
import { SQS } from 'aws-sdk';
import { SendMessageRequest } from 'aws-sdk/clients/sqs';

export interface WinstonSQSTransportConfig extends TransportStreamOptions {
  awsAccessKeyId?: string;
  awsSecretAccessKey?: string;
  region?: string;
  queueUrl: string;
}

export class SQSTransport extends Transport {
  private sqs: SQS;
  private readonly optional = {
    region: process.env.AWS_REGION || 'us-west-2',
    handleExceptions: false,
    silent: false,
  };

  constructor(private readonly pluginConfig: WinstonSQSTransportConfig) {
    super(pluginConfig);
    if (!pluginConfig.queueUrl) {
      return;
    }
    const options = { ...this.optional, ...pluginConfig };
    let sqsOpts: SQS.Types.ClientConfiguration = {};

    if (options.awsAccessKeyId || process.env.AWS_ACCESS_KEY_ID) {
      sqsOpts.accessKeyId = options.awsAccessKeyId;
    }
    if (options.awsSecretAccessKey || process.env.AWS_SECRET_ACCESS_KEY) {
      sqsOpts.secretAccessKey = options.awsSecretAccessKey;
    }
    if (options.region) {
      sqsOpts.region = options.region;
    }
    try {
      this.sqs = new SQS(sqsOpts);
      this.level = options.level;
      if (options.handleExceptions) {
        this.handleExceptions = options.handleExceptions;
      }
    } catch (e) {
      console.log('Failed to connect to SQS', e);
    }
    return;
  }

  // runs when winston.log is called
  log(info: string, callback: Function) {
    if (this.pluginConfig.silent) {
      return callback(null, true);
    }
    const sqsOpts: SendMessageRequest = {
      MessageBody: JSON.stringify(info),
      QueueUrl: this.pluginConfig.queueUrl,
    };
    if (!this.sqs) {
      console.log('Error: No SQS queue instantiated in Winston SQS Transport');
      return callback(null, true);
    }
    this.sqs.sendMessage(sqsOpts, (err, data) => {
      return callback(err, data);
    });
  }
}
