import { select, selectAll, event } from "d3-selection";
import { scaleLinear } from "d3-scale";
import { axisTop, axisLeft } from "d3-axis";

import { NOTES, KEYS } from './keys.js'

export default function pianoRoll(selector, opts) {
	opts = opts || {};

	let notes = [];
	let pending = {};

	const WIDTH = 1200;
	const HEIGHT = 600;
	const TIMESPAN = opts.timespan * 1000 || 16000;

	const MARGIN = {
		left: 30,
		right: 30,
		top: 30,
		bottom: 20
	};

	let svgNotes = select(selector).append("svg")
	    .attr("width", WIDTH + MARGIN.left + MARGIN.right)
	    .attr("height", HEIGHT + MARGIN.top + MARGIN.bottom);

	let xScale = scaleLinear()
		.domain([0, WIDTH]) // we'll use `note.x` instead of the value since black key positions are staggered
	    .range([0, WIDTH]);

	let yScale = scaleLinear()
		.domain([0, TIMESPAN]) // likewise, we're going to get a little tricky with y position to avoid long empty spaces
	    .range([0, HEIGHT]);

	let rules = KEYS.filter(d => {
		return d.names[0] == "C";
	}).map(d => {
		return d.x + (d.color === "white" ? 23 / 2 : 13 / 2);
	});

	let xAxis = axisTop(xScale)
		.tickValues(rules)
		.tickSize(-HEIGHT)
		.tickFormat("");

	let yAxis = axisLeft(yScale)
		.tickFormat(d => {
			return d / 1000 + "s";
		})
		.tickSize(-WIDTH);

	svgNotes.append("g")
		.attr("id", "x_axis")
	    .attr("transform", `translate(${ MARGIN.left },${ MARGIN.top })`)
	    .call(xAxis);

	svgNotes.append("g")
		.attr("id", "y_axis")
	    .attr("transform", `translate(${ MARGIN.left },${ MARGIN.top })`)
	    .call(yAxis);

	let pianoRoll = svgNotes.append("g").attr("transform", `translate(${ MARGIN.left },${ MARGIN.top })`).attr("id", "pianoRoll");

	return {
		WIDTH: WIDTH,
		HEIGHT: HEIGHT,
		MARGIN: MARGIN,
		TIMESPAN: TIMESPAN,
		svg: svgNotes,
		g: pianoRoll,
		xScale: xScale,
		yScale: yScale,
		x_axis: x_axis,
		y_axis: y_axis
	}
}