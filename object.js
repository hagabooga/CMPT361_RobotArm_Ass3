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
        // for (var i = 0; i < this.vertices.length; i+=3)
        // {
        //   for (var j = 0; j < 3; j++)
        //   {
        //       var normals = crossProd(
        //       subVect(this.vertices[i*j+1], this.vertices[i*j]),
        //       subVect(this.vertices[i*j+2], this.vertices[i*j]));
        //       this.normals.push(normals);
        //   }
        // }
        //console.log(this.vertices.length - this.normals.length);
        this.tmatrix = make_tmatrix(0,0,0);
        this.rmatrix = make_tmatrix(0,0,0);
        this.smatrix = make_tmatrix(0,0,0);
    }

    get_matrix(viewProjMatrix)
    {
        var matrix = multiplyMat(viewProjMatrix,this.tmatrix);
        matrix = multiplyMat(viewProjMatrix, this.rmatrix);
        matrix = multiplyMat(viewProjMatrix, this.smatrix);
        return matrix;
    }

    get color()
    {
        var lol = [];
        for (var i = 0; i < 36; i++)
        {
            lol.push([0.5,0.5,0.5,1]);
        }
        return lol
    }
}