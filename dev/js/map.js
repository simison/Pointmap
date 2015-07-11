$.getScript("js/jquery.capitalize.min.js");

window.app = {};
var app = window.app;
app.Drag = function() {

    ol.interaction.Pointer.call(this, {
        handleDownEvent: app.Drag.prototype.handleDownEvent,
        handleDragEvent: app.Drag.prototype.handleDragEvent,
        handleMoveEvent: app.Drag.prototype.handleMoveEvent,
        handleUpEvent: app.Drag.prototype.handleUpEvent
    });
    this.coordinate_ = null;
    cursor_ = 'pointer';
    this.feature_ = null;
    this.previousCursor_ = undefined;

};
ol.inherits(app.Drag, ol.interaction.Pointer);

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


app.Drag.prototype.handleDragEvent = function(evt) {
    var map = evt.map;

    var feature = map.forEachFeatureAtPixel(evt.pixel,
        function(feature, layer) {
            return feature;
        });

    var deltaX = evt.coordinate[0] - this.coordinate_[0];
    var deltaY = evt.coordinate[1] - this.coordinate_[1];

    var geometry =
        (this.feature_.getGeometry());
    geometry.translate(deltaX, deltaY);

    this.coordinate_[0] = evt.coordinate[0];
    this.coordinate_[1] = evt.coordinate[1];
    $('#position_lon').val(evt.coordinate[0]);
    $('#position_lat').val(evt.coordinate[1]);
};


app.Drag.prototype.handleMoveEvent = function(evt) {

    if (this.cursor_) {
        var map = evt.map;
        var feature = map.forEachFeatureAtPixel(evt.pixel,
            function(feature, layer) {

                return feature;

            });

        var element = evt.map.getTargetElement();
        if (feature) {

            flash(evt.feature);
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

app.Drag.prototype.handleUpEvent = function(evt) {

    this.coordinate_ = null;
    this.feature_ = null;
    return false;
};



var points;
var vectorSource;
var json;
var list;
$.when($.ajax({
    url: 'http://128.199.45.65/positions.jsonp',
    dataType: "jsonp",
    //jsonpCallback: 'jotain',
    async: 'true',
})).then(function(data) {
    points = JSON.stringify(data);
    points = points.substring(1);
    points = points.substring(0, points.length - 1);
    vectorSource = new ol.source.Vector({
        features: (new ol.format.GeoJSON()).readFeatures(points)
    });

    function round(value, decimals) {
        return Number(Math.round(value + 'e' + decimals) + 'e-' + decimals);
    }
    list = vectorSource.getFeatures();
    var i = 0;
    var voteArr = [];
    var voteC;
    for (i = 0; i < list.length; i++) {

        voteArr[i] = list[i]["q"]["votes"];

    }



    var max = Math.max.apply(null, voteArr);
    if (max === 0) max++;
    i = 0;
    for (i = 0; i < list.length; i++) {
        var ft = vectorSource.getClosestFeatureToCoordinate(list[i]["q"]["geometry"]["j"]);
        voteC = list[i]["q"]["votes"];

        var radius = round(voteC * (9 / max) + 7, 2);
        var opacity = round(voteC * (0.3 / max) + 0.5, 2);
        var iconStyle = new ol.style.Style({
            image: new ol.style.Circle({
                fill: new ol.style.Fill({
                    color: 'rgba(216, 30, 115,' + opacity + ')'
                }),
                radius: radius
            })
        });
        ft.setStyle(iconStyle);
        ft.setId(ft.get('id'));
    }

    var vectorLayer = new ol.layer.Vector({
        source: vectorSource,
        style: iconStyle
    });

    var projection = new ol.proj.Projection({
        code: 'EPSG:3067',
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

    proj4.defs("EPSG:3067", "+proj=utm +zone=35 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs");
    ol.proj.get('EPSG:3067').setExtent(extent);
    var extent = [-3670733.46, 4601971.85, 642319.78, 9362767.00];
    var attribution = new ol.Attribution({
        html: '<a href="http://www.openstreetmap.org/copyright" style="font-size: 14px;">&copy; OpenStreetMapin tekijät, kartta-aineisto Helsingin kaupunki</a>'
    });
    var rasterLayer = new ol.layer.Tile({
        source: new ol.source.XYZ({
            url: 'http://geoserver.hel.fi/mapproxy/wmts/osm-sm-hq/etrs_tm35fin_hq/{z}/{x}/{y}.png',
            //url: 'http://api.tiles.mapbox.com/v4/vaahtokarkki.c5dcc914/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoidmFhaHRva2Fya2tpIiwiYSI6IjhiNmQxZjNlZDY5NzVkNDBlOWZjYWJmNjE2YzlmNTVjIn0.ks2kzZ0hKBOZT1PQ-KVLGA',
            tilePixelRatio: 2,
            extent: extent,
            attributions: [attribution]

        }),
        
    });

    //var center = ol.proj.transform([24.9311, 60.1698], 'EPSG:4326', 'EPSG:3857');
    var center = [-2172193.974048958, -12743572.109373316];
    var view = new ol.View({
        center: center,
        zoom: 10,
        maxZoom: 14,
        minZoom: 5
    });

    var map = new ol.Map({
        layers: [rasterLayer, vectorLayer],
        target: document.getElementById('map'),
        view: view
    });

    var element = document.getElementById('popup');

    var popup = new ol.Overlay({
        element: element,
        positioning: 'bottom-center',
        stopEvent: false
    });
    map.addOverlay(popup);
    var tmp;
    var feature;
    var iconNull = new ol.style.Style({
        image: new ol.style.Circle({
            fill: new ol.style.Fill({
                color: 'rgba(255,0,0,0)'
            }),
            radius: 0
        })
    });

    function htmlEntities(str) {
        return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }
    var displayFeatureInfo = function(feature) {
        $('div.social').fadeTo(200, 0);
        $('.descWrap').fadeTo(100, 0, function() {
            $('.descName').text(feature.get('name').capitalize());


            desc = htmlEntities(feature.get('description'));
            desc = desc.replace(/(?:\r\n|\r|\n)/g, '<br />');

            $('.descP').html(desc.capitalize());
            $('#date').text(feature.get('date'));
            if (!localStorage.getItem(feature.get('id'))) {
                $('#vote').html('<span id="votes" class="vote"></span><a href="#" id="addVote"><img src="img/up.png" id="voteImg" class="vote" alt="upvote"></a>');
                $('#addVote').click(function() {
                    vote(feature.get('id'), function(votes) {
                        //alert(votes);
                        feature.set('votes', votes);
                    });
                });
            } else {
                $('#vote').html('<span id="votes" class="vote"></span><img src="img/up.png" id="voteImg" class="vote" alt="upvote" style="opacity:.4">');
            }
            if (feature.get('votes') == null) {
                $('#votes').text('0');
            } else {
                $('#votes').text(feature.get('votes'));
            }
            $("#idR").val(feature.get('id'));
            $(".reportName").text(feature.get('name'));
            $('#permalink').attr("data-content", '<a href="http://fillari.info/#id=' + feature.get("id") + '">http://fillari.info/#id=' + feature.get("id") + "</a>");
            $(".lightbox").attr("data-title", feature.get('name'));
            if ($('#descFooter').css("display") == "none") {
                $('#confirm').hide();
            }
            if ($('#confirm').is(":visible")) {
                $('#confirm').fadeTo(200, 0, function() {
                    $('#confirm').hide();
                    $('.social').fadeTo(300, 1);
                    $('#descFooter').fadeTo(300, 1);
                    $('.descWrap').fadeTo(300, 1);
                });
            } else {
                $('#descFooter').show();
                $('.descWrap').fadeTo(100, 1);
            }

        });
        var images = feature.get('images');
        //console.log(images);
        var z;
        var zz = 0;
        var fullres;
        var thumb;
        var imageContainer = "";

        $('#imgWrap').fadeTo(100, 0, function() {
            if (images !== null) {
                for (z = 0; z < images.length; z++) {
                    fullres = images[z];
                    thumb = images[z].replace("original", "thumb");
                    imageContainer += '<a href="' + fullres + '" data-caption="" class="galleryItem"><img class="descImg" src="' + thumb + '"></a><br>';
                    if (z + 1 === images.length) {
                        $('#imgWrap').html(imageContainer);
                        $("img.descImg").bind('load', function() {
                            $("img.descImg").each(function() {
                                zz++;

                                var width = $(this).width();
                                if (width < 30) {
                                    $(this).css("right", 120);
                                } else {
                                    $(this).css("right", width + 35);
                                }

                                if ($("#descFooter").is(":visible") && images.length == zz) $('#imgWrap').fadeTo(200, 1);
                            });
                        });
                    }
                }
                var title = htmlEntities(feature.get('name'));
                $(".galleryItem").attr("data-caption", title);
                baguetteBox.run('.gallery', {
                    // Custom options
                });
            }
        });
    }

    var resetDesc = function() {
        $('.descWrap').hide();
        $('#descFooter').hide();
        $('.descName').text('');
        $('.descP').html('<b>Pyöräteiden epäkohdat kartalla.</b><br><br>Klikkaa kohdetta nähdäksesi lisätietoja. Mitä enemmän kohteella on tykkäyksiä, sitä suurempana piste näkyy kartalla.<br>Aiheettomista pisteistä voit raportoida painamalla kuvauksen alareunasta löytyvää huutomerkkiä.<br><br>Pisteitä kartalla: <span id="amount"></span>kpl');
        $("#amount").text(list.length);
        $('.descWrap').fadeTo(200, 1);
        $('.social').fadeTo(200, 1);
    }

    // display popup on click
    map.on('click', function(evt) {
        var feature = map.forEachFeatureAtPixel(evt.pixel,
            function(feature, layer) {
                return feature;
            });
        if (feature && $('#open').css("display") != "inline") {
            feature.setStyle(feature.getStyle());
            feature.setId(500);
            tmp = feature.getId();
            if ($('#confirm').is(":visible")) {
                $('#confirm').fadeTo(200, 0, function() {
                    $('#confirm').hide();
                    displayFeatureInfo(feature);
                });
            } else {
                displayFeatureInfo(feature);
            }

        } else {
            delete tmp;
            if ($('#descFooter').is(":visible")) {
                resetDesc();
            } else if ($('#confirm').is(":visible")) {
                $('#confirm').fadeTo(200, 0, function() {
                    $('#confirm').hide();
                    resetDesc();
                });
            }

            if ($('#imgWrap').is(":visible")) {
                $('#imgWrap').fadeTo(200, 0, function() {
                    $('#imgWrap').hide();
                });
            }

            if ($('#open').css("display") == "inline") {
                if (vectorSource.getFeatureById(500) !== null) {
                    vectorSource.getFeatureById(500).setStyle(iconNull);
                    vectorSource.removeFeature(vectorSource.getFeatureById(500));
                }
                pointFeature = new ol.Feature(new ol.geom.Point(map.getCoordinateFromPixel(evt.pixel)));
                pointFeature.setId(500);
                pointFeature.setStyle(new ol.style.Style({
                    image: new ol.style.Circle({
                        fill: new ol.style.Fill({
                            color: 'rgba(216, 30, 115,0.7)'
                        }),
                        radius: 13
                    })
                }));
                vectorSource.addFeature(pointFeature);
                tmp = 500;
                $('#position_lon').val(map.getCoordinateFromPixel(evt.pixel)[0]);
                $('#position_lat').val(map.getCoordinateFromPixel(evt.pixel)[1]);
            }

        }
    });

    var featureH;
    var originalRadius;
    var originalFill;
    var b = 0;
    map.on('pointermove', function(e) {

        if (e.dragging) {
            $(element).popover('destroy');
            return;
        }
        var pixel = map.getEventPixel(e.originalEvent);
        var hit = map.hasFeatureAtPixel(pixel);
        map.getTarget().style.cursor = hit ? 'pointer' : '';


        if (hit && $("#add").is(":visible")) {
            if (b == 0) {
                featureH = map.forEachFeatureAtPixel(e.pixel,
                    function(feature, layer) {
                        return feature;
                    });
                originalFill = featureH.getStyle().getImage().getFill()["a"];
                var iconStyleHover = new ol.style.Style({
                    image: new ol.style.Circle({
                        fill: new ol.style.Fill({
                            color: originalFill
                        }),
                        radius: featureH.getStyle().getImage().getRadius() + 5
                    })
                });

                originalRadius = featureH.getStyle().getImage().getRadius();
                featureH.setStyle(iconStyleHover);
            };
            b++;
        }
        if (b !== 0 && !hit) {
            var iconStyleBack = new ol.style.Style({
                image: new ol.style.Circle({
                    fill: new ol.style.Fill({
                        color: originalFill
                    }),
                    radius: originalRadius
                })
            });
            featureH.setStyle(iconStyleBack);
            b = 0;
        }
    });

    var interaction = new app.Drag();
    var pointFeature;

    var select = new ol.interaction.Select();
    map.addInteraction(select);

    $("body").on("click", function(event) {
        if ($(event.target).closest('#add').length) {
            if (vectorSource.getFeatureById(500) !== null) {
                vectorSource.getFeatureById(500).setStyle(iconNull);
                vectorSource.removeFeature(vectorSource.getFeatureById(tmp));
            }
            vectorSource.clear();
            pointFeature = new ol.Feature(new ol.geom.Point(map.getView().getCenter()));
            pointFeature.setId(500);
            pointFeature.setStyle(new ol.style.Style({
                image: new ol.style.Circle({
                    fill: new ol.style.Fill({
                        color: 'rgba(216, 30, 115,0.7)'
                    }),
                    radius: 13
                })
            }));
            vectorSource.addFeature(pointFeature);
            map.addInteraction(interaction);
        } else if ($(event.target).closest('img.add').length) {
            if (vectorSource.getFeatureById(500) !== null) {
                vectorSource.getFeatureById(500).setStyle(iconNull);
                vectorSource.removeFeature(vectorSource.getFeatureById(500));
            }
            vectorSource.clear();
            var jotain = new ol.format.GeoJSON().readFeatures(points);
            vectorSource.addFeatures(jotain);
            var list = vectorSource.getFeatures();
            i = 0;
            for (i = 0; i < list.length; i++) {
                var ft = vectorSource.getClosestFeatureToCoordinate(list[i]["q"]["geometry"]["j"]);
                voteC = list[i]["q"]["votes"];
                var radius = round(voteC * (9 / max) + 7, 2);
                var opacity = round(voteC * (0.3 / max) + 0.5, 2);
                var iconStyle = new ol.style.Style({
                    image: new ol.style.Circle({
                        fill: new ol.style.Fill({
                            color: 'rgba(216, 30, 115,' + opacity + ')'
                        }),
                        radius: radius
                    })
                });
                ft.setStyle(iconStyle);
            }
            map.removeInteraction(interaction);
            delete tmp;

        }
    });

    function resize() {
        var div = $('#map');
        div.height($(window).height());
        map.updateSize();
    }
    resize();
    var cities = [];
    cities["espoo"] = [-2482136.0282985657, -12678584.128667295];
    cities["vantaa"] = [-2072272.6215921727, -12470177.822796773];
    cities["helsinki"] = [-2181672.2951651528, -12761559.658812637];

    function moveMap(place) {
        var pan = ol.animation.pan({
            duration: 1200,
            source: (view.getCenter())
        });
        map.beforeRender(pan);
        view.setCenter(cities[place])
    };

    $('a.nav').click(function() {
        moveMap(this.id);
    });


    function permaLink() {
        displayFeatureInfo(linkedFeature);
    }

    if (window.location.hash !== '') {
        var hash = window.location.hash.replace('#id=', '');
        var parts = hash.split('/');

        var linkedFeature = vectorSource.getFeatureById(parts[0]);
        if (parts.length === 1 && linkedFeature != null) {
            view.setCenter(linkedFeature["q"]["geometry"]["j"]);
            if (descLoaded) {
                displayFeatureInfo(linkedFeature);
            } else {
                setTimeout(function() {
                    permaLink();
                }, 500);
            }

        }
    }
});

var setAmount = function() {
    if (typeof list !== 'undefined') {
        $("#amount").text(list.length);
    } else {
        setTimeout(function() {
            setAmount();
        }, 500);
    }
};