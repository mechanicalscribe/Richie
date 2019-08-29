import { select, selectAll, event } from 'd3-selection';
import { extent } from 'd3-array';

let notes = null;
let pending = {};

const SLOW_FACTOR = 1;

let elapsedTime = 0;

const Simulation = function(roll, strikes) {
	this.roll = roll;
	this.strikes = strikes;
	this.count = 0;
	this.initialized = false;
	this.initialize();
}

Simulation.prototype.initialize = function() {
	this.roll.reset();
	let offset = this.strikes[0].timestamp * SLOW_FACTOR;

	this.strikes.forEach((strike, s) => {
		strike.timestamp = strike.timestamp * SLOW_FACTOR - offset;
	});
}

Simulation.prototype.replay = function() {
	let that = this;
	this.roll.startRecording();
	this.strikes.forEach(strike => {
		let timer = setTimeout(function() {
			if (!that.roll.clock) {
				return;
			}
			that.roll.addStrike(strike);
			that.count += 1;
			if (that.count == that.strikes.length) {
				clearTimeout(timer);
				that.roll.endRecording();
				console.log("Replay is over.");
				console.log(that.roll.notes);
			}
		}, strike.timestamp);
	});		
}

Simulation.prototype.step = function(interval) {
	if (!this.roll.startTime) {
		this.roll.startTime = 0;
	}

	if (!this.initialized) {
		this.initialize();
		this.initialized = true;
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


Simulation.prototype.loadAll = function() {
	this.roll.reset();

	let spanTime = this.strikes.slice(-1)[0].timestamp - this.strikes[0].timestamp;
	this.step(spanTime + 100);
	this.roll.endRecording();
}

export default Simulation;