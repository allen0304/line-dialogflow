"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const bot_sdk_1 = require("@line/bot-sdk");
const dialogflow = __importStar(require("dialogflow"));
const pb_util_1 = require("pb-util");
const _ = __importStar(require("lodash"));
const languageCode = 'zh-TW';
var Platform;
(function (Platform) {
    Platform["LINE"] = "LINE";
    Platform["PLATFORM_UNSPECIFIED"] = "PLATFORM_UNSPECIFIED";
})(Platform || (Platform = {}));
;
;
class LineDialogflow {
    constructor(lineConfig, dialogflowConfig) {
        this.projectId = dialogflowConfig.projectId;
        this.lineClient = new bot_sdk_1.Client(lineConfig);
        this.dialogflowClient = new dialogflow.SessionsClient(dialogflowConfig);
    }
    lineWebhook(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
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
        });
    }
    ;
    handleEvent(event) {
        return __awaiter(this, void 0, void 0, function* () {
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
        });
    }
    handleText(event) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.replyTextIntent(event);
        });
    }
    handleImage(event) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.replyText(event.replyToken, `收到`);
        });
    }
    handleVideo(event) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.replyText(event.replyToken, `收到`);
        });
    }
    handleAudio(event) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.replyText(event.replyToken, `收到`);
        });
    }
    handleFile(event) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.replyText(event.replyToken, `收到`);
        });
    }
    handleLocation(event) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.replyText(event.replyToken, `收到`);
        });
    }
    handleSticker(event) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.replyText(event.replyToken, `收到`);
        });
    }
    handleFollow(event) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.replyEventIntent(event, 'Welcome');
        });
    }
    ;
    handleUnfollow(event) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(`被封鎖： ${JSON.stringify(event)}`);
            return;
        });
    }
    ;
    handleJoin(event) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.replyText(event.replyToken, `Joined ${event.source.type}`);
        });
    }
    handleLeave(event) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(`Left ${event.source.type}`);
            return null;
        });
    }
    handlePostback(event) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(`postback: ${JSON.stringify(event)}`);
            return;
        });
    }
    handleBeacon(event) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.replyText(event.replyToken, `Got beacon: ${event.beacon.hwid}`);
        });
    }
    /**
     * 回覆文字訊息
     * @param replyToken
     * @param texts
     */
    replyText(replyToken, texts) {
        const textArray = _.isArray(texts) ? texts : [texts];
        const messages = _.map(textArray, text => ({ type: 'text', text: text }));
        return this.lineClient.replyMessage(replyToken, messages);
    }
    ;
    /**
     * 回覆 Intent by Text
     * @param {string} replyToken Line reply Token
     * @param {*} request Dialogflow detectIntent Request Object
     * @returns {Promise<any>}
     */
    replyTextIntent(event) {
        const sessionId = event.source.userId;
        const sessionPath = this.dialogflowClient.sessionPath(this.projectId, sessionId);
        const text = event.message.text;
        const request = {
            session: sessionPath,
            queryParams: {
                payload: pb_util_1.struct.encode({
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
    replyEventIntent(event, eventName, params = {}) {
        const sessionId = event.source.userId;
        const sessionPath = this.dialogflowClient.sessionPath(this.projectId, sessionId);
        const request = {
            session: sessionPath,
            queryParams: {
                payload: pb_util_1.struct.encode({
                    "data": event,
                    "source": "line"
                })
            },
            queryInput: {
                event: {
                    name: eventName,
                    parameters: pb_util_1.struct.encode(params),
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
    getReplyMessages(fulfillmentMessages) {
        const replyMessages = [];
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
                        const payload = pb_util_1.struct.decode(o.payload);
                        console.log('payload', payload);
                        if (payload.line) {
                            replyMessages.push(payload.line);
                        }
                        else {
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
exports.default = LineDialogflow;
//# sourceMappingURL=line-webhook.class.js.map