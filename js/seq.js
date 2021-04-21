/*
  the audio worker with the The setTimeout timer basically just checks to see if any notes are going to need to be scheduled “soon” based on the current tempo, and then schedules them, like so:

  I’m not keeping track of “sequence time” - that is, time since the beginning of starting the metronome. All we have to do is remember when we played the last note, and figure out when the next note is scheduled to play. That way, we can change the tempo (or stop playing) very easily.
*/

console.log('yolo');

class Sequencer {
  constructor() {
    this.seqWorker = new Worker("js/seqWorker.js");

    this.stepsElements = [];
    this.stepsElementsCheckboxes = [];
    this.stepsSettings = [];

    this.bpm = 130;
    this.scheduleLookahead = 100;
    this.scheduleInterval = 16;
    this.uiScheduler;


    this.noteValue = (60 / this.bpm) / 4;
    this.barValue = this.noteValue * this.numberOfSteps;
    this.numberOfSteps = 16;
    this.uiPreviousStep = 15;
    this.uiCurrentStep = 0;
    this.audioPreviousStep = 15;
    this.audioCurrentStep = 0;

    this.createStepSeqUI();
    this.addCheckboxEventListeners();
    this.updateTriggerTimes();
    this.initWorker();
  }
  
  addCheckboxEventListeners = () => {
    // add event listener for each checkbox
    for(let i = 0; i < this.numberOfSteps; i++) {
      this.stepsElementsCheckboxes[i].addEventListener('change', (e) => {
        this.stepIndex = i;
        // update stepSettings[].checked to current state
        if(e.target.checked) {
          this.stepsSettings[this.stepIndex].checked = true;
        } else {
          this.stepsSettings[this.stepIndex].checked = false;
        }
      });
    }
  }

  createStepSeqUI = () => {
    this.seqContainer = document.querySelector('#seq-container');
    this.seqBar = document.createElement('div');
    this.seqBar.className = 'seq-bar';
    this.seqBar.id = 'seq-bar-0';
   
    this.seqContainer.appendChild(this.seqBar);
    
    for(let i = 0; i < this.numberOfSteps; i++) {
  
      this.newStep = document.createElement('label');
      this.newStep.id =`step-${i}`;
      this.newStep.className = 'step';

      this.newCheckbox = document.createElement('input');
      this.newCheckbox.type = 'checkbox';
      this.newCheckbox.id = `${this.seqBar.id}-step-${i}-checkbox`;

      this.newSpan = document.createElement('span');
      this.newSpan.className = 'step-style';
    
      this.newStep.innerHTML = this.newCheckbox.outerHTML + this.newSpan.outerHTML;

      this.stepsElements.push(this.newStep);
      this.seqBar.appendChild(this.newStep);

      // Array of step checkbox values
      this.stepsElementsCheckboxes[i] = document.getElementById(this.newCheckbox.id);
    
      this.stepsSettings[i] = {
        checked: false,
        isScheduled: false,
        // calculate the time in the sequence to trigger this step
        trigTime: 0.0
      }; 
    }
  }

  initWorker = () => {
    this.seqWorker.postMessage({"interval":this.scheduleLookahead});
    // call scheduler every time seqWorker creates 'tick'
    this.seqWorker.onmessage = (e) => {
      if (e.data == "tick") {
        this.schedulerAudio();
      }
      else
          console.log("message: " + e.data);
    };
  }

  start = () => {
    this.seqWorker.postMessage("start");
    this.schedulerUI();
  }

  stop = () => {
    this.seqWorker.postMessage("stop");
    cancelAnimationFrame(this.uiScheduler);
  }

  schedulerUI = () => {
    this.uiCurrentStep = parseInt((actx.currentTime % this.barValue) / this.noteValue);

    if(this.uiCurrentStep != this.previousStep) {
      this.updateStepSeqUI(this.uiPreviousStep, this.uiCurrentStep);
      this.uiPreviousStep = this.uiCurrentStep;
    }
    this.uiScheduler = requestAnimationFrame(this.schedulerUI);
  }
    
  // set false when currentStep increases
  schedulerAudio = () => {
    // synth.play(.0005, .125, 'linear', false)
    let currentTime = actx.currentTime % this.barValue;
    let timeDiff;
    this.audioCurrentStep = parseInt((currentTime) / this.noteValue);
    let nextTrigger = (this.audioCurrentStep + 1) % this.numberOfSteps;

    // error will be: will trig once the full phase of 1st sequence is
    // done
    // trigger first step
    if(this.stepsSettings[nextTrigger].checked === true &&
      nextTrigger === 0 &&
      ((currentTime + this.scheduleLookahead) % this.barValue) < this.scheduleLookahead &&
      this.stepsSettings[nextTrigger].isScheduled === false) {
        
        this.stepsSettings[nextTrigger].isScheduled = true;
        timeDiff = actx.currentTime + (this.barValue - currentTime);
        
        playVoice(timeDiff);
    }

    if(this.stepsSettings[nextTrigger].checked === true &&
      this.stepsSettings[nextTrigger].trigTime > currentTime &&
      this.stepsSettings[nextTrigger].trigTime <= currentTime + this.scheduleLookahead &&
      this.stepsSettings[nextTrigger].isScheduled === false) {
        
        this.stepsSettings[nextTrigger].isScheduled = true;
        timeDiff = actx.currentTime + (this.stepsSettings[nextTrigger].trigTime - currentTime);

        playVoice(timeDiff);

        // console.log(`trigger ${nextTrigger}`);
    }


    // set is scheduled to false, if the step is behind the cursor
    if(this.stepsSettings[this.audioPreviousStep].isScheduled === true) {
      this.stepsSettings[this.audioPreviousStep].isScheduled = false;
    }

    if(this.audioPreviousStep != this.audioCurrentStep) {
      this.audioPreviousStep = this.audioCurrentStep;
    }
  }

  updateBPM(newBPM) {
    this.bpm = newBPM;
    this.noteValue = (60 / this.bpm) / 4;
    this.barValue = this.noteValue * this.numberOfSteps;
    this.updateTriggerTimes();
  }

  updateStepSeqUI = (prevStep, currStep) => {
    this.stepsElements[prevStep].className = 'step';
    this.stepsElements[currStep].className = 'step current-step';
  }

  updateTriggerTimes = () => {
    for(let i = 0; i < this.numberOfSteps; i++) {
      this.stepsSettings[i].trigTime = this.noteValue * i;
    }

    this.barValue = this.noteValue * this.numberOfSteps;
  }
}


let seq = new Sequencer();

