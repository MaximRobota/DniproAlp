// import * as scenes from "../server/utils/ScenesDB";
import cors from 'cors';
import bodyParser from 'body-parser';
// import * as config from './etc/config.json';

// import nodemailer from "nodemailer";

const nodemailer = require('nodemailer');


const express = require('express');

const app = express();
const port = 3000;
/**
 * Initialization of dev/staging/production environments
 *
 * To run Dev server with config ./etc/config.json:
 * npm run server_dev
 *
 * To run Staging server with config ./etc/config.json:
 * npm run server_staging
 *
 * To run Production server with config ./etc/config.json:
 * npm run server_production
 */
// initEnv();


app.get('/', (request, response) => {
  response.send('Hello from Express!')
});

app.listen(port, (err) => {
  if (err) {
    return console.log('something bad happened', err)
  }
  console.log(`server is listening on ${port}`)
});

// Using bodyParser middleware
app.use( bodyParser.json() );

// Allow requests from any origin
app.use(cors({ origin: '*' }));


app.get('/contact-us', (req, res) => {
  var data = {
    "bestAnimals": [
      "wombat",
      "corgi",
      "puffer fish",
      "owl",
      "crow"
    ]
  };

  res.json(data);  // scenes.filter(req, res);
});

app.post('/contact-us', (req, res) => {
  let transporter = nodemailer.createTransport({
    // service: 'https://webmail.meta.ua/',
    secure: false, // use SSL
    port: 25, // port for secure SMTP

    auth: {
      user: 'maxim1106@meta.ua',
      pass: '3572735727'
    },
    tls: {
      rejectUnauthorized: false
    }
  });
  let mailOptions = {
    from: '"Krunal Lathiya" <maxim1106@meta.ua>', // sender address
    // to: req.body.to, // list of receivers
    to: '<maxim11061106@gmail.com>', // list of receivers
    subject: 'req.body.subject', // Subject line
    text: 'req.body.body', // plain text body
    html: '<b>NodeJS Email Tutorial</b>' // html body
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.log('err', error);
    }
    console.log('Message %s sent: %s', info.messageId, info.response);
    res.render('index');
  });

  res.json();
  // scenes.create(req, res);
});

app.put('/scenes/:id', (req, res) => {
  // scenes.update(req, res);
});


/**
 * Initialization of dev/staging/production environments
 *
 * To run Dev server with config ./etc/config.json:
 * npm run server_dev
 *
 * To run Staging server with config ./etc/config.json:
 * npm run server_staging
 *
 * To run Production server with config ./etc/config.json:
 * npm run server_production
 */
function initEnv(){
  if(app.get('env') === 'local'){
    app.config = config.local;

    // Set up connection of database
    // mongoose.connect(`mongodb://${config.local.db.host}:${config.local.db.port}/${config.local.db.name}`);

    // Start server on Port
    app.listen(config.local.serverPort, function() {
      console.log(`Server Local is up and running on port ${config.local.serverPort}`);
    });
  }
  if(app.get('env') === 'dev'){
    app.config = config.dev;

    // Set up connection of database
    // mongoose.connect(`mongodb://${config.dev.db.host}:${config.dev.db.port}/${config.dev.db.name}`);

    // Start server on Port
    app.listen(config.dev.serverPort, function() {
      console.log(`Server DEV is up and running on port ${config.dev.serverPort}`);
    });
  }

  if(app.get('env') === 'staging') {
    app.config = config.staging;

    // Set up connection of database
    // mongoose.connect(`mongodb://${config.staging.db.host}:${config.staging.db.port}/${config.staging.db.name}`);

    // Start server on Port
    app.listen(config.staging.serverPort, function () {
      console.log(`Server Staging is up and running on port ${config.staging.serverPort}`);
    });
  }

  if(app.get('env') === 'production') {
    app.config = config.production;

    // Set up connection of database
    // mongoose.connect(`mongodb://${config.production.db.host}:${config.production.db.port}/${config.production.db.name}`);

    // Start server on Port
    app.listen(config.production.serverPort, function () {
      console.log(`Server production is up and running on port ${config.production.serverPort}`);
    });
  }

  if(app.get('env') === 'testing') {
    app.config = config.testing;

    // Set up connection of database
    // mongoose.connect(`mongodb://${config.testing.db.host}:${config.testing.db.port}/${config.testing.db.name}`);

    // Start server on Port
    app.listen(config.testing.serverPort, function () {
      console.log(`Test server is up and running on port ${config.testing.serverPort}`);
    });
  }
}

export default app;
