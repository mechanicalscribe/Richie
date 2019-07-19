# README

Many thanks to the [great tutorial](https://www.smashingmagazine.com/2018/03/web-midi-api/) on Smashing!

>	Here are the basics:
> + A command value of 144 signifies a "note on" event, and 128 typically signifies a "note off" event.
> + Note values are on a range from 0–127, lowest to highest. For example, the lowest note on an 88-key piano has a value of 21, and the highest note is 108. A "middle C" is 60.
> + Velocity values are also given on a range from 0–127 (softest to loudest). The softest possible "note on" velocity is 1.
> + A velocity of 0 is sometimes used in conjunction with a command value of 144 (which typically represents "note on") to indicate a "note off" message, so it’s helpful to check if the given velocity is 0 as an alternate way of interpreting a "note off" message.

## Sources

### Register designations

[Open Music Theory](http://openmusictheory.com/pitches.html)

### Piano keys

[Single piano octave SVG, Wikimedia Commons](https://commons.wikimedia.org/wiki/File:PianoKeyboard.svg)

> Copyright (c)  2005 Lauri Kaila.

> Permission is granted to copy, distribute and/or modify this document
 under the terms of the GNU Free Documentation License, Version 1.2
 or any later version published by the Free Software Foundation;
 with no Invariant Sections, no Front-Cover Texts, and no Back-Cover Texts.
 A copy of the license is included in the section entitled "GNU
 Free Documentation License".
 
> Intended to create a keyboard where key widths are
 accurately in position. 
 
> See http://www.mathpages.com/home/kmath043.htm for the math.
 
> This keyboard has following properties (x=octave width).
 1. All white keys have equal width in front (W=x/7).
 2. All black keys have equal width (B=x/12).
 3. The narrow part of white keys C, D and E is W - B*2/3
 4. The narrow part of white keys F, G, A, and B is W - B*3/4