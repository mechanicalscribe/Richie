// Accept incoming MIDI signals and handle them

import { NOTES, KEYS } from './keys.js';

function allowMIDIs() {
	console.log("Requesting MIDI Acess");
	navigator.requestMIDIAccess({ sysex: true }).then(onMIDISuccess, onMIDIFailure);
}

function onMIDISuccess(midiAccess) {
	console.log("Successfully loaded MIDIs!");
	window.midiAccess = midiAccess;

	var inputs = midiAccess.inputs;
	// var outputs = midiAccess.outputs;
	// console.log(inputs, outputs);

	if (inputs.size === 0) {
		console.log("Couldn't detect any MIDI device inputs.");
		return;
	}

	for (var input of midiAccess.inputs.values()) {
		console.log("Detected MIDI input");
		console.log(input)
		input.onmidimessage = getMIDIMessage;
	}
}	

function onMIDIFailure(midiAccess) {
	console.log("Couldn't connect to MIDI");
	console.log(midiAccess);
}	

function getMIDIMessage(message) {
	var command = message.data[0]; // MIDI command. See README
	var note = message.data[1]; // MIDI note value, from 21 to 108
	var velocity = (message.data.length > 2) ? message.data[2] : 0; // a velocity value might not be included with a noteOff command
	var timestamp = message.timeStamp;

	// null output signal
	if (command == 254) {
		return;
	}

	let datum = {
		command: command,
		value: value,
		velocity: message.data[2],
		time: timestamp
	};

	data.push(datum);
	console.log(datum);

	switch (command) {
		case 144: // noteOn
			if (velocity > 0) {
				noteOn(value, timestamp, velocity);
			} else {
				noteOff(value, timestamp);
			}
			break;
		case 128: // noteOff
			noteOff(value, timestamp);
			break;
		case 64: // pedal
			pedalPressed(value, timestamp, velocity);
		// we could easily expand this switch statement to cover other types of commands such as controllers or sysex
	}
}

function noteOn (value, timestamp, velocity) {
	var note = Object.assign({}, KEYS[value - 21]);
	note.status = "on";
	note.timestamp = timestamp;
	note.velocity = velocity;

	console.log(note.id, "on");

}

function noteOff (value, timestamp, velocity) {
	var note = Object.assign({}, KEYS[value - 21]);
	note.status = "off";
	note.timestamp = timestamp;

	console.log(note.id, "off");
}

function pedalPressed (value, timestamp, velocity) {
	console.log(value, timestamp, velocity);
}

export default {
	allowMIDIs: allowMIDIs
}