import { select, selectAll, event } from 'd3-selection';
import { extent } from 'd3-array';

let notes = null;
let pending = {};

const SLOW_FACTOR = 1;

let elapsedTime = 0;

const Simulation = function(roll, strikes, autoplay) {
	if (typeof autoplay === "undefined") {
		autoplay = true;
	}

	this.roll = roll;
	this.strikes = strikes;
	this.autoplay = autoplay;
	this.count = 0;
	this.initialized = false;

	this.roll.reset();

	this.initialize();
	
	if (autoplay) {		
		roll.startRecording();
		strikes.forEach(strike => {
			setTimeout(function() {
				if (!roll.clock) {
					return;
				}
				roll.addStrike(strike);
				count += 1;
				if (count == strikes.length) {
					clearTimeout(timer);
					console.log("Replay is over.");
				}
			}, strike.timestamp);
		});		
	}
}

Simulation.prototype.initialize = function() {
	let offset = this.strikes[0].timestamp * SLOW_FACTOR;

	this.strikes.forEach((strike, s) => {
		strike.timestamp = strike.timestamp * SLOW_FACTOR - offset;
	});

	this.initialized = true;
}

Simulation.prototype.stepInterval = function(interval) {
	if (!this.roll.startTime) {
		this.roll.startTime = 0;
	}

	if (!this.initialized) {
		this.initialize();
	}

	elapsedTime += interval;
	this.roll.currentTime = elapsedTime;

	this.strikes.forEach(strike => {
		if (!strike.added && strike.timestamp < elapsedTime) {
			strike.added = true;
			this.roll.addStrike(strike, true);
		}
	});
	this.roll.paintNotes();
}


Simulation.prototype.loadAll() {
	this.roll.reset();

	let spanTime = this.strikes.slice(-1)[0].timestamp - this.strikes[0].timestamp;
	console.log(spanTime);
	this.stepInterval(spanTime);
}

export default Simulation;