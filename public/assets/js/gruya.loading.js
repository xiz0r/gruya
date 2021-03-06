/**
 * User: jgcolo
 * Date: 2/26/13
 * Time: 3:56 AM
 */

var s = new Sonic({
    width:100,
    height:100,
    stepsPerFrame:4,
    trailLength:1,
    pointDistance:.01,
    fps:25,
    fillColor:'#FF7B2F',

    setup:function () {
        this._.lineWidth = 10;
    },

    step:function (point, i, f) {
        var progress = point.progress,
            degAngle = 360 * progress,
            angle = Math.PI / 180 * degAngle,
            angleB = Math.PI / 180 * (degAngle - 180),
            size = i * 3;
        this._.fillRect(
            Math.cos(angle) * 25 + (50 - size / 2),
            Math.sin(angle) * 15 + (50 - size / 2),
            size,
            size
        );
        this._.fillStyle = '#63D3F1F';
        this._.fillRect(
            Math.cos(angleB) * 15 + (50 - size / 2),
            Math.sin(angleB) * 25 + (50 - size / 2),
            size,
            size
        );

        if (point.progress == 1) {
            this._.globalAlpha = f < .5 ? 1 - f : f;
            this._.fillStyle = '#EEE';
            this._.beginPath();
            //this._.arc(50, 50, 5, 0, 360, 0);
            this._.closePath();
            this._.fill();
        }
    },
    path:[
        ['line', 40, 10, 60, 90]
    ]
});
