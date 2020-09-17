
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

function drawGalaxy() {
  var canvas = document.getElementById("my_canvas");
  var ctx = canvas.getContext("2d");
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, width, height);

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

  // let galaxyArm = galaxyArmConfig({a: 1.3, b: 0.5, n: 5});

  let armConfig = {
    scale: width/3,
    step: Math.PI/200,
    numSteps: 400,
    radius: galaxyArmConfig({a: 1.3, b: 0.5, n: 5})
  }

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

  // Draw solar systems
  traceGalaxyArm(armConfig, (stepNum, theta, radius) => {
    for (const i of Array(20).keys()) {
      let target_radius = radius + (Math.random() * 100) - 50
      let [coord_x, coord_y] = polarToCoords(theta, target_radius);
      drawPoint(ctx, coord_x, coord_y);
    }
  })
}
