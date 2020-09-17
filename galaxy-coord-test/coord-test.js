
let width = 1200;
let height = 1200;

let centerX = width/2;
let centerY = height/2;

function drawPoint(ctx, coord_x, coord_y) {
  ctx.beginPath();
  ctx.arc(coord_x, coord_y, 1, 0, 2 * Math.PI);
  ctx.strokeStyle = 'white';
  ctx.fill();
  ctx.stroke();
}

function drawCircle(ctx, coord_x, coord_y, radius) {
  ctx.beginPath();
  ctx.arc(coord_x, coord_y, radius, 0, 2 * Math.PI);
  ctx.strokeStyle = 'grey';
  ctx.stroke();
}

function polarToCoords(theta, radius) {
	// Solve for opposite
  let coord_y = (Math.sin(theta) * radius) + centerY;
  let coord_x = (Math.cos(theta) * radius) + centerX;
	return [coord_x, coord_y];
}

// https://arxiv.org/pdf/0908.0892.pdf
function galaxyArmConfig({a, b, n}) {
  return (phi) => {
  	return a / Math.log(b * Math.tan(phi / (2 * n)) )
  }
}

function traceGalaxyArm(config, callback) {
  for (const stepNum of Array(config.numSteps).keys()) {
    let theta = config.step * stepNum;
    let radius = config.radius(theta) * config.scale;
    callback(stepNum, theta, radius);
  }
}

function pointDistance(x1, y1, x2, y2) {
  return Math.sqrt(Math.pow((x2 - x1), 2) + Math.pow((y2 - y1), 2))
}

function checkCollides(clusters, x, y, r) {
  let minProximity = 5;
  let colliding = false;
  clusters.forEach(i => {
    if (!colliding && pointDistance(x, y, i.x, i.y) < (r + i.r + minProximity)) {
      colliding = true
    }
  })
  return colliding;
}

function randomInRange(max, min) {
  //The maximum is inclusive and the minimum is inclusive
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function randomClusterRadius() {
  let min = 15;
  let max = 45;
  //The maximum is inclusive and the minimum is inclusive
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function randomDistanceStray() {
  let maxStray = 100;
  return (Math.random() * maxStray) - (maxStray/2);
}

function renderAxis(ctx, width, height) {
  ctx.beginPath();
  ctx.strokeStyle = "grey";
  ctx.moveTo(0, height/2);
  ctx.lineTo(width, height/2);
  ctx.stroke();

  ctx.beginPath();
  ctx.strokeStyle = "grey";
  ctx.moveTo(width/2, 0);
  ctx.lineTo(width/2, height);
  ctx.stroke();
}

function drawGalaxy() {
  let RENDER_AXIS = false;
  let RENDER_ARMS = false;

  var canvas = document.getElementById("my_canvas");
  var ctx = canvas.getContext("2d");
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, width, height);

  if (RENDER_AXIS) {
    renderAxis(ctx, width, height);
  }

  // Configure the galaxy arms
  let armConfig = {
    scale: width/3,
    step: Math.PI/200,
    numSteps: 390,
    radius: galaxyArmConfig({a: 1.3, b: 0.5, n: 4.5})
  }
  let armFadeSteps = armConfig.step * 0.75; // Last 15% of the arm

  let clustersList = Array();

  // Draw solar systems
  traceGalaxyArm(armConfig, (stepNum, theta, radius) => {
    let fadded1 = false;
    let fadded2 = false;
    if (stepNum > (armConfig.numSteps - armFadeSteps)) {
      let clusterPercentage = ((stepNum - (armConfig.numSteps - armFadeSteps)) / armFadeSteps);
      if (Math.random() < clusterPercentage) {
        fadded1 = true;
      }
      if (Math.random() < clusterPercentage) {
        fadded2 = true;
      }
    }

    // Draw on arm 1
    if (!fadded1 && Math.floor(Math.random() * 2) == 1) {
      let targetRadius = radius + randomDistanceStray();
      let [coordX, coordY] = polarToCoords(theta, targetRadius);
      let clusterRadius = randomClusterRadius();

      // Save and draw cluster if it doesn't collide with any others
      if (!checkCollides(clustersList, coordX, coordY, clusterRadius)) {
        clustersList.push({
          x: coordX,
          y: coordY,
          r: clusterRadius
        })
        drawCircle(ctx, coordX, coordY, clusterRadius);
      }
    }

    // Draw on arm 2
    if (!fadded2 && Math.floor(Math.random() * 2) == 1) {
      let targetRadius = radius + randomDistanceStray();
      let [coordX, coordY] = polarToCoords(theta, targetRadius * -1);
      let clusterRadius = randomClusterRadius();

      // Save and draw cluster if it doesn't collide with any others
      if (!checkCollides(clustersList, coordX, coordY, clusterRadius)) {
        clustersList.push({
          x: coordX,
          y: coordY,
          r: clusterRadius
        })
        drawCircle(ctx, coordX, coordY, clusterRadius);
      }
    }
  })

  if (RENDER_ARMS) {
    // Trace first arm
    ctx.beginPath();
    ctx.strokeStyle = "grey";
    ctx.moveTo(centerX, centerY);
    traceGalaxyArm(armConfig, (stepNum, theta, radius) => {
      let [coord_x, coord_y] = polarToCoords(theta, radius);
      ctx.lineTo(coord_x, coord_y);
    });
    ctx.stroke();

    // Trace second arm
    ctx.beginPath();
    ctx.strokeStyle = "grey";
    ctx.moveTo(centerX, centerY);
    traceGalaxyArm(armConfig, (stepNum, theta, radius) => {
      let [coord_x, coord_y] = polarToCoords(theta, radius * -1);
      ctx.lineTo(coord_x, coord_y);
    })
    ctx.stroke();
  }
}
