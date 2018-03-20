/**
 * Obtains parameters from the hash of the URL
 * @return {Object} has parems
 */
function getHashParams() {
  let hashParams = {};
  let e;
  let r = /([^&;=]+)=?([^&;]*)/g;
  let q = window.location.hash.substring(1);
  while (e = r.exec(q)) {
    hashParams[e[1]] = decodeURIComponent(e[2]);
  }
  return hashParams;
}

/**
 *  Returns a random integer between min (inclusive) and max (inclusive)
 *  @param {Number} max - the high end of the numbers to choose from
 *  @return {Number} a random number that was generated
 */
function getRandomInt(max) {
  return Math.floor(Math.random() * (max - 0 + 1)) + 0;
}

// get 10 random songs from the playlist
/**
 *  returns an array of X numbers
 *  @param {Number} trackCount = max range of numbers to choose from
 *  @param {Number} count = length of the array to return
 *  @return {Object} array with numbers
 */
function generateSongList(trackCount, count) {
  let myArray = [];
  // continue the loop if the array does not have X values
  do {
    // reset array in the event of a loop
    myArray = [];
    // fill array with random numbers
    for (let y = 0; y < count; y += 1) {
      let addMe = getRandomInt(trackCount);
      // push value into the songs array
      myArray.push(addMe);
    }
    // filter array to only have unique values
    myArray = Array.from(new Set(myArray));
  } while (myArray.length !== count);
  // return finished array
  return myArray;
}

/**
 * gets the current users profile information
 * @param {string} accessToken - the currnen session Spotify access token
 */
function getUserProfile(accessToken) {
  /**
   *  Load the users profile
   */
  $.ajax({
    url: 'https://api.spotify.com/v1/me',
    headers: {
      'Authorization': 'Bearer ' + accessToken,
    },
    success: function(response) {
      // dynamically call the template file to load the html onto the page
      jQuery.ajax({
        url: 'templates/user-profile-template.hbs',
        success: function(data) {
          // handlebar process and load html onto the webpage
          let userProfileTemplate = Handlebars.compile(data);
          let userProfilePlaceholder = document.getElementById('user-profile');
          userProfilePlaceholder.innerHTML = userProfileTemplate(response);
          // toggle visibility to page sections
          jQuery('#login')
            .hide();
          jQuery('#gameInterface')
            .hide();
          jQuery('#loggedin')
            .show();
        },
      });
    },
    error: function(xhr, status, e) {
      // this will run if the token has expired after the user tries to reload the game
      if (xhr.status == 401 && e === 'Unauthorized') {
        jQuery('body .container')
          .prepend('<span>Connection Timed Out : Please log back into Spotify</span>');
        jQuery('#login')
          .show();
      }
    },
  });
}

/**
 * logging into spotify
 */
function loadGame() {
  let params = getHashParams();

  let accessToken = params.access_token;
  let refreshToken = params.refresh_token;
  let error = params.error;

  if (error) {
    // if log in was unsuccessful
    alert('There was an error during the authentication');
  } else {
    // RUN THIS IF LOG IN WAS SUCCESSFUL
    if (accessToken) {
      // load user profile with information
      getUserProfile(accessToken);
    } else {
      // render initial screen
      jQuery('#login')
        .show();
      jQuery('#gameInterface')
        .hide();
      jQuery('#loggedin')
        .hide();
    }

    // BIND EVENT LISTER TO START GAME BUTTON
    jQuery('#startGame')
      .on('click', {
        access_token: accessToken,
      }, startGame);
  }
}

// load the function call everytime the page loads
jQuery(document)
  .ready(loadGame);
