import * as express from 'express';
import * as cors from 'cors';
import { lineWebhook } from './webhook/line-webhhok';
import * as bodyParser from 'body-parser';

const app = express();
const router = express.Router();
app.use(cors({ origin: true }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use('/', router);

router.all('/line_webhook', lineWebhook);

const port = process.env.PORT || 8080;
app.listen(port, () => {
    console.log('Start listening on port', port);
});