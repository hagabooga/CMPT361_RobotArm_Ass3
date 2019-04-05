"use strict";
var canvas;
var gl;
var positionLocation;
var normalLocation;
var worldViewProjectionLocation;
var worldInverseTransposeLocation;
var colorLocation;
var lightWorldPositionLocation;
var worldLocation;
var normalBuffer;
var positionBuffer;
var shininessLocation;
var lightDirectionLocation;
var innerLimitLocation;
var outerLimitLocation;
var viewWorldPositionLocation;
var isSpot;
var colorLocation2;




window.onload = function init() 
{
  // Get A WebGL context
  /** @type {HTMLCanvasElement} */
  canvas = document.getElementById( "gl-canvas" );
  canvas.addEventListener("mousedown", mouseDown);
  canvas.addEventListener("mouseup", mouseUp);
  canvas.addEventListener("mouseout", mouseUp);
  canvas.addEventListener("mousemove", mouseMove);
  gl = WebGLUtils.setupWebGL( canvas );
  if ( !gl ) { alert( "WebGL isn't available" ); }
  program = initShaders( gl, "vertex-shader", "fragment-shader" );
  show_pointlight = gl.getUniformLocation(program, "show_pointlight");
  show_pointlight = true;

  // get atts and uniforms
  positionLocation = gl.getAttribLocation(program, "a_position");
  normalLocation = gl.getAttribLocation(program, "a_normal");
  worldViewProjectionLocation = gl.getUniformLocation(program, "u_worldViewProjection");
  worldInverseTransposeLocation = gl.getUniformLocation(program, "u_worldInverseTranspose");
  colorLocation = gl.getUniformLocation(program, "u_color");
  colorLocation2 = gl.getUniformLocation(program, "u_color2");
  lightWorldPositionLocation = gl.getUniformLocation(program, "u_lightWorldPosition");
  worldLocation = gl.getUniformLocation(program, "u_world");
  shininessLocation = gl.getUniformLocation(program, "u_shininess");
  lightDirectionLocation = gl.getUniformLocation(program, "u_lightDirection");
  innerLimitLocation = gl.getUniformLocation(program, "u_innerLimit");
  outerLimitLocation = gl.getUniformLocation(program, "u_outerLimit");
  viewWorldPositionLocation = gl.getUniformLocation(program, "u_viewWorldPosition");
  isSpot = gl.getUniformLocation(program,"isSpot");

  render();
}

var point_rotation = 0;
var spot_movement = 0;
var spot_increment = 0.1;

var base = new Cube(2,0.2,2);
var lower_arm = new Cube(0.2,2,0.2);
var upper_arm = new Cube(0.2,1.3,0.2);
function render() 
{
  // Setup
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.enable(gl.CULL_FACE);
  gl.enable(gl.DEPTH_TEST);
  gl.useProgram(program);
  // SETUP CAMERA
  var projectionMatrix = make_perspectiveMatrix(degreesToRad(60), canvas.width/canvas.height, 1, 500);
  var cameraMatrix = lookAt([0,0,10], [0,0,0], [0,1,0]);
  var viewMatrix = inverse(cameraMatrix);
  var viewProjectionMatrix = multiplyMat(projectionMatrix, viewMatrix);


  // ########### base ############
  positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData( gl.ARRAY_BUFFER, new Float32Array(base.vertices), gl.STATIC_DRAW );
  normalBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(base.normals), gl.STATIC_DRAW);
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(positionLocation);
  gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
  gl.vertexAttribPointer(normalLocation, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(normalLocation);

  // position
  // var worldMatrix = make_tmatrix(tx,ty,tz);
  // worldMatrix = multiplyMat(worldMatrix, make_rxmatrix(rx));
  // worldMatrix = multiplyMat(worldMatrix, make_rymatrix(ry));
  // worldMatrix = multiplyMat(worldMatrix, make_smatrix(2,2,2));
  var worldMatrix = make_tmatrix(0,-4,0);
  // COLOR
  gl.uniform4fv(colorLocation, [1, 0.3, 0, 1]); //yellow
  // Multiply the matrices.
  var worldViewProjectionMatrix = multiplyMat(viewProjectionMatrix, worldMatrix);
  var worldInverseMatrix = inverse(worldMatrix);
  var worldInverseTransposeMatrix = transpose(worldInverseMatrix);
  // Set the matrices
  gl.uniformMatrix4fv(worldViewProjectionLocation, false, worldViewProjectionMatrix);
  gl.uniformMatrix4fv(worldInverseTransposeLocation, false, worldInverseTransposeMatrix);
  gl.uniformMatrix4fv(worldLocation, false, worldMatrix);
  gl.drawArrays(gl.TRIANGLES, 0, 36);


  // ########### lower arm ############
  positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData( gl.ARRAY_BUFFER, new Float32Array(lower_arm.vertices), gl.STATIC_DRAW );
  normalBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(lower_arm.normals), gl.STATIC_DRAW);
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(positionLocation);
  gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
  gl.vertexAttribPointer(normalLocation, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(normalLocation);

  // position
  var worldMatrix = make_tmatrix(0,-1.8,0);
  worldMatrix = multiplyMat(worldMatrix, make_rzmatrix(60));
  // COLOR
  gl.uniform4fv(colorLocation, [0, 1, 0, 1]); //yellow
  // Multiply the matrices.
  var worldViewProjectionMatrix = multiplyMat(viewProjectionMatrix, worldMatrix);
  var worldInverseMatrix = inverse(worldMatrix);
  var worldInverseTransposeMatrix = transpose(worldInverseMatrix);
  // Set the matrices
  gl.uniformMatrix4fv(worldViewProjectionLocation, false, worldViewProjectionMatrix);
  gl.uniformMatrix4fv(worldInverseTransposeLocation, false, worldInverseTransposeMatrix);
  gl.uniformMatrix4fv(worldLocation, false, worldMatrix);
  gl.drawArrays(gl.TRIANGLES, 0, 36);

  // ########### upper arm ############
  positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData( gl.ARRAY_BUFFER, new Float32Array(upper_arm.vertices), gl.STATIC_DRAW );
  normalBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(upper_arm.normals), gl.STATIC_DRAW);
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(positionLocation);
  gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
  gl.vertexAttribPointer(normalLocation, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(normalLocation);

  // position
  var worldMatrix = make_tmatrix(0,0,0);
  worldMatrix = multiplyMat(worldMatrix, make_rymatrix(60));
  worldMatrix = multiplyMat(worldMatrix, make_rxmatrix(60));
  // COLOR
  gl.uniform4fv(colorLocation, [0, 1, 0, 1]); //yellow
  // Multiply the matrices.
  var worldViewProjectionMatrix = multiplyMat(viewProjectionMatrix, worldMatrix);
  var worldInverseMatrix = inverse(worldMatrix);
  var worldInverseTransposeMatrix = transpose(worldInverseMatrix);
  // Set the matrices
  gl.uniformMatrix4fv(worldViewProjectionLocation, false, worldViewProjectionMatrix);
  gl.uniformMatrix4fv(worldInverseTransposeLocation, false, worldInverseTransposeMatrix);
  gl.uniformMatrix4fv(worldLocation, false, worldMatrix);
  gl.drawArrays(gl.TRIANGLES, 0, 36);

  // ########### SPOTLIGHT ##########
  var spotlight_buffer = gl.createBuffer();
  gl.enableVertexAttribArray(positionLocation);
  gl.bindBuffer(gl.ARRAY_BUFFER, spotlight_buffer);
  gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);
  gl.bufferData(gl.ARRAY_BUFFER, make_cube(), gl.STATIC_DRAW);
  var spotlight_matrix = make_tmatrix(0,5,0);
  // if (spot_movement >=5) spot_increment = -0.1;
  // else if (spot_movement <= -5) spot_increment = 0.1;
  // spot_movement += spot_increment;
  // spotlight_matrix = multiplyMat(spotlight_matrix, make_tmatrix(spot_movement,0,0));
  //console.log(spotlight_matrix);
  var spotlight_pos = [spotlight_matrix[12],spotlight_matrix[13],spotlight_matrix[14]]
  gl.uniform3fv(lightWorldPositionLocation, spotlight_pos);
  gl.uniform3fv(viewWorldPositionLocation, [0,10,0]);
  gl.uniform1f(shininessLocation, 200);
  var lightDirection = lookAt(spotlight_pos, [0,0,0],[0,1,0]);
  lightDirection = [-lightDirection[8],-lightDirection[9],-lightDirection[10]];
  gl.uniform3fv(lightDirectionLocation, lightDirection);
  gl.uniform1f(innerLimitLocation, Math.cos(0));
  gl.uniform1f(outerLimitLocation, Math.cos(degreesToRad(80)));
  // COLOR 
  gl.uniform4fv(colorLocation, [0,0,0,0.1]); // transparent
  // Multiply the matrices.
  worldMatrix = spotlight_matrix;
  var worldViewProjectionMatrix = multiplyMat(viewProjectionMatrix, worldMatrix);
  var worldInverseMatrix = inverse(worldMatrix);
  var worldInverseTransposeMatrix = transpose(worldInverseMatrix);
  // Set the matrices
  gl.uniformMatrix4fv(worldViewProjectionLocation, false, worldViewProjectionMatrix);
  gl.uniformMatrix4fv(worldInverseTransposeLocation, false, worldInverseTransposeMatrix);
  gl.uniformMatrix4fv(worldLocation, false, worldMatrix);
  gl.drawArrays(gl.LINE_LOOP,0,36);

  

  window.requestAnimationFrame(render);
}