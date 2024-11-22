const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const resetButton = document.getElementById('reset');
const aboutButton = document.getElementById('about');
const infoDiv = document.getElementById('info');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const points = [];
const circles = [];
let draggingPoint = null;

// Utility function to calculate distance
function distance(p1, p2) {
    return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
}

// Draw a point
function drawPoint(point, color = 'black') {
    ctx.beginPath();
    ctx.arc(point.x, point.y, 5, 0, 2 * Math.PI);
    ctx.fillStyle = color;
    ctx.fill();
}

// Draw a circle
function drawCircle(circle) {
    ctx.beginPath();
    ctx.arc(circle.center.x, circle.center.y, circle.radius, 0, 2 * Math.PI);
    ctx.strokeStyle = circle.color;
    ctx.lineWidth = 2;
    ctx.stroke();
}

// Clear canvas
function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// Render everything
function render() {
    clearCanvas();

    points.forEach(point => drawPoint(point));

    circles.forEach(circle => drawCircle(circle));

    // Calculate and display intersection points if both circles are drawn
    if (circles.length === 2) {
        const intersections = calculateCircleIntersections(
            circles[0].center, circles[0].radius,
            circles[1].center, circles[1].radius
        );

        intersections.forEach(pt => drawPoint(pt, 'red'));
        displayInfo(intersections);
    }
}

// Calculate intersections of two circles
function calculateCircleIntersections(p1, r1, p2, r2) {
    const d = distance(p1, p2);
    if (d > r1 + r2 || d < Math.abs(r1 - r2) || d === 0) return [];

    const a = (r1 ** 2 - r2 ** 2 + d ** 2) / (2 * d);
    const h = Math.sqrt(r1 ** 2 - a ** 2);

    const midpoint = {
        x: p1.x + a * (p2.x - p1.x) / d,
        y: p1.y + a * (p2.y - p1.y) / d,
    };

    return [
        {
            x: midpoint.x + h * (p2.y - p1.y) / d,
            y: midpoint.y - h * (p2.x - p1.x) / d,
        },
        {
            x: midpoint.x - h * (p2.y - p1.y) / d,
            y: midpoint.y + h * (p2.x - p1.x) / d,
        }
    ];
}

// Display information
function displayInfo(intersections = []) {
    const pointInfo = points.map((p, i) => `Point ${String.fromCharCode(65 + i)}: (${p.x.toFixed(1)}, ${p.y.toFixed(1)})`).join('<br>');
    const intersectionInfo = intersections.length
        ? intersections.map((pt, i) => `Intersection ${i + 1}: (${pt.x.toFixed(1)}, ${pt.y.toFixed(1)})`).join('<br>')
        : 'No intersections';

    infoDiv.innerHTML = `<strong>Points:</strong><br>${pointInfo}<br><strong>Intersections:</strong><br>${intersectionInfo}`;
}

// Add real-time coordinate preview
const previewDiv = document.createElement('div');
previewDiv.id = 'preview';
document.body.appendChild(previewDiv);

canvas.addEventListener('mousemove', (e) => {
    const mousePos = { x: e.offsetX, y: e.offsetY };

    // Show coordinates if less than 4 points are added
    if (points.length < 4 && !draggingPoint) {
        previewDiv.style.display = 'block';
        previewDiv.style.left = `${e.pageX + 10}px`;
        previewDiv.style.top = `${e.pageY + 10}px`;
        previewDiv.textContent = `(${mousePos.x}, ${mousePos.y})`;
    } else {
        previewDiv.style.display = 'none';
    }

    if (draggingPoint) {
        draggingPoint.x = mousePos.x;
        draggingPoint.y = mousePos.y;

        if (points.length === 4) {
            circles[0].radius = distance(points[0], points[1]);
            circles[1].radius = distance(points[2], points[3]);
        }

        render();
    }
});

canvas.addEventListener('mouseout', () => {
    previewDiv.style.display = 'none';
});

// Event: Add points on click
canvas.addEventListener('mousedown', (e) => {
    const mousePos = { x: e.offsetX, y: e.offsetY };

    const clickedPoint = points.find(p => distance(p, mousePos) <= 10);

    if (clickedPoint) {
        draggingPoint = clickedPoint;
    } else if (points.length < 4) {
        points.push(mousePos);

        if (points.length === 4) {
            circles.push(
                { center: points[0], radius: distance(points[0], points[1]), color: 'blue' },
                { center: points[2], radius: distance(points[2], points[3]), color: 'yellow' }
            );
        }

        render();
        displayInfo(); // Display info immediately after adding a point
    }
});

canvas.addEventListener('mouseup', () => {
    draggingPoint = null;
});

// Event: Reset
resetButton.addEventListener('click', () => {
    points.length = 0;
    circles.length = 0;
    infoDiv.innerHTML = '';
    render();
});

// Event: About
aboutButton.addEventListener('click', () => {
    alert('Geometry Builder\nAuthor: Kyrylo Chervonets\nInstructions:\n1. Click to select 4 points.\n2. Move points to see live updates.\n3. Click "Reset" to start over.');
});
