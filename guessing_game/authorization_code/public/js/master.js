/**
 * Extends jquery functionality for easy implementation
 * of animate css classes
 */
$.fn.extend({
  animateCss: function (animationName, callback) {
    var animationEnd = (function (el) {
      var animations = {
        animation: 'animationend',
        OAnimation: 'oAnimationEnd',
        MozAnimation: 'mozAnimationEnd',
        WebkitAnimation: 'webkitAnimationEnd',
      };

      for (var t in animations) {
        if (el.style[t] !== undefined) {
          return animations[t];
        }
      }
    })(document.createElement('div'));

    this.addClass('animated ' + animationName)
      .one(animationEnd, function () {
        $(this)
          .removeClass('animated ' + animationName);

        if (typeof callback === 'function') callback();
      });

    return this;
  },
});


/**
 * Obtains parameters from the hash of the URL
 * @return {Object} has parems
 */
const getHashParams = () => {
  let hashParams = {};
  let e;
  let r = /([^&;=]+)=?([^&;]*)/g;
  let q = window.location.hash.substring(1);
  while (e = r.exec(q)) {
    hashParams[e[1]] = decodeURIComponent(e[2]);
  }
  return hashParams;
};


/**
 *  Returns a random integer between min (inclusive) and max (inclusive)
 *  @param {Number} max - the high end of the numbers to choose from
 *  @return {Number} a random number that was generated
 */
const getRandomInt = (max) => {
  return Math.floor(Math.random() * (max - 0 + 1)) + 0;
};


/**
 *  returns an array of X numbers
 *  @param {Number} trackCount = max range of numbers to choose from
 *  @param {Number} count = length of the array to return
 *  @return {Object} array with numbers
 */
const generateSongList = (trackCount, count) => {
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
};


/**
 * gets the current users profile information
 * @param {string} accessToken - the currnen session Spotify access token
 */
const getUserProfile = (accessToken) => {
  /**
   *  Load the users profile
   */
  $.ajax({
    url: 'https://api.spotify.com/v1/me',
    headers: {
      'Authorization': 'Bearer ' + accessToken,
    },
  })
    .fail(function (xhr, textStatus, e) {
      // this will run if the token has expired after the user tries to reload the game
      if (xhr.status == 401 && e === 'Unauthorized') {
        jQuery('body .container')
          .prepend('<span>Connection Timed Out : Please log back into Spotify</span>');
        jQuery('#login')
          .show();
      }
    })
    .done((response, textStatus, xhr) => {
      // dynamically call the template file to load the html onto the page
      jQuery.ajax({
        url: 'templates/user-profile-template.hbs',
      })
        .done((data, textStatus, xhr) => {
          // handlebar process and load html onto the webpage
          let userProfileTemplate = Handlebars.compile(data);
          let userProfilePlaceholder = document.getElementById('user-profile');
          userProfilePlaceholder.innerHTML = userProfileTemplate(response);

          jQuery('body')
            .css({
              'background-color': 'rgb(29, 185, 84)',
              '-webkit - transition': 'background-color 1000ms linear',
              '-ms-transition': 'background-color 1000ms linear',
              'transition': 'background-color 1000ms linear',
            });
          // ----------------------------------
          // toggle visibility to page sections
          // ----------------------------------
          jQuery('#login')
            .hide();
          jQuery('#gameInterface')
            .hide();
          jQuery('#loggedin')
            .fadeIn(1000);

          // ----------------------------------
          // show loading screen
          // ----------------------------------
          jQuery('#gameSettings')
            .removeClass('hide')
            .css('display', 'flex')
            .hide()
            .fadeIn(1000);

          // ----------------------------------
          // build the options for the questions amount drop down
          // ----------------------------------
          let $myDrop = jQuery('#gameSettings > select');
          for (let z = 5; z <= 20; z += 1) {
            $myDrop.html($myDrop.html() + '<option value="' + z + '">' + z + '</option>');
          }
        });
    });
};


/**
 *  Makes the scoreboard sticky when the board scrolls to the top of the page
 */
const stickyScoreBoard = () => {
  $(window)
    .scroll(function (e) {
      let $el = $('#scoreboard');
      let isPositionFixed = $el.css('position') == 'fixed';
      if ($(this)
        .scrollTop() > 300 && !isPositionFixed) {
        $el.css({
          'position': 'fixed',
          'top': '0px',
          'z-index': 1,
          'height': '50px',
          'line-height': '50px',
        });
      }
      if ($(this)
        .scrollTop() < 300 && isPositionFixed) {
        $el.css({
          'position': 'static',
          'top': '0px',
          'height': '',
          'line-height': '',
        });
      }
    });
};
/**
 * Triggers the loading animation when the user chooses to log into Spotify
 */
const bindLoginEvent = () => {
  jQuery('#loginLink')
    .on('click', function () {
      jQuery('#login .loginScreen')
        .hide();
      jQuery('#login .loading')
        .removeClass('hide');
    });
};


/**
 * Runs the main Game functions
 */
const loadGame = () => {
  let params = getHashParams();

  let accessToken = params.access_token;
  // let refreshToken = params.refresh_token;
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
};

/**
 *  the master function that will start off the app
 */
const startApp = () => {
  bindLoginEvent();
  stickyScoreBoard();
  loadGame();
};

// load the function call everytime the page loads
jQuery(document)
  .ready(startApp);
