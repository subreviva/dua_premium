// public/audio-processor.js

/**
 * An AudioWorkletProcessor for resampling and forwarding audio chunks.
 * It receives audio from the microphone, resamples it to a target sample rate (16kHz),
 * converts it to 16-bit PCM, and posts it back to the main thread.
 */
class ResamplingProcessor extends AudioWorkletProcessor {
  constructor(options) {
    super();
    this.targetSampleRate = options.processorOptions.targetSampleRate || 16000;
    this.inputBuffer = [];
    this.inputBufferSize = 0;
    this.port.onmessage = (event) => {
      // We can handle messages from the main thread here if needed
    };
  }

  /**
   * Simple linear interpolation for resampling.
   * @param {Float32Array} inputData - The raw audio data.
   * @param {number} fromRate - The original sample rate.
   * @param {number} toRate - The target sample rate.
   * @returns {Float32Array} - The resampled audio data.
   */
  resample(inputData, fromRate, toRate) {
    if (fromRate === toRate) {
      return inputData;
    }

    const ratio = fromRate / toRate;
    const outputLength = Math.floor(inputData.length / ratio);
    const output = new Float32Array(outputLength);

    for (let i = 0; i < outputLength; i++) {
      // A simple nearest-neighbor resampling.
      output[i] = inputData[Math.floor(i * ratio)];
    }
    return output;
  }

  /**
   * Converts a Float32Array to a 16-bit PCM Int16Array.
   * @param {Float32Array} input - The float audio data.
   * @returns {Int16Array} - The 16-bit PCM audio data.
   */
  toFloat32(input) {
    const output = new Int16Array(input.length);
    for (let i = 0; i < input.length; i++) {
      const s = Math.max(-1, Math.min(1, input[i]));
      output[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
    }
    return output;
  }

  process(inputs, outputs, parameters) {
    // We expect only one input.
    const input = inputs[0];

    // And only one channel.
    const channelData = input[0];

    if (!channelData) {
      return true;
    }

    // Resample the audio to the target rate (e.g., 16kHz for Gemini).
    const resampled = this.resample(channelData, sampleRate, this.targetSampleRate);

    // Convert to 16-bit PCM.
    const pcm16 = this.toFloat32(resampled);

    // Post the processed data back to the main thread.
    this.port.postMessage(pcm16.buffer, [pcm16.buffer]);

    // Return true to keep the processor alive.
    return true;
  }
}

registerProcessor('resampling-processor', ResamplingProcessor);
