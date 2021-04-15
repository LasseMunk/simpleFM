// Equal Power Crossfading

function equalPowXfade(controller) {
  // Fades between 0 (all source 1) and 1 (all source 2)
  var x = parseInt(controller.value) / parseInt(controller.max);
  // Use an equal-power crossfading curve:
  var gain1 = Math.cos(x * 0.5*Math.PI);
  var gain2 = Math.cos((1.0 - x) * 0.5*Math.PI);
  
  return gain1, gain2;
};


// band passed white noise generator

function playNoise(time) {
  const bufferSize = audioCtx.sampleRate * noiseDuration; // set the time of the note
  const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate); // create an empty buffer
  const data = buffer.getChannelData(0); // get data

  // fill the buffer with noise
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }

  // create a buffer source for our created data
  const noise = audioCtx.createBufferSource();
  noise.buffer = buffer;

  const bandpass = audioCtx.createBiquadFilter();
  bandpass.type = 'bandpass';
  bandpass.frequency.value = bandHz;

  // connect our graph
  noise.connect(bandpass).connect(audioCtx.destination);
  noise.start(time);
}

///////////////////////////////////////////////////////////////////////////////////////////////
// util functions
///////////////////////////////////////////////////////////////////////////////////////////////
function midiToFreq(v){ return 440 * Math.pow(2,((v-69)/12)); }
function freqToMidi(v){ return Math.round(69 + 12*Math.log(v/440)/Math.log(2)); }
function constrain(amt,low,high) { return (amt < low) ? low : ((amt > high) ? high : amt); }

// iOS Silent buffer to play
let unlocked = false;
if (!unlocked) {
  // play silent buffer to unlock the audio
  let buffer = audioContext.createBuffer(1, 1, 22050);
  let node = audioContext.createBufferSource();
  node.buffer = buffer;
  node.start(0);
  unlocked = true;
}