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

const PianoRoll = function(selector, opts, keyboard) {
	let that = this;
	opts = opts || {};

	const TIMESPAN = opts.timespan * 1000 || 16000;
	const colorPalette = opts.colorPalette ? colorScales["interpolate" + opts.colorPalette] : colorScales.interpolateYlGnBu;
	let dynamicRange = opts.dynamicRange || [30, 50, 70];
	let colorValues = [ colorPalette(0.3), colorPalette(0.65), colorPalette(1) ];

	if (opts.colorReverse) {
		colorValues = [ colorPalette(0.7), colorPalette(0.35), colorPalette(0) ];
	}

	const colorScale = scaleLinear()
		.domain(dynamicRange)
		.range(colorValues);

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
	this.currentTime = 0;
	this.keyboard = keyboard !== "undefined" ? keyboard : null;

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
		/*
		.on("click", function() {
			if (that.keyboard) {
				that.keyboard.liftAll();
			}
			that.endRecording();

			let y = event.layerY - MARGIN.top;
			let t = that.yScale.invert(y);
			that.playLine.attr("transform", `translate(0,${ that.yScale(t) })`)
		})
		*/

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

PianoRoll.prototype.addStrike = function(strikeData, dontPlay) {
	let that = this;
	if (this.startTime === null && !dontPlay) {
		this.startRecording();
	}

	if (strikeData.status === "off") {
		let note = this.pending[strikeData.id];

		if (!note) {
			console.log(`Hmmm, can't turn off ${ strikeData.id } since it's not pending.`);
			return;
		}

		if (this.keyboard) {
			this.keyboard.lift(note.id);
		}

		note.endTime = strikeData.timestamp;
		note.duration = note.endTime - note.startTime;
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

		let noteColor = this.colorScale(strikeData.velocity);

		if (this.keyboard) {
			this.keyboard.press(strikeData.id, noteColor);
		}

		strikeData.startTime = strikeData.timestamp;
		this.pending[strikeData.id] = strikeData;
		let pending = Object.values(this.pending);
		let pendingNotes = this.rollPending.selectAll(".note").data(pending, function(d) {
			return d.id;
		});

		pendingNotes.enter().append("rect").attr("class", "note")
			.attr("x", d => {
				return this.xScale(d.x) - TONE_WIDTH / 2 + (d.color === "white" ? 23 / 2 : 13 / 2)
			})
			.attr("y", d => this.yScale(d.startTime))
			.attr("width", TONE_WIDTH )
			.attr("height", 0)
			.attr("fill", d => this.colorScale(d.velocity));

		return;
	}
}

PianoRoll.prototype.paintNotes = function() {
	this.rollNotes.selectAll(".note")
		.data(this.notes)
		.enter()
		.append("rect")
		.attr("class", "note")
		.on("click", function(d) {
			console.log(d);
		});

	this.rollNotes.selectAll(".note")
		.attr("x", d => this.xScale(d.x) - TONE_WIDTH / 2 + (d.color === "white" ? 23 / 2 : 13 / 2))
		.attr("y", d => this.yScale(d.startTime))
		.attr("width", TONE_WIDTH)
		.attr("height", d => this.yScale(d.endTime - d.startTime))
		.attr("fill", d => this.colorScale(d.velocity));

	this.rollPending.selectAll(".note").attr("height", d => this.yScale(this.currentTime - d.startTime));

	this.playLine.attr("transform", `translate(0,${ this.yScale(this.currentTime) })`)

}

PianoRoll.prototype.startRecording = function() {
	// start clock
	this.startTime = new Date().getTime();
	let that = this;

	this.clock = setInterval(function() {
		that.currentTime = new Date().getTime() - that.startTime;
		that.paintNotes();
	}, FRAME_RATE);
}

PianoRoll.prototype.endRecording = function() {
	clearTimeout(this.clock);
	this.clock = null;
	if (this.keyboard) {
		this.keyboard.liftAll();
	}
}

PianoRoll.prototype.reset = function() {
	this.endRecording();
	this.svg.selectAll(".note").remove();
	this.notes = [];
	this.pending = {};
	this.startTime = null;
	this.currentTime = 0;
}

export default PianoRoll;
