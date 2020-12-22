window.onload = function () {
    let canvas = document.getElementById("angle");
    let ctx = canvas.getContext("2d");
    let drawIntervalID;

    // Comment this line to active logging again
    console.log = () => {};

    function draw() {
        // Initializing
        fixResize();
        let center = { x: Math.floor(canvas.width / 2), y: Math.floor(canvas.height / 2) };
        let side = 20;
        let dside = 10;
        let triangleHeight = Math.round(side * (Math.sqrt(3)/2));
        // console.log(`Canvas width: ${canvas.width} height: ${canvas.height}`);
        console.log(`Center x: ${center.x} y: ${center.y}`);

        let position = {
            x: center.x,
            y: center.y - triangleHeight,
            color: 0
        };
        let direction = 0;

        
        let drawnLines = 0;
        let linesToDraw = 100;
        let vertices = [];
        while (checkIfCanvasOutsideTriangle(vertices) && drawnLines < linesToDraw) {
            vertices.push(position);
            position = calcNextVertex(position, direction, side);
            direction = (direction + 1) % 3;
            side += dside;
        }

        console.log('Got out of the loop');
        console.log('Vertices', vertices);
        let points = getAllPoints(vertices);
        // console.log('points', points)
        drawSlow(points);
        // ctx.beginPath();
        // vertices.forEach(v => ctx.lineTo(v.x, v.y));
        // ctx.stroke();
    }

    function drawSlow(points) {
        let index = 0;
        let pointsPerIteration = 15;
        let initialPoint;
        drawIntervalID = setInterval(() => {
            if(index < points.length) {
                console.log('Index', index);
                if(index === 0) {
                    initialPoint = points[index];
                }
                let i;
                for (i = 0; i <= pointsPerIteration && index + i < points.length; i++) {
                    if(i === 0) {
                        ctx.beginPath();
                        console.log('Starting draw with initialPoint', initialPoint);
                        ctx.moveTo(initialPoint.x, initialPoint.y);
                        ctx.strokeStyle = `#${initialPoint.color.toString(16)}`;
                    } else {
                        console.log('i',i);
                        console.log('Drawing to ', points[index+i].x,points[index+i].y);
                        ctx.lineTo(points[index+i].x,points[index+i].y);
                        ctx.stroke();
                        ctx.beginPath();
                        ctx.moveTo(points[index+i].x,points[index+i].y)
                        ctx.strokeStyle = `#${points[index+i].color.toString(16)}`;
                    }
                }
                initialPoint = points[index+i-1];
                console.log('New initial point', initialPoint);
                index += pointsPerIteration;
            } else {
                console.log('Finished');
                clearInterval(drawIntervalID);
            }
        }, 1000/60);
    }

    function getAllPoints(vertices) {
        let points = [];
        for (let index = 1; index < vertices.length; index++) {
            const v1 = vertices[index-1];
            const v2 = vertices[index];
            let wayPoints = calcWayPoints(v1, v2);
            // console.log('got waypoints', wayPoints);
            points = points.concat(wayPoints);
        }

        return points;
    }


    function calcWayPoints(v1, v2, maxWaypoints = 30) {
        let wayPoints = [];
        let dx = v2.x - v1.x;
        let dy = v2.y - v1.y;
        let dcolor = v2.color - v1.color;
        for(let index = 0; index < maxWaypoints; index++) {
            // console.log('Calculing waypoints');
            wayPoints.push({
                x: v1.x + (dx*index/maxWaypoints),
                y: v1.y + (dy*index/maxWaypoints),
                color: v1.color + (dcolor*index/maxWaypoints)
            })
        }
        return wayPoints;
    }

    function degreesToRadians(degrees) {
        return (Math.PI / 180) * degrees
    }

    function checkIfCanvasOutsideTriangle(vertices) {
        let triangle = vertices.slice(-3);
        let result = false;
        if (triangle.length < 3) {
            result = true;
        } else {
            console.log('Verifying triangle', triangle);
            for (let index = 0; index < triangle.length && !result; index++) {
                let p1 = triangle[index];
                let p2 = triangle[(index + 1) % triangle.length];
                console.log('Verifying p1, p2', p1, p2);
                let insideCanvas = checkIfInsideCanvas(p1, p2);
                let intersectCanvas = checkIfIntersectCanvasRect(p1, p2)
                console.log(`Inside canvas: ${insideCanvas}, Intersect canvas: ${intersectCanvas}`);
                result = result ||( insideCanvas || intersectCanvas );
            }
        }
        
        console.log('Canvas outside triangle?', triangle, result);
        return result;
    }

    function checkIfLinesIntersect(p1, p2, p3, p4) {
        let x1 = p1.x, x2 = p2.x, x3 = p3.x, x4 = p4.x;
        let y1 = p1.y, y2 = p2.y, y3 = p3.y, y4 = p4.y;

        let uA = ((x4-x3)*(y1-y3) - (y4-y3)*(x1-x3)) / ((y4-y3)*(x2-x1) - (x4-x3)*(y2-y1));
        let uB = ((x2-x1)*(y1-y3) - (y2-y1)*(x1-x3)) / ((y4-y3)*(x2-x1) - (x4-x3)*(y2-y1));

        let result;
        if (uA >= 0 && uA <= 1 && uB >= 0 && uB <= 1) {
            result = true;
        } else {
            result = false;
        }

        console.log('Lines intersec?', p1, p2, p3, p4, result);
        return result;
    }

    function checkIfIntersectCanvasRect(p1, p2) {
        let sides = [
            [
                {x: 0, y: 0 },
                {x: 0, y: canvas.height}
            ],
            [
                {x: 0, y: canvas.height },
                {x: canvas.width, y: canvas.height}
            ],
            [
                {x: canvas.width, y: canvas.height },
                {x: canvas.width, y: 0}
            ],
            [
                {x: canvas.width, y: 0},
                {x: 0, y: 0}
            ]
        ];

        let intersects = false;
        for (let index = 0; index < sides.length && !intersects; index++) {
            const side = sides[index];
            intersects = intersects || checkIfLinesIntersect(p1, p2, side[0], side[1]);
        }
        return intersects;
    }

    function checkIfInsideCanvas(p1, p2) {
        return Math.min(p1.x, p2.x) >= 0 && Math.max(p1.x, p2.x) <= canvas.width && Math.min(p1.y, p2.y) >= 0 && Math.max(p1.y, p2.y) <= canvas.height;
    }

    function calcNextVertex(position, direction, side) {
        let dcolor = 60;
        let change = [
            { dx: -Math.cos(degreesToRadians(60)), dy: Math.sin(degreesToRadians(60)), dcolor },
            { dx: 1, dy: 0, dcolor },
            { dx: -Math.cos(degreesToRadians(60)), dy: -Math.sin(degreesToRadians(60)), dcolor }
        ];

        let newPosition = {
            x: Math.round(position.x + (change[direction].dx * side)),
            y: Math.round(position.y + (change[direction].dy * side)),
            color: position.color + change[direction].dcolor
        };

        return newPosition;
    }

    function fixResize() {
        const width = canvas.width = window.innerWidth;
        const height = canvas.height = window.innerHeight;
    }

    draw();

    window.onresize = function() {
        clearInterval(drawIntervalID);
        draw();
    }

}