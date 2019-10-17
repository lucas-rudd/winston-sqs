import winston from 'winston';
import { SQSTransport } from '../src';
import * as AWSMock from 'aws-sdk-mock';
import AWS from 'aws-sdk';
import * as sinon from 'sinon';

AWSMock.setSDKInstance(AWS);

describe('SQSTransport', () => {
  let sandbox: sinon.SinonSandbox;
  let winstonLogger: winston.Logger;
  let sqsStub: sinon.SinonStub;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    sqsStub = sandbox.stub().resolves();
    AWSMock.mock('SQS', 'sendMessage', sqsStub);
    winstonLogger = winston.createLogger({
      level: 'info',
      transports: [
        new SQSTransport({
          level: 'info',
          queueUrl: 'mockUrl',
        }),
      ],
    });
  });
  afterEach(() => {
    sandbox.restore();
  });

  it('should call sendMessage on sqs when logging', () => {
    winstonLogger.log('info', 'hello');
    sinon.assert.calledOnce(sqsStub);
    sinon.assert.calledWith(sqsStub, {
      MessageBody: JSON.stringify({ level: 'info', message: 'hello' }),
      QueueUrl: 'mockUrl',
    });
  });
});
