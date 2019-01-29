export default class SequencerAudio {
    constructor(context) {
        this.notes = [
            {
                data: "one",
                beat: 0,
                offset: 0,
                scheduledTimes: []
            },
            {
                data: "two",
                beat: 1,
                offset: 0,
                scheduledTimes: []
            },
            {
                data: "three",
                beat: 2,
                offset: 10,
                scheduledTimes: []
            },
            {
                data: "four",
                beat: 3,
                offset: -25,
                scheduledTimes: []
            }
        ];
        this.context = context;
        this.timeSignature = 4;
        this.bpm = 60;
        this.barsLookahead = 3;
        this.scheduleTicksPerBar = 1;
        this.interval = null;
        this.startTime = null;
        this.relativeStartTime = 0;
        
        
        // Bind methods for cleaner passing.
        this.scheduleNextNBars = this.scheduleNextNBars.bind(this);
    }

    get timePerBeat() {
        return 60 / this.bpm;
    }

    get totalBarTime() {
        return this.timeSignature * this.timePerBeat;
    }

    get scheduleInterval() {
        return 1000 * this.totalBarTime / this.scheduleTicksPerBar;
    }
    
    get currentProgressIntoBar() {
        return (
            this.context.currentTime + 
            this.relativeStartTime - 
            this.startTime
        ) % this.totalBarTime
    }
    
    get startOfCurrentBar() {
        return this.context.currentTime - this.currentProgressIntoBar;
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
            for (let scheduledTime of note.scheduledTimes) {
                if (scheduledTime >= currentTime) break;
                sliceIndex++;
            }
            note.scheduledTimes = note.scheduledTimes.slice(sliceIndex);
        }
    }
    
    scheduleNextNBars() {
        
        this.cleanupFulfilledNotes();
        
        const newNotesToSchedule = [];
        const currentTime = this.context.currentTime;
        
        // Look-ahead some number of bars for scheduling safety.
        const scheduleBlockStart = this.startOfCurrentBar;
        for (let bar = 0; bar < this.barsLookahead; bar++) {
            
            // Calculate the absolute start-time of each bar.
            const barStart = scheduleBlockStart + bar * this.totalBarTime;
            for (let note of this.notes) {
                
                // Calculate when this note in this bar should fall (in absolute time).
                const { data, beat, offset, scheduledTimes } = note;
                const noteScheduledTime = (
                    barStart 
                    + beat * this.timePerBeat 
                    + offset/100 * this.timePerBeat
                );

                // Check if we've already scheduled this note.
                const noteAlreadyScheduled = scheduledTimes.includes(noteScheduledTime);

                // If the note hasn't already been scheduled, do so now.
                if (!noteAlreadyScheduled && noteScheduledTime >= currentTime) {
                    newNotesToSchedule.push({ data, time: noteScheduledTime });
                    note.scheduledTimes.push(noteScheduledTime);
                }
            }
        }
        
        this.bulkSchedule(newNotesToSchedule);
    }

    bulkSchedule(notes) {
        for (let { data, time } of notes) {
            console.log("To implement: Scheduling note", data, "at", time - this.startTime);
        }
    }

    cancelAllNotes() {
        console.log("Implement on sound source: cancel all notes.")
    }

    startScheduling() {
        this.scheduleNextNBars();
        this.interval = setInterval(this.scheduleNextNBars, this.scheduleInterval)
    }

    updateStartTimes() {
        this.relativeStartTime = this.currentProgressIntoBar;
        this.startTime = this.context.currentTime;
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

    set beatsPerMinute(value) {
        this._bpm = value;
        this.startAgainFromNow();
    }

    set timeSignature(value) {
        this._timeSignature = value;
        this.startAgainFromNow();
    }

    addNote({ data, beat, offset}) {
        // Todo: this is inefficient and we should just schedule
        // the note we've added, rather than rescheduling everything!
        this.notes.push({ data, beat, offset, scheduledTimes: []});
        this.startAgainFromNow();
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
        this.startTime = this.context.currentTime;
        this.relativeStartTime = 0;
        this.startScheduling();
    }

    pause() {
        this.cancelAllNotes();
        this.cancelCurrentScheduler();
    }

    resume() {
        this.startTime = this.context.currentTime;
        this.startScheduling();
    }
}
