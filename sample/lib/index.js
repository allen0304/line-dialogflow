"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const cors = require("cors");
const line_webhhok_1 = require("./webhook/line-webhhok");
const bodyParser = require("body-parser");
const app = express();
const router = express.Router();
app.use(cors({ origin: true }));
app.use(bodyParser());
app.use('/', router);
router.all('/line_webhook', line_webhhok_1.lineWebhook);
const port = process.env.PORT || 8080;
app.listen(port, () => {
    console.log('Start listening on port', port);
});
//# sourceMappingURL=index.js.map