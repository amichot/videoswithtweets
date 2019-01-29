"use strict";
//youtube API key, url, users search value for back button
const apiKey = "AIzaSyCyPfvlKfIkWknSdpqQIGjKPOpVcT6opdg";
const searchURL = "https://www.googleapis.com/youtube/v3/search";
let userSearch = ""
const commentsUrl = `https://www.googleapis.com/youtube/v3/commentThreads?part=snippet%2Creplies&textFormat=plainText&videoId=${userSearch}&fields=items%2Freplies%2Fcomments%2Fsnippet%2FtextOriginal&key=${apiKey}`;

function getComments() {
	fetch(commentsUrl)
		.then(response => {
			if (response.ok) {
				return response.json();
			}
			throw new Error(response.json());
		})
		.then(responseJson => console.log(responseJson))
		.catch(err => {
			$("#error-message").text(`Something went wrong: ${err.message}`);
		});
}


//gets youtube video
function video(videoId) {
	$("#video-results").append(`
 <iframe title="YouTube video player" class="youtube-player" type="text/html" 
width="640" height="390" src="https://www.youtube.com/embed/${videoId}"
frameborder="0" allowFullScreen></iframe>
 `);
}


//displays video page to view video clicked
function displayVideo(videoId) {
	$("main").html(
		`<section id="video-results"><header><nav></nav></header></section>`
	);
	video(videoId);
	$( "#results" ).removeClass("hide", "Remove");
	watchBackButton(userSearch);
	getComments();
}

// Gets youtube video from results clicked
function clickResult() {
	$("#list-results").on("click", "li", function (event) {
		let videoId = event.currentTarget;
		videoId = $(videoId).attr("id");
		displayVideo(videoId);
	});
}

//Sends User to youtube results page on button click
function watchBackButton(userSearch) {
	$("input[value='Back']").on("click", function (event) {
		$("#video-results").empty();
		buildYoutubeRequest(userSearch);
		$("#results").addClass("hide");
	});
}

function renderHome() {
	$("main").html(`
    <section id="home">
    <header role="banner">
      <h1>Videos with Tweets</h1>
    </header>
    <form id="js-form">
      <label for="Search">Search</label>
      <input type="text" name="Search" id="js-search">

      <input type="submit" value="Search">
    </form>
    <p id="error-message"></p>
  </section>
    `);
}

//Sends user to Home Screen on button click
function watchHomeButton() {
	$("input[value='Home']").on("click", function (event) {
		$("body").removeAttr("id");
		renderHome();
		$( "#js-navlist" ).addClass("hide");
	});
}

// displays youtube search results
function displayResults(responseJson) {
	// Change html body's CSS
	$("body").attr("id", "body-results");
	// ADD Section, Header, and Return Home Button
	$("main").html(
		`<section id="search-results"><header><h1>Select Youtube Video</h1></header></section>`
	);
	$( "#js-navlist" ).removeClass("hide");
	// Add Search Results Content
	$("#search-results").append(`<ul id="list-results"></ul>`);
	for (let i = 0; i < responseJson.items.length; i++) {
		$("#list-results").append(
			`<li id="${responseJson.items[i].id.videoId}"><img src='${
				responseJson.items[i].snippet.thumbnails.default.url
			}'>
      <h2>${responseJson.items[i].snippet.title}</h2>
      <p>${responseJson.items[i].snippet.description}</p>
      </li>`
		);
	}
	// Get Video Clicked
	clickResult();
}

// Youtube API format params
function formatQueryParams(params) {
	const queryItems = Object.keys(params).map(
		key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`
	);
	return queryItems.join("&");
}

//Makes call to Youtube API
function buildYoutubeRequest(query) {
	const params = {
		key: apiKey,
		q: query,
		part: "snippet",
		maxResults: 10,
		type: "video"
	};
	const queryString = formatQueryParams(params);
	const url = searchURL + "?" + queryString;

	fetch(url)
		.then(response => {
			if (response.ok) {
				return response.json();
			}
			throw new Error(response.json());
		})
		.then(responseJson => displayResults(responseJson))
		.catch(err => {
			$("#error-message").text(`Something went wrong: ${err.message}`);
		});
}
// home screen watch for user submit, call buildYoutubeRequest
function watchForm() {
	$("#js-form").on("submit", function (event) {
		event.preventDefault();
		userSearch = $("#js-search").val();
		buildYoutubeRequest(userSearch);
	});
}

function launchHomeScreen() {
	watchHomeButton()
	$('#home').trigger('click')
	watchForm()
}

launchHomeScreen()
