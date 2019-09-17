import Stats from './modules/stats.module.js';
import { OrbitControls } from './modules/OrbitControls.js';
import { GUI } from './modules/gui.js';
import { Curve } from './modules/three.module.js';


var container, stats;
var camera, controls, scene, renderer;
var mouse = new THREE.Vector2();
var time = 0.0;
var mesh = [];
var stream = [];
var params = {
                scaleX: 5,
                scaleY: 5,
                scaleZ: 0.5,
                numX: 100,
                numY: 100,
                timestep: 0.015,
                wireframe: false,
                normals: false,
                pause: false,
                laplacian: false
            };



init();
animate();

function init() {


    container = document.getElementById( "my_canvas" );

    camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 10000 );
    camera.position.z = 325;
    camera.position.y = 75;
    camera.position.x = 325;
    scene = new THREE.Scene();
    scene.background = new THREE.Color( 0x000000 );
    scene.add( new THREE.AmbientLight( 0x555555 ) );


    var light = new THREE.PointLight( 0xffffff, 5, 1000 );
    light.position.set( 0, 200, 0 );
    scene.add( light );



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
    console.log ( camera.rotation )
}

function render() {
    controls.update();
    renderer.setRenderTarget( null );
    if(!params.pause) {
        time += params.timestep;
        var burst = []
        for(var i = 0; i < stream.length; i++) {
            burst.push( stream[i].update(time, params) );
        }
        for(var i = 0; i < mesh.length; i++) {
            mesh[i].updateMesh(time, params, burst);
        }
    }
    renderer.render( scene, camera );
}


function draw() {

    mesh.push( new Mesh(scene, params, new Vector3(0,0,0), 0x1c1f54) );
    
    // (scene, params, lifetime, offset, x-pos, height)
    for(var i = -225; i < 225; i += 3) {
        var lifetime = 4*(Math.random() + 0.25)
        stream.push( new Stream(scene, params, lifetime, lifetime*Math.random(), i, 100*(Math.random()) ) );
    }




    var gui = new GUI();
    gui.add( params, 'timestep', 0, 0.3 );
    gui.add( params, 'scaleX', 1, 100 ).onChange( function () { updateScale() } );
    gui.add( params, 'scaleZ', 0, 1 )
    gui.add( params, 'scaleY', 1, 100 ).onChange( function () { updateScale() } );
    gui.add( params, 'wireframe').onChange( function () { updateMaterial() } );
    gui.add( params, 'normals').onChange( function () { updateMaterial() } );
    gui.add( params, 'pause');
    gui.add( params, 'laplacian');
    gui.open();


    $( ".close-button" ).click(function() {
        if(gui.closed)
            $( ".gui-space" ).css('margin-top', '40px')
        else
            $( ".gui-space" ).css('margin-top', '260px')
    });

    
}

function updateScale() {
    for(var i = 0; i < mesh.length; i++) {
        mesh[i].updateScale(params)
    }
}

function updateMaterial() {
    for(var i = 0; i < mesh.length; i++) {
        mesh[i].updateMaterial(params);
    }
}


