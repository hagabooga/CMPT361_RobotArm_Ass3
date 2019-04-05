var dragging = false;
var old_x, old_y;
var dX = 0, dY = 0;
var dragging_key;
var tx,ty,tz,rx,ry,sx,sy,sz;
tx = 0;
ty= 0;
tz = 0;
rx = 0;
ry = 0;
sx = 1;
sy= 1;
sz = 1;
var show_pointlight = true;
show_spotlight = true;
var program;
function mouseDown(key)
{
    var mouse_button = key.button;
    if (mouse_button == 0)
    {
        dragging = true;
        dragging_key = 0;
        old_x = key.pageX, old_y = key.pageY;
        key.preventDefault();
        return false;
    }
    else if (mouse_button == 2)
    {
        dragging = true;
        dragging_key = 2;
        old_x = key.pageX, old_y = key.pageY;
        key.preventDefault();
        return false;
    }
}
function mouseUp(key)
{
    dragging = false;
}
function mouseMove(key)
{
    //console.log(tx);
    if (dragging)
    {
        if (dragging_key == 0)
        {
            //console.log(key.pageX);
            //console.log(key);
            dX = (key.pageX-old_x)/canvas.width/20;
            //console.log(dX);
            dY = (key.pageY-old_y)/canvas.height/20;
            // bunny_position[0] += -dX;
            // bunny_position[1] += dY;
            tx += dX;
            ty += -dY;
        }
        else if (dragging_key == 2)
        {
            //console.log(key);
            dX = (key.pageX-old_x)/canvas.width/25;
            //console.log(dX);
            dY = (key.pageY-old_y)/canvas.height/25;
            rx += dY;
            ry += dX;
        }
    }
}

window.addEventListener('wheel', function(e) 
{
    if (e.deltaY < 0) {
        tz += 0.4;
        // bunny_position[2] += 1;
    }
    if (e.deltaY > 0) {
        tz -= 0.4;
        // bunny_position[2] -= 1;
    }
});

window.addEventListener("keydown", function(e) {if([40].indexOf(e.keyCode) > -1) {e.preventDefault();}}, false);
window.addEventListener("keydown",function(e)
{
    if (e.key == "r")
    {
        tx = ty=tz = 0;
        rx = 0;
        ry = 0;
    }
    if (e.key == "p")
    {
        show_pointlight = !show_pointlight;
        //console.log(show_pointlight);
    }
    if (e.key == "s")
    {
        show_spotlight = !show_spotlight;
    }
});