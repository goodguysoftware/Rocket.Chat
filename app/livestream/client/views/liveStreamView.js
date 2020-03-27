import { ReactiveVar } from 'meteor/reactive-var';
import { Template } from 'meteor/templating';

this.onYouTubePlayerAPIReady = function() {
	const playerReadyEvent = new Event('playerReady');
	document.querySelector('.streaming-popup').dispatchEvent(playerReadyEvent);
};
this.liveStreamPlayer = null;

Template.liveStreamView.onCreated(function() {
	this.streamingOptions = new ReactiveVar(this.data.streamingOptions);
});

Template.liveStreamView.onRendered(function() {
	if (/^https:\/\/player\.vimeo\.com\/video\/\d+/.test(this.data.streamingOptions.url)) {
		if (!window.Vimeo) {
			const tag = document.createElement('script');
			tag.src = 'https://player.vimeo.com/api/player.js';
			tag.type = 'text/javascript';
			const firstScriptTag = document.body.getElementsByTagName('script')[0];
			firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
		}
		const itv = window.setInterval(() => {
			if (window.Vimeo) {
				clearInterval(itv);
				window.liveStreamPlayer = new window.Vimeo.Player('ytplayer', {
					width: '380',
					height: '214',
					url: this.data.streamingOptions.url,
					autoplay: true,
					controls: false,
					title: false,
				});
				window.liveStreamPlayer.on('playing', function() {
					const playerStateChangedEvent = new CustomEvent('playerStateChanged', { vimeo: 'playing' });
					document.querySelector('.rc-popout').dispatchEvent(playerStateChangedEvent);
				});
				window.liveStreamPlayer.on('pause', function() {
					const playerStateChangedEvent = new CustomEvent('playerStateChanged', { vimeo: 'pause' });
					document.querySelector('.rc-popout').dispatchEvent(playerStateChangedEvent);
				});
			}
		}, 400);
		return;
	}
	if (window.YT) {
		window.liveStreamPlayer = new window.YT.Player('ytplayer', {
			width: '380',
			height: '214',
			videoId: this.data.streamingOptions.id || '',
			playerVars: {
				autoplay: 1,
				controls: 0,
				showinfo: 0,
				enablejsapi: 1,
				fs: 0,
				modestbranding: 1,
				rel: 0,
			},
			events: {
				onStateChange: (e) => {
					const playerStateChangedEvent = new CustomEvent('playerStateChanged', { detail: e.data });
					document.querySelector('.rc-popout').dispatchEvent(playerStateChangedEvent);
				},
			},
		});
	} else {
		const tag = document.createElement('script');
		tag.src = 'https://www.youtube.com/player_api';
		tag.type = 'text/javascript';
		const firstScriptTag = document.body.getElementsByTagName('script')[0];
		firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
	}
});

Template.liveStreamView.events({
	'playerReady .streaming-popup'(e, i) {
		window.liveStreamPlayer = new window.YT.Player('ytplayer', {
			width: '380',
			height: '214',
			videoId: i.streamingOptions.get().id || '',
			playerVars: {
				autoplay: 1,
				controls: 0,
				showinfo: 0,
				enablejsapi: 1,
				fs: 0,
				modestbranding: 1,
				rel: 0,
			},
			events: {
				onStateChange: (e) => {
					const playerStateChangedEvent = new CustomEvent('playerStateChanged', { detail: e.data });
					document.querySelector('.rc-popout').dispatchEvent(playerStateChangedEvent);
				},
			},
		});
	},
});
