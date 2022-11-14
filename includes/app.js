//
// app.js
// by Jeremy Muller
// To be used in my piece "Voyager" for piano and web audio
//

/************* variables *************/
var startButton, text, wrapper, startDelay, startC, startNote;

var maxDelayTime = 30; // in seconds
var play = false;
var backgroundHue = Math.random() * 360;

var ratios = [2/9.0, 0.25, 0.4, 2/6.0, 0.125, 0.5, 2/15.0, 2/3.0, 1]; // consistent with the ratios happening in piano part
var detune = random([0, 1]);
var loopT1 = false;
var loopT3 = false;
var loopT4 = false;

var jupiter = [];
var saturn = [];
var uranus = [];
var neptune = [];

var currentMvmt = '0';

var intro = new Tone.Loop(playIntro, 0.2);
intro.humanize = 0.1;

var texture1 = new Tone.Loop(playTexture1, 0.3);
texture1.humanize = 0.2;

var texture2 = new Tone.Loop(playTexture2, 10);
// texture2.humanize = 1;

var texture3 = new Tone.Loop(playTexture3, 0.2);
texture3.humanize = 0.1;
texture3.probability = 0.25;
// var sequence = new Tone.Sequence(playMotive, [60, 62, 65, 71], 0.166666);
var a = [60, 62, 65, 71];
var b = [71, 60, 62, 65];
var c = [65, 71, 60, 62];
var d = [62, 65, 71, 60];
var sequence = new Tone.Sequence(playMotive, random([a, b, c, d]), 0.166666);
sequence.loop = 1;


console.log("random array: " + random([a, b, c, d]));

/************** synths **************/
var squareSynth = new Tone.Synth({
    "oscillator" : {
        "type" : "square",
        "volume" : 6
    },
    "envelope" : {
        "attack" : 0.05, // 0.05
        "decay" : 0.1,
        "sustain" : 0.1,
        "release" : 1
    }
}).toMaster();

var oscEnv = new Tone.AmplitudeEnvelope({
	"attack" : 0.02,
	"decay" : 0.1,
	"sustain" : 0.5,
	"release" : 2
}).toMaster();
var osc = new Tone.Oscillator(440, "square").connect(oscEnv).start();

var squareDelaySynth = new Tone.Synth({
	"oscillator" : {
		"type" : "square",
		"volume" : 6
	},
	"envelope" : {
		"attack" : 0.02,
		"decay" : 0.1,
		"sustain" : 0.1,
		"release" : 1
	}
}).toMaster();
var delayFilter = new Tone.Filter(1000);
var fbDelay = new Tone.FeedbackDelay(1, 0.6);
// var fbDelay = new Tone.FeedbackDelay({
// 	delayTime: 1,
// 	feedback: 0.6,
// 	maxDelay: 2
// });
squareDelaySynth.chain(delayFilter, fbDelay, Tone.Master);

var noise = new Tone.Noise().start();
var filter = new Tone.Filter({
	"type" : "bandpass",
	"frequency" : 880,
	"Q" : 1,
	"gain" : 24
});
var noiseEnv = new Tone.AmplitudeEnvelope({
	"attack" : 0.001,
	"decay" : 0.03,
	"sustain" : 0.2,
	"release" : 0.1,
	"attackCurve" : "linear",
	"releaseCurve" : "exponential"
});
var bump = new Tone.Multiply(20);
noise.chain(filter, noiseEnv, bump, Tone.Master);

var windNoise = new Tone.Noise().start();
var windFilter = new Tone.Filter({
		"type" : "bandpass",
		"frequency" : 880,
		"Q" : 50,
		"gain" : 24
});
var windEnv = new Tone.AmplitudeEnvelope({
		"attackCurve" : "linear",
		"releaseCurve" : "linear"
});
var windReverb = new Tone.Freeverb(0.9, 4000).toMaster();
windNoise.chain(windFilter, windEnv, Tone.Master);
windEnv.connect(windReverb);

/*****************************/
/********* functions *********/
/*****************************/

function buttonAction() {
	// everything that needs to happen when you press start
	console.log("STARTED");
	wrapper.remove();
	play = true;

	Tone.Master.volume.linearRampToValue(0, 45, Tone.now()+startDelay);

	// Subscribe
	pubnub.addListener({
		message: function (m) {
			console.log("publish timetoken: " + m.timetoken);
			handleMessage(m);
		},
		presence: function (p) {
			console.log("occupancy: " + p.occupancy);
			console.log("timestamp: " + p.timetoken);
		}
	});
	pubnub.subscribe({
		channels: ['JeremyMuller_Voyager'],
		withPresence: true
	});

	draw();
}

/************** intro **************/

function playIntro(time) {
    squareSynth.triggerAttackRelease(midiToFreq(startNote)+detune, 0.1, time, random(0.1, 1));
}

/************** texture 1 **************/

function changeNote(time) {
	if (loopT1) {
		var dur = 0.1;
		var note = random(jupiter) + 12;
		if (random(100) < 5) {
			dur = 3;
			note = 60;
		}
		// playTexture1(note, dur, time);
		console.log("changed note: " + note);
		osc.frequency.setValueAtTime(midiToFreq(note), time);
		Tone.Transport.schedule(changeNote, Tone.now()+random(5, 10));
	}
}

function playTexture1(time) {
	oscEnv.triggerAttackRelease(0.1, time+0.05, random(0.2, 1));
}

function startTexture1(time) {
	console.log("texture 1 started");
	loopT1 = true;
	changeNote(time);
}

function stopTexture1() {
	loopT1 = false;
	console.log("texture 1 stopped");
}

/************** texture 2 **************/

function playTexture2(time) {
	fbDelay.delayTime.setValueAtTime(random(ratios), time);
	var pitch = random(saturn);
	console.log("pitch: " + pitch);
	squareDelaySynth.triggerAttackRelease(midiToFreq(pitch)*2, 0.1, time, random(0.5, 1));
}

/************** texture 3 **************/

function playTexture3(time) {
	if (random(100) < 1) { // 1%
		console.log("SEQUENCE");
		fbDelay.delayTime.setValueAtTime(1, time);
		sequence.start(time);
		sequence.stop("+2");
	} else {
		console.log("NOISE");
		var pitch = random(uranus);
		filter.frequency.setValueAtTime(midiToFreq(pitch)*2, time);
		noiseEnv.triggerAttackRelease(0.01, time);
		if (texture3.probability < 1) texture3.probability += 0.02;
	}
}

function playMotive(time, pitch) {
	fbDelay.feedback.setValueAtTime(0.3, time);
	squareDelaySynth.set("envelope.release", 2);
	var freq = midiToFreq(pitch) * 2;
	squareDelaySynth.triggerAttackRelease(freq, 0.1, time, 1);
}

/************** texture 4 **************/

function playTexture4(time, swellDuration, restDuration) {
	console.log("swellDuration: " + swellDuration);
	var pitch = random(neptune);

	windEnv.set({
		"attack" : swellDuration/2.0,
		"decay" : 0.0,
		"sustain" : 1,
		"release" : swellDuration/2.0
	});
	// windFilter.set("frequency", midiToFreq(pitch)*2);
	windFilter.frequency.setValueAtTime(midiToFreq(pitch)*2, time);
	windEnv.triggerAttackRelease(swellDuration/2.0);

}

function startTexture4(time) {
	console.log("texture 4 started");
	loopT4 = true;
	texture4(time);
}

function stopTexture4() {
	loopT4 = false;
	console.log("texture 4 stopped");
}

function texture4(time) {
	if (loopT4) {
		var swellDuration = random(5, 20);
		var restDuration = random(3, 4);
		playTexture4(time, swellDuration, restDuration);
		Tone.Transport.schedule(texture4, time+swellDuration+restDuration);
	} else {
		// when texture4 is done, it triggers coda
		playCoda();
	}
}

/************** coda **************/

function playCoda() {
	setTimeout(theEnd, 60000);
	console.log("CODA!");
	var swellDuration = 60;

	windNoise.set("gain", 12);
	windFilter.set({
		"frequency" : midiToFreq(72),
		"gain" : 48
	});
	windEnv.set({
		"attack" : swellDuration/2.0,
		"decay" : 0.0,
		"sustain" : 1,
		"release" : swellDuration/2.0
	});
	windEnv.triggerAttackRelease(swellDuration/2.0);
}

/************** helpers **************/

function draw() {
	// this slowly animates background hue
	requestAnimationFrame(draw);
	document.body.style.backgroundColor = "hsl(" + backgroundHue + ", 100%, 50%)";
	if (play) backgroundHue += 0.1;

	// document.getElementsByTagName("p")[0].innerHTML = "audio context: " + Tone.now().toFixed(2);
}

function handleMessage(m) {
	// TODO
	var mvmt = m.message['mvmt'];
	if (currentMvmt == mvmt) // prevents multiple triggering
		return;
	switch (mvmt) {
		case 'i': // intro
			intro.start(Tone.now() + startDelay);
			currentMvmt = 'i';
			break;
		case '1':
			var del = random(maxDelayTime);
			console.log("delay for 1: " + del);
			intro.stop(Tone.now() + del);
			texture1.start(Tone.now() + del);
			startTexture1(Tone.now() + del);
			currentMvmt = '1';
			break;
		case '2':
			var del = random(maxDelayTime);
			console.log("delay for 2: " + del);
			texture1.stop(Tone.now() + del);
			stopTexture1();
			texture2.start(Tone.now() + del);
			currentMvmt = '2';
			break;
		case '3':
			var del = random(maxDelayTime);
			console.log("delay for 3: " + del);
			texture2.stop(Tone.now() + del);
			texture3.start(Tone.now() + del);
			currentMvmt = '3';
			break;
		case '4':
			var del = random(maxDelayTime);
			console.log("delay for 4: " + del);
			texture3.stop(Tone.now() + del);
			startTexture4(Tone.now() + del);
			currentMvmt = '4';
			break;
		case 'c': // coda
			stopTexture4();
			currentMvmt = 'c';
			break;
		default:
			console.log("STOP ALL");
			intro.stop(Tone.now());
			texture1.stop(Tone.now());
			texture2.stop(Tone.now());
			texture3.stop(Tone.now());
			stopTexture4();
			break;
	}
	console.log("response: " + m.message['mvmt']);
}

function init() {
    StartAudioContext(Tone.context);
	Tone.Master.volume.value = -500;
	// Tone.Master.volume.value = 0;
	Tone.Transport.start("+0.1");

	document.body.style.backgroundColor = "hsl(" + backgroundHue + ", 100%, 50%)";

    // create button
    startButton = document.createElement("button");
	startButton.onclick = buttonAction;
    text = document.createTextNode("Tap to connect");
    startButton.appendChild(text);
    startButton.className = "splash";
    wrapper = document.createElement("div");
    wrapper.className = "wrapper";
    wrapper.id = "container";
    wrapper.appendChild(startButton);
    document.body.appendChild(wrapper);

	// load data
	loadJSON(function(response) {
        satellites = JSON.parse(response);
		jupiter = satellites["Jupiter pitch"];
		saturn = satellites["Saturn pitch"];
		uranus = satellites["Uranus pitch"];
		neptune = satellites["Neptune pitch"];
    });

	// set variables
	// startC = 1;
	startC = random([0, 1]);
	if (startC) {startDelay = random(1, 5); startNote = 60;}
	else {startDelay = random(25, 30); startNote = 58;}

	console.log("startDelay: " + startDelay);
	console.log("startNote: " + startNote);
}
