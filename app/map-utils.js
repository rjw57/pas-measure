import { formatLength } from './utils.js';
const defaultOuterColor = 'rgba(51, 51, 51, 0.5)';
const defaultInnerColor = '#ffffff';
const defaultPerpPixLen = 20;

// Construct style function for a linear measurement.
//
// If the feature has a length, it is used as a label.
//
// Options may have the following properies:
//
//  innerColor: inner colour of line
//  outerColor: outer colour of line
//  lengthUnit: unit used for displaying length
//
export function linearMeasurementStyle(options) {
  options = Object.assign({
    innerColor: defaultInnerColor,
    outerColor: defaultOuterColor,
  }, options);

  return (feature, resolution) => {
    // resolution is "projection units per pixel"
    let perpPixLen = defaultPerpPixLen, perpLen = resolution * perpPixLen;

    let outerStrokeStyle = new ol.style.Stroke({
      color: options.innerColor, width: 2 });
    let innerStrokeStyle = new ol.style.Stroke({
      color: options.outerColor, width: 4 });

    let styles = [
      new ol.style.Style({ stroke: outerStrokeStyle, zIndex: 100 }),
      new ol.style.Style({ stroke: innerStrokeStyle, zIndex: 90 }),
    ];

    let geometry = feature.getGeometry();
    let label = '';

    if(feature.length && options.lengthUnit) {
      label = formatLength(feature.length, options.lengthUnit) + ' ' +
        options.lengthUnit.shortName;
    }

    if(geometry.getType() === 'LineString') {
      geometry.forEachSegment((start, end) => {
        let dx = end[0] - start[0], dy = end[1] - start[1];
        let sense = dx > 0 ? 1 : -1;

        let len = Math.sqrt(dx*dx + dy*dy);
        let perpDX = perpLen * -dy / len, perpDY = perpLen * dx / len;

        let perpGeom = new ol.geom.MultiLineString([
          [
            [start[0] - perpDX, start[1] - perpDY],
            [start[0] + perpDX, start[1] + perpDY],
          ],
          [
            [end[0] - perpDX, end[1] - perpDY],
            [end[0] + perpDX, end[1] + perpDY],
          ],
        ]);

        styles = styles.concat([
          new ol.style.Style({
            geometry: perpGeom,
            stroke: innerStrokeStyle,
            zIndex: 90,
          }),
          new ol.style.Style({
            geometry: perpGeom,
            stroke: outerStrokeStyle,
            zIndex: 100,
          }),
          new ol.style.Style({
            geometry: new ol.geom.Point([
                0.5 * (end[0] + start[0]) + sense * 0.5 * perpDX,
                0.5 * (end[1] + start[1]) + sense * 0.5 * perpDY,
            ]),
            text: new ol.style.Text({
              text: label,
              rotation: Math.atan2(-sense * dy, Math.abs(dx)),
              offsetX: 0, offsetY: 0,
              font: '15px sans-serif',
              fill: new ol.style.Fill({ color: options.innerColor }),
              stroke: new ol.style.Stroke({
                color: options.outerColor, width: 2 }),
            }),
          }),
        ]);
      });
    }

    return styles;
  };
}

// Construct a neutral background image source for maps.
export function createNeutralBackgroundSource() {
  return new ol.source.ImageCanvas({
    canvasFunction(extent, resolution, pxRato, imSize, proj) {
      let w = imSize[0], h = imSize[1];
      let canvasElem = document.createElement('canvas');
      canvasElem.width = w; canvasElem.height = h;
      let ctx = canvasElem.getContext('2d');
      ctx.fillStyle = '#bbb';
      ctx.fillRect(0, 0, w, h);
      return canvasElem;
    },
  });
}