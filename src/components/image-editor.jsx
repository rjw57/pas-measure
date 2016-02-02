import React from 'react';
import { connect } from 'react-redux'
import ol from 'openlayers';

import { formatLength } from '../utils.js';
import {
  linearMeasurementStyle, createNeutralBackgroundSource
} from '../map-utils.js';

require('style!css!./image-editor.css');

const scaleStyleOpts = {
  innerColor: '#ffcc33',
};

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

    // A layer for rendering a neutral background
    this.bgLayer = new ol.layer.Image({
      zIndex: -2000, source: createNeutralBackgroundSource()
    });

    // Scales
    this.scaleSource = new ol.source.Vector();
    this.scaleLayer = new ol.layer.Vector({
      source: this.scaleSource, zIndex: 100,
      style: linearMeasurementStyle(
        Object.assign(scaleStyleOpts, { lengthUnit: this.props.lengthUnit })
      ),
    });

    // The current draw interaction and sketch feature
    this.draw = null;
    this.sketchFeature = null;

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
  }

  componentDidMount() {
    // Create openlayers map
    this.map = new ol.Map({
      target: this.refs.map,
      controls: [],
      view: this.view,
      layers: [ this.bgLayer, this.imageLayer, this.scaleLayer ],
    });
  }

  componentWillReceiveProps(nextProps) {
    // Is there a new image URL?
    if(nextProps.imageSrc !== this.props.imageSrc) {
      this.setImageUrl(nextProps.imageSrc);
    }

    // Has the length unit changed?
    if(nextProps.lengthUnit.id !== this.props.lengthUnit.id) {
      this.scaleLayer.setStyle(linearMeasurementStyle(
        Object.assign(scaleStyleOpts, { lengthUnit: nextProps.lengthUnit })
      ));
    }

    // Drawing scales
    if(nextProps.isDrawingScale !== this.props.isDrawingScale) {
      // We've changed what we're drawing so come what may, we need to
      // remove any current drawing.
      this.removeCurrentDrawing();
      this.startDrawingScale(nextProps.nextScaleLength);
    }

    ////// Scale features //////

    // Form a set of current scale ids and next scale ids.
    let scaleIds = new Set(this.props.features.scales.map(s => s.id));
    let nextScaleIds = new Set(nextProps.features.scales.map(s => s.id));

    // Set of scale ids which have been inserted
    let insertedScaleIds = new Set(
      [...nextScaleIds].filter(id => !scaleIds.has(id)));

    // Set of scale ids which have been deleted
    let removedScaleIds = new Set(
      [...scaleIds].filter(id => !nextScaleIds.has(id)));

    // Remove any scales we need to
    removedScaleIds.forEach(id => {
      let f = this.scaleSource.getFeatureById(id);
      if(f) { this.scaleSource.removeFeature(f); }
    });

    // Now insert any new scales
    if(insertedScaleIds.size > 0) {
      nextProps.features.scales.forEach(s => {
        if(!insertedScaleIds.has(s.id)) { return; }
        let geometry = new ol.geom.LineString([s.startPoint, s.endPoint]);
        let f = new ol.Feature(geometry);
        f.length = s.length;
        f.setId(s.id);
        this.scaleSource.addFeature(f);
      });
    }
  }

  // Set a new image URL
  setImageUrl(imageUrl) {
    if(imageUrl === this.imageUrl) { return; /* nop */ }

    this.imageUrl = imageUrl;
    this.imageElement.src = imageUrl;
  }

  render() {
    return (
      <div className="image-editor-map" ref="map" />
    );
  }

  removeCurrentDrawing() {
    if(this.draw && this.map) {
      this.map.removeInteraction(this.draw);
      this.draw = null;
    }
  }

  startDrawingScale(worldLength) {
    // NOP if there's no map
    if(!this.map) { return; }
    this.removeCurrentDrawing();

    let pointerStyles = [
      new ol.style.Style({
        image: new ol.style.Circle({
          radius: 10,
          stroke: new ol.style.Stroke({
            color: 'rgba(0, 0, 0, 0.7)'
          }),
          fill: new ol.style.Fill({
            color: 'rgba(255, 255, 255, 0.2)'
          })
        }),
        text: new ol.style.Text({
          text: 'foo',
        }),
      }),
    ];

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

    this.draw.on('drawstart', (event) => {
      this.sketchFeature = event.feature;
      this.sketchFeature.length = worldLength;
    });

    this.draw.on('drawend', () => {
      if(!this.map) { return; }

      let geom;
      if(this.sketchFeature) { geom = this.sketchFeature.getGeometry(); }

      if(geom && this.props.onAddScale) {
        let coords = geom.getCoordinates();
        this.props.onAddScale({
          startPoint: coords[0], endPoint: coords[1], length: worldLength
        });
      }

      this.map.removeInteraction(this.draw);
      this.draw = null;
      this.sketchFeature = null;
    });

    this.map.addInteraction(this.draw);
  }
}

export default ImageEditor;
