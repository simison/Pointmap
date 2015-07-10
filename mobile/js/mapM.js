/**
 * Define a namespace for the application.
 */
window.app = {};
var app = window.app;



/**
 * @constructor
 * @extends {ol.interaction.Pointer}
 */
app.Drag = function() {

    ol.interaction.Pointer.call(this, {
        handleDownEvent: app.Drag.prototype.handleDownEvent,
        handleDragEvent: app.Drag.prototype.handleDragEvent,
        handleMoveEvent: app.Drag.prototype.handleMoveEvent,
        handleUpEvent: app.Drag.prototype.handleUpEvent
    });

    /**
     * @type {ol.Pixel}
     * @private
     */
    this.coordinate_ = null;

    /**
     * @type {string|undefined}
     * @private
     */
    this.cursor_ = 'pointer';

    /**
     * @type {ol.Feature}
     * @private
     */
    this.feature_ = null;

    /**
     * @type {string|undefined}
     * @private
     */
    this.previousCursor_ = undefined;

};
ol.inherits(app.Drag, ol.interaction.Pointer);


/**
 * @param {ol.MapBrowserEvent} evt Map browser event.
 * @return {boolean} `true` to start the drag sequence.
 */
app.Drag.prototype.handleDownEvent = function(evt) {
    var map = evt.map;

    var feature = map.forEachFeatureAtPixel(evt.pixel,
        function(feature, layer) {
            return feature;
        });

    if (feature) {
        this.coordinate_ = evt.coordinate;
        this.feature_ = feature;
    }

    return !!feature;
};


/**
 * @param {ol.MapBrowserEvent} evt Map browser event.
 */
app.Drag.prototype.handleDragEvent = function(evt) {
    var map = evt.map;

    var feature = map.forEachFeatureAtPixel(evt.pixel,
        function(feature, layer) {
            return feature;
        });

    var deltaX = evt.coordinate[0] - this.coordinate_[0];
    var deltaY = evt.coordinate[1] - this.coordinate_[1];

    var geometry = /** @type {ol.geom.SimpleGeometry} */
        (this.feature_.getGeometry());
    geometry.translate(deltaX, deltaY);

    this.coordinate_[0] = evt.coordinate[0];
    this.coordinate_[1] = evt.coordinate[1];
    
    $('#position_lon').val(evt.coordinate[0]);
    $('#position_lat').val(evt.coordinate[1]);
};


/**
 * @param {ol.MapBrowserEvent} evt Event.
 */
app.Drag.prototype.handleMoveEvent = function(evt) {
    if (this.cursor_) {
        var map = evt.map;
        var feature = map.forEachFeatureAtPixel(evt.pixel,
            function(feature, layer) {
                return feature;
            });
        var element = evt.map.getTargetElement();
        if (feature) {
            if (element.style.cursor != this.cursor_) {
                this.previousCursor_ = element.style.cursor;
                element.style.cursor = this.cursor_;
            }
        } else if (this.previousCursor_ !== undefined) {
            element.style.cursor = this.previousCursor_;
            this.previousCursor_ = undefined;
        }
    }
};


/**
 * @param {ol.MapBrowserEvent} evt Map browser event.
 * @return {boolean} `false` to stop the drag sequence.
 */
app.Drag.prototype.handleUpEvent = function(evt) {
    this.coordinate_ = null;
    this.feature_ = null;
    return false;
};


var pointFeature = new ol.Feature(new ol.geom.Point([-2181672.2951651528, -12761559.658812637]));
pointFeature.setId(800);
var vectorSource = new ol.source.Vector({});

vectorSource.addFeature(pointFeature);

var iconStyle = new ol.style.Style({
    image: new ol.style.Circle({
        fill: new ol.style.Fill({
            color: 'rgba(216, 30, 115,.7)'
        }),
        radius: 16
    })
});

var iconNull = new ol.style.Style({
        image: new ol.style.Circle({
            fill: new ol.style.Fill({
                color: 'rgba(255,0,0,0)'
            }),
            radius: 0,
            snapToPixel: false
        })
    });

//add the feature vector to the layer vector, and apply a style to whole layer
var vectorLayer = new ol.layer.Vector({
    source: vectorSource,
    style: iconStyle
});


var projection = new ol.proj.Projection({
        code: 'EPSG:3067',
        // The extent is used to determine zoom level 0. Recommended values for a
        // projection's validity extent can be found at http://epsg.io/.
        extent: [-3670733.46, 4601971.85, 642319.78, 9362767.00],
        units: 'm'
    });
    ol.proj.addProjection(projection);

    ol.proj.addCoordinateTransforms('EPSG:4326', projection,
        function(coordinate) {
            return [
                WGStoCHy(coordinate[1], coordinate[0]),
                WGStoCHx(coordinate[1], coordinate[0])
            ];
        },
        function(coordinate) {
            return [
                CHtoWGSlng(coordinate[0], coordinate[1]),
                CHtoWGSlat(coordinate[0], coordinate[1])
            ];
        });


    var extent = [-3670733.46, 4601971.85, 642319.78, 9362767.00];

    //Map layer
    var rasterLayer = new ol.layer.Tile({
//        source: new ol.source.MapQuest({
//            layer: "osm"
//        })
         
        source: new ol.source.XYZ({
        //projection: new ol.proj.Projection({code: 'EPSG:3067'}),
            url: 'http://geoserver.hel.fi/mapproxy/wmts/osm-sm-hq/etrs_tm35fin_hq/{z}/{x}/{y}.png',
            tilePixelRatio: 2,
            extent: extent
      
        })
    });

    var view = new ol.View({
        center: [-2181672.2951651528, -12761559.658812637],
        zoom: 11,
        maxZoom: 14,
        minZoom: 4
    });



//Create map
var map = new ol.Map({
    interactions: ol.interaction.defaults().extend([new app.Drag()]),
    layers: [rasterLayer, vectorLayer],
    target: document.getElementById('map'),
    view: view
});

map.on('click', function(evt) {
    vectorSource.getFeatureById(800).setStyle(iconNull);
    vectorSource.removeFeature(vectorSource.getFeatureById(800));
    pointFeature = new ol.Feature(new ol.geom.Point(map.getCoordinateFromPixel(evt.pixel)));
    pointFeature.setId(800);
    pointFeature.setStyle(iconStyle)
    vectorSource.addFeature(pointFeature);
    tmp = 800;
    $('#position_lon').val(map.getCoordinateFromPixel(evt.pixel)[0]);
    $('#position_lat').val(map.getCoordinateFromPixel(evt.pixel)[1]);
});

function resize() {
        var div = $('#map');
        div.height($(window).height());
        div.width($(window).width());
        map.updateSize();
}
