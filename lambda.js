
const { GalaxyBuilder } = require('./generator.js');

exports.handler = async () => {
  const config = {
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

  return galaxy.stars;
}
