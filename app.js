const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const fs = require("fs");
const app = express();
const db = mongoose.connect("mongodb://localhost/accountAPI");
const accountRouter = express.Router();
const port = process.env.PORT || 3000;
const Account = require("./models/accountModel");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var logStream = fs.createWriteStream(__dirname + '/access.log', { flags: 'a' });
app.use(morgan('combined', {stream: logStream}))

accountRouter
  .route("/accounts")
  .post((req, res) => {
    const account = new Account(req.body);
    account.save();
    return res.status(201).json(account);
  })
  .get((req, res) => {
    const query = {};
    if (req.query.creationMonth) {
      query.creationMonth = req.query.creationMonth;
    }
    Account.find(query, (err, accounts) => {
      if (err) {
        return res.send(err);
      }
      return res.json(accounts);
    });
  });

accountRouter.use("/accounts/:accountId", (req, res, next) => {
  Account.findById(req.params.accountId, (err, account) => {
    if (err) {
      return res.send(err);
    }
    if (account) {
      req.account = account;
      return next();
    }
    return res.sendStatus(404);
  });
});

accountRouter
  .route("/accounts/:accountId")
  .delete((req, res) => {
    req.account.remove((err) => {
      if (err) {
        return res.send(err);
      }
      return res.json(Account);
    });
  })
  .patch((req, res) => {
    const { account } = req;

    Object.entries(req.body).forEach((item) => {
      const key = item[0];
      const value = item[1];
      account[key] = value;
    });
    
    req.account.save((err) => {
      if (err) {
        return res.send(err);
      }
      return res.json(account);
    });
  })
  .put((req, res) => {
    const { account } = req;
    account.username = req.body.username;
    account.followers = req.body.followers;
    account.creationMonth = req.body.creationMonth;
    account.verified = req.body.verified;
    account.save();
    return res.json(account);
  })
  .get((req, res) => {
    Account.findById(req.params.accountId, (err, account) => {
      if (err) {
        return res.send(err);
      }
      return res.json(account);
    });
  });

app.use("/api", accountRouter);

app.get("/", (req, res) => {
  res.send("Welcome to my API!");
});

app.listen(port, () => {
  console.log(`Running on port ${port}`);
});
