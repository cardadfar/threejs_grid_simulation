import Stats from './modules/stats.module.js';
import { BufferGeometryUtils } from './modules/BufferGeometryUtils.js';
import { OrbitControls } from './modules/OrbitControls.js';
import { TriangleFanDrawMode } from './modules/three.module.js';
import { GUI } from './modules/gui.js';


var container, stats;
var camera, controls, scene, renderer;
var mouse = new THREE.Vector2();
var time = 0.0;
var cubic, curveObject;
var points, mesh;
var params = {
                color: '#03fccf',
                scaleX: 50,
                scaleY: 50,
                scaleZ: 50,
                numX: 101,
                numZ: 100,
                timestep: 0.01,
                point_scale: 5
            };




init();
animate();

function init() {

    container = document.getElementById( "my_canvas" );

    camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 10000 );
    camera.position.z = 700;
    camera.position.y = 100;
    scene = new THREE.Scene();
    scene.background = new THREE.Color( 0xa1a1a1 );
    scene.add( new THREE.AmbientLight( 0x555555 ) );


    draw();

    
    renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    container.appendChild( renderer.domElement );

    controls = new OrbitControls( camera, renderer.domElement );
    controls.update();

    stats = new Stats();
    container.appendChild( stats.dom );
    renderer.domElement.addEventListener( 'mousemove', onMouseMove );
}

function onMouseMove( e ) {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
}

function animate() {
    requestAnimationFrame( animate );
    render();
    stats.update();
}

function render() {
    controls.update();
    renderer.setRenderTarget( null );
    time += params.timestep;
    updateGeometry(time)
    renderer.render( scene, camera );
}


function draw() {

    
    var geometry_points = new THREE.BufferGeometry();
    var positions_points = [];
    var colors = [];
    var numX = params.numX;
    var numZ = params.numZ;
    
    for ( var i = 0; i <= numZ; i ++ ) {
        for ( var j = 0; j <= numX; j ++ ) {
            var x = j * params.scaleX - (numX/2 * params.scaleX);
            var y = 0;

            //initial conditions
            if (i == Math.floor(numZ/2) && j == Math.floor(numX/2)) {
                y = 50000;
            }

            var z = i * params.scaleZ - (numZ/2 * params.scaleZ);
            positions_points.push( x, y, z );
            colors.push( 0, 0, 0 );
        }
    }

    geometry_points.addAttribute( 'position', new THREE.Float32BufferAttribute( positions_points, 3 ) );
    geometry_points.addAttribute( 'color', new THREE.Float32BufferAttribute( colors, 3 ) );
    var material = new THREE.PointsMaterial( { size: 8, vertexColors: THREE.VertexColors, side: THREE.DoubleSide } );
    points = new THREE.Points( geometry_points, material );
    scene.add( points );


    var geometry_trigs = new THREE.BufferGeometry();
    var positions_trig = [];
    var colors = [];
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
            colors.push( 0, 0, 0 );
            colors.push( 0, 0, 0 );
            colors.push( 0, 0, 0 );
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
            colors.push( 0, 0, 0 );
            colors.push( 0, 0, 0 );
            colors.push( 0, 0, 0 );
        }
    }
    geometry_trigs.addAttribute( 'position', new THREE.Float32BufferAttribute( positions_trig, 3 ) );
    geometry_trigs.addAttribute( 'color', new THREE.Float32BufferAttribute( colors, 3 ) );
    geometry_trigs.computeBoundingSphere();
    var material = new THREE.MeshBasicMaterial({ vertexColors: THREE.VertexColors, side: THREE.DoubleSide, opacity: 1.0, transparent: true, wireframe: true  });
    mesh = new THREE.Mesh( geometry_trigs, material );
    scene.add( mesh ); 

    /*

    cubic = new Cubic(new Vector3( -2000, 0, -2000 ),new Vector3( 2000, 500, -2000 ),new Vector3( 0, -1000, 5000 ),new Vector3( 0, 0, 5000 ));
    var linePoints = cubic.getPoints(50, 0, 1)
    var geometry = new THREE.BufferGeometry().setFromPoints( linePoints );
    var lineMaterial = new THREE.LineBasicMaterial( { color : 0xffffff } );
    curveObject = new THREE.Line( geometry, lineMaterial );
    scene.add(curveObject)

    */

    var gui = new GUI();
    gui.addColor( params, 'color' )
    gui.add( params, 'timestep', 0, 0.3 );
    gui.add( params, 'scaleX', 1, 100 ).onChange( function ( value ) { updateScale(value, params.scaleZ) } );
    gui.add( params, 'scaleY', 1, 200 )
    gui.add( params, 'scaleZ', 1, 100 ).onChange( function ( value ) { updateScale(params.scaleX, value) } );
    gui.add( params, 'point_scale', 1, 20 ).onChange( function ( value ) { updateSize(value) } ).name('point scale');
    //gui.add( material, 'wireframe').name( 'show wireframe' );
    gui.open();
    

}


function updateScale(scaleX, scaleZ) {

    var positions_points = []
    var numX = params.numX
    var numZ = params.numZ
    
    for ( var i = 0; i <= numZ; i ++ ) {
        for ( var j = 0; j <= numX; j ++ ) {
            var x = j * scaleX - (numX/2 * scaleX);
            var y = 0;
            var z = i * scaleZ - (numZ/2 * scaleZ);
            positions_points.push( x, y, z );
        }
    }

    points.geometry.addAttribute( 'position', new THREE.Float32BufferAttribute( positions_points, 3 ) );
    points.geometry.attributes.position.needsUpdate = true;
}


function updateSize(size) {
    points.material.size = size;
}


function laplacianHeight(x, z, positions) {

    var sx = params.numX + 1

    var sum = 0;
    var scale = 1
    for(var dz = -scale; dz <= scale; dz++) {
        for(var dx = -scale; dx <= scale; dx++) {
            if ((z+dz < 0) || (z+dz > params.numZ) || (x+dx < 0) || (x+dx > params.numX))
                sum += 0
            else
                sum += positions[3*((z+dz)*sx + (x+dx)) + 1]
        }
    }

    return sum / ((2*scale+1)*(2*scale+1))

}


function updateGeometry(time) {

    /*
    var linePoints = cubic.getPoints(50, time%1, 1)
    var geometry = new THREE.BufferGeometry().setFromPoints( linePoints );
    curveObject.geometry = geometry
    */

	var positions = points.geometry.attributes.position.array
    var new_positions = positions;
    var c = new THREE.Color(params.color)
    var colors = [];
    var numX = params.numX;
    var numZ = params.numZ;
    var t = time % 1

	for(var i = 0; i < positions.length; i++) {
    	if((i-1) % 3 == 0) {

            var x = ((i - 1)/3) % (numX + 1)
            var z = (((i - 1)/3) - x) / (numX + 1)

            var height = laplacianHeight(x, z, positions)
            if (x == Math.floor(numX / 2) && z == Math.floor(numZ / 2))
                height = 1000 * Math.sin(t * 2 * Math.PI)

            new_positions[i] = height

            colors.push( c.r*height, c.g*height, c.b*height );
    	}
    }

    points.geometry.attributes.position.array = new_positions;
    points.geometry.addAttribute( 'color', new THREE.Float32BufferAttribute( colors, 3 ) );
    points.geometry.attributes.position.needsUpdate = true;

    
    var positions_trig = [];
    var colors = [];
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
            colors.push( c.r*height, c.g*height, c.b*height );
            colors.push( c.r*height, c.g*height, c.b*height );
            colors.push( c.r*height, c.g*height, c.b*height );

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
            colors.push( c.r*height, c.g*height, c.b*height );
            colors.push( c.r*height, c.g*height, c.b*height );
            colors.push( c.r*height, c.g*height, c.b*height );
        }
    }


    var positionAttribute = new THREE.Float32BufferAttribute( positions_trig, 3 );
    mesh.geometry.addAttribute( 'color', new THREE.Float32BufferAttribute( colors, 3 ) );
    mesh.geometry.addAttribute( 'position', positionAttribute );
    mesh.geometry.attributes.position.needsUpdate = true;
    
    
}

