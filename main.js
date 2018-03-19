const baseURL = 'https://api.spotify.com';
console.log('running jquery');
jQuery.get(baseURL + '1ny60YCHhEsxsJXWLhK7b0', function dataRetrieved(data) {
  // if (console && console.log) {
  console.log('sample of data: ' + data);
  // jQuery('#gotData')
  // .innerHtml(data);
  // }
});

jQuery.ajax({
    'async': true,
    'contentType': 'application/json',
    'dataType': 'json',
    'Autorization': access_token,
  })
  .done(function(data) {
    console.log(data);
  });
