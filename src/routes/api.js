/**
 * @file HTTP requests to external servers (RESTful API calls)
 */

/** Module dependencies */
var request = require('request');

/**
 * RESTful API calls
 * @module API
 */
module.exports = {

	/** HTTP request to the Open Weather Map API */
	weather: function(req, res) {
		var params = req.params.location.split(',');
		var position = {latitude: params[0], longitude: params[1]};
		var key = '5e2107b0ce1ca798d76e32f41dcc81fe'; 
		var url = "http://api.openweathermap.org/data/2.5/weather?lat='" 
        		+ position.latitude + "'&lon='" + position.longitude 
        		+ "'&APPID=" + key;

        request(url, function(error, response, body) {
        	if (error) {
				return console.log('Error: ', error);
			}
			if (response.statusCode !== 200) {
				return console.log('Invalid status code: ', response.statusCode);
			}
			var info = JSON.parse(body);
			res.send(info);
        });
	},

	/** HTTP request to the Flickr API */
	photo: function(req, res) {
		var params = req.params.location.split(',');
		var position = {latitude: params[0], longitude: params[1]};
		var keyword = params[2];
		var key = '34b0b3186145bc89472de08424c099f7';
		var url = "https://api.flickr.com/services/rest/?method=flickr.photos.search" 
                + "&api_key=" + key + "&lat=" + position.latitude + "&lon=" 
                + position.longitude + "&accuracy=1&tags=" + keyword 
                + ",night&sort=relevance&extras=url_l&format=json";

        res.send(url);
	},

	/** HTTP request to the Foursquare API */
	placeInfo: function(req, res) {
		var params = req.params.location.split(',');
		var position = {latitude: params[0], longitude: params[1]};
		var id = 'IWLYPFQCMGW2FHGZFBB4T22JWJPXAYP3ILENFTP0NNDM4JCF';
		var secret = '5FCOEYO4TNKZYO2FUS5JF4KTHLRMUHIMQCZPBP3ICHKCA1OO';
		var url = 'https://api.foursquare.com/v2/venues/search?client_id=' 
			+ id + '&client_secret=' + secret + '&v=20150829&ll=' 
			+ position.latitude + ',' + position.longitude;

		request(url, function(error, response, body) {
        	if (error) {
				return console.log('Error: ', error);
			}
			if (response.statusCode !== 200) {
				return console.log('Invalid status code: ', response.statusCode);
			}
			var info = JSON.parse(body);
			res.send(info);
        });
	},

	/** HTTP request to the Foursquare API */
	placeData: function(req, res) {
		var param = req.params.id;
		var id = 'IWLYPFQCMGW2FHGZFBB4T22JWJPXAYP3ILENFTP0NNDM4JCF';
		var secret = '5FCOEYO4TNKZYO2FUS5JF4KTHLRMUHIMQCZPBP3ICHKCA1OO';
		var version = '20150829';
		var url = 'https://api.foursquare.com/v2/venues/' + param + '?client_id=' 
				+ id + '&client_secret=' + secret + '&v=' + version;

		request(url, function(error, response, body) {
        	if (error) {
				return console.log('Error: ', error);
			}
			if (response.statusCode !== 200) {
				return console.log('Invalid status code: ', response.statusCode);
			}
			var info = JSON.parse(body);
			res.send(info);
        });
	},

	/** HTTP request to the Google Places API */
	place: function(req, res) {
		var params = req.params.location.split(',');
		var position = {latitude: params[0], longitude: params[1]};
		var name = params[2];
		var key = 'AIzaSyBE0F5GdLcE3651WbPXlUhuKINvpwij5ZQ';
		var url = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=' 
				+ position.latitude + ',' + position.longitude + '&radius=200&name=' 
				+ name + '&key=' + key;

		request(url, function(error, response, body) {
        	if (error) {
				return console.log('Error: ', error);
			}
			if (response.statusCode !== 200) {
				return console.log('Invalid status code: ', response.statusCode);
			}
			var info = JSON.parse(body);
			res.send(info);
        });
	}
};
