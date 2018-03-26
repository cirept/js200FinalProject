// Include the cluster module
var cluster = require('cluster');

// Code to run if we're in the master process
if (cluster.isMaster) {
  // Count the machine's CPUs
  var cpuCount = require('os')
    .cpus()
    .length;

  // Create a worker for each CPU
  for (var i = 0; i < cpuCount; i += 1) {
    cluster.fork();
  }

  // Listen for terminating workers
  cluster.on('exit', function (worker) {
    // Replace the terminated workers
    console.log('Worker ' + worker.id + ' died :(');
    cluster.fork();
  });

  // Code to run if we're in a worker process
} else {
  let express = require('express'); // Express web server framework
  let request = require('request'); // "Request" library
  let querystring = require('querystring');
  let cookieParser = require('cookie-parser');

  let clientId = 'e036464f2fd04cc19915206745ab9a10'; // Your client id
  let clientSecret = 'd739b8c63e664abaae47a68ab8322970'; // Your secret
  let redirectUri = 'http://localhost:8888/callback'; // Your redirect uri // local testing
//  let redirectUri = 'http://js200-final-project.us-west-2.elasticbeanstalk.com/callback'; // Your redirect uri // AWS server testing

  let stateKey = 'spotify_auth_state';

  let app = express();

  app.use(express.static('public'));

  // ***********************************************************
  // ***********************************************************
  // functions
  // ***********************************************************
  // ***********************************************************

  /**
   * Generates a random string containing numbers and letters
   * @param  {number} length The length of the string
   * @return {string} The generated string
   */
  const generateRandomString = function (length) {
    let text = '';
    let possible =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (let i = 0; i < length; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  };


  // ***********************************************************
  // ***********************************************************
  // APP listeners
  // ***********************************************************
  // ***********************************************************

  // this command runs the html file named 'index' by default.
  app.use(express.static(__dirname + '/public'))
    .use(cookieParser());

  /**
   * serve home page
   */
  // actions to perform when server gets an initial connect request
  app.get('/', function (req, res) {
    res.sendFile('index.html', {
      root: __dirname + '/public',
    });
  });

  /**
   * Log into Spotify
   */
  app.get('/login', function (req, res) {
    let state = generateRandomString(16);
    res.cookie(stateKey, state);

    // your application requests authorization
    let scope = 'user-read-private user-read-email';
    res.redirect('https://accounts.spotify.com/authorize?' +
      querystring.stringify({
        response_type: 'code',
        client_id: clientId,
        scope: scope,
        redirect_uri: redirectUri,
        state: state,
      }));
  });

  app.get('/callback', function (req, res) {
    // your application requests refresh and access tokens
    // after checking the state parameter

    let code = req.query.code || null;
    let state = req.query.state || null;
    let storedState = req.cookies ? req.cookies[stateKey] : null;

    if (state === null || state !== storedState) {
      res.redirect('/#' +
        querystring.stringify({
          error: 'state_mismatch',
        }));
    } else {
      res.clearCookie(stateKey);

      let authOptions = {
        url: 'https://accounts.spotify.com/api/token',
        form: {
          code: code,
          redirect_uri: redirectUri,
          grant_type: 'authorization_code',
        },
        headers: {
          'Authorization': 'Basic ' + new Buffer(clientId + ':' + clientSecret)
            .toString('base64'),
        },
        json: true,
      };

      request.post(authOptions, function (error, response, body) {
        if (!error && response.statusCode === 200) {
          let accessToken = body.access_token;
          let refreshToken = body.refresh_token;

          let options = {
            url: 'https://api.spotify.com/v1/me',
            headers: {
              'Authorization': 'Bearer ' + accessToken,
            },
            json: true,
          };

          // use the access token to access the Spotify Web API
          request.get(options, function (error, response, body) {
            console.log(body);
            // console.log(error);
          });

          // we can also pass the token to the browser to make requests from there
          res.redirect('/#' +
            querystring.stringify({
              access_token: accessToken,
              refresh_token: refreshToken,
            }));
        } else {
          res.redirect('/#' +
            querystring.stringify({
              error: 'invalid_token',
            }));
        }
      });
    }
  });

  app.get('/refresh_token', function (req, res) {
    // requesting access token from refresh token
    let refreshToken = req.query.refresh_token;
    let authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      headers: {
        'Authorization': 'Basic ' + new Buffer(clientId + ':' + clientSecret)
          .toString('base64'),
      },
      form: {
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      },
      json: true,
    };

    request.post(authOptions, function (error, response, body) {
      if (!error && response.statusCode === 200) {
        let accessToken = body.access_token;
        res.send({
          'access_token': accessToken,
        });
      }
    });
  });

  // console.log('Listening on 8888');
  // app.listen(8888);
  const port = process.env.PORT || 8888;

  const server = app.listen(port, function () {
    console.log('Server running at http://127.0.0.1:' + port + '/');
  });
}
