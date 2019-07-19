const fs = require('fs');
const d3 = require('d3');

let sample = require("../samples/chopin.json");

console.log(sample);

let notes = [];

let pending = {};

sample.forEach(note => {
	if (note.status === "on") {
		if (pending[note.id]) {
			console.log("Collision: Still have a pending note for", note.id);
			return;
		}
		pending[note.id] = note;
		note.start = note.timestamp;
	} else if (note.status === "off") {
		if (!pending[note.id]) {
			console.log("Oop! Trying to turn off a", note.id, "that isn't pending");
			return;
		}
		pending[note.id].end = note.timestamp;
		pending[note.id].duration = note.timestamp - pending[note.id].timestamp;
		notes.push(Object.assign({}, pending[note.id]));
		pending[note.id] = null;
	}
});

console.log("Pending", pending);
console.log(notes.length);

fs.writeFileSync("./parsed.json", JSON.stringify(notes, null, 2));