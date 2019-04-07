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
var playing_anim = false;
var time = 0;

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
    playing_anim = true;
    time = 0;
    camx = 0;
    camy = 4;
    camz = 6;
    camlx = 0;
    camly = 1.5;
    rock_hold = false;
    camlz = 0;
    lowr = 0;
    upr = 0;
    interval = 150;
    rockx = 0;
    rocky = 0;
    rockz = 0;
    rockrx = 0;
    rockry = 0;
    rockrz = 0;
    key_frame = 0;
    rock_fall = 0;
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

  if (!playing_anim)
  {
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
      normalBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(ball.normals), gl.STATIC_DRAW);
      gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
      gl.vertexAttribPointer(normalLocation, 3, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(normalLocation);
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
      var low_angle = a1;
      if (click_tick <= 100)
      {
        click_tick += 1;
        low_angle = olda1 + deltaRotLower*0.01*click_tick;
      }
      worldViewProjectionMatrix = multiplyMat(worldViewProjectionMatrix, make_rzmatrix(-Math.PI/2));
      worldViewProjectionMatrix = multiplyMat(worldViewProjectionMatrix, make_rzmatrix(low_angle));
      worldMatrix = multiplyMat(worldMatrix, make_rzmatrix(-Math.PI/2));
      worldMatrix = multiplyMat(worldMatrix, make_rzmatrix(low_angle));
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
      worldMatrix = multiplyMat(worldMatrix, make_rzmatrix(-upperArmRotation.value*0.03));
    }
      //console.log(lowerArmRotation.value)
      //console.log(upperArmRotation.value)
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
      var table_matrix = make_tmatrix(0,-base.h-table.h,0);
      worldViewProjectionMatrix = multiplyMat(viewProjectionMatrix, table_matrix);
      var worldInverseMatrix = inverse(table_matrix);
      var worldInverseTransposeMatrix = transpose(worldInverseMatrix);
      gl.uniformMatrix4fv(worldViewProjectionLocation, false, worldViewProjectionMatrix);
      gl.uniformMatrix4fv(worldInverseTransposeLocation, false, worldInverseTransposeMatrix);
      gl.uniformMatrix4fv(worldLocation, false, table_matrix);
      gl.uniform4fv(colorLocation, [0.4, 0.2, 0.2, 1]);
      renderCube(table);

      // ########## rock ##########
      var rock_matrix = make_tmatrix(-2,rock.h/2,0);
      worldViewProjectionMatrix = multiplyMat(viewProjectionMatrix, rock_matrix);
      var worldInverseMatrix = inverse(rock_matrix);
      var worldInverseTransposeMatrix = transpose(worldInverseMatrix);
      //console.log(rock_matrix[3],rock_matrix[7],rock_matrix[11]);
      gl.uniformMatrix4fv(worldViewProjectionLocation, false, worldViewProjectionMatrix);
      gl.uniformMatrix4fv(worldInverseTransposeLocation, false, worldInverseTransposeMatrix);
      gl.uniformMatrix4fv(worldLocation, false, rock_matrix);
      gl.uniform4fv(colorLocation, [.7,.7,.7, 1]);
      renderCube(rock);




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
    }
  else
  {
    //console.log(key_frame);
    //console.log("playinog");
    if (key_frame == 0)
    {
      if (time <= interval)
      {
        lowr = -0.8/interval*time;
        upr = -2/interval*time;
        
      }
      else
      {
        next_key(60);
        camx = -4;
        camy = 4;
        camz = 6;
      }
    }
    else if (key_frame == 1)
    {
      if (time<=interval)
      { 
      }
      else
      {
        next_key(40);
        rock_hold = true;
      }
    }
    else if (key_frame == 2)
    {
      if (time<=interval)
      { 
        lowr += 1/interval;
        upr += 3/interval;
      }
      else
      {
        next_key(25);
      }
    }
    else if (key_frame == 3)
    {
      if (time<=interval)
      { 
        lowr += -0.8/interval;
        upr += -2/interval;
      }
      else
      {
        next_key(25);
      }
    }
    else if (key_frame == 4)
    {
      if (time<=interval)
      { 
        lowr += 0.8/interval;
        upr += 2/interval;
      }
      else
      {
        next_key(25);
      }
    }
    else if (key_frame == 5)
    {
      if (time<=interval)
      { 
        lowr += -0.8/interval;
        upr += -2/interval;
      }
      else
      {
        next_key(25);
      }
    }
    else if (key_frame == 6)
    {
      if (time<=interval)
      { 
        lowr += 0.8/interval;
        upr += 2/interval;
      }
      else
      {
        next_key(25);
      }
    }
    else if (key_frame == 7)
    {
      if (time<=interval)
      { 
        lowr += -0.8/interval;
        upr += -2/interval;
      }
      else
      {
        next_key(75);
      }
    }
    else if (key_frame == 8)
    {
      if (time<=interval)
      { 
      }
      else
      {
        next_key(150);
        rock_hold = false;
        rockx = -0.8;
        //rocky = 0;
        rocky =  1.7;
        rockz = 0;
        rock_fall = rocky;
        console.log(rockx);
        //rock_matrix = make_tmatrix(rockx,rocky,rockz);
      }
    }
    else if (key_frame == 9)
    {
      if (time <= interval)
      {
        rocky -= rock_fall/interval;
      }
      else
      {
        next_key(100);
      }
    }
    else if (time >= interval + 100)
    {
      playing_anim = false;
    }
    // SETUP CAMERA
    var projectionMatrix = make_perspectiveMatrix(degreesToRad(60), canvas.width/canvas.height, 1, 500);
    var cameraMatrix = lookAt([camx,camy,camz], [camlx,camly,camlz], [0,1,0]);
    var viewMatrix = inverse(cameraMatrix);
    var viewProjectionMatrix = multiplyMat(projectionMatrix, viewMatrix);
    // ########### base ############
    var worldMatrix = make_smatrix(1,1,1);
    var worldViewProjectionMatrix = multiplyMat(viewProjectionMatrix, worldMatrix);
    var worldInverseMatrix = inverse(worldMatrix);
    var worldInverseTransposeMatrix = transpose(worldInverseMatrix);
    gl.uniformMatrix4fv(worldViewProjectionLocation, false, worldViewProjectionMatrix);
    gl.uniformMatrix4fv(worldInverseTransposeLocation, false, worldInverseTransposeMatrix);
    gl.uniformMatrix4fv(worldLocation, false, worldMatrix);
    gl.uniform4fv(colorLocation, [1, 0.5, 0, 1]);
    renderCube(base);
    // ########### lower arm ##########
    // COLOR
    // Multiply the matrices.
    worldViewProjectionMatrix = multiplyMat(worldViewProjectionMatrix, make_tmatrix(0,base.h,0));
    worldViewProjectionMatrix = multiplyMat(worldViewProjectionMatrix, make_rzmatrix(-lowr));
    worldViewProjectionMatrix = multiplyMat(worldViewProjectionMatrix, make_tmatrix(0,lower_arm.h,0));
    worldMatrix = multiplyMat(worldMatrix, make_rzmatrix(-lowerArmRotation.value*0.03));
    var worldInverseMatrix = inverse(worldMatrix);
    var worldInverseTransposeMatrix = transpose(worldInverseMatrix);
    gl.uniformMatrix4fv(worldViewProjectionLocation, false, worldViewProjectionMatrix);
    gl.uniformMatrix4fv(worldInverseTransposeLocation, false, worldInverseTransposeMatrix);
    gl.uniformMatrix4fv(worldLocation, false, worldMatrix);
    gl.uniform4fv(colorLocation, [0, 0, 1, 1]); 
    renderCube(lower_arm);
    // ########### upper arm ############
    // COLOR
    gl.uniform4fv(colorLocation, [0, 1, 0, 1]);
    // Multiply the matrices.
    worldViewProjectionMatrix = multiplyMat(worldViewProjectionMatrix, make_tmatrix(0,lower_arm.h,0));
    worldViewProjectionMatrix = multiplyMat(worldViewProjectionMatrix, make_rzmatrix(-upr));
    worldMatrix = multiplyMat(worldMatrix, make_rzmatrix(-upr));
    worldViewProjectionMatrix = multiplyMat(worldViewProjectionMatrix, make_tmatrix(0,upper_arm.h,0));
    var worldInverseMatrix = inverse(worldMatrix);
    var worldInverseTransposeMatrix = transpose(worldInverseMatrix);
    // Set the matrices
    gl.uniformMatrix4fv(worldViewProjectionLocation, false, worldViewProjectionMatrix);
    gl.uniformMatrix4fv(worldInverseTransposeLocation, false, worldInverseTransposeMatrix);
    gl.uniformMatrix4fv(worldLocation, false, worldMatrix);
    // draw
    renderCube(upper_arm);
    // ########## rock ##########
    if (rock_hold)
    {
      worldViewProjectionMatrix = multiplyMat(worldViewProjectionMatrix, make_tmatrix(0,upper_arm.h,0));
      worldViewProjectionMatrix = multiplyMat(worldViewProjectionMatrix, make_tmatrix(0,rock.h,0));
      rock_mat = worldViewProjectionMatrix;      
      camlx = rock_mat[3];
      camly = rock_mat[7];
      camlz = rock_mat[11];
    }
    else
    {
      worldMatrix = make_tmatrix(-2+rockx,rock.h/2+rocky,rockz);
      //console.log(worldMatrix[12],worldMatrix[13],worldMatrix[14]);
      //worldMatrix = multiplyMat(worldMatrix, make_rxmatrix(rockrx));
      //worldMatrix = multiplyMat(worldMatrix, make_rymatrix(rockry));
      //worldMatrix = multiplyMat(worldMatrix, make_rzmatrix(rockrz));
      worldViewProjectionMatrix = multiplyMat(viewProjectionMatrix, worldMatrix);
    }
    var worldInverseMatrix = inverse(worldMatrix);
    var worldInverseTransposeMatrix = transpose(worldInverseMatrix);
    gl.uniformMatrix4fv(worldViewProjectionLocation, false, worldViewProjectionMatrix);
    gl.uniformMatrix4fv(worldInverseTransposeLocation, false, worldInverseTransposeMatrix);
    gl.uniformMatrix4fv(worldLocation, false, worldMatrix);
    gl.uniform4fv(colorLocation, [.7,.7,.7, 1]);
    renderCube(rock);

    
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
    time += 1;
  }
  
  window.requestAnimationFrame(render);
}
