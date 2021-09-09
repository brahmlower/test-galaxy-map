
export interface RadiusConfig {
  a: number,
  b: number,
  n: number,
}

export interface Cluster {
  x: number,
  y: number,
  r: number,
}

export interface ArmConfig {
  scale: number,
  step: number,
  numSteps: number,
  armWidth: number,
  radiusConfig: RadiusConfig
}

export interface ArmPoints {
  inner: GalaxyCoordinate[],
  center: GalaxyCoordinate[],
  outer: GalaxyCoordinate[],
}

export interface GalaxyCoordinate {
  step: number,
  x: number,
  y: number,
  t: number,
  r: number,
}

export interface GalaxyConfig {
  width: number,
  height: number,
  minimum_star_distance: number,
  star_density_general: number,
  star_density_arm: number,
  star_density_cluster_minimum: number,
  star_density_cluster_maximum: number,
}

export interface Galaxy {
  stars: Star[]
  config: GalaxyConfig
}

export interface Star {
  x: number,
  y: number,
}

export const random_in_range = (max: number, min: number) => {
  // The maximum is inclusive and the minimum is inclusive
  return Math.floor(Math.random() * (max - min + 1) + min);
};

// https://arxiv.org/pdf/0908.0892.pdf
export const galaxy_arm_config = ({a, b, n}: RadiusConfig) => {
  return (phi: number) =>  a / Math.log(b * Math.tan(phi / (2 * n)) );
}

export class GalaxyBuilder {
  config: GalaxyConfig;
  width: number;
  height: number;
  minimum_star_distance: number;
  star_density_general: number;
  star_density_arm: number;
  star_density_cluster_minimum: number;
  star_density_cluster_maximum: number;

  constructor(config: GalaxyConfig) {
    this.config = config;
    this.width = config.width;
    this.height = config.height;
    this.minimum_star_distance = config.minimum_star_distance;
    this.star_density_general = config.star_density_general;
    this.star_density_arm = config.star_density_arm;
    this.star_density_cluster_minimum = config.star_density_cluster_minimum;
    this.star_density_cluster_maximum = config.star_density_cluster_maximum;
  }

  get center_x() {
    return this.width / 2
  }

  get center_y() {
    return this.height / 2
  }

  private polar_to_coords = (theta: number, radius: number) => {
    let coord_y = (Math.sin(theta) * radius) + this.center_y;
    let coord_x = (Math.cos(theta) * radius) + this.center_x;
    return [coord_x, coord_y];
  };

  private point_distance = (x1: number, y1: number, x2: number, y2: number) =>
    Math.sqrt(Math.pow((x2 - x1), 2) + Math.pow((y2 - y1), 2));

  private random_cluster_radius = () => {
    const min = 15;
    const max = 45;
    //The maximum is inclusive and the minimum is inclusive
    return Math.floor(Math.random() * (max - min + 1) + min);
  };

  private random_distance_stray = () => {
    const maxStray = 100;
    return (Math.random() * maxStray) - (maxStray/2);
  };

  private check_collides = (clusters: Cluster[], x: number, y: number, r: number) => {
    let min_proximity = 5;
    let colliding = false;
    clusters.forEach((i: Cluster) => {
      if (!colliding && this.point_distance(x, y, i.x, i.y) < (r + i.r + min_proximity)) {
        colliding = true
      }
    })
    return colliding;
  }

  private trace_galaxy_arm = (config: ArmConfig) => {
    const centerRadiusF = galaxy_arm_config(config.radiusConfig)
    const outerRadiusF = galaxy_arm_config({
      ...config.radiusConfig,
      a: config.radiusConfig.a + config.armWidth
    })
    const innerRadiusF = galaxy_arm_config({
      ...config.radiusConfig,
      a: config.radiusConfig.a - config.armWidth
    })

    const armPoints: ArmPoints = {
      inner: new Array(),
      center: new Array(),
      outer: new Array(),
    };

    for (const stepNum of Array(config.numSteps).keys()) {
      const theta = config.step * stepNum;

      // Calculate and push the inner arm point
      let radius_i = innerRadiusF(theta) * config.scale;
      let [coord_x_i, coord_y_i] = this.polar_to_coords(theta, radius_i);
      armPoints.inner.push({
        step: stepNum,
        x: coord_x_i,
        y: coord_y_i,
        t: theta,
        r: radius_i
      });

      // Calculate and push the center arm point
      let radius_c = centerRadiusF(theta) * config.scale;
      let [coord_x_c, coord_y_c] = this.polar_to_coords(theta, radius_c);
      armPoints.center.push({
        step: stepNum,
        x: coord_x_c,
        y: coord_y_c,
        t: theta,
        r: radius_c
      });

      // Calculate and push the outer arm point
      let radius_o = outerRadiusF(theta) * config.scale;
      let [coord_x_o, coord_y_o] = this.polar_to_coords(theta, radius_o);
      armPoints.outer.push({
        step: stepNum,
        x: coord_x_o,
        y: coord_y_o,
        t: theta,
        r: radius_o
      });
    }

    return armPoints;
  };

  private generate_arm_stars = (arm_points: ArmPoints, star_list: Star[]) => {
    let arm_stars = Array();
    for (let {x, y, step} of arm_points.inner) {
      if (arm_points.inner[step+1] === undefined) {
        break;
      }
      // Get coordinates for parallelagram
      let x1 = arm_points.outer[step+1].x;
      let y1 = arm_points.outer[step+1].y;
      let x2 = arm_points.outer[step].x;
      let y2 = arm_points.outer[step].y;
      // Calculate the area
      let area = this.point_distance(x1, y1, x2, y2) * this.point_distance(x, y, x2, y2);
      // Calculate the number of stars based on density
      let density = this.star_density_arm / 1000;
      let num_stars = Math.ceil(area * density);
      // Generate stars
      for (const n of Array(num_stars).keys()) {
        for (const na of Array(50).keys()) {
          let sx = random_in_range(x, x1);
          let sy = random_in_range(y, y2);

          let is_not_cramped: boolean = star_list.reduce((acc: boolean, star: Star): boolean => acc && this.point_distance(sx, sy, star.x, star.y) > this.minimum_star_distance, true);
          if (is_not_cramped) {
            arm_stars.push({x: sx, y: sy});
            break
          }
        }
      }
    }

    return arm_stars;
  };

  private generate_general_stars = (radius: number, star_list: Star[]) => {
    let circleStars = Array();

    let density = this.star_density_general / 1000;
    let area = Math.PI * Math.pow(radius, 2);
    let numStars = Math.ceil(area * density);

    for (const n of Array(numStars).keys()) {
      for (const na of Array(50).keys()) {
        // Attempt to place the star up to 50 times
        let x = random_in_range(this.center_x - radius, this.center_x + radius);
        let y = random_in_range(this.center_y - radius, this.center_y + radius);

        let isInCircle = this.point_distance(x, y, this.center_x, this.center_y) < radius;
        let isNotCramped = star_list.reduce((acc, cur) => acc && this.point_distance(x, y, cur.x, cur.y) > this.minimum_star_distance, true);
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

  public generate = () => {
    // Configure the galaxy arms and generate points along those arms
    let armConfig1: ArmConfig = {
      scale: this.width/3,
      step: Math.PI/200,
      numSteps: 390,
      armWidth: 0.3,
      radiusConfig: {a: 1.3, b: 0.5, n: 4.5}
    }

    let armConfig2: ArmConfig = {
      ...armConfig1,
      scale: armConfig1.scale * -1
    }

    const arm1Points = this.trace_galaxy_arm(armConfig1);
    const arm2Points = this.trace_galaxy_arm(armConfig2);

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
        let targetRadius = r + this.random_distance_stray();
        let [x, y] = this.polar_to_coords(t, targetRadius);
        let clusterRadius = this.random_cluster_radius();
        // Save and draw cluster if it doesn't collide with any others
        if (!this.check_collides(clustersList, x, y, clusterRadius)) {
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
        let targetRadius = r + this.random_distance_stray();
        let [x, y] = this.polar_to_coords(t, targetRadius);
        let clusterRadius = this.random_cluster_radius();
        // Save and draw cluster if it doesn't collide with any others
        if (!this.check_collides(clustersList, x, y, clusterRadius)) {
          clustersList.push({x, y, r: clusterRadius})
        }
      }
    });

    let starList = Array();

    // Generate stars in clusters
    clustersList.forEach(i => {
      let clusterDensity = random_in_range(this.star_density_cluster_minimum, this.star_density_cluster_maximum) / 1000;
      let clusterArea = Math.PI * Math.pow(i.r, 2);
      let numStars = Math.ceil(clusterArea * clusterDensity)
      let clusterStars = Array();
      for (const n of Array(numStars).keys()) {
        for (const na of Array(50).keys()) {
          // Attempt to place the star up to 50 times
          let x = random_in_range(i.x - i.r, i.x + i.r);
          let y = random_in_range(i.y - i.r, i.y + i.r);

          let isInCluster = this.point_distance(x, y, i.x, i.y) < i.r;
          let isNotCramped = clusterStars.reduce((acc, cur) => acc && this.point_distance(x, y, cur.x, cur.y) > this.minimum_star_distance, true);
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
    let arm1Stars = this.generate_arm_stars(arm1Points, starList);
    let arm2Stars = this.generate_arm_stars(arm2Points, starList);
    starList = starList.concat(arm1Stars);
    starList = starList.concat(arm2Stars);

    // Generate stars in galactic circle
    let circleRadius = Math.abs(arm1Points.center[arm1Points.center.length-1].r);
    let generalStars = this.generate_general_stars(circleRadius, starList);
    starList = starList.concat(generalStars);

    const galaxy: Galaxy = {
      stars: starList,
      config: this.config
    }
    return galaxy;
  };
}
