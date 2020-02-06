import { Client, Message } from '@line/bot-sdk';
import * as dialogflow from 'dialogflow';
import { struct } from 'pb-util';
import * as _ from 'lodash';

const languageCode = 'zh-TW';

enum Platform {
  LINE = 'LINE',
  PLATFORM_UNSPECIFIED = 'PLATFORM_UNSPECIFIED'
};

interface LineConfig {
  channelAccessToken: string;
  channelSecret: string;
};

interface DialogflowConfig {
  projectId: string;
  credentials: {
    client_email: string;
    private_key: string;
  }
}

export default class LineDialogflow {

  private projectId: string;
  private lineClient: Client;
  private dialogflowClient: any;

  constructor(lineConfig: LineConfig, dialogflowConfig: DialogflowConfig) {
    this.projectId = dialogflowConfig.projectId;
    this.lineClient = new Client(lineConfig);
    this.dialogflowClient = new dialogflow.SessionsClient(dialogflowConfig);
  }

  public async lineWebhook(req, res) {
    if (req.method === 'GET') {
      res.send('line webhook cold start');
      return null;
    }

    console.log('line-webhook headers:', JSON.stringify(req.headers));
    console.log('line-webhook body = ', JSON.stringify(req.body));
    const userId = req.body.events[0].source.userId;
    
    // line webhook 驗證用
    if (userId === 'Udeadbeefdeadbeefdeadbeefdeadbeef') {
      res.end();
    }

    return Promise.all(req.body.events.map(this.handleEvent))
      .then(() => {
        res.end();
      }).catch((err) => {
        console.error(err);
        res.status(500).end();
      });
  };

  private async handleEvent(event) {
    console.log('event:', event);
    switch (event.type) {
      case 'message':
        const message = event.message;
        switch (message.type) {
          case 'text':
            return this.handleText(event);
          case 'image':
            return this.handleImage(event);
          case 'video':
            return this.handleVideo(event);
          case 'audio':
            return this.handleAudio(event);
          case 'file':
            return this.handleFile(event);
          case 'location':
            return this.handleLocation(event);
          case 'sticker':
            return this.handleSticker(event);
          default:
            throw new Error(`Unknown message: ${JSON.stringify(message)}`);
        }

      // 加入好友
      case 'follow':
        return this.handleFollow(event);

      // bot被封鎖
      case 'unfollow':
        return this.handleUnfollow(event);

      // 加入群組或聊天室
      case 'join':
        return this.handleJoin(event);

      // 從群組刪除
      case 'leave':
        console.log(`Left: ${JSON.stringify(event)}`);
        return this.handleLeave(event);

      // template message 回傳 action
      case 'postback':
        return this.handlePostback(event);

      case 'beacon':
        return this.handleBeacon(event);

      default:
        throw new Error(`Unknown event: ${JSON.stringify(event)}`);
    }
  }

  handleText(event: any): Promise<any> {
    return this.replyTextIntent(event);
  }

  handleImage(event): Promise<any> {
    return this.replyText(event.replyToken, `收到`)
  }

  handleVideo(event): Promise<any> {
    return this.replyText(event.replyToken, `收到`)
  }

  handleAudio(event): Promise<any> {
    return this.replyText(event.replyToken, `收到`)
  }

  handleFile(event): Promise<any> {
    return this.replyText(event.replyToken, `收到`)
  }

  handleLocation(event): Promise<any> {
    return this.replyText(event.replyToken, `收到`)
  }

  handleSticker(event): Promise<any> {
    return this.replyText(event.replyToken, `收到`)
  }

  handleFollow(event: any) {
    return this.replyEventIntent(event, 'Welcome');
  };

  handleUnfollow(event: any) {
    console.log(`被封鎖： ${JSON.stringify(event)}`);
    return;
  };

  handleJoin(event: any) {
    return this.replyText(event.replyToken, `Joined ${event.source.type}`);
  }

  handleLeave(event: any) {
    return this.replyText(event.replyToken, `Left ${event.source.type}`);
  }

  handlePostback(event: any) {
    console.log(`postback: ${JSON.stringify(event)}`);
    return;
  }

  handleBeacon(event: any) {
    return this.replyText(event.replyToken, `Got beacon: ${event.beacon.hwid}`);
  }

  /**
   * 回覆文字訊息
   * @param replyToken
   * @param texts
   */
  public replyText(replyToken: string, texts: string | string[]) {
    const textArray = _.isArray(texts) ? texts : [texts];
    const messages: Message[] = _.map(textArray, text => (<Message>{ type: 'text', text: text }));
    return this.lineClient.replyMessage(replyToken, messages);
  };

  /**
   * 回覆 Intent by Text
   * @param {string} replyToken Line reply Token
   * @param {*} request Dialogflow detectIntent Request Object
   * @returns {Promise<any>}
   */
  private replyTextIntent(event: any): Promise<any> {
    const sessionId = event.source.userId;
    const sessionPath = this.dialogflowClient.sessionPath(this.projectId, sessionId);
    const text = event.message.text;
    const request = {
      session: sessionPath,
      queryParams: {
        payload: struct.encode({
          "data": event,
          "source": "line"
        })
      },
      queryInput: {
        text: {
          text: text,
          languageCode: languageCode
        }
      }
    };
    return this.dialogflowClient.detectIntent(request)
      .then(responses => {
        const messages = responses[0].queryResult.fulfillmentMessages;
        const replyMessages = this.getReplyMessages(messages);
        console.log(`replyTextIntent: ${JSON.stringify(replyMessages)}`);
        return this.lineClient.replyMessage(event.replyToken, replyMessages);
      }).catch(err => console.error(err));
  }

  /**
   * 回覆 Intent by Event
   * @param replyToken
   * @param sessionId
   * @param eventName
   */
  private replyEventIntent(event: any, eventName: string, params: any = {}): Promise<any> {
    const sessionId = event.source.userId;
    const sessionPath = this.dialogflowClient.sessionPath(this.projectId, sessionId);
    const request = {
      session: sessionPath,
      queryParams: {
        payload: struct.encode({
          "data": event,
          "source": "line"
        })
      },
      queryInput: {
        event: {
          name: eventName,
          parameters: struct.encode(params),
          languageCode: languageCode
        }
      }
    };
    return this.dialogflowClient.detectIntent(request)
      .then(responses => {
        const messages = responses[0].queryResult.fulfillmentMessages;
        const replyMessages = this.getReplyMessages(messages);
        console.log(`replyEventIntent: ${JSON.stringify(replyMessages)}`);
        return this.lineClient.replyMessage(event.replyToken, replyMessages);
      }).catch(err => console.error(err));
  }


  /**
   * 將dialogflow回傳的fulfillmentMessages轉為Line的回傳訊息格式
   * 只回傳 dialogflow platform 為 LINE 的訊息
   * @param fulfillmentMessages
   */
  private getReplyMessages(fulfillmentMessages: any): any[] {
    const replyMessages: any[] = [];
    // console.log('fulfillmentMessages:', JSON.stringify(fulfillmentMessages));
    _.forEach(fulfillmentMessages, o => {
      if (o['platform'] === Platform.LINE || o['platform'] === Platform.PLATFORM_UNSPECIFIED) {
        switch (o.message) {
          case 'text':
            console.log('text', o.text);
            replyMessages.push({
              type: 'text',
              text: o.text.text[0]
            });
            break;

          case 'payload':
            const payload = struct.decode(o.payload)
            console.log('payload', payload);
            if (payload.line) {
              replyMessages.push(payload.line);
            } else {
              replyMessages.push(payload);
            }
            break;

          default:
            console.log('unHandled message type', o);
            break;
        }
      }
    });
    return replyMessages;
  }
}
