import { select, selectAll, event } from 'd3-selection';
import { csvFormat } from 'd3-dsv';
import { json } from 'd3-fetch';
import MIDI from './src/js/midi.js';
import pianoKeys from './src/js/piano.js';
import pianoRoll from './src/js/pianoRoll.js';
import replay from './src/js/replay.js';

import './src/styles/richie.scss';

let MODE = "flats";

let data = MIDI.data;

select("#richie").html(require("./src/html/richie.html"));

// controls
selectAll("button").on("click", function() {
	if (this.id === "start") {
		MIDI.allowMIDIs();
		return;
	}

	if (this.id === "stop") {
		endRecording();
		return;
	}

	if (this.id === "save") {
		console.log(data);
		downloadCSV(data);
		return;
	}

	if (this.id === "load") {
		json("./scripts/parsed.json").then(function(note_file) {
		// json("./samples/chopin.json").then(function(json) {
			console.log(note_file);
			simulate.simulation(notespace, note_file);
		});
		return;
	}

	if (this.id === "replay") {
		json("./samples/chopin.json").then(function(note_file) {
		// json("./samples/chopin.json").then(function(json) {
			console.log(note_file);
			replay(notespace, note_file);
		});
		return;
	}

	// flats vs sharps
	if (select(this).classed("selected")) {
		return;
	}

	selectAll("button").classed("selected", false);
	select(this).classed("selected", true);
	if (this.id === "use_flats") {
		MODE = "flats";
	} else {
		MODE = "sharps";
	}
});

function downloadJSON(dataObj) {
	var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(json));
	var anchor = document.getElementById('save_anchor');
	anchor.setAttribute("href", dataStr );
	anchor.setAttribute("download", "score.json");
	anchor.click();	
}

function downloadCSV(dataObj) {
	var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(csvFormat(json));
	var anchor = document.getElementById('save_anchor');
	anchor.setAttribute("href", dataStr );
	anchor.setAttribute("download", "score.csv");
	anchor.click();	
}

let keyboard = pianoKeys("#piano_88_keys")

let notespace = pianoRoll("#notespace", { timespan: 30 });

// let practice = simulate.simulation(notespace.session);