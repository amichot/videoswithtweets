"use strict";
//youtube API key, url, users search value for back button
const twitterService = require("./twitter.js")()
console.log("test" + twitterService.test());

const apiKey = "AIzaSyCOWBRqsfecwAAwNE5SKu1vio8LMtgzgkE";
const searchURL = "https://www.googleapis.com/youtube/v3/search";
let userSearch = "";
let vidId = "";
const commentsURL = "https://www.googleapis.com/youtube/v3/commentThreads";


function getSentiment(comments) {
	let positive = 0;
	let neutral = 0;
	let negative = 0;
	let Sentiment = require('sentiment');
	let sentiment = new Sentiment();
	comments.forEach(function(comment){
	let	result = sentiment.analyze(comment)
	if (result.score > 0) {
		positive += 1;
	}
	else if (result.score === 0) {
		neutral += 1;
	}

	else if (result.score < 0) {
		negative += 1
	}
	
})
let totalComments = positive + neutral + negative;
let positivePercent = Math.round(positive / totalComments * 100);
let neutralPercent = Math.round(neutral / totalComments * 100);
let negativePercent = Math.round(negative / totalComments * 100);
let commentsPercentage = [positivePercent, neutralPercent, negativePercent]
return commentsPercentage;
}


function displayComments(responseJson) {
	let commentsArr = [];
	responseJson.items.forEach(function(item){
		let comment = item.snippet["topLevelComment"]["snippet"].textOriginal
		commentsArr.push(comment);
	})
	let commentsPercentage = getSentiment(commentsArr)
	$("#video-results").append(`
	<h2>Comments</h2>
		<ul id="public-sentiment">
			<li class="positive"><span>${commentsPercentage[0]}\%</span></li>
			<li class="neutral"><span>${commentsPercentage[1]}\%</span></li>
			<li class="negative"><span>${commentsPercentage[2]}\%</span></li>
		</ul>
	`)
}

function formatCommentParams(params) {
	const queryItems = Object.keys(params).map(
		key => `${key}=${params[key]}`
	);
	return queryItems.join("&");
}

function getComments() {

	const param = {
		part: "snippet\%2Creplies",
		maxResults: 100,
		textFormat: "plainText",
		videoId: vidId,
		fields: "items(replies\%2Fcomments\%2Fsnippet\%2FtextOriginal\%2Csnippet\%2FtopLevelComment\%2Fsnippet\%2FtextOriginal)",
		key: apiKey
	};

	const queryString = formatCommentParams(param);
	const url = commentsURL + "?" + queryString;
	console.log(url);

	fetch(url)
		.then(response => {
			if (response.ok) {
				return response.json();
			}
			throw new Error(response.json());
		})
		.then(responseJson => displayComments(responseJson))
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
		vidId = event.currentTarget;
		vidId = $(vidId).attr("id");
		displayVideo(vidId);
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
		console.log(userSearch)
		buildYoutubeRequest(userSearch);
	});
}

function launchHomeScreen() {
	watchHomeButton()
	$('#home').trigger('click')
	watchForm()
}

launchHomeScreen()
