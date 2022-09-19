"use strict";
const express = require("express");
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));
var cors = require("cors");
const port = 3015;
const app = express();
const redis = require("redis");
const token =
  "9RLe0nYqh6LogNT5i1k4i1HZfYVi9XoUPdyRIxyUkeZDMOC91csgZkU3waThMOFmFgfX7WMSe29ai8Ah";
// const client = redis.createClient(6378, "127.0.0.1", { auth_pass: token });
const client = redis.createClient();

app.use(cors());

app.get("/", (req, res) => {
  try {
    var object = {};
    client.get(`clicwick_score`, (err, object) => {
      if (err == null) {
        object = JSON.parse(object);
        res.send(object);
      } else {
        res.send(object);
      }
    });
  } catch (e) {
    console.log('err', e);
  }
});

app.listen(port, () => {
  console.log(`Cricwick listening on port ${port}!`);
});
