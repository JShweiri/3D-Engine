let gameCanvas = document.getElementById("gc");
let ctx = gameCanvas.getContext("2d")

gameCanvas.width = window.innerWidth;
gameCanvas.height = window.innerHeight;

//////////////////////////////////////
            //OBJECTS
//////////////////////////////////////

function vec3d(x,y,z,w = 1){
    return{
    x: x,
    y: y,
    z: z,
    w: w,

    cross: function(vec){
        return vec3d(this.y * vec.z - this.z * vec.y, this.z * vec.x - this.x * vec.z, this.x * vec.y - this.y * vec.x);
    },
    
    dot: function (vec){
        return this.x*vec.x + this.y*vec.y + this.z*vec.z; 
    },
    
    subtract:function (vec){
        return vec3d(this.x-vec.x, this.y-vec.y, this.z-vec.z);
    },
    
    add: function (vec){
        return vec3d(this.x+vec.x, this.y+vec.y, this.z+vec.z);
    },
    
    divide: function (vec){
        let tempX = this.x, tempY = this.y, tempZ = this.z;
        if(vec.x != 0){
            tempX /= vec.x;
        }
        if(vec.y != 0){
            tempY /= vec.y;
        }
        if(vec.z != 0){
            tempZ /= vec.z
        }

        return vec3d(this.x/vec.x, this.y/vec.y, this.z/vec.z);
    },

    multiply: function (vec){
        return vec3d(this.x*vec.x, this.y*vec.y, this.z*vec.z);
    },
    
    normalize: function (){
        let l = Math.sqrt(this.x*this.x + this.y*this.y + this.z*this.z);
        return vec3d(this.x /= l, this.y /= l, this.z /= l)
        }
    };
}

function triangle (p1, p2, p3, b=1){
    return {
        p1 : p1,
        p2 : p2,
        p3 : p3,

        brightness: b,

        avgDepth: function(){
            return (this.p1.z +this.p2.z + this.p3.z)/3;
        },

        translate: function(x,y,z){
            let temp = vec3d(x,y,z);
            return triangle(this.p1.add(temp), this.p2.add(temp), this.p3.add(temp), this.brightness);
        },

        scale: function(x,y,z){
            let temp = vec3d(x,y,z);
            return triangle(this.p1.multiply(temp), this.p2.multiply(temp), this.p3.multiply(temp), this.brightness);

        },

        getNormal: function(){
        let line1 = this.p3.subtract(p1);
        let line2 = this.p2.subtract(p1);
        return line2.cross(line1).normalize();
        },

        fill: function (r, g, b){
            ctx.fillStyle = 'rgb(' + r*this.brightness +', ' +g*this.brightness +', ' + b*this.brightness +')';
            //console.log('rgb(' + r*this.brightness +', ' +g*this.brightness +', ' + b*this.brightness +')');
            //Draw Wireframe
            ctx.strokeStyle= 'rgb(' + r*this.brightness +', ' +g*this.brightness +', ' + b*this.brightness +')';// WireFrame: "black";
            ctx.lineWidth=1;
            ctx.beginPath();
            ctx.moveTo(this.p1.x, this.p1.y);
            ctx.lineTo(this.p2.x, this.p2.y);
            ctx.lineTo(this.p3.x, this.p3.y);
            ctx.closePath();
            ctx.stroke();
            ctx.fill();
        },

        transform: function(matrix){
            return triangle(vecMatrixMultiply(this.p1, matrix), vecMatrixMultiply(this.p2, matrix), vecMatrixMultiply(this.p3, matrix), this.brightness);
        }
    };
}



//////////////////////////////////////
            //MATRICES
//////////////////////////////////////

function matrixTranslation(x, y, z)
{
    temp = empty4x4();
    temp[0][0] = 1;
    temp[1][1] = 1;
    temp[2][2] = 1;
    temp[3][3] = 1;
    temp[3][0] = x;
    temp[3][1] = y;
    temp[3][2] = z;
    return temp;
}

function matrixRotateX(theta){
    temp = empty4x4();
    temp[0][0] = 1;
    temp[1][1] = Math.cos(theta);
    temp[1][2] = Math.sin(theta);
    temp[2][1] = -Math.sin(theta);
    temp[2][2] = Math.cos(theta);;
    temp[3][3] = 1;
    return temp;
}

function matrixRotateY(theta){
    temp = empty4x4();
    temp[0][0] = Math.cos(theta);
    temp[1][1] = Math.sin(theta);
    temp[1][2] = -Math.sin(theta);
    temp[2][1] = 1
    temp[2][2] = Math.cos(theta);;
    temp[3][3] = 1;
    return temp;
}

function matrixRotateZ(theta){
    temp = empty4x4();
    temp[0][0] = Math.cos(theta);
    temp[0][1] = Math.sin(theta);
    temp[1][0] = -Math.sin(theta);
    temp[1][1] = Math.cos(theta);
    temp[2][2] = 1;
    temp[3][3] = 1;
    return temp;
}

projectionMatrix = function(fov, aspectRatio, nearPoint, farPoint){
    let fovRad = 1 / Math.tan( fov * 0.5 / 180 * Math.PI);
    
    return [    [aspectRatio*fovRad   ,0      ,0                          ,0],
                                    [0                      ,fovRad,0                          ,0],
                                    [0                      ,0      ,farPoint/(farPoint-nearPoint)          ,1],
                                    [0                      ,0      ,-farPoint*nearPoint/(farPoint-nearPoint)   ,0]];
    
    }

function empty4x4(){
    return [[0,0,0,0],
    [0 ,0,0,0],
    [0,0,0 ,0],
    [0,0,0,0]];
}

function identityMatrix(){
    return [[1,0,0,0],
    [0 ,1,0,0],
    [0,0,1 ,0],
    [0,0,0,1]];
}

//CUBE
let meshTris = [triangle(vec3d(0,0,0),vec3d(0,1,0),vec3d(1,1,0)),
    triangle(vec3d(0,0,0),vec3d(1,1,0),vec3d(1,0,0)),

    triangle(vec3d(1,0,0),vec3d(1,1,0),vec3d(1,1,1)),
    triangle(vec3d(1,0,0),vec3d(1,1,1),vec3d(1,0,1)),

    triangle(vec3d(1,0,1),vec3d(1,1,1),vec3d(0,1,1)),
    triangle(vec3d(1,0,1),vec3d(0,1,1),vec3d(0,0,1)),

    triangle(vec3d(0,0,1),vec3d(0,1,1),vec3d(0,1,0)),
    triangle(vec3d(0,0,1),vec3d(0,1,0),vec3d(0,0,0)),

    triangle(vec3d(0,1,0),vec3d(0,1,1),vec3d(1,1,1)),
    triangle(vec3d(0,1,0),vec3d(1,1,1),vec3d(1,1,0)),

    triangle(vec3d(1,0,1),vec3d(0,0,1),vec3d(0,0,0)),
    triangle(vec3d(1,0,1),vec3d(0,0,0),vec3d(1,0,0))];




//////////////////////////////////////
            //FUNCTIONS
//////////////////////////////////////

function vecMatrixMultiply(inputVec, Matrix){

    let temp = vec3d(inputVec.x * Matrix[0][0] + inputVec.y * Matrix[1][0] + inputVec.z * Matrix[2][0] + inputVec.w * Matrix[3][0],
                     inputVec.x * Matrix[0][1] + inputVec.y * Matrix[1][1] + inputVec.z * Matrix[2][1] + inputVec.w * Matrix[3][1],
                     inputVec.x * Matrix[0][2] + inputVec.y * Matrix[1][2] + inputVec.z * Matrix[2][2] + inputVec.w * Matrix[3][2],
                     inputVec.x * Matrix[0][3] + inputVec.y * Matrix[1][3] + inputVec.z * Matrix[2][3] + inputVec.w * Matrix[3][3]);

                return temp;
}

function matrixMatrixMultiply(m1, m2){
    temp = empty4x4();
		for (let c = 0; c < 4; c++)
			for (let r = 0; r < 4; r++)
				temp[r][c] = m1[r][0] * m2[0][c] + m1[r][1] * m2[1][c] + m1[r][2] * m2[2][c] + m1[r][3] * m2[3][c];
		return temp;
}

function matrixPointAt(pos, target, up){
    let newForward = target.subtract(pos);
    newForward = newForward.normalize();

    let a = newForward.multiply(vec3d(up.dot(newForward), up.dot(newForward), up.dot(newForward)));
    let newUp = up.subtract(a);
    newUp = newUp.normalize();

    let newRight = newUp.cross(newForward);

    let pointAtMatrix = empty4x4();		
    pointAtMatrix[0][0] = newRight.x;	pointAtMatrix[0][1] = newRight.y;	pointAtMatrix[0][2] = newRight.z;	pointAtMatrix[0][3] = 0.0;
    pointAtMatrix[1][0] = newUp.x;		pointAtMatrix[1][1] = newUp.y;		pointAtMatrix[1][2] = newUp.z;		pointAtMatrix[1][3] = 0.0;
    pointAtMatrix[2][0] = newForward.x;	pointAtMatrix[2][1] = newForward.y;	pointAtMatrix[2][2] = newForward.z;	pointAtMatrix[2][3] = 0.0;
    pointAtMatrix[3][0] = pos.x;			pointAtMatrix[3][1] = pos.y;			pointAtMatrix[3][2] = pos.z;			pointAtMatrix[3][3] = 1.0;
    return pointAtMatrix;
}

function Matrix_QuickInverse(m) // Only for Rotation/Translation Matrices
{
    let matrix = empty4x4();
    matrix[0][0] = m[0][0]; matrix[0][1] = m[1][0]; matrix[0][2] = m[2][0]; matrix[0][3] = 0;
    matrix[1][0] = m[0][1]; matrix[1][1] = m[1][1]; matrix[1][2] = m[2][1]; matrix[1][3] = 0;
    matrix[2][0] = m[0][2]; matrix[2][1] = m[1][2]; matrix[2][2] = m[2][2]; matrix[2][3] = 0;
    matrix[3][0] = -(m[3][0] * matrix[0][0] + m[3][1] * matrix[1][0] + m[3][2] * matrix[2][0]);
    matrix[3][1] = -(m[3][0] * matrix[0][1] + m[3][1] * matrix[1][1] + m[3][2] * matrix[2][1]);
    matrix[3][2] = -(m[3][0] * matrix[0][2] + m[3][1] * matrix[1][2] + m[3][2] * matrix[2][2]);
    matrix[3][3] = 1;
    return matrix;
}


let vcamera = vec3d(0,0,0);
let vLookDir = vec3d(0,0,1);

let vUp = vec3d(0,1,0);
let vtarget = vcamera.add(vLookDir);
let yaw = 0;

let cameraRotateMatrix = matrixRotateY(yaw);

let cameraMatrix = matrixPointAt(vcamera, vtarget, vUp);
let viewMatrix = Matrix_QuickInverse(cameraMatrix);

theta = 0.1;
let translationMatrix, worldMatrix;
let transformationMatrix = projectionMatrix(90, gameCanvas.height / gameCanvas.width, 0.1, 1000);


setInterval(function(){  
    ctx.clearRect(0, 0, gameCanvas.width, gameCanvas.height); 
    theta += .01;


    let rotateXMatrix = matrixRotateX(theta);
    let rotateZMatrix = matrixRotateZ(theta/2);
    translationMatrix = matrixTranslation(0,0,3);
    
    worldMatrix = identityMatrix();
    worldMatrix = matrixMatrixMultiply(rotateZMatrix, rotateXMatrix);
    worldMatrix = matrixMatrixMultiply(worldMatrix, translationMatrix);


    let trisToDraw =[];

    for (let i = 0; i < meshTris.length; i++){

        let triProjected, triTransformed, triViewed;

        triTransformed = meshTris[i].transform(worldMatrix);
 

        let normal = triTransformed.getNormal();
        let transMinusCam = triTransformed.p1.subtract(vcamera);

        if(normal.dot(transMinusCam) < 0 ){

        let lightDirection = vec3d(0,0, -1);
        //normalize(lightDirection);

        triViewed = triTransformed;
        triViewed.transform(viewMatrix);

        triProjected = triViewed.transform(transformationMatrix);
        //triProjected = triTransformed.transform(transformationMatrix);
        triProjected.p1 = triProjected.p1.divide(vec3d(triProjected.p1.w, triProjected.p1.w, triProjected.p1.w));
        triProjected.p2 = triProjected.p2.divide(vec3d(triProjected.p2.w, triProjected.p2.w, triProjected.p2.w));
        triProjected.p3 = triProjected.p3.divide(vec3d(triProjected.p3.w, triProjected.p3.w, triProjected.p3.w));

        triProjected.brightness = normal.dot(lightDirection);




        //Scale
        triProjected = triProjected.translate(1,1,0);
        triProjected = triProjected.scale(0.5 * gameCanvas.width, 0.5 * gameCanvas.height, 0);
        
        trisToDraw.push(triProjected);

        } 
     }

    trisToDraw.sort(function(a, b){ 
        if( a.avgDepth() < b.avgDepth()){
            return 1;
        } else {
            return -1;
        }
});

        for(let i =0; i < trisToDraw.length; i++){
            trisToDraw[i].fill(0, 5, 255);
        }

}, 10);

let text;
let lines;
let points = [];

let fileInput = document.getElementById('fileInput');

fileInput.addEventListener('change', function(e) {
let reader = new FileReader();
let file = fileInput.files[0];
let textType = /text.*/;
  
    reader.readAsText(file);  

    reader.onload = function(e) {
        text = reader.result;
        console.log(text);
        lines = text.split("\n");
        console.log(lines[0]);
        let tempPoints, tempTris;
        meshTris = [];

        for(let i = 0; i < lines.length; i++){
            if(lines[i].charAt(0) == 'v'){
                tempPoints = lines[i].split(" ");
                points[points.length] = vec3d(tempPoints[2], tempPoints[3], tempPoints[4]);
            }
            if(lines[i].charAt(0) == 'f'){
                tempTris = lines[i].split(" ");
                meshTris[meshTris.length] = triangle(points[tempTris[2]-1], points[tempTris[3]-1], points[tempTris[4]-1]);
            }
        }

      }
});
