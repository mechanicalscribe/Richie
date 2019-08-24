const NOTES = [
	{ "names": "A Gx Bbb", "color": "white" },
	{ "names": "As Bb", "color": "black" },
	{ "names": "B Ax Cb", "color": "white" },
	{ "names": "C Bs Dbb", "color": "white" },
	{ "names": "Cs Db", "color": "black" },
	{ "names": "D Cx Ebb", "color": "white" },
	{ "names": "Ds Eb", "color": "black" },
	{ "names": "E Dx Fb", "color": "white" },
	{ "names": "F Es Gbb", "color": "white" },
	{ "names": "Fs Gb", "color": "black" },
	{ "names": "G Fx Abb", "color": "white" },
	{ "names": "Gs Ab", "color": "black" }
];

const BLACK_KEY_OFFSETS = {
	"As": 19.5,
	"Cs": 14.333333,
	"Ds": 18.666666,
	"Fs": 13.25,
	"Gs": 20.25
};

const KEYS = [];
let posW = -23;
let posB = 0;

// build keyboard
for (let c = 0; c < 88; c += 1) {
	let note = Object.assign({}, NOTES[c % 12]);
	note.index = c + 21;	
	note.names = note.names.split(/ /g);
	note.register = Math.floor((c - 3) / 12) + 1;
	note.id = note.names[0] + note.register;
	if (note.color === "white") {
		posW += 23;
		note.x = posW;
	} else {
		note.x = posW + BLACK_KEY_OFFSETS[note.names[0]];
	}
	KEYS.push(note);
}

export { NOTES, KEYS };