/* Create Greenest Pixel Composites from Landsat 1, 2, 3
Andrew Pericak, June 2016

This script will create a greenest-pixel composite (where greenest pixel is the maximum NDVI)
using raw, orthocorrected imagery for Landsat 1, 2, or 3 (the Multi-Spectral Sensor, or MSS).
The user will specify the desired start year (beginning January 1), the desired end year (ending
December 31), and the sensor that covers those years. The output image is the greenest-pixel
composite for that time span (year or years). Note that the MSS sensors have a 60 m resolution,
so four Landsat TM/ETM+/OLI pixels (Landsats 4 - 8) equal one MSS pixel.

Data availability:
  Landsat 1: Jul 23, 1972 - Jan 7, 1978
  Landsat 2: Jan 22, 1975 - Feb 26, 1982
  Landsat 3: Mar 5, 1978 - Mar 31, 1983

Band names:
  B4: blue (0.5 - 0.6 μm)               [equivalent to TM band 2]
  B5: green (0.6 - 0.7 μm)              [equivalent to TM band 3]
  B6: red (0.7 - 0.8 μm)                [equivalent to TM band 4]
  B7: near infrared (0.8 - 1.1 μm)      [equivalent to TM band 4]
  B8: thermal infrared (10.4 - 12.6 μm) [equivalent to TM band 6]   **this band only on L3

GEE does not have pre-made top-of-atmosphere (TOA) layers, so use the ee.Algorithms.Landsat.TOA function
to produce these (the documentation says it doesn't support Landsats 1 - 3, but a recent update to the
algorithm means it now does.)
*/

/*-------------------------------DATA AND VARIABLES--------------------------------------------------*/

// USER VARIABLES
var startYr = "1976"; // Beginning complete year of analysis
var endYr = "1976";   // Ending complete year of analysis (could be same as beginning year)
var sensor = "L2";    // Desired Landsat sensor (just change the number to 1, 2, or 3)
var extent = ee.FeatureCollection("ft:1sZzM7TFsdW0HDqewl4-zNAsSZCXEjAfPn8EYow5q"); // The study area extent (Campagna)


// DATA (DO NOT MANIPULATE)

// The image collections (var stack)
if(sensor == "L1") {
  var stack = ee.ImageCollection("LANDSAT/LM1_L1T")
    .filterDate(startYr+"-01-01", endYr+"-12-31")
    .filterBounds(extent);
}
else if(sensor == "L2") {
  var stack = ee.ImageCollection("LANDSAT/LM2_L1T")
    .filterDate(startYr+"-01-01", endYr+"-12-31")
    .filterBounds(extent);
}
else if(sensor == "L3") {
  var stack = ee.ImageCollection("LANDSAT/LM3_L1T")
    .filterDate(startYr+"-01-01", endYr+"-12-31")
    .filterBounds(extent);
}
else {
  print("You didn't choose a sensor! Options are 'L1', 'L2', or 'L3'.");
}


/*-------------------------------PROCESSING STEPS--------------------------------------------------*/

/* Create greenest (max NDVI) composite image
The MSS sensors use B7 and B5 to perofrm NDVI calculation */

var addNDVI = stack.map(function(image){
  var TOA = ee.Algorithms.Landsat.TOA(image); // The TOA calcuation from DN
  var ndvi = TOA.normalizedDifference(["B7", "B5"]);
  return image.addBands(ndvi)
    .rename(["B4", "B5", "B6", "B7", "NDVI"]);
});
var greenest = addNDVI.qualityMosaic("NDVI"); // This builds the composite


Map.addLayer(greenest);
Map.centerObject(extent);
