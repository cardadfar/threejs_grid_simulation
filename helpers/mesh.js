class Mesh {

    constructor(scene, params, origin, color, peak) {
        /* origin - origin vector
         * points - reference to point cloud object
         * mesh - reference to triangle mesh object
         * helper - reference to vertex normals object
         */

        this.origin = origin
        this.peak = peak

        var geometry_points = new THREE.BufferGeometry();
        var positions_points = [];
        var old_positions = []
        var numX = params.numX;
        var numZ = params.numZ;
        
        for ( var i = 0; i <= numZ; i ++ ) {
            for ( var j = 0; j <= numX; j ++ ) {
                var x = j * params.scaleX - (numX/2 * params.scaleX) + origin.x;
                var y = origin.y;
                if( i == Math.floor(numZ/2) && j == Math.floor(numX/2)) { y = 100}
                var z = i * params.scaleZ - (numZ/2 * params.scaleZ) + origin.z;

                positions_points.push( x, y, z );
                old_positions.push(0,0,0);
            }
        }

        geometry_points.addAttribute( 'position', new THREE.Float32BufferAttribute( positions_points, 3 ) );
        var material = new THREE.PointsMaterial( { size: params.point_scale, color: 0xff0000, side: THREE.DoubleSide } );
        this.points = new THREE.Points( geometry_points, material );
        scene.add( this.points );

        this.old_positions = old_positions

        var geometry_trigs = new THREE.BufferGeometry();
        var positions_trig = [];
        for ( var i = 0; i < numZ; i ++ ) {
            for ( var j = 0; j < numX; j ++ ) {
                var sx = numX + 1
                var ax = positions_points[3*(i*sx + j)    ]
                var ay = positions_points[3*(i*sx + j) + 1]
                var az = positions_points[3*(i*sx + j) + 2]
                var bx = positions_points[3*(i*sx + j + 1)    ]
                var by = positions_points[3*(i*sx + j + 1) + 1]
                var bz = positions_points[3*(i*sx + j + 1) + 2]
                var cx = positions_points[3*((i+1)*sx + j)    ]
                var cy = positions_points[3*((i+1)*sx + j) + 1]
                var cz = positions_points[3*((i+1)*sx + j) + 2]
                positions_trig.push( ax, ay, az );
                positions_trig.push( bx, by, bz );
                positions_trig.push( cx, cy, cz );
                // push b and c again to save time
                var dx = positions_points[3*(i*sx + j + 1)    ]
                var dy = positions_points[3*(i*sx + j + 1) + 1]
                var dz = positions_points[3*(i*sx + j + 1) + 2]
                var ex = positions_points[3*((i+1)*sx + j)    ]
                var ey = positions_points[3*((i+1)*sx + j) + 1]
                var ez = positions_points[3*((i+1)*sx + j) + 2]
                var fx = positions_points[3*((i+1)*sx + j + 1)    ]
                var fy = positions_points[3*((i+1)*sx + j + 1) + 1]
                var fz = positions_points[3*((i+1)*sx + j + 1) + 2]
                positions_trig.push( dx, dy, dz );
                positions_trig.push( ex, ey, ez );
                positions_trig.push( fx, fy, fz );
            }
        }
        geometry_trigs.addAttribute( 'position', new THREE.Float32BufferAttribute( positions_trig, 3 ) );

        geometry_trigs.computeFaceNormals();
        geometry_trigs.computeVertexNormals();

        var material = new THREE.MeshLambertMaterial({ color: color, side: THREE.DoubleSide, flatShading: THREE.SmoothShading});
        this.mesh = new THREE.Mesh( geometry_trigs, material );
        this.helper = new THREE.VertexNormalsHelper( this.mesh, 5, 0xff0000, 100 );

        scene.add( this.mesh ); 
        scene.add( this.helper );
        this.helper.visible = params.normals;

    }

    updateMaterial(params) {
        this.mesh.material.wireframe = params.wireframe;
        this.helper.visible = params.normals;
    }

    updateMesh(time, params, burst) {
        var positions = this.points.geometry.attributes.position.array
        var new_positions = positions.slice();
        var numX = params.numX;
        var numZ = params.numZ;
    
        for(var i = 1; i < positions.length; i+=3) {
    
            var x = ((i - 1)/3) % (numX + 1)
            var z = (((i - 1)/3) - x) / (numX + 1)
            var y = this.laplacianHeight(x, z, positions, params)

            new_positions[i] = y * 0.99 + 0.01 * this.origin.y
            
        }

        for(var i = 0; i < burst.length; i++) {
            var mag = burst[i].mag;
            var loc = burst[i].loc;
            var x = Math.floor( (loc.x + params.numX * params.scaleX / 2) / params.scaleX)
            var z = Math.floor( (loc.z + params.numZ * params.scaleZ / 2) / params.scaleZ)
            var sx = params.numX + 1
            new_positions[3 * (z * sx + x) + 1] = this.peak * mag;
            
        }
    
        this.points.geometry.attributes.position.array = new_positions;
        this.points.geometry.attributes.position.needsUpdate = true;

        this.old_positions = positions
    
        
        var positions_trig = [];
        for ( var i = 0; i < numZ; i ++ ) {
            for ( var j = 0; j < numX; j ++ ) {
    
                var sx = numX + 1
                var ax = new_positions[3*(i*sx + j)    ]
                var ay = new_positions[3*(i*sx + j) + 1]
                var az = new_positions[3*(i*sx + j) + 2]
                var bx = new_positions[3*(i*sx + j + 1)]
                var by = new_positions[3*(i*sx + j + 1) + 1]
                var bz = new_positions[3*(i*sx + j + 1) + 2]
                var cx = new_positions[3*((i+1)*sx + j)    ]
                var cy = new_positions[3*((i+1)*sx + j) + 1]
                var cz = new_positions[3*((i+1)*sx + j) + 2]
                positions_trig.push( ax, ay, az );
                positions_trig.push( bx, by, bz );
                positions_trig.push( cx, cy, cz );
                var height = ay / params.scaleY;
    
                var dx = new_positions[3*(i*sx + j + 1)    ]
                var dy = new_positions[3*(i*sx + j + 1) + 1]
                var dz = new_positions[3*(i*sx + j + 1) + 2]
                var ex = new_positions[3*((i+1)*sx + j)    ]
                var ey = new_positions[3*((i+1)*sx + j) + 1]
                var ez = new_positions[3*((i+1)*sx + j) + 2]
                var fx = new_positions[3*((i+1)*sx + j + 1)    ]
                var fy = new_positions[3*((i+1)*sx + j + 1) + 1]
                var fz = new_positions[3*((i+1)*sx + j + 1) + 2]
                positions_trig.push( dx, dy, dz );
                positions_trig.push( ex, ey, ez );
                positions_trig.push( fx, fy, fz );
                var height = dy / params.scaleY;
            }
        }
    
    
        var positionAttribute = new THREE.Float32BufferAttribute( positions_trig, 3 );
        this.mesh.geometry.addAttribute( 'position', positionAttribute );
    
        this.mesh.geometry.computeFaceNormals();
        this.mesh.geometry.computeVertexNormals();
        this.helper.update();
    
        this.mesh.geometry.attributes.position.needsUpdate = true;
    }


    updateScale(params) {

        var positions_points = []
        var numX = params.numX
        var numZ = params.numZ
        var scaleX = params.scaleX
        var scaleZ = params.scaleZ
        
        for ( var i = 0; i <= numZ; i ++ ) {
            for ( var j = 0; j <= numX; j ++ ) {
                var x = j * scaleX - (numX/2 * scaleX) + this.origin.x;
                var y = this.origin.y;
                var z = i * scaleZ - (numZ/2 * scaleZ) + this.origin.z;
                positions_points.push( x, y, z );
            }
        }

        this.points.geometry.addAttribute( 'position', new THREE.Float32BufferAttribute( positions_points, 3 ) );
        this.points.geometry.attributes.position.needsUpdate = true;
    }


    updateSize(size) {
        this.points.material.size = size;
    }

    laplacianHeight(x, z, positions, params) {


        var sx = params.numX + 1
    
        var sum = 0;

        var left = 0
        var right = 0
        var top = 0
        var bottom = 0
        var prev = this.old_positions[3*(z*sx + x) + 1]
        var curr = positions[3*(z*sx + x) + 1]

        if(x > 0)        { left   = positions[3*(z*sx + (x-1)) + 1] }
        if(x < params.numX) { right  = positions[3*(z*sx + (x+1)) + 1] }
        if(z > 0)        { bottom = positions[3*((z-1)*sx + x) + 1] }
        if(z < params.numZ) { top    = positions[3*((z+1)*sx + x) + 1] }
        
        sum = 2 * curr - prev + 0.2*Math.trunc((left + right + top + bottom - 4 * curr) / 4)
        sum = 0.5 * sum + 0.5 * curr
        //sum = prev
        return sum / 1

        /*
        var scale = 1
        var mask = [[1, 1, 1, 1, 1],
                    [1, 1, 1, 1, 1],
                    [1, 1, 200, 1, 1],
                    [1, 1, 1, 1, 1],
                    [1, 1, 1, 1, 1]]
        var maskSum = 0;
        var scale = Math.floor(mask.length / 2)
        for(var b = 0; b < mask.length; b++) {
            for(var a = 0; a < mask[0].length; a++) {
                maskSum += mask[b][a]
            }
        }

        for(var dz = -scale; dz <= scale; dz++) {
            for(var dx = -scale; dx <= scale; dx++) {
                if ((z+dz < 0) || (z+dz > params.numZ) || (x+dx < 0) || (x+dx > params.numX))
                    sum += this.origin.y
                else
                    sum += positions[3*((z+dz)*sx + (x+dx)) + 1] * mask[dz+scale][dx+scale]
            }
        }
    
        return sum / (maskSum) */
    
    }
}





