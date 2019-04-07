class Cube
{
    constructor(w,h,l)
    {
      this.w = w;
      this.h = h;
      this.l = l;
        this.vertices = make_cube(w,h,l);
        this.normals = [

          // left column back
          0, 0, -1,
          0, 0, -1,
          0, 0, -1,
          0, 0, -1,
          0, 0, -1,
          0, 0, -1,
            // right
            0, 0, 1,
            0, 0, 1,
            0, 0, 1,
            0, 0, 1,
            0, 0, 1,
            0, 0, 1,
          // top
          0, 1, 0,
          0, 1, 0,
          0, 1, 0,
          0, 1, 0,
          0, 1, 0,
          0, 1, 0,

            // bottom
            0, -1, 0,
            0, -1, 0,
            0, -1, 0,
            0, -1, 0,
            0, -1, 0,
            0, -1, 0,


          // left
          -1, 0, 0,
          -1, 0, 0,
          -1, 0, 0,
          -1, 0, 0,
          -1, 0, 0,
          -1, 0, 0,
            // right
          1, 0, 0,
          1, 0, 0,
          1, 0, 0,
          1, 0, 0,
          1, 0, 0,
          1, 0, 0,

        ];
        this.tmatrix = make_tmatrix(0,0,0);
        this.rmatrix = make_tmatrix(0,0,0);
        this.smatrix = make_tmatrix(0,0,0);
    }
}

class Square
{
  constructor()
  {
    this.vertices = 
    [
        1,1,0,
        -1,1,0,
        -1,-1,0,
        1,1,0,
        -1,-1,0,
        1,-1,0
    ];
    this.normals =
    [
      1,1,1,
      1,1,1,
      1,1,1,
      1,1,1,
      1,1,1,
      1,1,1,
    ];
  }
}

var base = new Cube(1,0.15,1);
var lower_arm = new Cube(0.2,1,0.2);
var upper_arm = new Cube(0.12,0.7,0.12);
var ball = new Square();
var background = new Cube(50,50,1);
var table = new Cube(20,3,15);
var rock = new Cube(0.175,0.175,0.175);


var camx = 0;
var camy = 4;
var camz = 6;
var camlx = 0;
var camly = 1.5;
var camlz = 0;
var lowr = 0;
var interval = 30;
var upr = 0;
var rockx,rocky,rockz = 0;
var rockrx,rockry,rockrz;
var key_frame = 0;
var rock_hold = false;
var rock_mat;
var rock_fall;
function next_key(inter)
{
  interval = inter;
  key_frame += 1;
  time = 0;
}