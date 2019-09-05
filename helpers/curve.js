class Stream {

    constructor(scene, params, starttime, x) {
        /* curve - reference to curve
         * stream - reference to line
         * point - reference to point
         * lifetime = (sec) how long the stream lasts for
         * starttime = (sec) when in system time the stream was created
         */

        this.lifetime = 2;
        this.starttime = -starttime

        this.x = x
        
        var boundaryX = params.scaleX * params.numX;
        var boundaryZ = params.scaleZ * params.numZ;
        var startX = boundaryX * (Math.random() - 0.5);
        var startZ = boundaryZ * (Math.random() - 0.5);
        var endX = boundaryX * (Math.random() - 0.5);
        var endZ = boundaryZ * (Math.random() - 0.5);

        this.curve = new THREE.CubicBezierCurve3(
            new THREE.Vector3( x, 0, -boundaryZ/2 ),
            new THREE.Vector3( x, 0, 0 ),
            new THREE.Vector3( x, 0, 0 ),
            new THREE.Vector3( x, 0, boundaryZ/2 )
        );
        
        var points = this.curve.getPoints( 50 );
        var geometry = new THREE.BufferGeometry().setFromPoints( points );
        var material = new THREE.LineBasicMaterial( { color : 0xffffff } );
        this.stream = new THREE.Line( geometry, material );
        scene.add( this.stream )

        var dotGeometry = new THREE.Geometry();
        dotGeometry.vertices.push( this.curve.getPoint(0) );
        var dotMaterial = new THREE.PointsMaterial( { size: 20 } );
        this.point = new THREE.Points( dotGeometry, dotMaterial );
        scene.add( this.point );


    }

    update(time, params) {

        if( this.starttime == -999 ) { this.starttime = time }

        var t = (time - this.starttime) / this.lifetime;
        var loc = this.curve.getPoint(t)
        this.point.geometry.vertices[0] = loc
        this.point.geometry.verticesNeedUpdate = true;

        if( time - this.starttime >= this.lifetime ) { this.change(params) } 

        return new Burst(loc, 1 - 2 * Math.abs(0.5 - t));

    }

    change(params) {

        this.lifetime = 2;
        this.starttime = -999

        var boundaryX = params.scaleX * params.numX;
        var boundaryZ = params.scaleZ * params.numZ;
        var startX = boundaryX * (Math.random() - 0.5);
        var startZ = boundaryZ * (Math.random() - 0.5);
        var endX = boundaryX * (Math.random() - 0.5);
        var endZ = boundaryZ * (Math.random() - 0.5);

        this.curve.v0 = new THREE.Vector3( this.x, 0, -boundaryZ/2);
        this.curve.v3 = new THREE.Vector3( this.x, 0, boundaryZ/2);

        var points = this.curve.getPoints( 50 );
        var geometry = new THREE.BufferGeometry().setFromPoints( points );
        this.stream.geometry = geometry;
        this.stream.geometry.needsUpdate = true;
    }

    remove(scene) {
        scene.remove( this.stream );
    }


}





