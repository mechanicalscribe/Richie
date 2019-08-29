// Draw the 88-key keyboard
// To do: Add elasticSVG and use paths for the keys

import { select, selectAll, event } from "d3-selection";
import { transition } from "d3-transition";

import { NOTES, KEYS } from './keys.js';

let toType = function(obj) {
	return ({}).toString.call(obj).match(/\s([a-zA-Z]+)/)[1].toLowerCase()
}

const PianoKeyboard = function(selector, opts) {
	if (!selector) {
		selector = document.body;
	}

	opts = opts || {};

	let direction = opts.direction ? opts.direction[0].toLowerCase() : "h";
	let labels = opts.labels || [ "C4" ];

	if (toType(labels) === "string") {
		labels = [ labels ];
	}

	let WIDTH = direction == "h" ? 1200 : 140;
	let HEIGHT = direction == "h" ? 140 : 1200;
	let MARGIN = 5;

	// swap coordinates for vertical view, rather than messing with translations
	if (direction == "v") {
		KEYS.reverse();
		KEYS.forEach(key => {
			let x = key.x;
			let y = key.y;
			let w = key.width;
			let h = key.height;
			key.x = y;
			key.y = HEIGHT - x - w;
			key.width = h;
			key.height = w;
		});
	}

	let keyLabels = [];

	// get each labeled key from `labels`, which can include notes without registers
	labels.forEach(d => {
		keyLabels = keyLabels.concat(KEYS.filter(k => {
			if (k.id == d) {
				return true;
			}
			if (k.names.indexOf(d) != -1) {
				return true;
			}
			return false;
		}));
	});

	let white_keys = KEYS.filter(d => {
		return d.color === "white";
	});

	let black_keys = KEYS.filter(d => {
		return d.color === "black";
	});

	let svg = select(selector).append("svg")
	    .attr("width", WIDTH + MARGIN)
	    .attr("height", HEIGHT + MARGIN);

	let g_keys = svg.append("g").attr("id", "keys");
	let g_white_keys = g_keys.append("g").attr("id", "white_keys");
	let g_black_keys = g_keys.append("g").attr("id", "black_keys");
	let g_labels = svg.append("g").attr("id", "labels");

	g_white_keys.selectAll(".key")
		.data(white_keys)
		.enter()
		.append("rect")
		.attr("class", d => {
			return "key white " + d.names.join(" ");
		})
		.attr("width", d => d.width - 1)
		.attr("height", d => d.height)
		.attr("x", d => d.x + 0.5 )
		.attr("y", d => d.y )
		.attr("rx", 2)
		.attr("ry", 2)
		.attr("id", d => { return "note_" + d.id; });

	g_black_keys.selectAll(".key")
		.data(black_keys)
		.enter()
		.append("rect")
		.attr("class", d => {
			return "key black " + d.names.join(" ");
		})
		.attr("width", d => d.width)
		.attr("height", d => d.height)
		.attr("x", d => d.x )
		.attr("y", d => d.y )
		.attr("rx", 2)
		.attr("ry", 2)
		.attr("id", d => { return "note_" + d.id; })

	if (direction == "h") {
		g_labels.selectAll(".label")
			.data(keyLabels)
			.enter()
			.append("text")
			.attr("class", "label")
			.text(d => d.id)
			.attr("x", d => d.x + d.width / 2)
			.attr("y", d => d.height - 6);		
	} else {
		g_labels.selectAll(".label")
			.data(keyLabels)
			.enter()
			.append("text")
			.attr("class", "label")
			.text(d => d.id)
			.attr("x", d => d.width - 11)
			.attr("y", d => d.y + d.height / 2 + 4);
	}

	this.svg = svg;
	this.KEYS = KEYS;
	this.g = g_keys;
	this.labels = g_labels;
}

PianoKeyboard.prototype.press = function(key_id, color) {
	let key = this.g.select("#note_" + key_id);
	if (!key.node()) {
		console.log(`Can't press ${key_id} since it doesn't exist.`);
		return;
	}

	key.style("fill", color);
}

PianoKeyboard.prototype.lift = function(key_id) {
	let key = this.g.select("#note_" + key_id);
	if (!key.node()) {
		console.log(`Can't lift ${key_id} since it doesn't exist.`);
		return;
	}

	key.style("fill", d => d.color === "white" ? "#FFF" : "000");
}


PianoKeyboard.prototype.liftAll = function(key_id) {
	this.g.selectAll(".key").style("fill", d => d.color === "white" ? "#FFF" : "000");
}

PianoKeyboard.prototype.play = function(key_id, duration, color, dontFade) {
	let key = this.g.select("#note_" + key_id);
	if (!key.node()) {
		console.log(`Can't play ${key_id} since it doesn't exist.`);
		return;
	}

	let colorOriginal = key.style("fill");

	duration = duration || 3000;
	color = color || "#17d117";

	key.style("fill", color);
	if (!dontFade) {
		key.transition().duration(duration).style("fill", colorOriginal);		
	} else {
		setTimeout(function() {
			key.style("fill", colorOriginal);
		}, duration);
	}
}

export default PianoKeyboard;