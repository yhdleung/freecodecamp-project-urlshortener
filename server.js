require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bodyParser = require('body-parser')
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;
mongoose.connect(process.env.MONGO_URI, {useNewUrlParser: true, useUnifiedTopology:true});
console.log(mongoose.connection.readyState);
const urlSchmea = new mongoose.Schema({ 
  url: {type: String},
});
let UrlModel = mongoose.model('urls', urlSchmea);

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

app.use(bodyParser.urlencoded({extended: false}))

// API endpoints
app.post('/api/shorturl', function(req, res) {
  // verify submitted URL
  const dns = require('dns')
  try {
    submitted_url = new URL(req.body.url)
  } catch (error) {
    res.json({"error": 'invalid url'});
  }
  dns.lookup(submitted_url.hostname, (err, address, family) => {
    if(err){
      res.json({error: 'invalid url'});
    }else{
      // save the URL
      let newUrl = new UrlModel({url: submitted_url.href});
      newUrl.save((err,data)=>{
        if (err) return console.error(err);
        res.json({
          "original_url": data.url,
          "short_url": data.id
        })
      })
    }
  });
})

app.get('/api/shorturl/:id', (req, res)=>{
  UrlModel.findById(req.params.id, (err, data)=>{
    if(!data){
      res.json({error: 'invalid short url'});
    }else{
      res.redirect(data.url);
    }
  })
})

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
