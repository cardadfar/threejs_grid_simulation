class Stream {

    constructor(scene, params, lifetime, starttime, x, peak) {
        /* curve - reference to curve
         * stream - reference to line
         * point - reference to point
         * lifetime = (sec) how long the stream lasts for
         * starttime = (sec) when in system time the stream was created
         * peak - the height displacement caused by the stream
         */

        this.lifetime = lifetime;
        this.starttime = -starttime
        this.peak = peak

        this.x = x
        
        var boundaryX = params.scaleX * params.numX;
        var boundaryZ = params.scaleY * params.numY;

        this.curve = new THREE.CubicBezierCurve3(
            new THREE.Vector3( x, 0, -boundaryZ/2 ),
            new THREE.Vector3( x, 0, -boundaryZ/4 ),
            new THREE.Vector3( x, 0, boundaryZ/4 ),
            new THREE.Vector3( x, 0, boundaryZ/2 )
        );
        
        var points = this.curve.getPoints( 50 );
        var geometry = new THREE.BufferGeometry().setFromPoints( points );
        var material = new THREE.LineBasicMaterial( { color : 0xffffff } );
        this.stream = new THREE.Line( geometry, material );
        scene.add( this.stream )

        var dotGeometry = new THREE.Geometry();
        dotGeometry.vertices.push( this.curve.getPoint(0) );
        var dotMaterial = new THREE.PointsMaterial( { size: 2 } );
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

        return new Burst(loc, 1 * this.peak);

    }

    change(params) {

        this.starttime = -999

        var boundaryX = params.scaleX * params.numX;
        var boundaryZ = params.scaleY * params.numY;

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





