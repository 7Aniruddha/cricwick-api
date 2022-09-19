"use strict";
const express = require("express");
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));
var cors = require("cors");
const port = 3012;
const app = express();
const redis = require("redis");
// const token =
//   "9RLe0nYqh6LogNT5i1k4i1HZfYVi9XoUPdyRIxyUkeZDMOC91csgZkU3waThMOFmFgfX7WMSe29ai8Ah";
// const client = redis.createClient(6378, "127.0.0.1", { auth_pass: token });

const client = redis.createClient();

app.use(cors());

var requestOptions = {
  method: "GET",
  headers: {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:103.0) Gecko/20100101 Firefox/103.0",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.5",
    "Accept-Encoding": "gzip, deflate, br",
    'Connection': 'keep-alive' ,
    'Upgrade-Insecure-Requests': '1' ,
    'Sec-Fetch-Dest': 'document' ,
    'Sec-Fetch-Mode': 'navigate' ,
    'Sec-Fetch-Site': 'cross-site' ,
    'Pragma': 'no-cache' ,
    'Cache-Control': 'no-cache'
  },
};

var score = {};

async function getHtml() {
  return new Promise(async (resolve, reject) => {
    try {
      const urls = await fetch(
        `https://s-usc1f-nss-2540.firebaseio.com/.json?v=5&s=asoosXhd9oyjczh7qZs59OANDi0puTWv&ns=crickettelenorzong`,
        requestOptions
      );
      const urls_json = await urls.json();
      var match_data = []
      var l_i_datas = {};
      var l_m_datas = {};

      if (urls_json) {
        for (const [key, val] of Object.entries(urls_json)) {          
          if(key.includes("l_i_")){
            l_i_datas[key] = val;
          } 

          if(key.includes("l_m_")){
            l_m_datas[key] = val;
          }
        }
      }

      if(Object.keys(l_i_datas).length>1 && Object.keys(l_m_datas).length>0){ 
        for (const [keyi, vali] of Object.entries(l_i_datas)){
          if (vali!=null){
            for (const [keym, valm] of Object.entries(l_m_datas)){
              if(keyi.split('_')[2] == keym.split('_')[2]){
                var obj = {
                  status: valm.match_state,

                  match_key: `CKWK${keym.split('_')[2]}`,

                  cs: {
                    msg: '',
                  },

                  iov: vali.slice(-1)[0].total_overs,

                  t1: {
                    f: valm.teamA.name,
                    n: valm.teamA.short_name,
                  },

                  t2: {
                    f: valm.teamB.name,
                    n: valm.teamB.short_name,
                  },

                  i1: {
                    sc:(vali[0].runs ? vali[0].runs : '0'),
                    wk:(vali[0].wickets ? vali[0].wickets : '0'),
                    ov:(vali[0].overs ? vali[0].overs : '0'),
                    rt:'0',
                  },
                 
                  i2: {
                    sc:(vali.length>1 ? (vali[1].runs ? vali[1].runs : '0'): '0'),
                    wk:(vali.length>1 ? (vali[1].wickets ? vali[1].wickets : '0'): '0'),
                    ov:(vali.length>1 ? (vali[1].overs ? vali[1].overs : '0'): '0'),
                    rt:'0',
                  },

                  i3: {
                    sc:(vali.length>2 ? (vali[2].runs ? vali[2].runs : '0'): '0'),
                    wk:(vali.length>2 ? (vali[2].wickets ? vali[2].wickets : '0'): '0'),
                    ov:(vali.length>2 ? (vali[2].overs ? vali[2].overs : '0'): '0'),
                  },

                  i4: {
                    sc:(vali.length>3 ? (vali[3].runs ? vali[3].runs : '0'): '0'),
                    wk:(vali.length>3 ? (vali[3].wickets ? vali[3].wickets : '0'): '0'),
                    ov:(vali.length>3 ? (vali[3].overs ? vali[3].overs : '0'): '0'),
                  },

                  p1:(vali.slice(-1)[0].summary ? (vali.slice(-1)[0].summary.batsman_1 ? vali.slice(-1)[0].summary.batsman_1.name : '') : ''),

                  p2:(vali.slice(-1)[0].summary ? (vali.slice(-1)[0].summary.batsman_2 ? vali.slice(-1)[0].summary.batsman_2.name : '') : ''),

                  os:(vali.slice(-1)[0].summary ? (vali.slice(-1)[0].summary.batsman_1 ? (vali.slice(-1)[0].summary.batsman_1.string_state == "facing" ? 'p1' : 'p2'): '') : ''),

                  b1s:(vali.slice(-1)[0].summary ? (vali.slice(-1)[0].summary.batsman_1 ? `${vali.slice(-1)[0].summary.batsman_1.runs_scored},${vali.slice(-1)[0].summary.batsman_1.balls_played},0,0` : '') : ''),

                  b2s:(vali.slice(-1)[0].summary ? (vali.slice(-1)[0].summary.batsman_2 ? `${vali.slice(-1)[0].summary.batsman_2.runs_scored},${vali.slice(-1)[0].summary.batsman_2.balls_played},0,0` : '') : ''),
                  
                  bw: (vali.slice(-1)[0].summary ? (vali.slice(-1)[0].summary.bowler ? vali.slice(-1)[0].summary.bowler.name : '') : ''),

                  pb:'',
                };
                match_data.push(obj)
              }
            }
          }  
        }
      }  
      return resolve(match_data);
    } catch (e) {
      return reject(e);
    }
  });
}


function startScrap() {
  getHtml()
    .then(async (links) => {
      var counter = 0;
      
      links.forEach(async (item, index) => {
        if (item && item != {}) {
            score[item.match_key] = item;
        }
        counter++;
        if (counter === links.length) {
          setToRedis();
        }
      });
    })
    .catch((error) => {
      console.log("error", error);
      process.exit();
    });
}

function setToRedis() {
  // console.log('done');
  client.set(`clicwick_score`, JSON.stringify(score));
  startScrap();
}

startScrap();


