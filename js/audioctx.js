// actx = audio context
let AudioContext = window.AudioContext || window.webkitAudioContext;
let actx = new AudioContext(); 




let unlocked = false;
function playSilentBuffer() {
  if (!unlocked) {
    // play silent buffer to unlock the audio
    let buffer = actx.createBuffer(1, 1, 44100);
    let node = actx.createBufferSource();
    node.buffer = buffer;
    node.start(0);
    unlocked = true;
    console.log('silentbufferplayed');
  }
}