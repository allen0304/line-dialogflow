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
Object.defineProperty(exports, "__esModule", { value: true });
const line_dialogflow_1 = require("@allen0304/line-dialogflow");
exports.lineWebhook = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const lineConfig = {
        channelAccessToken: '18xpaNFWu1lSZbMhTqUeZFBQG3lhh6W+FG2jhIj3IH9X9gqTLRN5gXq3fTuv4JGrQ9YuEyI8RNxAg1wXOFthMV1M5IXuYF5TiLaZcyooQBlfMzlb6NEfaWe0Iey+1SG4cpDNEGMDLmPcv4BNf6G3nAdB04t89/1O/w1cDnyilFU=',
        channelSecret: 'f8212802f4b66fd6c73c39eb31dc3032'
    };
    const dialogflowConfig = {
        projectId: 'allen-bot-ce4df',
        credentials: {
            client_email: 'dialogflow-kaxksb@allen-bot-ce4df.iam.gserviceaccount.com',
            private_key: '-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDH44fRe6NrwWwe\ncZ5kvlrTYnGWj6vyyz/wPzyOzyqa/Gq1wiXrV78D0MQdUkjDkfIxMeHZfg8SlyPj\n/hQ3Co9RxYFsQPyC6fEQiKR++NB5xk4MOtpmVUi9XVyU9m6gWu7HWrD9kthOGSQ8\nxBmpY8uvWwvVcPIRzZU+4OOHNRuBfV39nr+B4nX/Lf5jsvuov9/G0Y/NURQRIa10\npKMg8oqXvnQw2XWTBzrB6Ij0gJsIsKdKj8nqLaVHpUECW50zJG/bCNKv/jAOWGPF\nkQND88OkCh4UVtrZXTHssgD/S2vtvAg3jgcuBC40Owa8RiluLdAWBjvMqfKbLpbK\nc/9umZSfAgMBAAECggEAGbpW2vG3q8DuR6TcJvS8AAU7FY6nKnhatx43Od0UYMp9\nzv3kSjxgYP9X9BDek2g6QiFng8pOlQKlzfdVZsLnMOE5B/6oAbmsG4gFlDThBdYu\naYiRtSY5Aev9ufarb9xZwN29djCWbXGdpmyfLkb4Co6vdpOJCh2UniPtZT5tVzyE\ncCBB4iOz7Wf+GewYig7I1mBizjwD0WATd/v9aKJy48t5lVodmncqxbGHSQxRGYPc\nVUsuAhl9S4+1uZCiDnGKqCP7teaTaMXHKr9lP61W2Ry04FCrHccxS3n8ECmXhnDQ\n63UeEWOkfSh4d5YvEbqdiOaKiRIfns2gtkev2M0boQKBgQD7+0MOg5FthoKOApwZ\ndYXuPNJavnLNQwb6A8DpAsXEs9azYbLzdDGiw8raaosyzaZHJT5vHQ0wfqc/fara\n89DCDEbZBBrUCmwOHgeqDEW2RoChk1c1s5HDD49cdoKBYMQNiw7gnKNExMBZpNUM\nIfkJnvGESDJ0c4IpIJuDDWpxCQKBgQDLE5hjXrx8L+BH1hEfpB+IidFyPfwY9PQh\n9+/NziPYQPu4nDbocCUhSJUF4ny8pSZ7oHJLPoYuv9ESQJPWhyn3hhV6jhjvd+EW\nVNmcQVVG5HrrXc7h1MZiBCUa1BRz/PHEXKNxEXp4Ectk9iPOk4O5WVt3X1czgoom\nNKCkBS3KZwKBgQD1X0V7Oq9A4jz7oJr1R7X1uhB1AQO10dFXYJRX0rVWyHEIGNkz\nrTAweUxtyFZoUE3c9e2IMdgIIy0l7G+V6tqcO2w6I38kgEmcra1076JqztivflTs\nHEKSmfJWbajD58DCF2mTW7S5YIaWRKaZu/NQZRB2af+H2nsjJXeJ9GR0UQKBgA+H\nzButXxTQRIK56E1XK+IxSAdInkL6WMFQSNKgdTVQou+XYsub5/sHpf3xOEDlEHBb\n8OG4QmLI4KBYt/WsGJWJd5ML0vRdYqVmj83XYUIurwfZAL1cnF9amcvXdEj6izLN\nMuKux4LvOXLbMBnYRjaiktAqRmz2CsKpO6/PhZT5AoGAX5ZXXnQJFTTa2n9iZKu3\nydawxEf7QJcfNFeY5TejxQwzqia7YAo/rXvRBFTpDxe59kAP6cxGnjO1DToRs/tT\n6NzZ4yqhnXyQqQVcvuVuAx14NtVzFdauFQp4qBHGoJ3PveS6IpK+zwH6pTItwaT/\n1dSxKyN4uhrmax/rz6Dol+c=\n-----END PRIVATE KEY-----\n'
        }
    };
    const lineDialogflow = new line_dialogflow_1.LineDialogflow(lineConfig, dialogflowConfig);
    console.log('body:', req.body);
    return lineDialogflow.lineWebhook(req, res);
});
//# sourceMappingURL=line-webhhok.js.map