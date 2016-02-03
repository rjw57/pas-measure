import React from 'react';

import { connect } from 'react-redux'
import ol from 'openlayers';

import { formatLength } from '../utils.js';
import {
  createNeutralBackgroundSource,
  linearMeasurementStyle, circularMeasurementStyle
} from '../map-utils.js';

require('style!css!./image-editor.css');

const scaleStyleOpts = { innerColor: '#b58900' };
const circleStyleOpts = { innerColor: '#268bd2' };
const lineStyleOpts = { innerColor: '#859900' };

function measureLength(lengthInPixels, pixelLengthEstimate) {
  let mu = lengthInPixels * pixelLengthEstimate.mu;
  let sigma = lengthInPixels * pixelLengthEstimate.sigma;
  return { mu, sigma };
}

function measureArea(areaInSqPixels, pixelLengthEstimate) {
  let mu = Math.pow(pixelLengthEstimate.mu, 2) * areaInSqPixels;
  let sigma = Math.sqrt(2) * pixelLengthEstimate.sigma / pixelLengthEstimate.mu;
  sigma *= mu;
  return { mu, sigma };
}

const pointerStyles = [ ];

// updateSourceFromFeatures will take a collection of feature objects, each with
// an associated id, and add or remove features from a source depending on
// whether a feature with a matching id is present. The createFeature callback
// is called on the feature object to create the corresponding ol.Feature.
function updateSourceFromFeatures(source, nextFeatures, createFeature) {
  // Form a set of current feature ids and next feature ids.
  let featureIds = new Set(source.getFeatures().map(f => f.getId()));
  let nextFeatureIds = new Set(nextFeatures.map(f => f.id));

  // Set of feature ids which have been inserted
  let insertedFeatureIds = new Set(
    [...nextFeatureIds].filter(id => !featureIds.has(id)));

  // Set of feature ids which have been deleted
  let removedFeatureIds = new Set(
    [...featureIds].filter(id => !nextFeatureIds.has(id)));

  // Remove any features we need to
  removedFeatureIds.forEach(id => {
    let f = source.getFeatureById(id);
    if(f) { source.removeFeature(f); }
  });

  // Now insert any new features
  if(insertedFeatureIds.size > 0) {
    nextFeatures.forEach(f => {
      if(!insertedFeatureIds.has(f.id)) { return; }
      let newFeature = createFeature(f);
      newFeature.setId(f.id);
      source.addFeature(newFeature);
    });
  }
}

// ImageEditor is a React component which provides a canvas which displays an
// image and a set of features. It also supports the creation of new features
// via drawing.
class ImageEditor extends React.Component {
  constructor(props) {
    super(props);

    // ImageEditor essentially consists of one large OpenLayers map with a
    // custom projection. The map is created when the component mounts but map
    // metadata like projection and viewport persist across mounts.
    this.map = null;
    this.projection = new ol.proj.Projection({
      code: 'flat-image', units: 'pixels',
      extent: [0, 0, 512, 512],
    });
    this.view = new ol.View({
      center: [0, 0], projection: this.projection, zoom: 0,
      minZoom: -4,
    });

    // Scales
    this.scaleSource = new ol.source.Vector();
    this.scaleLayer = new ol.layer.Vector({ source: this.scaleSource, zIndex: 100 });

    // Lines
    this.lineSource = new ol.source.Vector();
    this.lineLayer = new ol.layer.Vector({ source: this.lineSource, zIndex: 101 });

    // Circles
    this.circleSource = new ol.source.Vector();
    this.circleLayer = new ol.layer.Vector({ source: this.circleSource, zIndex: 102 });

    // The current draw interaction and sketch feature
    this.draw = null;

    // URL to current image
    this.imageUrl = null;

    // Layer for image
    this.imageLayer = new ol.layer.Image({ zIndex: 0 });

    // HTML element used to load image
    this.imageElement = document.createElement('img');
    this.imageElement.onload = () => {
      // Abort if we're out of date
      if(this.imageElement.src !== this.imageUrl) { return; }

      // Update layer source
      let extent = [0, 0, this.imageElement.width, this.imageElement.height];
      this.imageLayer.setSource(new ol.source.ImageStatic({
        url: this.imageElement.src,
        projection: this.projection,
        imageExtent: extent
      }));

      // Zoom map to extent
      if(this.map) {
        this.view.fit(extent, this.map.getSize());
      }
    };

    this.updateLayerStyles(this.props.lengthUnit);

    this.pointerTooltip = new ol.Overlay({
      offset: [15, 0], positioning: 'center-left',
    });
  }

  componentDidMount() {
    // Create openlayers map
    this.map = new ol.Map({
      target: this.refs.map,
      controls: [],
      view: this.view,
      layers: [
        this.imageLayer, this.scaleLayer, this.lineLayer, this.circleLayer
      ],
    });
    this.map.addOverlay(this.pointerTooltip);

    this.map.on('pointermove', evt => this.pointerMove(evt));
  }

  componentWillUnmount() {
    this.removeCurrentDrawing();
    this.map = null;
  }

  componentWillReceiveProps(nextProps) {
    // Is there a new image URL?
    if(nextProps.imageSrc !== this.props.imageSrc) {
      this.setImageUrl(nextProps.imageSrc);
    }

    // Has the length unit changed?
    if(nextProps.lengthUnit.id !== this.props.lengthUnit.id) {
      this.updateLayerStyles(nextProps.lengthUnit);
    }

    // Has the length estimate changed?
    if((nextProps.pixelLengthEstimate.mu !== this.props.pixelLengthEstimate.mu) ||
        (nextProps.pixelLengthEstimate.sigma !== this.props.pixelLengthEstimate.sigma))
    {
      this.updateLayerStyles(nextProps.lengthUnit);
    }

    // Drawing scales
    if(nextProps.isDrawingScale !== this.props.isDrawingScale) {
      // We've changed what we're drawing so come what may, we need to
      // remove any current drawing.
      this.removeCurrentDrawing();
      this.startDrawingScale(nextProps.nextScaleLength);
    }

    // Drawing lines
    if(nextProps.isDrawingLine !== this.props.isDrawingLine) {
      // We've changed what we're drawing so come what may, we need to
      // remove any current drawing.
      this.removeCurrentDrawing();
      this.startDrawingLine(nextProps.nextLineLength);
    }

    // Drawing circles
    if(nextProps.isDrawingCircle !== this.props.isDrawingCircle) {
      // We've changed what we're drawing so come what may, we need to
      // remove any current drawing.
      this.removeCurrentDrawing();
      this.startDrawingCircle(nextProps.nextCircleLength);
    }

    updateSourceFromFeatures(this.scaleSource, nextProps.scales, s => {
      let geometry = new ol.geom.LineString([s.startPoint, s.endPoint]);
      let f = new ol.Feature(geometry);
      f.length = s.length;
      return f;
    });

    updateSourceFromFeatures(this.lineSource, nextProps.lines, l => {
      let geometry = new ol.geom.LineString([l.startPoint, l.endPoint]);
      let f = new ol.Feature(geometry);
      return f;
    });

    updateSourceFromFeatures(this.circleSource, nextProps.circles, l => {
      let geometry = new ol.geom.LineString([l.startPoint, l.endPoint]);
      let f = new ol.Feature(geometry);
      return f;
    });
  }

  pointerMove(evt) {
    if(evt.dragging) { return; }
    this.pointerTooltip.setPosition(evt.coordinate);
  }

  setPointerTooltipText(text) {
    if(!text) { this.pointerTooltip.setElement(null); return; }

    let inner = document.createElement('div');
    inner.classList.add('image-editor-tooltip-inner');
    inner.appendChild(document.createTextNode(text));

    let tooltip = document.createElement('div');
    tooltip.classList.add('image-editor-tooltip');
    tooltip.appendChild(inner);

    this.pointerTooltip.setElement(tooltip);
  }

  updateLayerStyles(lengthUnit) {
    this.scaleLayer.setStyle(linearMeasurementStyle(
      Object.assign({}, scaleStyleOpts, {
        lengthUnit: lengthUnit,
        labelFunc: feature => (
          formatLength(feature.length, lengthUnit) + ' ' + lengthUnit.shortName
        ),
      })
    ));

    let lengthMeasureLabelFunc = (feature, s, e) => {
      if(!this.props.pixelLengthEstimate.mu) {
        return '';
      }
      let dx = e[0] - s[0], dy = e[1] - s[1];
      let len = Math.sqrt(dx*dx + dy*dy);
      let measure = measureLength(len, this.props.pixelLengthEstimate);

      // is the error > 0.01 length units?
      if(measure.sigma > 0.01 * this.props.lengthUnit.length) {
        return formatLength(measure.mu, this.props.lengthUnit) +
          ' \u00b1 ' + formatLength(measure.sigma, this.props.lengthUnit) +
          ' ' + this.props.lengthUnit.shortName;
      } else {
        return formatLength(measure.mu, this.props.lengthUnit) +
          ' ' + this.props.lengthUnit.shortName;
      }
    };

    let circleAreaLabelFunc = (feature, s, e) => {
      if(!this.props.pixelLengthEstimate.mu) {
        return '';
      }
      let dx = e[0] - s[0], dy = e[1] - s[1];
      let len = Math.sqrt(dx*dx + dy*dy);
      let area = Math.PI * Math.pow(0.5*len, 2);
      let measure = measureArea(area, this.props.pixelLengthEstimate);

      let { lengthUnit } = this.props;
      let areaUnit = {
        id: lengthUnit.id + '_AREA', length: Math.pow(lengthUnit.length, 2),
        shortName: lengthUnit.shortName + '\u00b2'
      };

      // is the error > 0.01 length units?
      if(measure.sigma > 0.01 * areaUnit.length) {
        return formatLength(measure.mu, areaUnit) +
          ' \u00b1 ' + formatLength(measure.sigma, areaUnit) +
          ' ' + areaUnit.shortName;
      } else {
        return formatLength(measure.mu, areaUnit) + ' ' + areaUnit.shortName;
      }
    };

    this.lineLayer.setStyle(linearMeasurementStyle(
      Object.assign({}, lineStyleOpts, {
        lengthUnit: lengthUnit,
        labelFunc: lengthMeasureLabelFunc,
      })
    ));

    this.circleLayer.setStyle(circularMeasurementStyle(
      Object.assign({}, circleStyleOpts, {
        aboveLabelFunc: lengthMeasureLabelFunc,
        belowLabelFunc: circleAreaLabelFunc,
      })
    ));
  }

  // Set a new image URL
  setImageUrl(imageUrl) {
    if(imageUrl === this.imageUrl) { return; /* nop */ }

    this.imageUrl = imageUrl;
    this.imageElement.src = imageUrl;
  }

  render() {
    return (<div className="image-editor-map" ref="map" />);
  }

  removeCurrentDrawing() {
    if(this.draw && this.map) {
      this.map.removeInteraction(this.draw);
      this.draw = null;
    }
  }

  startDrawingScale(length) {
    // NOP if there's no map
    if(!this.map) { return; }
    this.removeCurrentDrawing();

    // Create a new drawing
    this.draw = new ol.interaction.Draw({
      // source: source,
      type: 'LineString',
      minPoints: 2, maxPoints: 2,
      style: (f, r) => {
        let geometry = f.getGeometry();

        if(geometry.getType() == 'LineString') {
          return this.scaleLayer.getStyle()(f, r);
        }

        if(geometry.getType() == 'Point') {
          return pointerStyles;
        }

        return new ol.style.Style();
      },
    });

    let sketchFeature;
    this.draw.on('drawstart', (event) => {
      sketchFeature = event.feature;
      sketchFeature.length = length;
      this.setPointerTooltipText('Click to finish drawing scale');
    });

    this.draw.on('drawend', () => {
      if(!this.map) { return; }

      let geom;
      if(sketchFeature) { geom = sketchFeature.getGeometry(); }

      if(geom && this.props.onAddScale) {
        let coords = geom.getCoordinates();
        this.props.onAddScale({
          startPoint: coords[0], endPoint: coords[1], length
        });
      }

      this.setPointerTooltipText();
      this.map.removeInteraction(this.draw);
      this.draw = null;
    });

    this.map.addInteraction(this.draw);
    this.setPointerTooltipText('Click to start drawing scale');
  }

  startDrawingLine() {
    // NOP if there's no map
    if(!this.map) { return; }
    this.removeCurrentDrawing();

    // Create a new drawing
    this.draw = new ol.interaction.Draw({
      // source: source,
      type: 'LineString',
      minPoints: 2, maxPoints: 2,
      style: (f, r) => {
        let geometry = f.getGeometry();

        if(geometry.getType() == 'LineString') {
          return this.lineLayer.getStyle()(f,r);
        }

        if(geometry.getType() == 'Point') {
          return pointerStyles;
        }

        return new ol.style.Style();
      },
    });

    let sketchFeature;
    this.draw.on('drawstart', (event) => {
      sketchFeature = event.feature;
      this.setPointerTooltipText('Click to finish drawing line');
    });

    this.draw.on('drawend', () => {
      if(!this.map) { return; }

      let geom;
      if(sketchFeature) { geom = sketchFeature.getGeometry(); }

      if(geom && this.props.onAddLine) {
        let coords = geom.getCoordinates();
        this.props.onAddLine({ startPoint: coords[0], endPoint: coords[1] });
      }

      this.setPointerTooltipText();
      this.map.removeInteraction(this.draw);
      this.draw = null;
    });

    this.map.addInteraction(this.draw);
    this.setPointerTooltipText('Click to start drawing line');
  }

  startDrawingCircle() {
    // NOP if there's no map
    if(!this.map) { return; }
    this.removeCurrentDrawing();

    // Create a new drawing
    this.draw = new ol.interaction.Draw({
      // source: source,
      type: 'LineString',
      minPoints: 2, maxPoints: 2,
      style: (f, r) => {
        let geometry = f.getGeometry();

        if(geometry.getType() == 'LineString') {
          return this.circleLayer.getStyle()(f,r);
        }

        if(geometry.getType() == 'Point') {
          return pointerStyles;
        }

        return new ol.style.Style();
      },
    });

    let sketchFeature;
    this.draw.on('drawstart', (event) => {
      sketchFeature = event.feature;
      this.setPointerTooltipText('Click the opposite point on circle');
    });

    this.draw.on('drawend', () => {
      if(!this.map) { return; }

      let geom;
      if(sketchFeature) { geom = sketchFeature.getGeometry(); }

      if(geom && this.props.onAddCircle) {
        let coords = geom.getCoordinates();
        this.props.onAddCircle({ startPoint: coords[0], endPoint: coords[1] });
      }

      this.setPointerTooltipText();
      this.map.removeInteraction(this.draw);
      this.draw = null;
    });

    this.map.addInteraction(this.draw);
    this.setPointerTooltipText('Click a point on circle');
  }
}

export default ImageEditor;
