import { Request, Response } from 'express';
import { MessageEvent, FollowEvent, UnfollowEvent } from '@line/bot-sdk/dist/types';

interface LineConfig {
  channelAccessToken: string;
  channelSecret: string;
}

interface DialogflowConfig {
  projectId: string;
  credentials: {
    client_email: string;
    private_key: string;
  }
}

export declare class LineDialogflow {
  constructor(lineConfig: LineConfig, dialogflowConfig: DialogflowConfig);

  projectId: string;
  lineClient: any;
  dialogflowClient: any;

  lineWebhook: lineWebhook;

  replyText: replyText;

  replyTextIntent: replyTextIntent;
  
  handleFollow: handleFollow;

  handleUnfollow: UnfollowEvent;
}

type handleFollow = (event: FollowEvent) => Promise<any>;
type handleUnfollow = (event: UnfollowEvent) => Promise<any>;

type lineWebhook = (req: Request, res: Response) => Promise<any>;

/**
 * 回覆文字訊息
 * @param replyToken
 * @param texts
 */
type replyText = (replyToken: string, texts: string | string[]) => Promise<void>;

/**
 * 回覆 Intent by Text
 * @param {string} replyToken Line reply Token
 * @param {*} request Dialogflow detectIntent Request Object
 * @returns {Promise<any>}
 */
type replyTextIntent = (event: MessageEvent, text: string) => Promise<any>;
