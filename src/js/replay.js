import { select, selectAll, event } from 'd3-selection';
import { extent } from 'd3-array';

let TIME = 0;
let TIME_STEP = 50;

let notes = null;
let pending = {};
let strikes;

const FACTOR = 1;

let beginningOfTime, elapsedTime = 0;

function stepInterval(roll, interval) {
	elapsedTime += interval;
	console.log(elapsedTime);

	strikes.forEach(strike => {
		if (!strike.added && strike.timestamp < elapsedTime) {
			strike.added = true;
			roll.addStrike(strike);
		}
	});
	roll.paintNotes();
}


function replay(roll, importedStrikes, stepped) {
	strikes = importedStrikes;

	let offset = strikes[0].timestamp * FACTOR;

	strikes.forEach((strike, s) => {
		strike.timestamp = strike.timestamp * FACTOR - offset;
	});

	let count = 0;
	
	roll.addStrike(strikes[0]);


	if (!stepped) {		
		strikes.slice(1).forEach(strike => {
			setTimeout(function() {
				if (!roll.clock) {
					return;
				}
				roll.addStrike(strike);
				count += 1;
				console.log(count);
				if (count == strikes.length) {
					clearTimeout(timer);
					console.log("Replay is over.");
				}
			}, strike.timestamp);
		});		
	}
}

export { replay, stepInterval };