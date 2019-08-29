# README

Many thanks to the [great tutorial](https://www.smashingmagazine.com/2018/03/web-midi-api/) on Smashing!

>	Here are the basics:
> + A command value of 144 signifies a "note on" event, and 128 typically signifies a "note off" event.
> + Note values are on a range from 0–127, lowest to highest. For example, the lowest note on an 88-key piano has a value of 21, and the highest note is 108. A "middle C" is 60.
> + Velocity values are also given on a range from 0–127 (softest to loudest). The softest possible "note on" velocity is 1.
> + A velocity of 0 is sometimes used in conjunction with a command value of 144 (which typically represents "note on") to indicate a "note off" message, so it’s helpful to check if the given velocity is 0 as an alternate way of interpreting a "note off" message.

## Detailed MIDI specifications

Here are the [official MIDI specs](https://www.midi.org/specifications-old/item/table-2-expanded-messages-list-status-bytes) and [control change codes](https://www.midi.org/specifications-old/item/table-3-control-change-messages-data-bytes-2), and here is a [more readable](http://www.opensound.com/pguide/midi/midi5.html). For our purposes, only Channel 1 is relevant.

## Sources

### Register designations

[Open Music Theory](http://openmusictheory.com/pitches.html)

### Piano keys

The keyboard represents a reasonably accurate depiction of key position. I took some guidance from the [Wikimedia Commons single piano octave SVG](https://commons.wikimedia.org/wiki/File:PianoKeyboard.svg), which drew from [MathPages.com](https://www.mathpages.com/home/kmath043.htm).

## Code

The code is divided into a few libraries for sanity's sake. To compile the Node scripts for the browser, use my external Webpack bundler:
	
	npm install bundle-module -g
	bundle-module --name=richie # optionally add `--watch` if desired
	bundle-module --name=richie --min # ibid

### Libraries

[*`./src/js/keys.js`*](./src/js/keys.js), called by [*`./src/js/pianoKeyboard.js`*](./src/js/pianoKeyboard.js)
Generates an array of the 88 keys. Each key has the coordinates for a horizontal visualization (easily swapped), the color, the MIDI code, the unique id, and the various notations, e.g.:

	{	
		id: "C4",
		code: 60
		color: "white"
		register: 4,
		names: ["C", "Bs", "Dbb"],
		x: 529
		y: 0
		height: 120,
		width: 23
	}

This also returns a 12-item array of just the individual notes in a given options, which is mainly used to populate the above.

[*`./src/js/pianoKeyboard.js`*](./src/js/pianoKeyboard.js)
Draw the keyboard. This takes two options:
	+ `direction`: `h` (default) or `v`
	+ `labels`: Which keys to label. Currently doesn't really work for black keys. This array can be either specific `id`s (e.g. "A2" or "C4") or notes (e.g. "D"), the latter of which labels that note in every octave. Default is "C4".

[*`./src/js/pianoRoll.js`*](./src/js/pianoRoll.js)
Visualize the notes as they're played. This uses an x-axis spanning the keyboard and the y-axis spans time, starting at 30 seconds and scrolling.




