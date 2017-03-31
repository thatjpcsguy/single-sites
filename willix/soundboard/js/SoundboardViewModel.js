function SoundboardViewModel() {
	'use strict';

	/*
		videos: [video, video, ...]

		video:
			name: title of the video
			path: path to video
	*/


	var self = this;

	this.videos 			= ko.observableArray([]);
	this.currentlyPlaying 	= ko.observableArray([]);

	this.init = function(videos){
		videos.forEach(function(video){
			self.videos().push(ko.mapping.fromJS(video));
		});
	};

	this.play = function(video){
		self.currentlyPlaying().push(video);
		self.addVideo(video);
	};

	this.addVideo = function(video){
		var newVideo = document.createElement('video');
		var newVideoSource = document.createElement('source');

		newVideo.setAttribute('autoplay', 'true');

		newVideoSource.setAttribute('type', 'video/mp4');
		newVideoSource.setAttribute('src', video.path());

		newVideo.appendChild(newVideoSource);

		var videoContainer = document.getElementById('video-container');
		videoContainer.appendChild(newVideo);

		newVideo.onended = function(){
			videoContainer.removeChild(newVideo);
			self.currentlyPlaying.remove(video);
		};
	};
}