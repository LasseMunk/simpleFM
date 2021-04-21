// Get Controls Interface IDs
let hasPlayed = false;

document.getElementById('playButton')
        .addEventListener('click', (e) => {
          
          let transportState = e.target.firstChild.data;

          if(transportState === 'PLAY') {
            e.target.firstChild.data = 'STOP';
            if(hasPlayed === false) {
              hasPlayed = true;
              actx.resume().then(() => {
                console.log('AudioContext resumed');
                playSilentBuffer();
                synthArr.forEach(synth => {
                  synth.start();
                });
                seq.start();
              })
            } else {
              seq.start();
            }
          }

          if(transportState === 'STOP') {
            e.target.firstChild.data = 'PLAY';
            seq.stop();
          }
        });
// document.getElementById('playButton')
//         .addEventListener('touchstart', (e) => {
          
//           let transportState = e.target.firstChild.data;

//           if(transportState === 'PLAY') {
//             e.target.firstChild.data = 'STOP';
//             if(actx.state === 'suspended') {
//               actx.resume().then(() => {
//                 console.log('AudioContext resumed');
//                 playSilentBuffer();
//                 synthArr.forEach(synth => {
//                   synth.start();
//                 });
//                 seq.start();
//               })
//             } else {
//               seq.start();
//             }
//           }

//           if(transportState === 'STOP') {
//             e.target.firstChild.data = 'PLAY';
//             seq.stop();
//           }
//         });

document.getElementById('bpm-input-number')
        .addEventListener('change', (e) => {
          let newBPM = parseFloat(e.target.value);
          let bpmInputElement = document.getElementById('bpm-input-number');
          if(newBPM > 180) {
            newBPM = 180 
            bpmInputElement.value = newBPM;
          } 
          if(newBPM < 30) {
            newBPM = 30 
            bpmInputElement.value = newBPM;
          }

          seq.updateBPM(newBPM);
        });
document.getElementById('slider-cFreq')
        .addEventListener('input', (e) => {
          synthParams.carrierFreq = parseFloat(e.target.value);
        });
document.getElementById('slider-hRatio')
        .addEventListener('input', (e) => {
          synthParams.harmRatio = parseFloat(e.target.value);
        });
document.getElementById('slider-mIndex')
        .addEventListener('input', (e) => {
          synthParams.modIndex = parseFloat(e.target.value);
        });
document.getElementById('slider-attack')
        .addEventListener('input', (e) => {
          synthParams.attack = parseFloat(e.target.value);
        });
document.getElementById('slider-decay')
        .addEventListener('input', (e) => {
          synthParams.decay = parseFloat(e.target.value);
        });
document.getElementById('slider-mGain')
        .addEventListener('input', (e) => {
          for(let i = 0; i < synthVoices; i++) {
            synthArr[i].mGainVol(parseFloat(e.target.value)); 
          }
        });









