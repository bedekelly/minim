const NOTE_ON = 144;
const NOTE_OFF = 128;


function close(a, b, delta) {
    return Math.abs(a - b) < delta;
}


function includesClose(iterable, value, delta) {
    for (let test of iterable) {
        if (close(test, value, delta)) return true;
    }
    return false;
}


function snapTo(value, snapValues) {
    if (!snapValues || snapValues.length === 0) {
        throw new Error("snapValues must be an array of >= 1 numbers.");
    }
    let bestValueDiff = Infinity;
    let bestValue;
    for (let snapValue of snapValues) {
        const diff = Math.abs(value - snapValue);
        if (diff < bestValueDiff) {
            bestValue = snapValue;
            bestValueDiff = diff;
        }
    }
    return bestValue;
}


export default class SequencerAudio {
    constructor(context) {
        this.context = context;
        this._timeSignature = 4;
        this._bpm = 60;
        this.barsLookahead = 1;
        this.scheduleTicksPerBar = 4;
        this.interval = null;
        this.relativeStartTime = 0;
        this.lastEventRelativeTime = 0;
        this.lastEventAbsoluteTime = 0;
        this.lastEventTime = 0;
        this.soundSource = null;
        this.notes = [];
        this.playing = false;
        this.closenessDelta = this.timePerBeat / 100;
        this.snap = false;
        // this.closenessDelta = 0.3;

        // Bind methods for cleaner passing.
        this.scheduleNextNBars = this.scheduleNextNBars.bind(this);
    }

    get timePerBeat() {
        return 60 / this._bpm;
    }

    get totalBarTime() {
        return this._timeSignature * this.timePerBeat;
    }

    get scheduleInterval() {
        return 1000 * this.totalBarTime / this.scheduleTicksPerBar;
    }

    get currentRelativeTime() {
        if (!this.playing) {
            return this.lastEventRelativeTime;
        }
        
        // current progress into bar is the current progress at the last event, 
        // plus the time elapsed since the last event, modulo the length of the bar.
        const timeSinceLastEvent = this.context.currentTime - this.lastEventAbsoluteTime;
        return (this.lastEventRelativeTime + timeSinceLastEvent) % this.totalBarTime;
    }
    
    get currentProgress() {
        return this.currentRelativeTime / this.totalBarTime;
    }
    
    get startOfCurrentBar() {
        return this.context.currentTime - this.currentRelativeTime;
    }

    /**
     * Clean up all the sequenced notes we (should) have already played.
     * For each note, trim the start of the array.
     * Assumption: note-schedule times are added in chronological order.
     */
    cleanupFulfilledNotes() {
        const currentTime = this.context.currentTime;
        for (let note of this.notes) {
            let sliceIndex = 0;
            for (let scheduledTime of note.scheduledTimes[NOTE_ON]) {
                if (scheduledTime >= currentTime) break;
                sliceIndex++;
            }
            note.scheduledTimes[NOTE_ON] = note.scheduledTimes[NOTE_ON].slice(sliceIndex);
            sliceIndex = 0;
            for (let scheduledTime of note.scheduledTimes[NOTE_OFF]) {
                if (scheduledTime >= currentTime) break;
                sliceIndex++;
            }
            note.scheduledTimes[NOTE_OFF] = note.scheduledTimes[NOTE_OFF].slice(sliceIndex);
        }
    }

    scheduleNextNBars() {
        this.cleanupFulfilledNotes();

        const newNotesToSchedule = [];
        const currentTime = this.context.currentTime;

        // Look-ahead some number of bars for scheduling safety.
        const scheduleBlockStart = this.startOfCurrentBar;
        for (let bar = 0; bar <= this.barsLookahead; bar++) {
            
            const thisBarStart = scheduleBlockStart + bar * this.totalBarTime;
            const nextBarStart = thisBarStart + this.totalBarTime;
            // Calculate the absolute start-time of each bar.
            for (let note of this.notes) {
                // Calculate when this note in this bar should fall (in absolute time).
                const { data, beat, offset, scheduledTimes } = note;
                const barStart = (beat === 1 && offset < 0) ? nextBarStart : thisBarStart;
                
                const noteScheduledTime = (
                    barStart 
                    + (beat-1) * this.timePerBeat 
                    + offset/100 * this.timePerBeat
                );
                // Check if we've already scheduled this note, or if it's gone straight to the source.
                const noteAlreadyScheduled = includesClose(
                    scheduledTimes[data[0]], noteScheduledTime, this.closenessDelta);

                
                const notePlayingNow = noteScheduledTime <= currentTime + this.closenessDelta;
                
                if (!noteAlreadyScheduled && !notePlayingNow) {
                    newNotesToSchedule.push({ data, time: noteScheduledTime });
                    note.scheduledTimes[data[0]].push(noteScheduledTime);
                } else {
                    // console.log("Not scheduling note because: ", { data, noteScheduledTime, currentTime, delta: this.closenessDelta, noteAlreadyScheduled, notePlayingNow, scheduledTimes: note.scheduledTimes[data[0]] });
                }
            }
        }
        
        this.bulkSchedule(newNotesToSchedule);
    }

    bulkSchedule(notes) {
        this.soundSource && this.soundSource.scheduleNotes && this.soundSource.scheduleNotes(notes);
    }

    cancelAllNotes() {
        this.soundSource && this.soundSource.cancelAllNotes && this.soundSource.cancelAllNotes();
    }

    startScheduling() {
        this.scheduleNextNBars();
        this.interval = setInterval(this.scheduleNextNBars, this.scheduleInterval);
    }

    updateStartTimes() {
        this.lastEventRelativeTime = this.currentRelativeTime;
        this.lastEventAbsoluteTime = this.context.currentTime;
    }

    cancelCurrentScheduler() {
        clearInterval(this.interval);
    }

    startAgainFromNow() {
        this.cancelAllNotes();
        this.cancelCurrentScheduler();
        this.updateStartTimes();
        this.startScheduling();
    }

    get bpm() {
        return this._bpm;
    }

    set bpm(value) {
        this._bpm = value;
        this.closenessDelta = this.timePerBeat / 100;
        if (this.playing) this.startAgainFromNow();
    }
    
    get timeSignature() {
        return this._timeSignature;
    }
    
    set timeSignature(value) {
        this._timeSignature = value;
        if (this.playing) this.startAgainFromNow();
    }
    
    addNote({ data, beat, offset}) {
        // Todo: this is inefficient and we should just schedule
        // the note we've added, rather than rescheduling everything!
        this.notes.push({ data, beat, offset, scheduledTimes: { [NOTE_ON]: [], [NOTE_OFF]: []}});
        if (this.playing) this.scheduleNextNBars();
    }
    
    addNotes(notes) {
        for (let { data, beat, offset } of notes) {
            this.notes.push({ data, beat, offset, scheduledTimes: { [NOTE_ON]: [], [NOTE_OFF]: [] }});
        }
        if (this.playing) this.scheduleNextNBars();
    }
    
    addRepeatingNoteNow(data) {
        const fractionalBeat = this.timeSignature * this.currentRelativeTime / this.totalBarTime;
        let beat = Math.round(fractionalBeat);
        let offset = (fractionalBeat - beat) * 100;
        if (beat > this.timeSignature) beat -= this.timeSignature;
        beat = 1 + beat % this.timeSignature;
        const note = `${data[1]} ${data[0] === 128 ? "off" : "on"}}`;
        console.log("Adding note: ", { note, beat, offset });
        
        const snapValues = [-50, -100/3, -25, 0, 25, 100/3, 50];
        if (this.snap) {
            offset = snapTo(offset, snapValues);
        }
        this.addNote({ data, beat, offset });
    }

    clearAll() {
        this.notes = [];
        if (this.playing) this.startAgainFromNow();
    }

    removeNote({ data, beat, offset }) {
        // Again, this is super inefficient. Can we ask our sound
        // sources to cancel a particular note instead?
        this.notes = this.notes.filter( note => {
            return !(
                note.data === data && 
                note.beat === beat && 
                note.offset === offset);
        });
        this.startAgainFromNow();
    }

    play() {
        this.playing = true;
        this.lastEventAbsoluteTime = this.context.currentTime;
        this.startScheduling();
    }

    pause() {
        this.lastEventRelativeTime = this.currentRelativeTime;
        this.playing = false;
        this.lastEventAbsoluteTime = this.context.currentTime;
        this.cancelAllNotes();
        this.cancelCurrentScheduler();
    }
    
    stop() {
        this.pause();
        this.lastEventRelativeTime = 0;
    }
    
    sendNotesTo(source) {
        // console.log("sending notes to ", source);
        this.soundSource = source;
    }
    
    playPause() {
        if (this.playing) {
            this.pause()
        } else {
            this.play();
        }
    }
}
