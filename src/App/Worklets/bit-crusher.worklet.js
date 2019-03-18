class BitCrusherProcessor extends AudioWorkletProcessor {
    static get parameterDescriptors() {
        return [
            {
                name: 'bitDepth', 
                defaultValue: 12, 
                minValue: 1, 
                maxValue: 16
            }, 
            { 
                name: 'frequencyReduction',
                defaultValue: 0.5,
                minValue: 0,
                maxValue: 1,
            },
        ];
    }
    
    constructor() {
        super();
        this.phase_ = 0;
        this.lastSampleValue_ = 0;
    }
    
    process(inputs, outputs, parameters) {
        for (let input of inputs) {
            const output = outputs[0];
            for (let channel = 0; channel < output.length; channel++) {
                const inputChannel = input[channel];
                const outputChannel = output[channel];
                
                let frequencyReduction = parameters.frequencyReduction[0];
                let bitDepth = parameters.bitDepth[0];
                let step = Math.pow(0.5, bitDepth);
                for (let i = 0; i < inputChannel.length; ++i) {
                    this.phase_ += frequencyReduction;
                    if (this.phase_ >= 1.0) {
                        this.phase_ %= 1.0;
                        this.lastSampleValue_ = Math.round(inputChannel[i] / step) * step;
                    }
                    outputChannel[i] = this.lastSampleValue_;
                }
            }
        }

        return true;
    }
}

registerProcessor('bit-crusher-processor', BitCrusherProcessor);