/**
 * @file Map and places
 */

var map;
var markers = [];
var infowindow;
var pos = {lat: 0, long: 0};

/**
 * Initialise Google Map with current user's location
 */
function initMap() {
	if (navigator.geolocation) {
    	navigator.geolocation.getCurrentPosition(function(position) {
        	pos.lat = position.coords.latitude,
        	pos.lng = position.coords.longitude
        	map = new google.maps.Map(document.getElementById('map-canvas'), {
            	center: pos,
            	zoom: 16
        	});
        	placesSearch();
        	infowindow = new google.maps.InfoWindow({
        		maxWidth: 200
       		});
			var type = null;
			searchNearby(type);
    	}, function() {
        	handleLocationError(true, infowindow, map.getCenter());
    	});
  	} else {
    	handleLocationError(false, infowindow, map.getCenter());
  	}
}

/**
 * Search nearby places
 * @param {String} type - Specified place category
 */
function searchNearby(type) {
	var service = new google.maps.places.PlacesService(map);
	if (type != null) {
		service.nearbySearch({
			location: pos,
			radius: 1000,
			types: [type]
		}, callback);
	}
}

/**
 * A callback function that creates makers on the map
 * according to each search result
 * @param {Object[]} results - Search results
 * @param {String} status - Service status
 */
function callback(results, status) {
	if (status === google.maps.places.PlacesServiceStatus.OK) {
		clearMarkers();
		for (var i = 0; i < results.length; i++) {
			createMarker(results[i]);
		}
	}
}

/**
 * Create a single marker on the map
 * @param {Object} place - A place object
 */
function createMarker(place) {
	var placeLoc = place.geometry.location;
	var marker = new google.maps.Marker({
		map: map,
		position: place.geometry.location
	});

	var lat = place.geometry.location.lat();
	var lng = place.geometry.location.lng();

	google.maps.event.addListener(marker, 'click', function() {
		getPlaceInfo(lat, lng, place.name);
		infowindow.open(map, this);
	});

	markers.push(marker);
}

/**
 * Remove all markers from the map
 */
function clearMarkers() {
	for (var i = 0; i < markers.length; i++) {
			markers[i].setMap(null);
		}
		markers = [];
}

/**
 * Search nearby places when a button is clicked
 * @param {Object} button - A button labelled with a place category
 * @param {String} type - Specified place category
 */
function buttonSearch(button, type) {
	button.onclick = function() {
		searchNearby(type);
		map.setCenter(pos);
	};
}

/**
 * Add a search box onto the map and implement 
 * autocomplete functionality 
 */
function placesSearch() {
	var input = document.getElementById('places-input');
	var searchBox = new google.maps.places.SearchBox(input);
	map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

	map.addListener('bounds_changed', function() {
		searchBox.setBounds(map.getBounds());
	});

	searchBox.addListener('places_changed', function() {
		var places = searchBox.getPlaces();

		if (places.length == 0) {
			return;
		}

		clearMarkers();

		var bounds = new google.maps.LatLngBounds();
		places.forEach(function(place) {
			createMarker(place);

			if (place.geometry.viewport) {
				bounds.union(place.geometry.viewport);
			} else {
				bounds.extend(place.geometry.location);
			}
		});
		map.fitBounds(bounds);
	});
}

/**
 * Match buttons with valid place categories from
 * the Google Places API
 */
window.onload = function() {
	var numButtons = 32;
	/** Types specified by Google Places Web Service */
	var types = ['restaurant', 'cafe', 'bar', 'night_club', 
				'meal_delivery', 'meal_takeaway', 'bakery', 'liquor_store',
				'department_store', 'shopping_mall', 'electronics_store', 
				'book_store', 'clothing_store', 'shoe store', 'grocery_or_supermarket', 
				'convenience_store', 'library', 'art_gallery', 'museum', 'casino',
				'movie_theater', 'bowling_alley', 'gym', 'park',
				'atm', 'bank', 'post_office', 'police', 'health',
				'hospital', 'doctor', 'dentist'];
	var buttons = [];
	buttons = document.getElementsByClassName('btn');

	for (var i = 0; i < numButtons; i++) {
		buttonSearch(buttons[i], types[i]);
	}
}

/**
 * Get places information in the specified area
 * @param {Number} latitude - Geographic cooridinate (latitude)
 * @param {Number} longitude - Geographic cooridinate (longitude)
 * @param {String} name - Place name 
 */
function getPlaceInfo(latitude, longitude, name) {
	var params = latitude + ',' + longitude;
	var url = '/placeinfo/' + params;

	if (window.XMLHttpRequest) {
		var xmlhttp = new XMLHttpRequest();
		xmlhttp.addEventListener('load', function() {
			var response = JSON.parse(xmlhttp.responseText);
			var placeName = name.split(' ')[0].toLowerCase();
			var placeID;
			var onFoursquare = false;

			for (var i = 0; i < response.response.venues.length; i++) {
				if (response.response.venues[i].name.split(' ')[0].toLowerCase()
					== 'the' && placeName == 'the') {
					if (response.response.venues[i].name.split(' ')[1].toLowerCase()
						== name.split(' ')[1].toLowerCase()) {
						placeID = response.response.venues[i].id;
						getPlaceData(placeID);
						onFoursquare = true;
						break;
					}
				} else if (response.response.venues[i].name.split(' ')[0].toLowerCase() 
					== placeName && placeName != 'the') {
					placeID = response.response.venues[i].id;
					getPlaceData(placeID);
					onFoursquare = true;
					break;
				} 
			}
			if (!onFoursquare) {
				getPlace(latitude, longitude, name);
			}
		}, false);

		xmlhttp.addEventListener('error', function(err) {
			alert('Unable to complete the request');
		}, false);

		xmlhttp.open('GET', url, true);
		xmlhttp.send();
	} else {
		alert('Unable to fetch data from Foursquare');
	}
}

/**
 * Get place data specified by a place ID
 * @param {String} placeID - Place ID (From the Foursquare's database) 
 */
function getPlaceData(placeID) {
	var url = '/placedata/' + placeID;

	if (window.XMLHttpRequest) {
		var xmlhttp = new XMLHttpRequest();
		xmlhttp.addEventListener('load', function() {
			var response = JSON.parse(xmlhttp.responseText);
			var content = '';
			var photo;
			var photoLink = {
				size: '200x200',
				prefix: null,
				suffix: null
			};

			if (response.response.venue.photos.count > 0) {
				photoLink.prefix = response.response.venue.photos.groups[0].items[0].prefix;
				photoLink.suffix = response.response.venue.photos.groups[0].items[0].suffix;
				photo = photoLink.prefix + photoLink.size + photoLink.suffix;
			}

			var details = {
				name: response.response.venue.name,
				address: response.response.venue.location.formattedAddress[0],
				phoneNumber: response.response.venue.contact.phone,
				rating: response.response.venue.rating,
				website: response.response.venue.url,
				foursquare: response.response.venue.canonicalUrl,
			};

			var tips = [];
			if (response.response.venue.tips.groups[0].items.length > 0) {
				tips[0] = {
					tip: response.response.venue.tips.groups[0].items[0].text,
					firstName: response.response.venue.tips.groups[0].items[0].user.firstName,
					lastName: response.response.venue.tips.groups[0].items[0].user.lastName
					
				};
				if (response.response.venue.tips.groups[0].items.length > 1) {
					tips[1] = {
						tip: response.response.venue.tips.groups[0].items[1].text,
						firstName: response.response.venue.tips.groups[0].items[1].user.firstName,
						lastName: response.response.venue.tips.groups[0].items[1].user.lastName
					};
				}
			}

			if (dataAvailable(photo)) {
				content += '<br/><img src="' + photo 
						+ '" class="img-responsive"' 
						+ ' style="margin-left:21px;">';
			} 
			if (dataAvailable(details.name)) {
				content += '<br/><strong>'+ details.name + '</strong>';
			}
			if (dataAvailable(details.address)) {
				content += '<br/>' + details.address;
			}
			if (dataAvailable(details.phoneNumber)) {
				content += '<br/>Tel: ' + details.phoneNumber;
			}
			if (dataAvailable(details.rating)) {
				content += '<br/>Rating: ' + details.rating + '/10';
			}
			if (dataAvailable(details.website)) {
				content += '<br/>Website: <a href="' 
						+ details.website + '">' + details.name + '</a>';
			}
			if (dataAvailable(details.foursquare)) {
				content += '<br/>Foursquare: <a href="' 
						+ details.foursquare + '">View on Foursquare</a>';
			}
			if (dataAvailable(tips[0])) {
				content += '<br/><br/><strong>Tips and Reviews</strong>'
						+ '<br>"' + tips[0].tip + '"';
				if (dataAvailable(tips[0].firstName)) {
					content += ' — ' + tips[0].firstName;
					if (dataAvailable(tips[0].lastName)) {
						content += ' ' + tips[0].lastName;
					}
				} 
			}
			if (dataAvailable(tips[1])) {
				content += '<br><br/>"' + tips[1].tip + '"';
				if (dataAvailable(tips[1].firstName)) {
					content += ' — ' + tips[1].firstName;
					if (dataAvailable(tips[1].lastName)) {
						content += ' ' + tips[1].lastName;
					}
				} 
			}
			if (response.response.venue.tips.groups[0].items.length > 0) {
				if (dataAvailable(details.foursquare)) {
					content += '<br/><br/>View more reviews on <a href="' 
							+ details.foursquare + '">Foursquare</a>';
				}
			}

			infowindow.setContent(content);
		}, false);

		xmlhttp.addEventListener('error', function(err) {
			alert('Unable to complete the request');
		}, false);

		xmlhttp.open('GET', url, true);
		xmlhttp.send();
	} else {
		alert('Unable to fetch data from Foursquare');
	}
}

/**
 * Get place information specified by geographic coordinates and place name
 * @param {Number} latitude - Geographic cooridinate (latitude)
 * @param {Number} longitude - Geographic cooridinate (longitude)
 * @param {String} name - Place name 
 */
function getPlace(latitude, longitude, name) {
	var params = latitude + ',' + longitude + ',' + name.split(' ')[0];
	var url = '/place/' + params;

	if (window.XMLHttpRequest) {
		var xmlhttp = new XMLHttpRequest();
		xmlhttp.addEventListener('load', function() {
			var response = JSON.parse(xmlhttp.responseText);
			var content = '';

			if (response.results.length > 0) {
				var details = {
					name: response.results[0].name,
					vicinity: response.results[0].vicinity,
					rating: response.results[0].rating
				}; 

				if (dataAvailable(details.name)) {
				content += '<strong>' + details.name + '</strong>';
				}
				if (dataAvailable(details.vicinity)) {
				content += '<br/>' + details.vicinity;
				}
				if (dataAvailable(details.rating)) {
				content += '<br/>Rating: ' + details.rating + '/5';
				}
			} else {
				content += '<strong>' + name + '</strong>';
			}

			infowindow.setContent(content);
		}, false);

		xmlhttp.addEventListener('error', function(err) {
			alert('Unable to complete the request');
		}, false);

		xmlhttp.open('GET', url, true);
		xmlhttp.send();
	} else {
		alert('Unable to fetch data');
	}
}

/**
 * Check if specified data is not null
 */
function dataAvailable(data) {
	if (data != null && data != 'undefined' &&
		data != NaN) {
		return true;
	}
	return false;
}
