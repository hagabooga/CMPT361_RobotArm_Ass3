
var u_matrix;
var worldViewProjectionLocation;
var world_inverseT;
var colorLocation ;
var lightWorldPositionLocation;
var positionAttributeLocation;
var normalAttributeLocation;
var reverseLightDirectionLocation;
function yeo()
{
    canvas = document.getElementById( "gl-canvas" );
    canvas.addEventListener("mousedown", mouseDown);
    canvas.addEventListener("mouseup", mouseUp);
    canvas.addEventListener("mouseout", mouseUp);
    canvas.addEventListener("mousemove", mouseMove);
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }
    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    gl.viewport( 0, 0, canvas.width, canvas.height );

    worldViewProjectionLocation = gl.getUniformLocation(program, "u_worldViewProj");
    world_inverseT = gl.getUniformLocation(program, "u_worldInverseTrans");
    colorLocation = gl.getUniformLocation(program, "u_color");
    lightWorldPositionLocation = gl.getUniformLocation(program, "u_lightWorldPosition");
    u_matrix = gl.getUniformLocation(program, "u_matrix");
    // point light position

    positionAttributeLocation = gl.getAttribLocation(program, "a_position");
    normalAttributeLocation = gl.getAttribLocation(program, "a_normal");

    // buffer
    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData( gl.ARRAY_BUFFER, flatten(all_v), gl.STATIC_DRAW );
    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );
    // color
    var cBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(color), gl.STATIC_DRAW);
    var vColor = gl.getAttribLocation(program, "vColor");
    gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vColor);
    // normal
    // var normalBuffer = gl.createBuffer();
    // gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    // gl.bufferData(gl.ARRAY_BUFFER, bunny_normals, gl.STATIC_DRAW);
    // gl.vertexAttribPointer(normalAttributeLocation, 3, gl.FLOAT, false, 0, 0);
    // gl.enableVertexAttribArray(normalAttributeLocation);
    window.requestAnimationFrame(render);
}

function render()
{
    

    // matrix
    var projectionMat = make_perspectiveMatrix(degreesToRad(60), canvas.width/canvas.height,1,100);
    var cameraMatrix = make_tmatrix(0,0,10);
    var cameraPos = [cameraMatrix[12],cameraMatrix[13],cameraMatrix[14]];
    var up = [0,1,0];
    // make camera at 0,0,10 and look at bunny
    var cameraLook = lookAt(cameraPos,bunny_position,up);
    var viewMat = inverse(cameraLook);
    var viewProjectionMatrix = multiplyMat(projectionMat, viewMat);

    //
    var inver = inverse(viewProjectionMatrix);
    var inverT = transpose(inver);

    // set point light
    
    // rotate bunny
    var bunny_viewMatrix = multiplyMat(viewProjectionMatrix, make_tmatrix(tx,ty,tz));
    bunny_viewMatrix = multiplyMat(bunny_viewMatrix, make_rymatrix(ry));
    bunny_viewMatrix = multiplyMat(bunny_viewMatrix, make_rxmatrix(rx));
    
    // worldinverse
    gl.uniformMatrix4fv(worldViewProjectionLocation, false, bunny_viewMatrix);
    // gl.uniformMatrix4fv(worldViewProjectionLocation, false, viewProjectionMatrix);
    // gl.uniformMatrix4fv(world_inverseT, false, inverT);

    // gl.uniform3fv(lightWorldPositionLocation, [5,5,0])


    
    gl.drawArrays( gl.TRIANGLES, 0, all_v.length );
    window.requestAnimationFrame(render);
}

