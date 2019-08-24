import { select, selectAll, event } from 'd3-selection';
import { extent } from 'd3-array';
import { interpolateRdYlGn, interpolateGnBu, interpolateYlGnBu } from 'd3-scale-chromatic';

let TIME = 0;
let TIME_STEP = 50;
let CLOCK;

function startRecording() {
	CLOCK = setInterval(function() {
		TIME += TIME_STEP;
	}, TIME_STEP);
}

function endRecording() {
	clearTimeout(CLOCK);
}

function visualization(pianoRoll, importedNotes) {
	let offset = importedNotes[0].timestamp;

	let dynamicRange = extent(importedNotes, d => { return d.velocity; });
	dynamicRange[0] = Math.min(30, dynamicRange[0]);
	dynamicRange[1] = Math.max(80, dynamicRange[1]);
	dynamicRange.push(dynamicRange[1] - dynamicRange[0]);

	console.log(dynamicRange);
	
	importedNotes.forEach(note => {
		note.start -= offset;
		note.end -= offset;
	});

	let TONE_WIDTH = 10;

	let playLine = pianoRoll.g.append("line")
		.attr("id", "play_line")
		.attr("x1", pianoRoll.xScale(0))
		.attr("x2", pianoRoll.xScale(pianoRoll.WIDTH))
		.attr("y1", pianoRoll.yScale(0))
		.attr("y2", pianoRoll.yScale(0));

	pianoRoll.svg.on("click", function(d) {
		let y = event.offsetY - pianoRoll.MARGIN.top;
		let time = pianoRoll.yScale.invert(y);
		if (time >= 0 && time <= pianoRoll.TIMESPAN) {
			playLine.attr("transform", `translate(0,${ y })`);
			if (importedNotes) {
				console.log(time);
				let selected = importedNotes.filter(d => {
					return d.start <= time && d.end >= time;
				});

				console.log(selected);
			}

		}
	});	

	pianoRoll.g.selectAll(".tone")
		.data(importedNotes)
		.enter()
		.append("rect")
		.attr("x", function(d) {
			return pianoRoll.xScale(d.x) - TONE_WIDTH / 2 + (d.color === "white" ? 23 / 2 : 13 / 2);
		})
		.attr("y", function(d) {
			return pianoRoll.yScale(d.start);
		})
		.attr("width", TONE_WIDTH)
		.attr("height", function(d) {
			return pianoRoll.yScale(d.duration);
		})
		.attr("class", "tone")
		.attr("fill", function(d) {
			return interpolateYlGnBu((d.velocity - dynamicRange[0]) / dynamicRange[2]);
		})
		.on("click", function(d) {
			console.log(d);
		});


	// brief pause before we begin
	setTimeout(function() {



	}, 500);
}

export default {
	simulation: simulation,
	startRecording: startRecording,
	endRecording: endRecording
}
