// This function takes the translation and two rotation angles (in radians) as input arguments.
// The two rotations are applied around x and y axes.
// It returns the combined 4x4 transformation matrix as an array in column-major order.
// You can use the MatrixMult function defined in project5.html to multiply two 4x4 matrices in the same format.
function GetModelViewMatrix( translationX, translationY, translationZ, rotationX, rotationY )
{
	// [TO-DO] Modify the code below to form the transformation matrix.
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


// [TO-DO] Complete the implementation of the following class.
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
		vec4 diffuseCoefficient = u_showTex ? texture2D(u_texture, v_textureCoordinates) : vec4(1.0, 1.0, 1.0, 1.0);
		vec3 specularCoefficient = vec3(1.0, 1.0, 1.0);

		vec3 lightIntensity = vec3(1.0, 1.0, 1.0);
		vec3 cameraDirection = -1.0 * vec3(v_position);
		vec3 blinnDirection = normalize(u_lightDirection + cameraDirection);

		vec3 diffuseModel = lightIntensity * diffuseCoefficient.rgb * dot(u_lightDirection, normal);
		vec3 specularModel = lightIntensity * specularCoefficient * pow(dot(normal, blinnDirection), u_shininess); 

		gl_FragColor = vec4(diffuseModel + specularModel, 1.0);
	}
`

class MeshDrawer
{
	// The constructor is a good place for taking care of the necessary initializations.
	constructor()
	{
		// [TO-DO] initializations
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
		// [TO-DO] Update the contents of the vertex buffer objects.
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
		// [TO-DO] Set the uniform parameter(s) of the vertex shader
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
		// [TO-DO] Complete the WebGL initializations before drawing
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
		// [TO-DO] Bind the texture
		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, this.texture);

		// You can set the texture image data using the following command.
		gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img );
		gl.generateMipmap(gl.TEXTURE_2D);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);

		// [TO-DO] Now that we have a texture, it might be a good idea to set
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
		// [TO-DO] set the uniform parameter(s) of the fragment shader to specify if it should use the texture.
		gl.useProgram(this.prog)
		gl.uniform1i(this.showTexLocation, show ? 1 : 0);
	}
	
	// This method is called to set the incoming light direction
	setLightDir( x, y, z )
	{
		// [TO-DO] set the uniform parameter(s) of the fragment shader to specify the light direction.
		gl.useProgram(this.prog);
		gl.uniform3f(this.lightDirectionLocation, x, y, z);
	}
	
	// This method is called to set the shininess of the material
	setShininess( shininess )
	{
		// [TO-DO] set the uniform parameter(s) of the fragment shader to specify the shininess.
		gl.useProgram(this.prog);
		gl.uniform1f(this.shininessLocation, shininess);
	}
}
