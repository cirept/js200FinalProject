/* globals Handlebars */

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
 *  @param {Number} count = length of the array to returns
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
  } while (myArray.length !== 10);
  console.log(myArray);
  // return finished array
  return myArray;
}

// console.log(generateSongList(100, 10));


// let userProfileSource = document.getElementById('user-profile-template')
//   .innerHTML;
// let userProfileTemplate = Handlebars.compile(userProfileSource);
// let userProfilePlaceholder = document.getElementById('user-profile');

// const bindEvents = () => {
//   let params = getHashParams();
//
//   // start game button
//   jQuery('#startGame')
//     .on('click', function() {
//       jQuery.ajax({
//         url: '/startGame',
//         data: params,
//         success: function(data, status, xhr) {
//           console.log('data recieved');
//           console.log(data);
//         },
//       });
//     });
// };
