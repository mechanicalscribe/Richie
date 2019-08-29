import { select, selectAll, event } from 'd3-selection';
import { csvFormat } from 'd3-dsv';
import { json } from 'd3-fetch';
import MIDI from './src/js/midi.js';
import PianoKeyboard from './src/js/PianoKeyboard.js';
import PianoRoll from './src/js/PianoRoll.js';
//import visualize from './src/js/visualize.js';
import Simulation from './src/js/Simulation.js';

import './src/styles/richie.scss';

let MODE = "flats";

// load HTML skeleton
select("#richie").html(require("./src/html/richie.html"));

let keyboard = new PianoKeyboard("#piano_88_keys", {
	labels: "C"
});

// keyboard.play("C4", 6000);
// keyboard.play("Fs4", 5000, "#F00", true);

let roll = new PianoRoll("#notespace", { 
	timespan: 30,
	colorPalette: "RdYlGn",
	colorReverse: true
}, keyboard);

let testNote = {
	note_id: "Gs4",
	startTime: 5802.4,
	endTime: 7979.2,
	velocity: 65
};

let isLoaded = false;
let simulation;
// controls
selectAll("button").on("click", function() {
	selectAll("button").classed("selected", false);
	select(this).classed("selected", true);


	if (this.id === "start") {
		MIDI.allowMIDIs();
		return;
	}

	if (this.id === "stop") {
		roll.endRecording();
		return;
	}

	if (this.id === "step") {
		if (!isLoaded) {
			json("./samples/chopin.json").then(function(note_strikes) {
				isLoaded = true;
				simulation = new Simulation(roll, note_strikes, false);
				simulation.step(100);
			});
		} else {
			simulation.step(100);
		}
	}

	if (this.id === "save") {
		console.log(roll.notes);
		// downloadCSV(roll.notes);
		downloadJSON(roll.notes);
		return;
	}

	if (this.id === "load") {
		json("./samples/chopin.json").then(function(note_strikes) {
			simulation = new Simulation(roll, note_strikes, false);
			simulation.loadAll();
		});
		return;
	}

	if (this.id === "replay") {
		json("./samples/chopin.json").then(function(note_strikes) {
			simulation = new Simulation(roll, note_strikes);
			simulation.replay();
		});
		return;
	}

	// flats vs sharps
	if (select(this).classed("selected")) {
		return;
	}

	if (this.id === "use_flats") {
		MODE = "flats";
	} else {
		MODE = "sharps";
	}
});

function downloadJSON(dataObj) {
	var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(dataObj, null, 2));
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


// let practice = simulate.simulation(notespace.session);