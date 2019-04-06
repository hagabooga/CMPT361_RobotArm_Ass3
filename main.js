"use strict";
var canvas;
var gl;
var program;
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
var baseRotation, lowerArmRotation, upperArmRotation;

var base = new Cube(1,0.15,1);
var lower_arm = new Cube(0.2,1,0.2);
var upper_arm = new Cube(0.12,0.7,0.12);
var ball = new Square();
var ballx, bally = 0;


function init() 
{
  
  // Get A WebGL context
  /** @type {HTMLCanvasElement} */
  canvas = document.getElementById( "gl-canvas" );
  gl = WebGLUtils.setupWebGL( canvas );
  if ( !gl ) { alert( "WebGL isn't available" ); }
  program = initShaders( gl, "vertex-shader", "fragment-shader" );
  

  // get atts and uniforms
  positionLocation = gl.getAttribLocation(program, "a_position");
  normalLocation = gl.getAttribLocation(program, "a_normal");
  worldViewProjectionLocation = gl.getUniformLocation(program, "u_worldViewProjection");
  worldInverseTransposeLocation = gl.getUniformLocation(program, "u_worldInverseTranspose");
  colorLocation = gl.getUniformLocation(program, "u_color");
  lightWorldPositionLocation = gl.getUniformLocation(program, "u_lightWorldPosition");
  worldLocation = gl.getUniformLocation(program, "u_world");
  shininessLocation = gl.getUniformLocation(program, "u_shininess");
  lightDirectionLocation = gl.getUniformLocation(program, "u_lightDirection");
  innerLimitLocation = gl.getUniformLocation(program, "u_innerLimit");
  outerLimitLocation = gl.getUniformLocation(program, "u_outerLimit");
  viewWorldPositionLocation = gl.getUniformLocation(program, "u_viewWorldPosition");
  baseRotation = document.getElementById("baseRotation");
  lowerArmRotation = document.getElementById("lowerArmRotation");
  upperArmRotation = document.getElementById("upperArmRotation");

  window.addEventListener("mousedown", function(key)
  {
    if (0 <= key.x && key.x <= canvas.width && !(200 <= key.x && key.x <= 400 && !(0<=key.y && key.y <= 175)) &&
       0 <= key.y && key.y <= canvas.height/2)
       {
        ballx = ((2* (key.x/canvas.width)) - 1)*4;
        bally = ((2 * ((canvas.height - key.y)/canvas.height))-1)*4;
        console.log(key.x,key.y);
       }

  })
  render();
}


function render() 
{
  // Setup
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
  gl.clearColor(0,0,0,0.1);
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.enable(gl.CULL_FACE);
  gl.enable(gl.DEPTH_TEST);
  gl.useProgram(program);
  // SETUP CAMERA
  var projectionMatrix = make_perspectiveMatrix(degreesToRad(60), canvas.width/canvas.height, 1, 500);
  //var cameraMatrix = lookAt([0,4,6], [0,1.5,0], [0,1,0]);
  var cameraMatrix = lookAt([0,0,7], [0,0,0], [0,1,0]);
  var viewMatrix = inverse(cameraMatrix);
  var viewProjectionMatrix = multiplyMat(projectionMatrix, viewMatrix);

  // ########### base ############
  // COLOR
  gl.uniform4fv(colorLocation, [1, 0.5, 0, 1]);
  // Multiply the matrices.
  var worldMatrix = make_tmatrix(0,0,0);
  worldMatrix = multiplyMat(worldMatrix, make_rymatrix(baseRotation.value*0.1));
  //var worldViewProjectionMatrix = multiplyMat(viewProjectionMatrix, worldMatrix);
  worldViewProjectionMatrix = multiplyMat(viewProjectionMatrix, make_rymatrix(baseRotation.value*0.1));
  var worldInverseMatrix = inverse(worldMatrix);
  var worldInverseTransposeMatrix = transpose(worldInverseMatrix);
  // Set the matrices
  gl.uniformMatrix4fv(worldViewProjectionLocation, false, worldViewProjectionMatrix);
  gl.uniformMatrix4fv(worldInverseTransposeLocation, false, worldInverseTransposeMatrix);
  gl.uniformMatrix4fv(worldLocation, false, worldMatrix);
  // draw
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
  gl.drawArrays(gl.TRIANGLES, 0, 36);


  // ########### lower arm ############
  // COLOR
  gl.uniform4fv(colorLocation, [0, 0, 1, 1]); 
  // Multiply the matrices.
  worldViewProjectionMatrix = multiplyMat(worldViewProjectionMatrix, make_tmatrix(0,base.h,0));
  worldViewProjectionMatrix = multiplyMat(worldViewProjectionMatrix, make_rzmatrix(-lowerArmRotation.value*0.03));
  worldViewProjectionMatrix = multiplyMat(worldViewProjectionMatrix, make_tmatrix(0,lower_arm.h,0));
  worldMatrix = multiplyMat(worldMatrix, make_rzmatrix(-lowerArmRotation.value*0.03));
  var worldInverseMatrix = inverse(worldMatrix);
  var worldInverseTransposeMatrix = transpose(worldInverseMatrix);
  // Set the matrices
  gl.uniformMatrix4fv(worldViewProjectionLocation, false, worldViewProjectionMatrix);
  gl.uniformMatrix4fv(worldInverseTransposeLocation, false, worldInverseTransposeMatrix);
  gl.uniformMatrix4fv(worldLocation, false, worldMatrix);
  // draw
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
  gl.drawArrays(gl.TRIANGLES, 0, 36);

  // ########### upper arm ############
  // COLOR
  gl.uniform4fv(colorLocation, [0, 1, 0, 1]); //yellow
  // Multiply the matrices.
  worldViewProjectionMatrix = multiplyMat(worldViewProjectionMatrix, make_tmatrix(0,lower_arm.h,0));
  worldViewProjectionMatrix = multiplyMat(worldViewProjectionMatrix, make_rzmatrix(-upperArmRotation.value*0.03));
  worldViewProjectionMatrix = multiplyMat(worldViewProjectionMatrix, make_tmatrix(0,upper_arm.h,0));
  worldMatrix = multiplyMat(worldMatrix, make_rzmatrix(-upperArmRotation.value*0.1));

  var worldInverseMatrix = inverse(worldMatrix);
  var worldInverseTransposeMatrix = transpose(worldInverseMatrix);
  // Set the matrices
  gl.uniformMatrix4fv(worldViewProjectionLocation, false, worldViewProjectionMatrix);
  gl.uniformMatrix4fv(worldInverseTransposeLocation, false, worldInverseTransposeMatrix);
  gl.uniformMatrix4fv(worldLocation, false, worldMatrix);
  // draw
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
  gl.drawArrays(gl.TRIANGLES, 0, 36);

  // ########### SPOTLIGHT ##########
  var spotlight_matrix = make_tmatrix(0,7,7);
  var spotlight_pos = [spotlight_matrix[12],spotlight_matrix[13],spotlight_matrix[14]]
  gl.uniform3fv(lightWorldPositionLocation, spotlight_pos);
  gl.uniform3fv(viewWorldPositionLocation, [0,7,0]);
  gl.uniform1f(shininessLocation, 900);
  var lightDirection = lookAt(spotlight_pos, [0,1,0],[0,1,0]);
  lightDirection = [-lightDirection[8],-lightDirection[9],-lightDirection[10]];
  gl.uniform3fv(lightDirectionLocation, lightDirection);
  gl.uniform1f(innerLimitLocation, Math.cos(0));
  gl.uniform1f(outerLimitLocation, Math.cos(degreesToRad(50)));
  // COLOR 
  // Multiply the matrices.
  worldMatrix = spotlight_matrix;
  var worldViewProjectionMatrix = multiplyMat(viewProjectionMatrix, worldMatrix);
  var worldInverseMatrix = inverse(worldMatrix);
  var worldInverseTransposeMatrix = transpose(worldInverseMatrix);
  // Set the matrices
  gl.uniformMatrix4fv(worldViewProjectionLocation, false, worldViewProjectionMatrix);
  gl.uniformMatrix4fv(worldInverseTransposeLocation, false, worldInverseTransposeMatrix);
  gl.uniformMatrix4fv(worldLocation, false, worldMatrix);
  window.requestAnimationFrame(render);


  var vBuffer = gl.createBuffer();
  worldMatrix = make_tmatrix(ballx,bally,0);
  worldMatrix = multiplyMat(worldMatrix, make_smatrix(0.25,0.25,0.25));
  var worldViewProjectionMatrix = multiplyMat(viewProjectionMatrix, worldMatrix);
  var worldInverseMatrix = inverse(worldMatrix);
  var worldInverseTransposeMatrix = transpose(worldInverseMatrix);
  var leggo = [ballx,bally,0,1];
  worldInverseMatrix = multiplyMat(worldInverseMatrix, leggo)
  gl.uniformMatrix4fv(worldViewProjectionLocation, false, worldViewProjectionMatrix);
  gl.uniformMatrix4fv(worldInverseTransposeLocation, false, worldInverseTransposeMatrix);
  gl.uniformMatrix4fv(worldLocation, false, worldMatrix);
  gl.uniform4fv(colorLocation, [1,0,0,1]);
  gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
  gl.bufferData( gl.ARRAY_BUFFER, flatten(ball.vertices), gl.STATIC_DRAW );
  gl.vertexAttribPointer( positionLocation, 3, gl.FLOAT, false, 0, 0 );
  gl.enableVertexAttribArray( positionLocation );
  gl.drawArrays( gl.TRIANGLES, 0, 6 );

}

window.onload = init;