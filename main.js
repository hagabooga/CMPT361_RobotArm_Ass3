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


var ballx,bally;
var allowMouse;
var olda1,olda2;
var a1,a2;
var deltaRotLower, deltaRotUpper;
var click_tick = 100;

// #Animation
var play_anim;

window.onload = function init() 
{
  
  // Get A WebGL context
  /** @type {HTMLCanvasElement} */
  canvas = document.getElementById( "gl-canvas" );
  gl = WebGLUtils.setupWebGL( canvas );
  if ( !gl ) { alert( "WebGL isn't available" ); }
  program = initShaders( gl, "vertex-shader", "fragment-shader" );
  ballx =((2* (464/canvas.width)) - 1)*4;
  bally =((2 * ((canvas.height - 159)/canvas.height))-1)*4;
  var x = Math.abs(ballx);
  var y = Math.abs(bally);
  var dist = Math.sqrt(x*x + y*y)/2;
  //var len1 = 
  var d1 = Math.atan2(y,x);
  var d2 = lawCos(dist,lower_arm.h, upper_arm.h);
  a1 = d1+d2;
  a2 = lawCos(lower_arm.h, upper_arm.h, dist);

  olda1=a1;
  olda2=a2;

  allowMouse = document.getElementById("allowMouse");
  play_anim = document.getElementById("play_anim");
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
    if (allowMouse.checked)
    {
      if (0 <= key.x && key.x <= canvas.width && //!(185 <= key.x && key.x <= 385 && !(0<=key.y && key.y <= 150)) &&
      0 <= key.y && key.y <= canvas.height/2)
      {
        olda1 = a1;
        olda2 = a2;
       ballx = ((2* (key.x/canvas.width)) - 1)*4;
       bally = ((2 * ((canvas.height - key.y)/canvas.height))-1)*4;
       // find angles
       var x = Math.abs(ballx);
       var y = Math.abs(bally);
       var dist = Math.sqrt(x*x + y*y)/2;
       //var len1 = 
       var d1 = Math.atan2(y,x);
       var d2 = lawCos(dist,lower_arm.h, upper_arm.h);
       a1 = d1+d2;
       a2 = lawCos(lower_arm.h, upper_arm.h, dist);
       if (ballx <= 0) 
       {
         a1 = Math.PI - a1;
         a2 = -a2;
       }
       if (isNaN(a1))
       {
         a1 = Math.PI/2;
         a2 = Math.PI;
       }
       deltaRotLower = a1 - olda1;
       deltaRotUpper = a2 - olda2;
       click_tick = 0;
      }
    }
  })

  play_anim.onclick = function()
  {
    allowMouse.checked = false;
    console.log("PLAYING");
  }
  render();
}

function renderCube(cube)
{
  positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData( gl.ARRAY_BUFFER, new Float32Array(cube.vertices), gl.STATIC_DRAW );
  normalBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cube.normals), gl.STATIC_DRAW);
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(positionLocation);
  gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
  gl.vertexAttribPointer(normalLocation, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(normalLocation);
  gl.drawArrays(gl.TRIANGLES, 0, 36);
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
  var cameraMatrix;
  if (!allowMouse.checked)
  {
    cameraMatrix = lookAt([0,4,6], [0,1.5,0], [0,1,0]);
  }
  else
  {
    cameraMatrix = lookAt([0,0,7], [0,0,0], [0,1,0]);
  }
  var viewMatrix = inverse(cameraMatrix);
  var viewProjectionMatrix = multiplyMat(projectionMatrix, viewMatrix);
  // ####### ball ########
  if (allowMouse.checked == true)
  {
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
  // ########### base ############
  // COLOR
  gl.uniform4fv(colorLocation, [1, 0.5, 0, 1]);
  // Multiply the matrices.
  var worldMatrix = make_smatrix(1,1,1);
  if (allowMouse.checked)
  {
    worldViewProjectionMatrix = multiplyMat(viewProjectionMatrix, worldMatrix);
  }
  else
  {
    worldViewProjectionMatrix = multiplyMat(viewProjectionMatrix, make_rymatrix(baseRotation.value*0.1));
    worldMatrix = multiplyMat(worldMatrix, make_rymatrix(baseRotation.value*0.1));
  }
  var worldInverseMatrix = inverse(worldMatrix);
  var worldInverseTransposeMatrix = transpose(worldInverseMatrix);
  // Set the matrices
  gl.uniformMatrix4fv(worldViewProjectionLocation, false, worldViewProjectionMatrix);
  gl.uniformMatrix4fv(worldInverseTransposeLocation, false, worldInverseTransposeMatrix);
  gl.uniformMatrix4fv(worldLocation, false, worldMatrix);
  // draw
  renderCube(base);

  // ########### lower arm ############
  // COLOR
  gl.uniform4fv(colorLocation, [0, 0, 1, 1]); 
  // Multiply the matrices.
  worldViewProjectionMatrix = multiplyMat(worldViewProjectionMatrix, make_tmatrix(0,base.h,0));
  if (allowMouse.checked == true)
  {
    var angle = a1;
    if (click_tick <= 100)
    {
      click_tick += 1;
      angle = olda1 + deltaRotLower*0.01*click_tick;
    }
    worldViewProjectionMatrix = multiplyMat(worldViewProjectionMatrix, make_rzmatrix(-Math.PI/2));
    worldViewProjectionMatrix = multiplyMat(worldViewProjectionMatrix, make_rzmatrix(angle));
    worldMatrix = multiplyMat(worldMatrix, make_rzmatrix(-Math.PI/2));
    worldMatrix = multiplyMat(worldMatrix, make_rzmatrix(angle));
  }
  else
  {
    worldViewProjectionMatrix = multiplyMat(worldViewProjectionMatrix, make_rzmatrix(-lowerArmRotation.value*0.03));
    worldMatrix = multiplyMat(worldMatrix, make_rzmatrix(-lowerArmRotation.value*0.03));
  }
  worldViewProjectionMatrix = multiplyMat(worldViewProjectionMatrix, make_tmatrix(0,lower_arm.h,0));
  var worldInverseMatrix = inverse(worldMatrix);
  var worldInverseTransposeMatrix = transpose(worldInverseMatrix);
  // Set the matrices
  gl.uniformMatrix4fv(worldViewProjectionLocation, false, worldViewProjectionMatrix);
  gl.uniformMatrix4fv(worldInverseTransposeLocation, false, worldInverseTransposeMatrix);
  gl.uniformMatrix4fv(worldLocation, false, worldMatrix);
  // draw
  renderCube(lower_arm);
  // ########### upper arm ############
  // COLOR
  gl.uniform4fv(colorLocation, [0, 1, 0, 1]);
  // Multiply the matrices.
  worldViewProjectionMatrix = multiplyMat(worldViewProjectionMatrix, make_tmatrix(0,lower_arm.h,0));
  if (allowMouse.checked == true)
  {
    var angle = a2;
    if (click_tick <= 100)
    {
      click_tick += 1;
      angle = olda2 + deltaRotUpper*0.01*click_tick;
    }
    worldViewProjectionMatrix = multiplyMat(worldViewProjectionMatrix, make_rzmatrix(-Math.PI));
    worldViewProjectionMatrix = multiplyMat(worldViewProjectionMatrix, make_rzmatrix(angle));
    worldMatrix = multiplyMat(worldMatrix, make_rzmatrix(-Math.PI));
    worldMatrix = multiplyMat(worldMatrix, make_rzmatrix(a2));
  }
  else
  {
    worldViewProjectionMatrix = multiplyMat(worldViewProjectionMatrix, make_rzmatrix(-upperArmRotation.value*0.03));
    worldMatrix = multiplyMat(worldMatrix, make_rzmatrix(-upperArmRotation.value*0.1));
  }
  worldViewProjectionMatrix = multiplyMat(worldViewProjectionMatrix, make_tmatrix(0,upper_arm.h,0));
  var worldInverseMatrix = inverse(worldMatrix);
  var worldInverseTransposeMatrix = transpose(worldInverseMatrix);
  // Set the matrices
  gl.uniformMatrix4fv(worldViewProjectionLocation, false, worldViewProjectionMatrix);
  gl.uniformMatrix4fv(worldInverseTransposeLocation, false, worldInverseTransposeMatrix);
  gl.uniformMatrix4fv(worldLocation, false, worldMatrix);
  // draw
  renderCube(upper_arm);


  // ######## BACKGROUND ############
  var background_matrix = make_tmatrix(0,-5,-6);
  worldViewProjectionMatrix = multiplyMat(viewProjectionMatrix, background_matrix);
  var worldInverseMatrix = inverse(background_matrix);
  var worldInverseTransposeMatrix = transpose(worldInverseMatrix);
  gl.uniformMatrix4fv(worldViewProjectionLocation, false, worldViewProjectionMatrix);
  gl.uniformMatrix4fv(worldInverseTransposeLocation, false, worldInverseTransposeMatrix);
  gl.uniformMatrix4fv(worldLocation, false, background_matrix);
  gl.uniform4fv(colorLocation, [0.0, 0.8, 1, 0.7]);
  renderCube(background);

  // ########## TABLE ##########
  // ######## BACKGROUND ############
  var table_matrix = make_tmatrix(0,-base.h-table.h,0);
  worldViewProjectionMatrix = multiplyMat(viewProjectionMatrix, table_matrix);
  var worldInverseMatrix = inverse(table_matrix);
  var worldInverseTransposeMatrix = transpose(worldInverseMatrix);
  gl.uniformMatrix4fv(worldViewProjectionLocation, false, worldViewProjectionMatrix);
  gl.uniformMatrix4fv(worldInverseTransposeLocation, false, worldInverseTransposeMatrix);
  gl.uniformMatrix4fv(worldLocation, false, table_matrix);
  gl.uniform4fv(colorLocation, [0.4, 0.2, 0.2, 1]);
  renderCube(table);

  // ########### SPOTLIGHT ##########
  var spotlight_matrix = make_tmatrix(0,3,5);
  var spotlight_pos = [spotlight_matrix[12],spotlight_matrix[13],spotlight_matrix[14]]
  gl.uniform3fv(lightWorldPositionLocation, spotlight_pos);
  gl.uniform3fv(viewWorldPositionLocation, [0,0,0]);
  gl.uniform1f(shininessLocation, 200);
  var lightDirection = lookAt(spotlight_pos, [0,0,0],[0,1,0]);
  lightDirection = [-lightDirection[8],-lightDirection[9],-lightDirection[10]];
  gl.uniform3fv(lightDirectionLocation, lightDirection);
  gl.uniform1f(innerLimitLocation, Math.cos(0));
  gl.uniform1f(outerLimitLocation, Math.cos(degreesToRad(40)));
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
}
