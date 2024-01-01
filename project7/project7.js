// This function takes the translation and two rotation angles (in radians) as input arguments.
// The two rotations are applied around x and y axes.
// It returns the combined 4x4 transformation matrix as an array in column-major order.
// You can use the MatrixMult function defined in project5.html to multiply two 4x4 matrices in the same format.
function GetModelViewMatrix( translationX, translationY, translationZ, rotationX, rotationY )
{
	// Modify the code below to form the transformation matrix.
	const rotationMatrixX = [
		1, 										0, 									 0, 0,
		0, 	Math.cos(rotationX), Math.sin(rotationX), 0,
		0, -Math.sin(rotationX), Math.cos(rotationX), 0,
		0,										0, 									 0, 1
	];
	const rotationMatrixY = [
		Math.cos(rotationY), 0, -Math.sin(rotationY), 0,
		0, 									 1, 									 0, 0,
		Math.sin(rotationY), 0,  Math.cos(rotationY), 0,
		0,									 0, 									 0, 1
	];
	const rotationMatrix = MatrixMult(rotationMatrixY, rotationMatrixX)
	var translationMatrix = [
		1, 0, 0, 0,
		0, 1, 0, 0,
		0, 0, 1, 0,
		translationX, translationY, translationZ, 1
	];
	var mv = MatrixMult(translationMatrix, rotationMatrix);

	return mv;
}

// Complete the implementation of the following class.
const meshVS = `
	attribute vec3 a_position;
	attribute vec2 a_textureCoordinates;
	attribute vec3 a_normal;

	uniform mat4 u_matrixMVP;
	uniform bool u_swap;
	uniform mat4 u_matrixMV;
	uniform mat3 u_matrixNormal;

	varying vec2 v_textureCoordinates;
	varying vec3 v_normal;
	varying vec4 v_position;

	void main()
	{
		if (u_swap) {
			gl_Position = u_matrixMVP * vec4(a_position.xzy, 1);
		} else {
			gl_Position = u_matrixMVP * vec4(a_position, 1);
		}
		v_textureCoordinates = a_textureCoordinates;
		v_normal = u_matrixNormal * a_normal;
		v_position = u_matrixMV * vec4(a_position, 1.0);
	}
`

const meshFS = `
	precision mediump float;

	uniform sampler2D u_texture;
	uniform bool u_showTex;
	uniform vec3 u_lightDirection;
	uniform float u_shininess;

	varying vec2 v_textureCoordinates;
	varying vec3 v_normal;
	varying vec4 v_position;

	void main()
	{
		vec3 normal = normalize(v_normal);
		vec3 position = vec3(normalize(v_position));
		vec4 diffuseCoefficient = u_showTex ? texture2D(u_texture, v_textureCoordinates) : vec4(1.0, 1.0, 1.0, 1.0);
		vec3 specularCoefficient = vec3(1.0, 1.0, 1.0);

		vec3 lightIntensity = vec3(1.0, 1.0, 1.0);
		vec3 ambientLightIntensity = vec3(0.1, 0.1, 0.1);
		vec3 cameraDirection = -1.0 * vec3(position);
		vec3 blinnDirection = normalize(u_lightDirection + cameraDirection);

		vec3 diffuseModel = lightIntensity * vec3(diffuseCoefficient) * max(0.0, dot(u_lightDirection, normal));
		vec3 specularModel = lightIntensity * specularCoefficient * pow(max(0.0, dot(normal, blinnDirection)), u_shininess); 
		vec3 ambientModel = ambientLightIntensity * vec3(diffuseCoefficient);

		gl_FragColor = vec4(diffuseModel + specularModel + ambientModel, 1.0);
	}
`

class MeshDrawer
{
	// The constructor is a good place for taking care of the necessary initializations.
	constructor()
	{
		// initializations
		this.prog = InitShaderProgram(meshVS, meshFS);

		this.matrixMVPLocation = gl.getUniformLocation(this.prog, 'u_matrixMVP');
		this.matrixMVLocation = gl.getUniformLocation(this.prog, 'u_matrixMV');
		this.matrixNormalLocation = gl.getUniformLocation(this.prog, 'u_matrixNormal')
		this.swapLocation = gl.getUniformLocation(this.prog, 'u_swap')
		this.showTexLocation = gl.getUniformLocation(this.prog, 'u_showTex')
		this.textureLocation = gl.getUniformLocation(this.prog, 'u_texture')
		this.lightDirectionLocation = gl.getUniformLocation(this.prog, 'u_lightDirection');
		this.shininessLocation = gl.getUniformLocation(this.prog, 'u_shininess');

		this.positionLocation = gl.getAttribLocation(this.prog, 'a_position');
		this.textureCoordinatesLocation = gl.getAttribLocation(this.prog, 'a_textureCoordinates');
		this.normalLocation = gl.getAttribLocation(this.prog, 'a_normal');

		// Buffers
		this.positionBuffer = gl.createBuffer();
		this.textureCoordinatesBuffer = gl.createBuffer();
		this.normalBuffer = gl.createBuffer();
		this.texture = gl.createTexture();

		this.showTexture(false);
	}
	
	// This method is called every time the user opens an OBJ file.
	// The arguments of this function is an array of 3D vertex positions,
	// an array of 2D texture coordinates, and an array of vertex normals.
	// Every item in these arrays is a floating point value, representing one
	// coordinate of the vertex position or texture coordinate.
	// Every three consecutive elements in the vertPos array forms one vertex
	// position and every three consecutive vertex positions form a triangle.
	// Similarly, every two consecutive elements in the texCoords array
	// form the texture coordinate of a vertex and every three consecutive 
	// elements in the normals array form a vertex normal.
	// Note that this method can be called multiple times.
	setMesh( vertPos, texCoords, normals )
	{
		// Update the contents of the vertex buffer objects.
		this.numTriangles = vertPos.length / 3;

		gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertPos), gl.STATIC_DRAW);

		gl.bindBuffer(gl.ARRAY_BUFFER, this.textureCoordinatesBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texCoords), gl.STATIC_DRAW);

		gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);
	}
	
	// This method is called when the user changes the state of the
	// "Swap Y-Z Axes" checkbox. 
	// The argument is a boolean that indicates if the checkbox is checked.
	swapYZ( swap )
	{
		// Set the uniform parameter(s) of the vertex shader
		gl.useProgram(this.prog)
		gl.uniform1i(this.swapLocation, swap ? 1 : 0);
	}
	
	// This method is called to draw the triangular mesh.
	// The arguments are the model-view-projection transformation matrixMVP,
	// the model-view transformation matrixMV, the same matrix returned
	// by the GetModelViewProjection function above, and the normal
	// transformation matrix, which is the inverse-transpose of matrixMV.
	draw( matrixMVP, matrixMV, matrixNormal )
	{
		// Complete the WebGL initializations before drawing
		gl.useProgram(this.prog);
		gl.uniformMatrix4fv(this.matrixMVPLocation, false, matrixMVP);
		gl.uniformMatrix4fv(this.matrixMVLocation, false, matrixMV);
		gl.uniformMatrix3fv(this.matrixNormalLocation, false, matrixNormal);

		gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
		gl.vertexAttribPointer(this.positionLocation, 3, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(this.positionLocation);

		gl.bindBuffer(gl.ARRAY_BUFFER, this.textureCoordinatesBuffer);
		gl.vertexAttribPointer(this.textureCoordinatesLocation, 2, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(this.textureCoordinatesLocation);

		gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
		gl.vertexAttribPointer(this.normalLocation, 3, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(this.normalLocation);

		gl.drawArrays( gl.TRIANGLES, 0, this.numTriangles );
	}
	
	// This method is called to set the texture of the mesh.
	// The argument is an HTML IMG element containing the texture data.
	setTexture( img )
	{
		// Bind the texture
		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, this.texture);

		// You can set the texture image data using the following command.
		gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img );
		gl.generateMipmap(gl.TEXTURE_2D);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);

		// Now that we have a texture, it might be a good idea to set
		// some uniform parameter(s) of the fragment shader, so that it uses the texture.
		gl.useProgram(this.prog);
		gl.uniform1i(this.textureLocation, 0);

		this.showTexture(true);
	}
	
	// This method is called when the user changes the state of the
	// "Show Texture" checkbox. 
	// The argument is a boolean that indicates if the checkbox is checked.
	showTexture( show )
	{
		// set the uniform parameter(s) of the fragment shader to specify if it should use the texture.
		gl.useProgram(this.prog)
		gl.uniform1i(this.showTexLocation, show ? 1 : 0);
	}
	
	// This method is called to set the incoming light direction
	setLightDir( x, y, z )
	{
		// set the uniform parameter(s) of the fragment shader to specify the light direction.
		gl.useProgram(this.prog);
		gl.uniform3f(this.lightDirectionLocation, x, y, z);
	}
	
	// This method is called to set the shininess of the material
	setShininess( shininess )
	{
		// set the uniform parameter(s) of the fragment shader to specify the shininess.
		gl.useProgram(this.prog);
		gl.uniform1f(this.shininessLocation, shininess);
	}
}

/**
 * @typedef {Object} Vec3
 * @prop {number} x
 * @prop {number} y
 * @prop {number} z
 * @prop {(x: number, y: number, z: number) => Vec3} init sets the x, y, and z coordinates to the given values.
 * @prop {() => Vec3} copy returns a copy of the vector object.
 * @prop {(v: Vec3) => void} set sets the x, y, and z coordinates to the same values as the given vector v.
 * @prop {(v: Vec3) => void} inc increments the x, y, and z coordinate values by adding the coordinate values of the given vector v.
 * @prop {(v: Vec3) => void} dec decrements the x, y, and z coordinate values by subtracting the coordinate values of the given vector v.
 * @prop {(f: number) => void} scale multiplies the x, y, and z coordinates by the given scalar f.
 * @prop {(v: Vec3) => Vec3} add add the given vector v to this vector and returns the resulting vector.
 * @prop {(v: Vec3) => Vec3} sub subtracts the given vector v from this vector and returns the resulting vector.
 * @prop {(v: Vec3) => number} dot computes the dot product of this vector and the given vector v and returns the resulting scalar.
 * @prop {(v: Vec3) => Vec3} cross computes the cross product of this vector and the given vector v and returns the resulting vector.
 * @prop {(f: number) => Vec3} mul multiplies the vector by the given scalar f and returns the result.
 * @prop {(f: number) => Vec3} div divides the vector by the given scalar f and returns the result.
 * @prop {() => number} len2 returns the squared length of the vector.
 * @prop {() => number} len returns the length of the vector.
 * @prop {() => Vec3} unit returns the unit vector along the direction of this vector.
 * @prop {() => void} normalize normalizes this vector, turning it into a unit vector.
 * @prop {(m: number[][]) => {x: number, y: number, z: number, w: number}} trans returns a transposed version of this vector with the given matrix.
 */

/**
 * @typedef {Object} Spring
 * @prop {number} p0
 * @prop {number} p1
 * @prop {number} rest
 */

/**
 * This function is called for every step of the simulation.
 * Its job is to advance the simulation for the given time step duration dt.
 * It updates the given positions and velocities.
 * @param {number} dt time step size
 * @param {Vec3[]} positions
 * @param {Vec3[]} velocities
 * @param {Spring[]} springs
 * @param {number} stiffness
 * @param {number} damping
 * @param {number} particleMass
 * @param {Vec3} gravity
 * @param {number} restitution the restitution coefficient for collisions with the box walls.
 * */
function SimTimeStep( dt, positions, velocities, springs, stiffness, damping, particleMass, gravity, restitution )
{
	var forces = Array( positions.length ).fill(particleMass * gravity.len()); // The total for per particle

	// Compute the total force of each particle
	springs.forEach((spring) => {
		const p0position = positions[spring.p0];
		const p1position = positions[spring.p1];
		
		// Spring force
		const springLength = p1position.sub(p0position).len();
		const springDirection = p1position.sub(p0position).div(springLength);
		const springForce = springDirection.mul(stiffness * (springLength - spring.rest));
		const springForceMagnitude = springForce.len()
		
		// Damping force
		const p0velocity = velocities[spring.p0];
		const p1velocity = velocities[spring.p1];
		const lengthChangeSpeed = p1velocity.sub(p0velocity).dot(springDirection);
		const springDampingForce = springDirection.mul(damping * lengthChangeSpeed); 
		const springDampingForceMagnitude = springDampingForce.len();

		forces[spring.p0] += springForceMagnitude + springDampingForceMagnitude;
		forces[spring.p1] += -(springForceMagnitude + springDampingForceMagnitude);
	})
	
	// [TO-DO] Update positions and velocities
	
	// [TO-DO] Handle collisions
	
}

