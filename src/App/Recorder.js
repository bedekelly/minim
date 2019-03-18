import RecorderWorker from './Workers/recorder.worker.js';


var Recorder = function(source, cfg){
    var config = cfg || {};
    var bufferLen = config.bufferLen || 4096;
    this.context = source.context;
    if(!this.context.createScriptProcessor){
        this.node = this.context.createJavaScriptNode(bufferLen, 2, 2);
    } else {
        this.node = this.context.createScriptProcessor(bufferLen, 2, 2);
    }

    var worker = new RecorderWorker();
    worker.postMessage({
        command: 'init',
        config: {
            sampleRate: this.context.sampleRate
        }
    });
    var recording = false,
        currCallback;

    this.node.onaudioprocess = function(e){
        if (!recording) return;
        worker.postMessage({
            command: 'record',
            buffer: [
                e.inputBuffer.getChannelData(0),
                e.inputBuffer.getChannelData(1)
            ]
        });
    }

    this.configure = function(cfg){
        for (var prop in cfg){
            if (cfg.hasOwnProperty(prop)){
                config[prop] = cfg[prop];
            }
        }
    }

    this.record = function(){
        recording = true;
    }

    this.stop = function(){
        recording = false;
    }

    this.clear = function(){
        worker.postMessage({ command: 'clear' });
    }

    this.getBuffers = function(cb) {
        currCallback = cb || config.callback;
        worker.postMessage({ command: 'getBuffers' })
    }

    this.exportWAV = function(cb, type){
        currCallback = cb || config.callback;
        type = type || config.type || 'audio/wav';
        if (!currCallback) throw new Error('Callback not set');
        console.log("Sending export wav message");
        worker.postMessage({
            command: 'exportWAV',
            type: type
        });
    }

    this.exportMonoWAV = function(cb, type){
        currCallback = cb || config.callback;
        type = type || config.type || 'audio/wav';
        if (!currCallback) throw new Error('Callback not set');
        worker.postMessage({
            command: 'exportMonoWAV',
            type: type
        });
    }

    worker.onmessage = function(e){
        var blob = e.data;
        currCallback(blob);
    }

    source.connect(this.node);
    this.node.connect(this.context.destination);   // if the script node is not connected to an output the "onaudioprocess" event is not triggered in chrome.
};


Recorder.download = function(blob, filename){
    console.log("Downloading", blob);
    console.log(window);
    debugger;
    const url = (window.URL || { createObjectURL: (blob) => { console.log("nope", blob)} }).createObjectURL(blob);
    downloadURI(url, filename);
};


function downloadURI(uri, name) {
    const link = document.createElement("a");
    link.download = name;
    link.href = uri;
    document.body.appendChild(link);
    link.click();
    console.log("Downloading with ", link);
    // document.body.removeChild(link);
}


export default Recorder;