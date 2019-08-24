// Draw the 88-key keyboard
// To do: Add elasticSVG and allow for rotation

import { select, selectAll, event } from "d3-selection";

import { NOTES, KEYS } from './keys.js'

export default function piano(selector) {

	let white_keys = KEYS.filter(d => {
		return d.color === "white";
	});

	let black_keys = KEYS.filter(d => {
		return d.color === "black";
	});

	let svgPiano = select(selector).append("svg")
	    .attr("width", 1200)
	    .attr("height", 140);

	let g_white_keys = svgPiano.append("g").attr("id", "white_keys");
	let g_black_keys = svgPiano.append("g").attr("id", "black_keys");
	let g_labels = svgPiano.append("g").attr("id", "labels");

	g_white_keys.selectAll(".key")
		.data(white_keys)
		.enter()
		.append("rect")
		.attr("class", d => {
			return "key white " + d.names.join(" ");
		})
		.attr("width", 23)
		.attr("height", 120)
		.attr("x", d => { return d.x; })
		.attr("y", 0)
		.attr("id", d => { return "note_" + d.index; });

	g_black_keys.selectAll(".key")
		.data(black_keys)
		.enter()
		.append("rect")
		.attr("class", d => {
			return "key black " + d.names.join(" ");
		})
		.attr("width", 13)
		.attr("height", 80)
		.attr("x", d => { return d.x; })
		.attr("y", 0)
		.attr("id", d => { return "note_" + d.index; })

	let C4 = white_keys.filter(d => {
		return d.id == "C4";
	})[0];

	g_labels.append("text")
		.attr("class", "label")
		.text("C4")
		.attr("x", C4.x + 23 / 2)
		.attr("y", 120 - 6);

	return {
		svg: svgPiano,
		KEYS: KEYS,
		NOTES: NOTES
	}
}