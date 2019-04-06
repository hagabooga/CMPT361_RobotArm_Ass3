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
  }
}