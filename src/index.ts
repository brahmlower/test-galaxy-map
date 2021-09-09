
import { GalaxyBuilder, GalaxyConfig } from './generator';

const config: GalaxyConfig = {
  width: 1200,
  height: 1200,
  minimum_star_distance: 2,
  star_density_general: 4,
  star_density_arm: 6,
  star_density_cluster_minimum: 12,
  star_density_cluster_maximum: 20,
};

const builder = new GalaxyBuilder(config);
const galaxy = builder.generate();

console.log(galaxy.stars);
