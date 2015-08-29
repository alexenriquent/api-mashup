var map;
var markers = [];
var infowindow;
var pos = {lat: 0, long: 0};

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

function callback(results, status) {
	if (status === google.maps.places.PlacesServiceStatus.OK) {
		clearMarkers();
		for (var i = 0; i < results.length; i++) {
			createMarker(results[i]);
		}
	}
}

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

function clearMarkers() {
	for (var i = 0; i < markers.length; i++) {
			markers[i].setMap(null);
		}
		markers = [];
}

function buttonSearch(button, type) {
	button.onclick = function() {
		searchNearby(type);
	};
}

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

window.onload = function() {
	var types = ['restaurant', 'cafe', 'bar', 'night_club', 
				'meal_delivery', 'meal_takeaway', 'bakery', 'liquor_store'];
	var buttons = [];
	buttons = document.getElementsByClassName('btn');

	for (var i = 0; i < 10; i++) {
		buttonSearch(buttons[i], types[i]);
	}
}

function getPlaceInfo(latitude, longitude, name) {
	var id = 'IWLYPFQCMGW2FHGZFBB4T22JWJPXAYP3ILENFTP0NNDM4JCF';
	var secret = '5FCOEYO4TNKZYO2FUS5JF4KTHLRMUHIMQCZPBP3ICHKCA1OO';
	var url = 'https://api.foursquare.com/v2/venues/search?client_id=' 
			+ id + '&client_secret=' + secret + '&v=20150829&ll=' 
			+ latitude + ',' + longitude;

	if (window.XMLHttpRequest) {
		var xmlhttp = new XMLHttpRequest();
		xmlhttp.addEventListener('load', function() {
			var response = JSON.parse(xmlhttp.responseText);
			var placeName = name.split(' ')[0].toLowerCase();
			var placeID;

			for (var i = 0; i < response.response.venues.length; i++) {
				if (response.response.venues[i].name.split(' ')[0].toLowerCase() == placeName &&
					placeName != 'the') {
					placeID = response.response.venues[i].id;
					getPlaceDetails(placeID);
					break;
				} else if (placeName == 'the') {
					if (response.response.venues[i].name.split(' ')[1].toLowerCase() == 
						name.split(' ')[1].toLowerCase()) {
						placeID = response.response.venues[i].id;
						getPlaceDetails(placeID);
						break;
					}
				} else {
					infowindow.setContent('<strong>' + name + '</strong>');
				}
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

// function getPlacePhoto(placeID) {
// 	var id = 'IWLYPFQCMGW2FHGZFBB4T22JWJPXAYP3ILENFTP0NNDM4JCF';
// 	var secret = '5FCOEYO4TNKZYO2FUS5JF4KTHLRMUHIMQCZPBP3ICHKCA1OO';
// 	var url = 'https://api.foursquare.com/v2/venues/' + placeID + '/photos?client_id=' 
// 			+ id + '&client_secret=' + secret + '&v=20150829';

// 	if (window.XMLHttpRequest) {
// 		var xmlhttp = new XMLHttpRequest();
// 		xmlhttp.addEventListener('load', function() {
// 			var response = JSON.parse(xmlhttp.responseText);
// 			var size = '200x200';
// 			var prefix;
// 			var suffix;
// 			var photo;
			
// 			if (response.response.photos.count > 0) {
// 				prefix = response.response.photos.items[0].prefix;
// 				suffix = response.response.photos.items[0].suffix;
// 				photo = prefix + size + suffix;
// 			}

// 			getPlaceDetails(placeID, photo);
// 		}, false);

// 		xmlhttp.addEventListener('error', function(err) {
// 			alert('Unable to complete the request');
// 		}, false);

// 		xmlhttp.open('GET', url, true);
// 		xmlhttp.send();
// 	} else {
// 		alert('Unable to fetch data from Foursquare');
// 	}
// } 

function getPlaceDetails(placeID) {
	var id = 'IWLYPFQCMGW2FHGZFBB4T22JWJPXAYP3ILENFTP0NNDM4JCF';
	var secret = '5FCOEYO4TNKZYO2FUS5JF4KTHLRMUHIMQCZPBP3ICHKCA1OO';
	var url = 'https://api.foursquare.com/v2/venues/' + placeID + '?client_id=' 
			+ id + '&client_secret=' + secret + '&v=20150829';

	if (window.XMLHttpRequest) {
		var xmlhttp = new XMLHttpRequest();
		xmlhttp.addEventListener('load', function() {
			var response = JSON.parse(xmlhttp.responseText);
			var content = '';
			var size = '200x200';
			var prefix;
			var suffix;
			var photo;

			if (response.response.venue.photos.count > 0) {
				prefix = response.response.venue.photos.groups[0].items[0].prefix;
				suffix = response.response.venue.photos.groups[0].items[0].suffix;
				photo = prefix + size + suffix;
			}

			var name = response.response.venue.name;
			var rating = response.response.venue.rating;
			var address = response.response.venue.location.formattedAddress[0];
			var phoneNumber = response.response.venue.contact.phone;
			var website = response.response.venue.url;
			var foursquare = response.response.venue.canonicalUrl;

			if (dataAvailable(photo)) {
				content += '<br/><img src="' + photo 
						+ '" class="img-responsive"' 
						+ ' style="margin-left:21px;">';
			}
			if (dataAvailable(name)) {
				content += '<br/><strong>'+ name + '</strong>';
			}
			if (dataAvailable(rating)) {
				content += '<br/>Rating: ' + rating + '/10';
			}
			if (dataAvailable(address)) {
				content += '<br/>Address: ' + address;
			}
			if (dataAvailable(phoneNumber)) {
				content += '<br/>Tel: ' + phoneNumber;
			}
			if (dataAvailable(website)) {
				content += '<br/>Website: <a href="' 
						+ website + '">' + name + '</a>';
			}
			if (dataAvailable(foursquare)) {
				content += '<br/>Foursquare: <a href="' 
						+ foursquare + '">View on Foursquare</a></div>';
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

function dataAvailable(data) {
	if (data != null) {
		return true;
	}
	return false;
}

