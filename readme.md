
# Test Galaxy Map

This is a super simple project for generating galaxy maps suitable for a 2D game. No efforts have been made to make the generation process efficient, and tweaking generation settings must be done by manually editing constants in the js file.

### Configurables

#### Canvas Configs
* `width`: width of the canvas. Needs to be kept in sync with element width declared in the html
* `height`: height of the canvas. Needs to be kept in sync with element height declared in the html

#### Rendering Configs
* `RENDER_AXIS`: enable/disable rendering of the x and y axis
* `RENDER_ARMS`: enable/disable rendering of the galaxy arm guidelines
* `RENDER_CLUSTERS`: enable/disable rendering star cluster borders
* `RENDER_STARS`: enable/disable rendering of all stars
* `RENDER_STARS_ARM`: enable/disable rendering of filler stars in the arms (does not effect cluster stars)
* `RENDER_STARS_GENERAL`: enable/disable rendering of the stars between the galaxy arms

#### Star Density Configs

Density values here represent N/1000 stars/pixel for a given region. Finding a comfortable balance here is very much a manual effort.

* `MIN_STAR_DISTANCE`: Minimum number of pixels between any two stars
* `STAR_DENSITY_GENERAL`: Star density for stars between arms of the galaxy
* `STAR_DENSITY_ARM`: Star dentity for stars in the galaxy arms, but not in the star clusters
* `STAR_DENSITY_CLUSTER_MIN`: Minimum boundry for star cluster density
* `STAR_DENSITY_CLUSTER_MAX`: Maximum boundry for star cluster density

### Images

The following are a couple examples of the resulting maps.

This first image is with the default settings
![](https://i.imgur.com/x4KtAum.png)

This second image is with cluster density significantly increased
![](https://i.imgur.com/Vav7PI6.png)
