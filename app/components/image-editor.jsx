import React from 'react';
import ol from 'openlayers';

import { imageUrlFromRecord } from '../pas-api.js';

require('style!css!./image-editor.css');

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
      layers: [ this.bgLayer, this.imageLayer ],
    });
  }

  componentWillReceiveProps(nextProps) {
    // Has the record gone away?
    if(!nextProps.record && this.props.record) {
      setImageUrl(null);
      return;
    }

    // Is there a new image URL?
    if(nextProps.record) {
      var nextImageUrl = imageUrlFromRecord(nextProps.record);
      if(nextImageUrl !== this.imageUrl) {
        this.setImageUrl(nextImageUrl);
      }
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
}

export default ImageEditor;
