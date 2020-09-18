
let width = 1200;
let height = 1200;

let centerX = width/2;
let centerY = height/2;

let RENDER_AXIS = false;
let RENDER_ARMS = false;
let RENDER_CLUSTERS = false;
let RENDER_STARS = true;
let RENDER_STARS_ARM = true;
let RENDER_STARS_GENERAL = true;

let MIN_STAR_DISTANCE = 2;
let STAR_DENSITY_GENERAL = 4;
let STAR_DENSITY_ARM = 6;
let STAR_DENSITY_CLUSTER_MIN = 12;
let STAR_DENSITY_CLUSTER_MAX = 20;

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

function traceGalaxyArm(config) {
  const centerRadiusF = galaxyArmConfig(config.radiusConfig)
  const outerRadiusF = galaxyArmConfig({
    ...config.radiusConfig,
    a: config.radiusConfig.a + config.armWidth
  })
  const innerRadiusF = galaxyArmConfig({
    ...config.radiusConfig,
    a: config.radiusConfig.a - config.armWidth
  })

  const armPoints = {
    inner: new Array(),
    center: new Array(),
    outer: new Array(),
  };

  for (const stepNum of Array(config.numSteps).keys()) {
    const theta = config.step * stepNum;

    // Calculate and push the inner arm point
    let radius_i = innerRadiusF(theta) * config.scale;
    let [coord_x_i, coord_y_i] = polarToCoords(theta, radius_i);
    armPoints.inner.push({
      step: stepNum,
      x: coord_x_i,
      y: coord_y_i,
      t: theta,
      r: radius_i
    });

    // Calculate and push the center arm point
    let radius_c = centerRadiusF(theta) * config.scale;
    let [coord_x_c, coord_y_c] = polarToCoords(theta, radius_c);
    armPoints.center.push({
      step: stepNum,
      x: coord_x_c,
      y: coord_y_c,
      t: theta,
      r: radius_c
    });

    // Calculate and push the outer arm point
    let radius_o = outerRadiusF(theta) * config.scale;
    let [coord_x_o, coord_y_o] = polarToCoords(theta, radius_o);
    armPoints.outer.push({
      step: stepNum,
      x: coord_x_o,
      y: coord_y_o,
      t: theta,
      r: radius_o
    });
  }

  return armPoints;
}

function generateArmStars(armPoints, starList) {
  let armStars = Array();
  for (let {x, y, step} of armPoints.inner) {
    if (armPoints.inner[step+1] === undefined) {
      break;
    }
    // Get coordinates for parallelagram
    let x1 = armPoints.outer[step+1].x;
    let y1 = armPoints.outer[step+1].y;
    let x2 = armPoints.outer[step].x;
    let y2 = armPoints.outer[step].y;
    // Calculate the area
    let area = pointDistance(x1, y1, x2, y2) * pointDistance(x, y, x2, y2);
    // Calculate the number of stars based on density
    let density = STAR_DENSITY_ARM / 1000;
    let numStars = Math.ceil(area * density);
    // Generate stars
    for (const n of Array(numStars).keys()) {
      for (const na of Array(50).keys()) {
        let sx = randomInRange(x, x1);
        let sy = randomInRange(y, y2);

        let isNotCramped = starList.reduce((acc, cur) => acc && pointDistance(sx, sy, cur.x, cur.y) > MIN_STAR_DISTANCE, true);
        if (isNotCramped) {
          armStars.push({x: sx, y: sy});
          break
        }
      }
    }
  }

  return armStars;
}

function generateGeneralStars(radius, starList) {
  let circleStars = Array();

  let density = STAR_DENSITY_GENERAL / 1000;
  let area = Math.PI * Math.pow(radius, 2);
  let numStars = Math.ceil(area * density);

  for (const n of Array(numStars).keys()) {
    for (const na of Array(50).keys()) {
      // Attempt to place the star up to 50 times
      let x = randomInRange(centerX - radius, centerX + radius);
      let y = randomInRange(centerY - radius, centerY + radius);

      let isInCircle = pointDistance(x, y, centerX, centerY) < radius;
      let isNotCramped = starList.reduce((acc, cur) => acc && pointDistance(x, y, cur.x, cur.y) > MIN_STAR_DISTANCE, true);
      // If the distance to the point is less than the radius of the cluster
      // then we should save it
      if (isInCircle && isNotCramped) {
        circleStars.push({x, y});
        break
      }
    }
  }

  return circleStars;
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
  // let RENDER_AXIS = false;
  // let RENDER_ARMS = false;
  // let RENDER_CLUSTERS = false;
  // let RENDER_STARS = true;

  var canvas = document.getElementById("my_canvas");
  var ctx = canvas.getContext("2d");
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, width, height);

  if (RENDER_AXIS) {
    renderAxis(ctx, width, height);
  }

  // Configure the galaxy arms and generate points along those arms
  let armConfig1 = {
    scale: width/3,
    step: Math.PI/200,
    numSteps: 390,
    armWidth: 0.3,
    radiusConfig: {a: 1.3, b: 0.5, n: 4.5}
  }

  let armConfig2 = {
    ...armConfig1,
    scale: armConfig1.scale * -1
  }

  const arm1Points = traceGalaxyArm(armConfig1);
  const arm2Points = traceGalaxyArm(armConfig2);

  if (RENDER_ARMS) {
    // Draw center line for arm 1
    ctx.beginPath();
    ctx.strokeStyle = "grey";
    ctx.moveTo(centerX, centerY);
    arm1Points.center.forEach(({x, y}) => ctx.lineTo(x, y));
    ctx.stroke();

    // Draw inner line for arm 1
    ctx.beginPath();
    ctx.strokeStyle = "grey";
    ctx.moveTo(centerX, centerY);
    arm1Points.inner.forEach(({x, y}) => ctx.lineTo(x, y));
    ctx.stroke();

    // Draw outer line for arm 1
    ctx.beginPath();
    ctx.strokeStyle = "grey";
    ctx.moveTo(centerX, centerY);
    arm1Points.outer.forEach(({x, y}) => ctx.lineTo(x, y));
    ctx.stroke();

    // Draw center line for arm 2
    ctx.beginPath();
    ctx.strokeStyle = "grey";
    ctx.moveTo(centerX, centerY);
    arm2Points.center.forEach(({x, y}) => ctx.lineTo(x, y));
    ctx.stroke();

    // Draw inner line for arm 2
    ctx.beginPath();
    ctx.strokeStyle = "grey";
    ctx.moveTo(centerX, centerY);
    arm2Points.inner.forEach(({x, y}) => ctx.lineTo(x, y));
    ctx.stroke();

    // Draw outer line for arm 2
    ctx.beginPath();
    ctx.strokeStyle = "grey";
    ctx.moveTo(centerX, centerY);
    arm2Points.outer.forEach(({x, y}) => ctx.lineTo(x, y));
    ctx.stroke();

    drawCircle(ctx, centerX, centerY, Math.abs(arm1Points.center[arm1Points.center.length-1].r))
  }


  let armFadeSteps = armConfig1.step * 0.75; // After 25% of the arm

  // Generate star cluster points
  let clustersList = new Array();

  arm1Points.center.forEach(({step, r, t}) => {
    let fadded = false;
    if (step > (armConfig1.numSteps - armFadeSteps)) {
      let clusterPercentage = ((step - (armConfig1.numSteps - armFadeSteps)) / armFadeSteps);
      if (Math.random() < clusterPercentage) {
        fadded = true;
      }
    }

    // Draw on arm 1
    if (!fadded && Math.floor(Math.random() * 2) == 1) {
      let targetRadius = r + randomDistanceStray();
      let [x, y] = polarToCoords(t, targetRadius);
      let clusterRadius = randomClusterRadius();
      // Save and draw cluster if it doesn't collide with any others
      if (!checkCollides(clustersList, x, y, clusterRadius)) {
        clustersList.push({x, y, r: clusterRadius})
      }
    }
  });

  arm2Points.center.forEach(({step, r, t}) => {
    let fadded = false;
    if (step > (armConfig2.numSteps - armFadeSteps)) {
      let clusterPercentage = ((step - (armConfig2.numSteps - armFadeSteps)) / armFadeSteps);
      if (Math.random() < clusterPercentage) {
        fadded = true;
      }
    }

    // Draw on arm 2
    if (!fadded && Math.floor(Math.random() * 2) == 1) {
      let targetRadius = r + randomDistanceStray();
      let [x, y] = polarToCoords(t, targetRadius);
      let clusterRadius = randomClusterRadius();
      // Save and draw cluster if it doesn't collide with any others
      if (!checkCollides(clustersList, x, y, clusterRadius)) {
        clustersList.push({x, y, r: clusterRadius})
      }
    }
  });

  if (RENDER_CLUSTERS) {
    clustersList.forEach(({x, y, r}) => drawCircle(ctx, x, y, r));
  }

  let starList = Array();

  // Generate stars in clusters
  clustersList.forEach(i => {
    let clusterDensity = randomInRange(STAR_DENSITY_CLUSTER_MIN, STAR_DENSITY_CLUSTER_MAX) / 1000;
    let clusterArea = Math.PI * Math.pow(i.r, 2);
    let numStars = Math.ceil(clusterArea * clusterDensity)
    let clusterStars = Array();
    for (const n of Array(numStars).keys()) {
      for (const na of Array(50).keys()) {
        // Attempt to place the star up to 50 times
        let x = randomInRange(i.x - i.r, i.x + i.r);
        let y = randomInRange(i.y - i.r, i.y + i.r);

        let isInCluster = pointDistance(x, y, i.x, i.y) < i.r;
        let isNotCramped = clusterStars.reduce((acc, cur) => acc && pointDistance(x, y, cur.x, cur.y) > MIN_STAR_DISTANCE, true);
        // If the distance to the point is less than the radius of the cluster
        // then we should save it
        if (isInCluster && isNotCramped) {
          starList.push({x, y});
          clusterStars.push({x, y});
          break
        }
      }
    }
  });

  // Generate stars in arms
  if (RENDER_STARS_ARM) {
    let arm1Stars = generateArmStars(arm1Points, starList);
    let arm2Stars = generateArmStars(arm2Points, starList);
    starList = starList.concat(arm1Stars);
    starList = starList.concat(arm2Stars);
  }

  // Generate stars in galactic circle
  if (RENDER_STARS_GENERAL) {
    let circleRadius = Math.abs(arm1Points.center[arm1Points.center.length-1].r);
    let generalStars = generateGeneralStars(circleRadius, starList);
    starList = starList.concat(generalStars);
  }

  // Draw the stars on the map
  if (RENDER_STARS) {
    starList.forEach(({x, y}) => drawPoint(ctx, x, y));
  }
}
