// Accept incoming MIDI signals and handle them

import { NOTES, KEYS } from './keys.js'

let data = [];
let notes = [];
let pending = {};

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
		console.log(input)
		input.onmidimessage = getMIDIMessage;
	}
}	

function onMIDIFailure(midiAccess) {
	console.log(midiAccess);
}	

function getMIDIMessage(message) {
	var command = message.data[0];
	var note = message.data[1];
	var velocity = (message.data.length > 2) ? message.data[2] : 0; // a velocity value might not be included with a noteOff command
	var timestamp = message.timeStamp;

	// null output signal
	if (command == 254) {
		return;
	}

	let datum = {
		command: command,
		value: note,
		velocity: message.data[2],
		time: timestamp
	};

	data.push(datum);
	console.log(datum);

	switch (command) {
		case 144: // noteOn
			if (velocity > 0) {
				noteOn(note, timestamp, velocity);
			} else {
				noteOff(note, timestamp);
			}
			break;
		case 128: // noteOff
			noteOff(note, timestamp);
			break;
		// we could easily expand this switch statement to cover other types of commands such as controllers or sysex
	}
}

function noteOn(value, timestamp, velocity) {
	var note = Object.assign({}, KEYS[value - 21]);
	note.status = "on";
	note.start = timestamp;
	note.velocity = velocity;
	//data.push(note);

	console.log(note.id, "on");

}

function noteOff(value, timestamp, velocity) {
	var note = Object.assign({}, KEYS[value - 21]);
	note.status = "off";
	note.timestamp = timestamp;
	//data.push(note);

	console.log(note.id, "off");
}

export default {
	allowMIDIs: allowMIDIs,
	data: data,
	notes: notes,
	pending: pending
}