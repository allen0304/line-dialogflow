import { Request, Response } from 'express';
import {
  Client, Message, FollowEvent, MessageEvent, UnfollowEvent,
  JoinEvent, LeaveEvent, PostbackEvent,
  WebhookEvent, BeaconEvent
} from '@line/bot-sdk';
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

  public async lineWebhook(req: Request, res: Response) {
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
    
    return Promise.all(_.map(req.body.events, this.handleEvent))
      .then(() => {
        res.end();
      })
      .catch((err) => {
      console.error(err);
      res.status(500).end();
      });
  };

  private handleEvent = async (event: WebhookEvent) => {
    console.log('event:', JSON.stringify(event));
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
  };

  protected handleText = async (event: MessageEvent): Promise<any> => {
    console.log('text', JSON.stringify(event));
    return this.replyTextIntent(event);
  };

  protected handleImage = async (event): Promise<any> => {
    return this.replyText(event.replyToken, `收到`);
  };

  protected handleVideo = async (event): Promise<any> => {
    return this.replyText(event.replyToken, `收到`);
  };

  protected handleAudio = async (event): Promise<any> => {
    return this.replyText(event.replyToken, `收到`);
  };

  protected handleFile = async (event): Promise<any> => {
    return this.replyText(event.replyToken, `收到`);
  };

  protected handleLocation = async (event): Promise<any> => {
    return this.replyText(event.replyToken, `收到`);
  };

  protected handleSticker = async (event): Promise<any> => {
    return this.replyText(event.replyToken, `收到`);
  };

  protected handleFollow = async (event: FollowEvent) => {
    return this.replyEventIntent(event, 'Welcome');
  };

  protected handleUnfollow = async (event: UnfollowEvent) => {
    console.log(`被封鎖： ${JSON.stringify(event)}`);
    return;
  };

  protected handleJoin = async (event: JoinEvent) => {
    return this.replyText(event.replyToken, `Joined ${event.source.type}`);
  };

  protected handleLeave = async (event: LeaveEvent) => {
    console.log(`Left ${event.source.type}`);
    return null;
  };

  protected handlePostback = async (event: PostbackEvent) => {
    console.log(`postback: ${JSON.stringify(event)}`);
    return;
  };

  protected handleBeacon = async (event: BeaconEvent) => {
    return this.replyText(event.replyToken, `Got beacon: ${event.beacon.hwid}`);
  };

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
