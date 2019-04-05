var canvas;
var gl;
var program;

//var bunny_position = [0,0,0];
var bunny_vertices = get_vertices();
var bunny_faces = get_faces();
var i = 0;
var colors = []; 
var all_v = [];
var bunny_normals = [];
// Get bunny stuff
for (i = 0; i < bunny_faces.length; i++)
{
    var j = 0;
    for (j = 0; j < 3; j++)
    {
        all_v.push(bunny_vertices[bunny_faces[i][j] - 1]);
        colors.push([1,0,0,1]);
        var normals = crossProd(
            subVect(bunny_vertices[bunny_faces[i][1] - 1], bunny_vertices[bunny_faces[i][0] - 1]),
            subVect(bunny_vertices[bunny_faces[i][2] - 1], bunny_vertices[bunny_faces[i][0] - 1]));
        bunny_normals.push(normals);
    }
}
// console.log(bunny_normals.length);
// console.log(all_v);
// console.log(all_v.length);
// ATTRIBUTES
var positionLocation;
var normalLocation;
var worldViewProjectionLocation;
var worldInverseTransposeLocation;
var colorLocation;
var lightWorldPositionLocation;
var u_world;
var normBuffer;
var posBuffer;
window.onload = function init()
{
    // SETUP
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

    gl.clearColor(0, 0, 0, 1);


    // GET ATTRIBUTES AND UNIFORMS
    positionLocation = gl.getAttribLocation(program, "a_position");
    normalLocation = gl.getAttribLocation(program, "a_normal");
    worldViewProjectionLocation = gl.getUniformLocation(program, "u_worldViewProjection");
    worldInverseTransposeLocation = gl.getUniformLocation(program, "u_worldInverseTranspose");
    colorLocation = gl.getUniformLocation(program, "u_color");
    lightWorldPositionLocation = gl.getUniformLocation(program, "u_lightWorldPosition");
    u_world = gl.getUniformLocation(program, "u_world");

    //// BIND BUFFERS
    posBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
    gl.bufferData( gl.ARRAY_BUFFER, flatten(all_v), gl.STATIC_DRAW );


    // var cBuffer = gl.createBuffer();
    // gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    // gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);
    // var vColor = gl.getAttribLocation(program, "vColor");
    // gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
    // gl.enableVertexAttribArray(vColor);

    normBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, normBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(bunny_normals), gl.STATIC_DRAW);
    

    // render
    window.requestAnimationFrame(render);
}

function render()
{

    // Clear
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
    gl.enableVertexAttribArray(positionLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
    gl.vertexAttribPointer(positionLocation,3,gl.FLOAT,false,0,0);
    //console.log(bunny_position);
    gl.enableVertexAttribArray( normalLocation );
    gl.bindBuffer(gl.ARRAY_BUFFER, normBuffer);
    gl.vertexAttribPointer(normalLocation,3,gl.FLOAT,false,0,0);
    // Perspective camera at 0,0,10 looks at 0,0,0
    var projectionMat = make_perspectiveMatrix(degreesToRad(60), canvas.width/canvas.height,1,2000);
    //var cameraMatrix = make_tmatrix(0,0,10);
    //var cameraPos = [cameraMatrix[12],cameraMatrix[13],cameraMatrix[14]];
    var up = [0,1,0];
    var cameraLook = lookAt([0,0,10],[0,0,0],up);
    var viewMat = inverse(cameraLook);
    var viewProjectionMatrix = multiplyMat(projectionMat, viewMat);
    
    // Draw bunny
    tx += 5;
    var worldMatrix = make_tmatrix(tx,ty,tz);
    worldMatrix = multiplyMat(worldMatrix, make_rxmatrix(rx));
    worldMatrix = multiplyMat(worldMatrix, make_rymatrix(ry));
    console.log(worldMatrix);

    // Create final matrices
    var worldViewProjectionMatrix = multiplyMat(viewProjectionMatrix, worldMatrix);
    var worldInverseMatrix = inverse(worldMatrix);
    console.log(worldInverseMatrix);
    var worldInverseTransposeMatrix = transpose(worldInverseMatrix);
    console.log(worldInverseTransposeMatrix);

    // Set Matrices
    gl.uniformMatrix4fv(worldViewProjectionLocation, false, worldViewProjectionMatrix);
    gl.uniformMatrix4fv(worldInverseTransposeLocation, false, worldInverseTransposeMatrix);
    gl.uniformMatrix4fv(u_world, false, worldMatrix);

    // Color of bunny
    gl.uniform4fv(colorLocation, [0.2, 0.2, 0.2, 1]);

    // Point Light position
    gl.uniform3fv(lightWorldPositionLocation, [5, 5, 0]);

    // render
    gl.drawArrays(gl.TRIANGLE, 0, all_v.length);
    //window.requestAnimationFrame(render);
}