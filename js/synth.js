class SimpleFM {

  /*
    Inspired by Max/MSPs abstraction simpleFM 
  */
  constructor() {

    this.oscModulator = actx.createOscillator();
    this.oscModulator.type = 'sine';
  

    this.modAmp = actx.createGain();
    this.modAmp.gain.value = 0;
    
    this.cFreqAdd = actx.createGain();

    this.oscCarrier = actx.createOscillator();
    this.oscCarrier.type = 'sine';
    this.oscCarrier.frequency.value = 220;

    this.ampEnv = actx.createGain();
    this.ampEnv.gain.value = 0;

    this.mGain = actx.createGain();
    this.mGain.gain.value = 1;
    

    this.oscModulator.connect(this.modAmp);
    this.oscModulator.frequency.value = 1;

    this.modAmp.connect(this.cFreqAdd);
    this.cFreqAdd.connect(this.oscCarrier.frequency);
    this.oscCarrier .connect(this.ampEnv)
                    .connect(this.mGain)
                    .connect(actx.destination);
  }

  trigAD(attackTime, decayTime, rampType, time) {
    // time: time to trigger AD
    // type: exp or linear
    if(rampType === 'linear') {
      this.ampEnv.gain.cancelAndHoldAtTime(time);
      this.ampEnv.gain.setValueAtTime(this.ampEnv.gain.value, time);
      this.ampEnv.gain.linearRampToValueAtTime(1, time + attackTime);
      this.ampEnv.gain.linearRampToValueAtTime(0, time + attackTime + decayTime);
    } else {
      // default to exponential envelope
      this.ampEnv.gain.cancelAndHoldAtTime(time);
      this.ampEnv.gain.setValueAtTime(0, time);
      this.ampEnv.gain.linearRampToValueAtTime(1, time + attackTime);
      this.ampEnv.gain.linearRampToValueAtTime(0.000000000001, time + attackTime + decayTime);

    }
      

  }

  play(carrierFreq, harmRatio, modIndex, attackTime, decayTime, time) {

    this.oscCarrier.frequency.value = carrierFreq;
    this.oscModulator.frequency.value = carrierFreq * harmRatio;
    this.modAmp.gain.value = carrierFreq * harmRatio * modIndex;

    this.trigAD(attackTime, decayTime, 'linear', time);
  }

  start () {
    this.oscModulator.start(0);
    this.oscCarrier.start(0);
  }
  

  stop() {
    this.osc.stop(0);
  }

  mGainVol(vol) {
    this.mGain.gain.linearRampToValueAtTime
          (vol, actx.currentTime + .02);
  }

}

synthParams = {
  carrierFreq: 220,
  harmRatio: 0.36,
  modIndex: 3.5,
  attack: 0.005,
  decay: 0.1
};

const synthArr = [];
const synthVoices = 4;
let currentSynthVoice = 0;

for(let i = 0; i < synthVoices; i++) {
  synthArr[i] = new SimpleFM();
}

playVoice = (time) => {
  synthArr[currentSynthVoice].play(
    synthParams.carrierFreq,
    synthParams.harmRatio,
    synthParams.modIndex,
    synthParams.attack,
    synthParams.decay,
    time
  );
  
  currentSynthVoice = (currentSynthVoice + 1) % synthVoices;
}