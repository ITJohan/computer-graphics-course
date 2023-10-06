class CurveDrawer {
  constructor() {
    this.prog = InitShaderProgram(curvesVS, curvesFS);

    this.t = gl.getAttribLocation(this.prog, 't');
    this.mvp = gl.getUniformLocation(this.prog, 'mvp');
    this.p0 = gl.getUniformLocation(this.prog, 'p0');
    this.p1 = gl.getUniformLocation(this.prog, 'p1');
    this.p2 = gl.getUniformLocation(this.prog, 'p2');
    this.p3 = gl.getUniformLocation(this.prog, 'p3');

    // Initialize the attribute buffer
    this.steps = 100;
    var tv = [];
    for (var i = 0; i < this.steps; ++i) {
      tv.push(i / (this.steps - 1));
    }

    this.buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(tv), gl.STATIC_DRAW);
  }
  setViewport(width, height) {
    const trans = [
      2 / width,
      0,
      0,
      0,
      0,
      -2 / height,
      0,
      0,
      0,
      0,
      1,
      0,
      -1,
      1,
      0,
      1,
    ];
    gl.useProgram(this.prog); // Bind the program
    gl.uniformMatrix4fv(this.mvp, false, trans);
  }
  updatePoints(pt) {
    gl.useProgram(this.prog);

    const x0 = pt[0].getAttribute('cx');
    const y0 = pt[0].getAttribute('cy');
    gl.uniform2f(this.p0, x0, y0);
    const x1 = pt[1].getAttribute('cx');
    const y1 = pt[1].getAttribute('cy');
    gl.uniform2f(this.p1, x1, y1);
    const x2 = pt[2].getAttribute('cx');
    const y2 = pt[2].getAttribute('cy');
    gl.uniform2f(this.p2, x2, y2);
    const x3 = pt[3].getAttribute('cx');
    const y3 = pt[3].getAttribute('cy');
    gl.uniform2f(this.p3, x3, y3);
  }
  draw() {
    gl.useProgram(this.prog);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
    gl.enableVertexAttribArray(this.t);
    gl.vertexAttribPointer(this.t, 1, gl.FLOAT, false, 0, 0);
    gl.drawArrays(gl.LINE_STRIP, 0, this.steps);
  }
}

// Vertex Shader
var curvesVS = `
	attribute float t;
	uniform mat4 mvp;
	uniform vec2 p0;
	uniform vec2 p1;
	uniform vec2 p2;
	uniform vec2 p3;
	void main()
	{
    float x = p0.x * pow(1.0 - t, 3.0) + p1.x * 3.0 * t * pow(1.0 - t, 2.0) + p2.x * 3.0 * (1.0 - t) * pow(t, 2.0) + p3.x * pow(t, 3.0);
    float y = p0.y * pow(1.0 - t, 3.0) + p1.y * 3.0 * t * pow(1.0 - t, 2.0) + p2.y * 3.0 * (1.0 - t) * pow(t, 2.0) + p3.y * pow(t, 3.0);
		gl_Position = mvp * vec4(x, y, 0.0, 1.0);
	}
`;

// Fragment Shader
var curvesFS = `
	precision mediump float;
	void main()
	{
		gl_FragColor = vec4(1,0,0,1);
	}
`;
