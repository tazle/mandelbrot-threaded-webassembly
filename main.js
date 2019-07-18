const memory = new WebAssembly.Memory({
    initial: 80,
    maximum: 80,
    shared: true
});

// the 'seahorse tail'
// https://commons.wikimedia.org/wiki/File:Mandel_zoom_04_seehorse_tail.jpg
const config = {
    x: -0.743644786,
    y: 0.1318252536,
    d: 0.00029336
};


let repeats = 0;
const repeatCount = 100;

var start;

let workers = [];

const workerCount = 4;
var doneCount = 0;
for (let i = 0; i < workerCount; i++) {
    const worker = new Worker("worker.js");
    workers.push(worker);
}


function calculate(onDone, count) {
    doneCount = 0;
    config.d -= 0.0000005
    
    var i32 = new Uint32Array(memory.buffer);
    i32[0] = 0;

    start = performance.now();
    for (let i = 0; i < workerCount; i++) {
        const worker = workers[i];
        worker.onmessage = e => {
            doneCount++;
            if (doneCount === workerCount) {
                console.log(e.data);
                onDone(count)
            }
        };
        worker.postMessage({ memory, config, id: i * 200 + 100 });
    }
}

function onDone(count) {
    console.log("done", performance.now() - start);
    const canvasData = new Uint8Array(memory.buffer, 4, 1200 * 800 * 4);
    const context = document.querySelector("canvas").getContext("2d");
    const imageData = context.createImageData(1200, 800);
    imageData.data.set(canvasData);
    context.putImageData(imageData, 0, 0);
    if (count < repeatCount) {
        calculate(onDone, count + 1);
    }
}

calculate(onDone, 0);
