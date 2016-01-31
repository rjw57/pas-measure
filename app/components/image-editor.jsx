import React from 'react';
import { connect } from 'react-redux'
import ol from 'openlayers';

import { imageUrlFromRecord } from '../pas-api.js';

import { formatLength } from '../utils.js';
import { linearMeasurementStyle } from '../map-utils.js';

import {
  startedDrawing, finishedDrawing, updatedDrawing,
  SCALE, addScale
} from '../actions.js';

require('style!css!./image-editor.css');

function filterState(state) {
  let { currentlyDrawing, features } = state;
  return { currentlyDrawing, features };
}

const scaleStyleOpts = {
  innerColor: '#ffcc33',
};

class ImageEditor extends React.Component {
  constructor(props) {
    super(props);

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
      zIndex: -2000,
      source: new ol.source.ImageCanvas({
        canvasFunction(extent, resolution, pxRato, imSize, proj) {
          var w = imSize[0], h = imSize[1];
          var canvasElem = document.createElement('canvas');
          canvasElem.width = w; canvasElem.height = h;
          var ctx = canvasElem.getContext('2d');
          ctx.fillStyle = '#bbb';
          ctx.fillRect(0, 0, w, h);
          return canvasElem;
        },
      }),
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
    // Has the record gone away?
    if(!nextProps.record && this.props.record) {
      setImageUrl(null);
      return;
    }

    // Has the length unit changed?
    if(nextProps.lengthUnit.id !== this.props.lengthUnit.id) {
      // Update any sketch feature
      if(this.sketchFeature) { this.sketchFeature.unit = nextProps.lengthUnit; }

      this.scaleLayer.setStyle(linearMeasurementStyle(
        Object.assign(scaleStyleOpts, { lengthUnit: nextProps.lengthUnit })
      ));
    }

    // Is there a new image URL?
    if(nextProps.record) {
      var nextImageUrl = imageUrlFromRecord(nextProps.record);
      if(nextImageUrl !== this.imageUrl) {
        this.setImageUrl(nextImageUrl);
      }
    }

    // Drawing
    if(nextProps.currentlyDrawing.type !== this.props.currentlyDrawing.type) {
      // We've changed what we're drawing so come what may, we need to
      // remove any current drawing.
      this.removeCurrentDrawing();

      let drawProps = nextProps.currentlyDrawing.properties;

      // What are we drawing?
      switch(nextProps.currentlyDrawing.type) {
        case SCALE:
          this.startDrawingScale(drawProps.worldLength);
          break;
      }
    }

    // Scales
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
      /*
      sketchFeature.on('change', () => {
        this.props.dispatch(updatedDrawing({
          type: SCALE, geometry: sketchFeature.getGeometry(),
          properties: { worldLength },
        }));
      });
      */
    });

    this.draw.on('drawend', () => {
      if(!this.map) { return; }

      let geom;
      if(this.sketchFeature) { geom = this.sketchFeature.getGeometry(); }
      this.props.dispatch(finishedDrawing({
        type: SCALE, geometry: geom, properties: { worldLength },
      }));

      if(geom) {
        let coords = geom.getCoordinates();
        this.props.dispatch(addScale(coords[0], coords[1], worldLength));
      }

      this.map.removeInteraction(this.draw);
      this.draw = null;
      this.sketchFeature = null;
    });

    this.map.addInteraction(this.draw);
    this.props.dispatch(startedDrawing({
      type: SCALE, geometry: null, properties: { worldLength },
    }));
  }
}

ImageEditor = connect(filterState)(ImageEditor);

export default ImageEditor;
