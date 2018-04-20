const fetch = require('isomorphic-fetch');
const app = require('express')();
const cors = require('cors');

const API_KEY = process.env.API_KEY;

app.use(cors());

let lastData;

app.get('/forecast', (req, res) => {
  if (lastData) {
    res.send(lastData);
    return;
  }

  const { lat, long } = req.query;
  const date = new Date();
  // Normalize time to GMT+0
  let dateTime = date.getTime() + date.getTimezoneOffset() * 60 * 1000;
  // Hardcode London GMT+1 current timezone
  dateTime = dateTime + (1 * 60 * 1000);
  // Add another second into a day
  dateTime = dateTime + 1000;
  // Normalize timestamp to the API time format
  dateTime = Math.floor(dateTime / 1000);

  const current = fetch(`https://api.darksky.net/forecast/${API_KEY}/${lat},${long}?exclude=minutely,hourly,alerts,flags&units=uk2`)
  .then(res => res.json());

  const time = fetch(`https://api.darksky.net/forecast/${API_KEY}/${lat},${long},${dateTime}?exclude=currently,minutely,daily,alerts,flags&units=uk2`)
  .then(res => res.json());

  Promise.all([current, time]).then(([current, time]) => {
    const data = JSON.stringify({ current, time });
    lastData = data;

    res.send(data);
  }).catch(() => res.status(500).end());
});

app.listen(3001);
