
let width = 1200;
let height = 1200;

let correctX = width/2;
let correctY = height/2;

function drawPoint(ctx, coord_x, coord_y) {
  ctx.beginPath();
  ctx.arc(coord_x, coord_y, 1, 0, 2 * Math.PI);
  ctx.strokeStyle = 'white';
  ctx.fill();
  ctx.stroke();
}

function polarToCoords(theta, radius) {
	// Solve for opposite
  let coord_y = (Math.sin(theta) * radius) + correctY;
  let coord_x = (Math.cos(theta) * radius) + correctX;
	return [coord_x, coord_y];
}

// https://arxiv.org/pdf/0908.0892.pdf
function galaxyArmConfig({a, b, n}) {
  return (phi) => {
  	return a / Math.log(b * Math.tan(phi / (2 * n)) )
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

  //let galaxyArm = galaxyArmConfig({a: 6, b: 0.05, n: 4});
  let galaxyArm = galaxyArmConfig({a: 1.3, b: 0.5, n: 5});

  let scale = width/3;
  let step = Math.PI / 200;

  // ctx.beginPath();
  // ctx.strokeStyle = "black";
  // ctx.moveTo(300, 300);
  for (const stepNum of Array(400).keys()) {
    let theta = step * stepNum;
    let radius = galaxyArm(theta) * scale;
    // let [coord_x, coord_y] = polarToCoords(theta, radius);
    for (const i of Array(20).keys()) {
      let target_radius = radius + (Math.random() * 100) - 50
      let [coord_x, coord_y] = polarToCoords(theta, target_radius);
      drawPoint(ctx, coord_x, coord_y);
    }
    // ctx.lineTo(coord_x, coord_y);
  }
  // ctx.stroke();

  // ctx.beginPath();
  // ctx.strokeStyle = "black";
  // ctx.moveTo(300, 300);
  for (const stepNum of Array(400).keys()) {
    let theta = step * stepNum;
    let radius = galaxyArm(theta) * scale * -1;
    for (const i of Array(20).keys()) {
      let target_radius = radius + (Math.random() * 100) - 50
      let [coord_x, coord_y] = polarToCoords(theta, target_radius);
      drawPoint(ctx, coord_x, coord_y);
    }
    // let [coord_x, coord_y] = polarToCoords(theta, radius);
    // drawPoint(ctx, coord_x, coord_y)
    // ctx.lineTo(coord_x, coord_y);
  }
  // ctx.stroke();
}