/**
 * Colormaps.js - a general set of utilities for dealing with colors and stuff
 *
 * Author: Yue Zhang
 *
 * */

function ColorScheme(name, minValue, maxValue, minr, maxr, ming, maxg, minb, maxb) {
    this.name = name;
    this.minValue = minValue;
    this.maxValue = maxValue;
    this.minr = minr;
    this.maxr = maxr;
    this.ming = ming;
    this.maxg = maxg;
    this.minb = minb;
    this.maxb = maxb;
}

function Color(r, g, b) {
    this.r = r;
    this.g = g;
    this.b = b;
}

Color.prototype.toString = function() {
    return "rgb("+parseInt(this.r)+","+parseInt(this.g)+","+parseInt(this.b)+")";
}

Color.prototype.toHex = function() {
    var r = parseInt(this.r);
    var g = parseInt(this.g);
    var b = parseInt(this.b);
}

function MultiColorScheme(name, minValue, maxValue, colors) {
    this.name = name;
    this.minValue = minValue;
    this.maxValue = maxValue;
    this.colors = colors;
    //colorStops is the locations of each color on the gradient.
    this.colorStops = [];
    for (var i = 0; i<this.colors.length; i++) {
        this.colorStops = 
            this.colorStops.concat(i*(maxValue-minValue)/(this.colors.length-1));
    }
}

/**
 * Given a value, and the min and max of that value, returns the color that
 * corresponds to that value for the given colorScheme.
 * */
function makeMultiColor(value, min, max, colorScheme) {
    var colors = colorScheme.colors;
    var colorStops = [];
    for (var i = 0; i<colorScheme.colors.length; i++) {
        colorStops = 
            colorStops.concat(min + i*(max - min)/(colors.length-1));
    }
    for (var i = 1; i<colorScheme.colors.length; i++) {
        if (value <= colorStops[i]+0.01 &&  value >= colorStops[i-1]) {
            var cMin = colorStops[i-1];
            var cMax = colorStops[i];
            var r = interpolate(value, cMin, cMax, colors[i-1].r, colors[i].r);
            var g = interpolate(value, cMin, cMax, colors[i-1].g, colors[i].g);
            var b = interpolate(value, cMin, cMax, colors[i-1].b, colors[i].b);
            return "rgb("+parseInt(r)+","+parseInt(g)+","+parseInt(b)+")";
        }
    }
    return "rgb(255,255,255)";
}

function HeatMap(name, values){
    this.name = name;
    this.values = values;
    this.colors = [];
    this.xpos = 0;
    this.ypos = 0;
}

function interpolate(pos1, min1, max1, min2, max2) {
    return (max2-min2)*(pos1-min1)/(max1-min1)+min2;
}

/**
* Given a value and the min and max possible values for that value,
* returns a color that represents the color in the color scheme.
* */
function makeColor(value, min, max, colorScheme) {
    if (colorScheme instanceof MultiColorScheme) {
        return makeMultiColor(value, min, max, colorScheme);
    }
    else {
        var colorR = interpolate(value, min, max,
        colorScheme.minr, colorScheme.maxr);
        var colorG = interpolate(value, min, max,
        colorScheme.ming, colorScheme.maxg);
        var colorB = interpolate(value, min, max,
        colorScheme.minb, colorScheme.maxb);
        //Colors have to be ints
        return "rgb("+parseInt(colorR)+","+parseInt(colorG)+","+
        parseInt(colorB)+")";
    }
}

/**
* Given a heat map without colors
*  and a color scheme, gives the heat map colors.
* */
function makeColors(heatMap, colorScheme) {
    for (var i = 0; i<heatMap.values.length; i++) {
        if (LOGARITHMIC) {
            heatMap.values[i] = Math.log(heatMap.values[i])/Math.log(2);
        }
        var value = heatMap.values[i];
        var color = makeColor(value, colorScheme.minValue, colorScheme.maxValue,
        colorScheme);
        //if the value is not positive, the color is white.
        if (value <= 0) {
            heatMap.colors = heatMap.colors.concat("rgb(255,255,255)");
        }
        else {
            //Colors have to be ints
            heatMap.colors = heatMap.colors.concat(color);
        }
    }
}



/**
* Draws a color map for the given color scheme onto the given canvas.
* */
function drawColorMap(canvas, colorScheme, maxValue, minValue) {
    var context = canvas.getContext('2d');
    context.clearRect(0, 0, canvas.width, canvas.height);
    var width = canvas.width;
    var height = canvas.height;
    var gradient = context.createLinearGradient(0, 0, width, 0);
    if (colorScheme instanceof MultiColorScheme) {
        for (var i = 0; i<colorScheme.colorStops.length; i++) {
            gradient.addColorStop(colorScheme.colorStops[i]/colorScheme.maxValue, 
                colorScheme.colors[i].toString());
        }
    }
    else {
        gradient.addColorStop(0, makeColor(0, 0, width, colorScheme));
        gradient.addColorStop(1, makeColor(width, 0, width, colorScheme));
    }
    context.fillStyle = gradient;
    context.fillRect(0, 0, width, height/2);
    //writing text
    context.fillStyle = "rgb(0,0,0)";
    context.font = "12pt sans-serif";
    var maxString = String(maxValue);
    var minString = String(minValue);
    context.fillText(minString, 0, height/2+20);
    context.fillText(maxString, width-9*maxString.length, height/2+20);
}

//GLOBAL color schemes
//Red is high, green is low
var GREEN_RED_SCHEME = new ColorScheme('redGreen', 0, 1000, 0, 255, 255, 0, 0, 0);
//Red is high, blue is low
var BLUE_RED_SCHEME = new ColorScheme('blueRed', 0, 1000, 0, 255, 0, 0, 255, 0);
//Red is high, yellow is low
var YELLOW_RED_SCHEME = new ColorScheme('yellowRed', 0, 1000, 255, 255, 255, 0, 0, 0);
//Blue is high, white is low
var WHITE_BLUE_SCHEME = new ColorScheme('whiteBlue', 0, 1000, 255, 0, 255, 0, 255, 255);
//Green is high, blue is low
var BLUE_GREEN_SCHEME = new ColorScheme('blueGreen', 0, 1000, 0, 0, 0, 255, 255, 0);
//White, yellow, red, black color scheme
var YELLOW_RED_BLACK_SCHEME = new MultiColorScheme('', 0, 1000, 
    [new Color(255,255,0),
    new Color(255,0,0),
    new Color(0,0,0)]);
var BLUE_WHITE_RED_SCHEME = new MultiColorScheme('', 0, 1000,
        [new Color(255, 0, 0),
        new Color(255, 255, 255),
        new Color(0, 0, 255)]);
var BLUE_GREEN_YELLOW_RED_SCHEME = new MultiColorScheme('', 0, 1000,
    [new Color(0, 0, 255),
    new Color(0, 255, 255),
    new Color(0, 255, 0),
    new Color(255,255,0),
    new Color(255,0,0)]);
//console.log(BLUE_GREEN_YELLOW_RED_SCHEME);

var colorSchemes = {'GREEN_RED_SCHEME':GREEN_RED_SCHEME, 'BLUE_RED_SCHEME':BLUE_RED_SCHEME,
'YELLOW_RED_SCHEME':YELLOW_RED_SCHEME, 'WHITE_BLUE_SCHEME':WHITE_BLUE_SCHEME,
'BLUE_GREEN_SCHEME':BLUE_GREEN_SCHEME,
'YELLOW_RED_BLACK_SCHEME':YELLOW_RED_BLACK_SCHEME,
'BLUE_GREEN_YELLOW_RED_SCHEME':BLUE_GREEN_YELLOW_RED_SCHEME,
'BLUE_WHITE_RED_SCHEME': BLUE_WHITE_RED_SCHEME};
