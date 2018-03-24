/**
Starts the functionality of the game
1. Show the game interface div and hides the "Start Game" button
2. Use Spotify API : Grab the total size custom created Spotify Playlist
3. Use Spotify API : Saves the song information of 10 random songs
4. Create an Object with just the information that the game will use.
5. Loop through the song list Object to grab 3 other songs from the artist
6. Using the card template, create html and add it to the page.
*/

/**
 * Starts the game functionality
 * @param {object} event - the click event object passed from the event listener
 */
const startGame = (event) => {
  // show the game UI
  $('#gameInterface')
    .show();
  // hide the buttons
  $('#gameSettings')
    .hide();
  // show game loading screen
  $('#loading')
    .removeClass('hide');

  // the URL for the game playlist
  const totalURL = 'https://api.spotify.com/v1/users/cirept612/playlists/5J9c1FAlO3qEnLMLSqZjwu/tracks?market=ES&fields=total&limit=1&offset=1';
  let trackCount;
  // set the number of songs that make up the game questions
  const numberOfSongs = Number($('#gameSettings select[name="questionAmount"]')
    .val());
  const songList = {}; // empty object to store song information

  if (!trackCount) {
    // ----------------------------------
    // get the total number of tracks in the custom playlist
    // ----------------------------------
    $.ajax({
      url: totalURL,
      async: true,
      contentType: 'application/json',
      dataType: 'json',
      headers: {
        Authorization: `Bearer ${event.data.access_token}`,
      },
    })
      .fail((xhr, status, e) => {
        // ----------------------------------
        // show error message and have the user re-log
        // ----------------------------------
        $('body .container')
          .prepend('<span>Connection Timed Out : Please log back into Spotify</span>');
        $('#loggedin')
          .hide();
        $('#login')
          .show();
      })
      .done((data) => {
        /**
         * if the GET request was successful, save that information
         * and call grab 10 random songs from the playlist
         */
        // get the total number of songs in the spotify playlist
        trackCount = data.total;
        // randomly select X amount of songs from the Spotify playlist
        const songs = generateSongList(trackCount, numberOfSongs);
        // loop counter for the songs
        let no = 1;
        console.log(songs);
        // get the track numbers from the playlist
        // USED MAP BECAUSE I DID NOT WANT TO CREATE A LOOP.  =]
        const quizQuestions = songs.map((x) => {
          // using map to run this function on all items in the array
          const trackURL = `https://api.spotify.com/v1/users/cirept612/playlists/5J9c1FAlO3qEnLMLSqZjwu/tracks?market=ES&limit=1&offset=${x}`;
          $.ajax({
            url: trackURL,
            async: false,
            contentType: 'application/json',
            dataType: 'json',
            headers: {
              Authorization: `Bearer ${event.data.access_token}`,
            },
          })
            .done((response, status, xhr) => {
              // ----------------------------------
              // for demo purposes
              // ----------------------------------
              console.log(response);

              // filter the data that was received from Spotify to
              // only what is needed by the templates
              const track = response.items[0].track;
              // ----------------------------------
              // save song information into an object
              // ----------------------------------
              songList[no] = {
                song_number: no,
                preview_url: track.preview_url,
                name: track.name,
                id: track.id,
                artist: track.artists[0].name,
                artist_id: track.artists[0].id,
                album_art_large: track.album.images[0].url,
                album_art_medium: track.album.images[1].url,
                album_art_small: track.album.images[2].url,
                album_name: track.album.name,
              };

              // using map to run this function on all items in the array
              const artistTopTrackURL = `https://api.spotify.com/v1/artists/${track.artists[0].id}/top-tracks?country=ES`;
              // ----------------------------------
              // Get Artist Top Tracks From spotify
              // ----------------------------------
              $.ajax({
                url: artistTopTrackURL,
                async: false,
                contentType: 'application/json',
                dataType: 'json',
                headers: {
                  Authorization: `Bearer ${event.data.access_token}`,
                },
              })
                .done((data, status, xhr) => {
                  // ----------------------------------
                  // Filter the Top Tracks data Returned from Spotify
                  // Remove Song Guess Question from Artist Top Tracks, if found
                  // ----------------------------------
                  // save tracks to a variable
                  const song_id = track.id; // save the song id
                  const topTracks = data.tracks; // save returned data from Spotify to a variable
                  for (let p = 0; p < topTracks.length; p += 1) {
                    if (topTracks[p].id === song_id) {
                      topTracks.splice(p, 1);
                    }
                  }
                  // ----------------------------------
                  // Generate a list of random numbers ranging from 0 to Array.Length
                  // ----------------------------------
                  const number_of_choices = 3; // define the length of the array
                  const myLength = topTracks.length; // determine the length of the top track array
                  // get an array of 3 randomly generated numbers
                  const choiceList = generateSongList(myLength, number_of_choices);
                  // ----------------------------------
                  // Get the index representation of the randomly generated number list
                  // ----------------------------------
                  // loop through the choice list array
                  for (let i = 0; i < choiceList.length; i += 1) {
                    // use the value at index to determine what song title to grab from the topTracks array
                    choiceList[i] = topTracks[i].name;
                  }
                  // ----------------------------------
                  // Add the real song name into the array
                  // ----------------------------------
                  choiceList.push(track.name);
                  // ----------------------------------
                  // Randomly Sort the choices
                  // ----------------------------------
                  choiceList.sort((a, b) => 0.5 - Math.random());
                  // ----------------------------------
                  // Save generated choice list to the Songs Object
                  // ----------------------------------
                  songList[no].choices = choiceList;
                });
              // increment counter for adding additional songs
              no += 1;
            });
        });

        // ----------------------------------
        // loop through each song stored in the object and create cards for them
        // ----------------------------------
        $.each(songList, (prop, value) => {
          // ----------------------------------
          // Build Song Cards
          // ----------------------------------
          $.ajax({
            url: 'templates/songCard.hbs',
            async: false,
            success: (data) => {
              // ----------------------------------
              // dynamically call the template file and use
              // Handlebars to build the html and add it
              // to the page.
              // ----------------------------------
              const songCardTemplate = Handlebars.compile(data);
              const userProfilePlaceholder = document.getElementById('gameInterface');
              // ----------------------------------
              // Inject the compiled code onto the webpage
              // ----------------------------------
              userProfilePlaceholder.innerHTML += songCardTemplate(value);

              // ----------------------------------
              // animate the song cards reveal
              // ----------------------------------
              $('#gameInterface')
                .hide()
                .show()
                .fadeIn(1000)
                .delay(0)
                .queue(function () {
                  $('div[class*="song"]')
                    .each(function (index, elem) {
                      $(elem)
                        // .hide()
                        .delay(200 * index)
                        .animate({
                          'opacity': 1,
                        }, 1000);
                    });
                });
            },
          });
        });
      })
      .always((data, status, e) => {
        // after the cards have been built and added to the DOM
        // bind the event listeners for the choices
        // ----------------------------------
        // Bind event listeners to the Song Card Elements
        // ----------------------------------
        for (let x = 1; x <= numberOfSongs; x += 1) {
          // ----------------------------------
          // FRONT of Card
          // ----------------------------------
          // bind the functionality to the GUESS SONG button
          $(`.song${x} button.guessSong`)
            .on('click', () => {
              // ----------------------------------
              // STOP ALL PLAYERS
              // ----------------------------------
              $.each($('audio'), function (ind, elem) {
                elem.pause();
              });
              // ----------------------------------
              // Flip to the back of the card
              // ----------------------------------
              $(`.song${x} .flip-container`)
                .addClass('hover');
            });
          // ----------------------------------
          // BACK of Card
          // ----------------------------------
          // bind song choices
          for (let y = 1; y < 5; y += 1) {
            $(`.song${x} .choice${y}`)
              .on('click', (ev) => {
                // ----------------------------------
                // Bind OPTION click functionality
                // ----------------------------------
                let elem = ev.target;
                let $elem = $(ev.currentTarget);
                // const data = event.target.dataset;
                let $parent = $(elem)
                  .parents('div[class*="song"]');
                // ----------------------------------
                // Bind the Options Elements
                // ----------------------------------
                if ($elem.data('song') === $parent.data('song')) {
                  // change whole card green
                  $parent.css({
                    'background-color': 'rgb(29, 185, 84)',
                    '-webkit - transition': 'background-color 1000ms linear',
                    '-ms-transition': 'background-color 1000ms linear',
                    'transition': 'background-color 1000ms linear',
                  });

                  // remove blur from images
                  $parent.find('img')
                    .css({
                      filter: 'inherit',
                    });

                  // convert current score to a number
                  let curScore = Number($('#score')
                    .html());
                  // add the current score plus 1
                  $('#score')
                    .html(curScore + 1);
                } else {
                  $parent.css({
                    'background-color': 'red',
                    '-webkit - transition': 'background-color 1000ms linear',
                    '-ms-transition': 'background-color 1000ms linear',
                    'transition': 'background-color 1000ms linear',
                  });
                }

                // ----------------------------------
                // post answer animations
                // ----------------------------------
                $elem.delay(1000)
                  .queue(function () {
                    // fade out choice list
                    $elem.parents('.back')
                      .fadeOut('fast')
                      .queue(function () {
                        // toggle the choice list container
                        $elem.parents('.flip-container')
                          .animate({
                            'height': 'toggle',
                          }, 1000);
                        // hide the h2 while the animations happen
                        // $parent.children('.cardHead')
                        //   .toggle();
                        // shrink the entire card
                        $parent.animate({
                          'height': '255px',
                        }, 500)
                          // .delay(350)
                          .queue(function () {
                            // show the h2
                            $parent.children('.cardHead')
                              .animate({
                                'top': '45px',
                              }, 500);
                            // .toggle();
                          });
                      });
                  });
              });
          }
        }
        // ----------------------------------
        // Show the ScoreBoard
        // ----------------------------------
        $('#scoreboard')
          .fadeIn(1000);
        // ----------------------------------
        // hide loading screen
        // ----------------------------------
        $('#loading')
          .addClass('hide');
      });
  } else {
    console.log('track count already known');
  }
};
