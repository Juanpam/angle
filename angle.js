window.onload = function () {
    let canvas = document.getElementById("angle");
    let ctx = canvas.getContext("2d");

    function draw() {
        // Initializing
        fixResize();
        let center = { x: Math.floor(canvas.width / 2), y: Math.floor(canvas.height / 2) };
        let side = 20;
        let dside = 10;
        let triangleHeight = Math.round(side * (Math.sqrt(3)/2));
        console.log(`Canvas width: ${canvas.width} height: ${canvas.height}`);
        console.log(`Center x: ${center.x} y: ${center.y}`);

        let position = {
            x: center.x,
            y: center.y - triangleHeight
        };
        let direction = 0;

        ctx.moveTo(position.x, position.y);
        let drawnLines = 0;
        let linesToDraw = 100;
        let vertices = [];
        while (checkIfCanvasOutsideTriangle(vertices) && drawnLines < linesToDraw) {
            // console.log('Drawing', position);
            // ctx.lineTo(position.x, position.y);
            vertices.push(position);
            position = calcNextVertex(position, direction, side);
            direction = (direction + 1) % 3;
            side += dside;
            // drawnLines++;
        }

        console.log('Got out of the loop');
        console.log('Vertices', vertices);
        let points = getAllPoints(vertices);
        console.log('points', points)

        // points.forEach(p => ctx.lineTo(p.x, p.y));

        drawSlow(vertices);
    }

    function drawSlow(points) {
        let index = 0;
        let intervalID = setInterval(() => {
            if(index < points.length) {
                ctx.lineTo(points[index].x, points[index].y);
                index++;
            } else {
                clearInterval(intervalID);
            }
            ctx.stroke();
        }, 1000 / 10);
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


    function calcWayPoints(v1, v2, maxWaypoints = 10) {
        let wayPoints = [];
        let dx = v2.x - v1.x;
        let dy = v2.y - v1.y;
        for(let index = 0; index < maxWaypoints; index++) {
            // console.log('Calculing waypoints');
            wayPoints.push({
                x: v1.x + (dx*index/maxWaypoints),
                y: v1.y + (dy*index/maxWaypoints),
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
        let change = [
            { dx: -Math.cos(degreesToRadians(60)), dy: Math.sin(degreesToRadians(60)) },
            { dx: 1, dy: 0 },
            { dx: -Math.cos(degreesToRadians(60)), dy: -Math.sin(degreesToRadians(60)) }
        ];

        let newPosition = {
            x: position.x + (change[direction].dx * side),
            y: position.y + (change[direction].dy * side)
        };

        return newPosition;
    }

    function fixResize() {
        canvas.width = canvas.getBoundingClientRect().width;
        canvas.height = canvas.getBoundingClientRect().height;
    }

    draw();

    window.onresize = function() {
        draw();
    }

}