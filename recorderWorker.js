importScripts('pcmdata.min.js');

var recLength = 0,
  recBuffers = [];

this.onmessage = function(e){
  switch(e.data.command){
    case 'record':
      record(e.data.buffer);
      break;
    case 'exportWAV':
      exportWAV();
      break;
    case 'clear':
      clear();
      break;
  }
};

function record(inputBuffer){
  var bufferL = inputBuffer.getChannelData(0);
  var bufferR = inputBuffer.getChannelData(1);
  var interleaved = interleave(bufferL, bufferR);
  recBuffers.push(interleaved);
  recLength += interleaved.length;
}

function exportWAV(){
  var buffer = mergeBuffers(recBuffers, recLength);
  var waveData = PCMData.encode({
    sampleRate: 44100,
    channelCount:   2,
    bytesPerSample: 2,    //16bit
    data:       buffer
  });
  this.postMessage(waveData);
}

function clear(){
  recLength = 0;
  recBuffers = [];
}

function mergeBuffers(recBuffers, recLength){
  var result = new Float32Array(recLength);
  var offset = 0;
  for (var i = 0; i < recBuffers.length; i++){
    result.set(recBuffers[i], offset);
    offset += recBuffers[i].length;
  }
  return result;
}

function interleave(inputL, inputR){
  var length = inputL.length + inputR.length;
  var result = new Float32Array(length);

  var index = 0,
    inputIndex = 0;

  while (index < length){
    result[index++] = inputL[inputIndex];
    result[index++] = inputR[inputIndex];
    inputIndex++;
  }
  return result;
}