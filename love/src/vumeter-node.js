export default class VUMeterNode extends window.AudioWorkletNode {
  constructor(context, updateIntervalInMS) {
    super(context, 'vumeter', {
      numberOfInputs: 1,
      numberOfOutputs: 0,
      channelCount: 1,
      processorOptions: {
        updateIntervalInMS: updateIntervalInMS || 16.67,
      },
    });
    // States in AudioWorkletNode
    this._updateIntervalInMS = updateIntervalInMS;
    this._volume = 0;
    // Handles updated values from AudioWorkletProcessor
    this.port.onmessage = (event) => {
      if (event.data.volume) this._volume = event.data.volume;
    };
    this.port.start();
  }

  get updateInterval() {
    return this._updateIntervalInMS;
  }
  set updateInterval(updateIntervalInMS) {
    this._updateIntervalInMS = updateIntervalInMS;
    this.port.postMessage({ updateIntervalInMS: updateIntervalInMS });
  }
  draw() {
    console.log(this._updateIntervalInMS, this._volume);
  }
}
