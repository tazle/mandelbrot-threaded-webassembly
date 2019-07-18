var state = {}

onmessage = ({ data }) => {
  const {
    memory,
    config: { x, y, d },
    id
  } = data;

    if (state.code === undefined) {
        
        fetch("mandelbrot.wasm")
            .then(response => response.arrayBuffer())
            .then(bytes =>
                  WebAssembly.instantiate(bytes, {
                      env: {
                          memory
                      }
                  })
                 )
            .then(({ instance }) => {
                state.code = instance;
                state.code.exports.run(x, y, d, id);
            });
    } else {
        state.code.exports.run(x, y, d, id);
    }
      
    postMessage("done " + d);
};
