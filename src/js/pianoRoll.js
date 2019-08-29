import { select, selectAll, event } from "d3-selection";
import { scaleLinear } from "d3-scale";
import { axisTop, axisLeft } from "d3-axis";
import * as colorScales from 'd3-scale-chromatic';
import { NOTES, KEYS } from './keys.js';

const noteLookup = {};
KEYS.forEach(key => {
	noteLookup[key.id] = key;
});

const FRAME_RATE = 100;
const TONE_WIDTH = 10;
const WIDTH = 1200;
const HEIGHT = 600;

const PianoRoll = function(selector, opts) {
	opts = opts || {};

	const TIMESPAN = opts.timespan * 1000 || 16000;
	const colorScale = opts.colorScale ? colorScales["interpolate" + opts.colorScale] : colorScales.interpolateYlGnBu;
	let dynamicRange = opts.dynamicRange || [30, 80, 50];

	const MARGIN = {
		left: 40,
		right: 0,
		top: 20,
		bottom: 20
	};

	this.notes = [];
	this.pending = {};
	this.startTime = null;
	this.clock = null;

	select(selector).style("left", -MARGIN.left + "px");

	let svg = select(selector).append("svg")
	    .attr("width", WIDTH + MARGIN.left + MARGIN.right)
	    .attr("height", HEIGHT + MARGIN.top + MARGIN.bottom)
	    .attr("viewBox", `0 0 ${ WIDTH + MARGIN.left + MARGIN.right } ${ HEIGHT + MARGIN.top + MARGIN.bottom }`);

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
		.tickSizeInner(-HEIGHT - MARGIN.top + 5)
		.tickFormat("");

	let yAxis = axisLeft(yScale)
		.tickFormat(d => {
			return d / 1000 + "s";
		})
		.tickSize(-WIDTH);

	svg.append("g")
		.attr("id", "background")
		.append("rect")
		.attr("x", MARGIN.left)
		.attr("y", 0)
		.attr("width", WIDTH)
		.attr("height", HEIGHT + MARGIN.top + MARGIN.bottom)
		.style("fill", "ffefd5")
		.style("fill-opacity", 0.25);

	svg.append("g")
		.attr("id", "x_axis")
	    .attr("transform", `translate(${ MARGIN.left },${ MARGIN.top })`)
	    .call(xAxis);

	svg.append("g")
		.attr("id", "y_axis")
	    .attr("transform", `translate(${ MARGIN.left },${ MARGIN.top })`)
	    .call(yAxis);

	svg.select("#x_axis").selectAll(".tick line").attr("transform", `translate(0, ${ -MARGIN.top + 5 })`);

	this.roll = svg.append("g").attr("transform", `translate(${ MARGIN.left },${ MARGIN.top })`).attr("class", "pianoRoll");
	this.rollNotes = this.roll.append("g");
	this.rollPending = this.roll.append("g");

	this.playLine = this.roll.append("line")
		.attr("id", "play_line")
		.attr("x1", xScale(0))
		.attr("x2", xScale(WIDTH))
		.attr("y1", yScale(0))
		.attr("y2", yScale(0));

	this.svg = svg;
	this.xScale = xScale;
	this.yScale = yScale;
	this.xAxis = xAxis;
	this.yAxis = yAxis;
	this.colorScale = colorScale;
	this.dynamicRange = dynamicRange;
}

PianoRoll.prototype.paintNotes = function() {
	let currentTime = new Date().getTime() - this.startTime;

	this.rollNotes.selectAll(".note")
		.data(this.notes)
		.enter()
		.append("rect")
		.attr("class", "note");

	this.rollNotes.selectAll(".note")
		.attr("x", d => this.xScale(d.x) - TONE_WIDTH / 2 + (d.color === "white" ? 23 / 2 : 13 / 2))
		.attr("y", d => this.yScale(d.startTime))
		.attr("width", TONE_WIDTH)
		.attr("height", d => this.yScale(d.endTime - d.startTime))
		.attr("fill", d => this.colorScale((d.velocity - this.dynamicRange[0]) / this.dynamicRange[2]));

	this.rollPending.selectAll(".note").attr("height", d => this.yScale(currentTime - d.startTime));
}

PianoRoll.prototype.addStrike = function(strikeData) {
	let that = this;
	if (this.startTime === null) {
		this.startTime = new Date().getTime();
		console.log("startTime is", this.startTime);

		// start clock
		this.clock = setInterval(function() {
			that.paintNotes();
		}, FRAME_RATE);		
	}

	if (strikeData.status === "off") {
		let note = this.pending[strikeData.id];
		if (!note) {
			console.log(`Hmmm, can't turn off ${ strikeData.id } since it's not pending.`);
			return;
		}

		note.endTime = strikeData.timestamp;
		note.status = "concluded";
		this.notes.push(note);
		delete this.pending[strikeData.id];

		let pending = Object.values(this.pending);
		let pendingNotes = this.rollPending.selectAll(".note").data(pending, function(d) {
			return d.id;
		});

		let toGo = pendingNotes.exit().remove();

		this.paintNotes();

		return;
	}

	if (strikeData.status === "on") {
		if (this.pending[strikeData.id]) {
			console.log(`Weird, we already have a pending ${ strikeData.id }.`);
			return;
		}
		strikeData.startTime = strikeData.timestamp;
		this.pending[strikeData.id] = strikeData;
		let pending = Object.values(this.pending);
		let pendingNotes = this.rollPending.selectAll(".note").data(pending, function(d) {
			return d.id;
		});

		pendingNotes.enter().append("rect").attr("class", "note")
			.attr("x", d => {
				console.log("Adding", d);
				return this.xScale(d.x) - TONE_WIDTH / 2 + (d.color === "white" ? 23 / 2 : 13 / 2)
			})
			.attr("y", d => this.yScale(d.startTime))
			.attr("width", TONE_WIDTH )
			.attr("height", 0)
			.attr("fill", d => this.colorScale((d.velocity - this.dynamicRange[0]) / this.dynamicRange[2]));

		// console.log(`Added ${ strikeData.id } to pending at ${ strikeData.startTime }.`);
		return;
	}
}

PianoRoll.prototype.endRecording = function() {
	clearTimeout(this.clock);
	this.clock = null;
}

export { PianoRoll };
