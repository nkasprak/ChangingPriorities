// JavaScript Document

(function(m) {

	m.colorConfig = {
		highColor : "#b9292f",
		zeroColor : "#ffffff",
		lowColor  : "#fff0d3",
		hoverColor:	"#f8c55b"
	};
	
	m.hexToRGB = function (hexString) {
		var r = parseInt(hexString.substr(1, 2), 16);
		var g = parseInt(hexString.substr(3, 2), 16);
		var b = parseInt(hexString.substr(5, 2), 16);
		return [r, g, b];
	};

	m.RGBToHex = function (rgbArray) {
		function pad(num, size) {
			var s = "0" + num;
			return s.substr(s.length - size);
		}
		return "#" + pad(rgbArray[0].toString(16), 2) + pad(rgbArray[1].toString(16), 2) + pad(rgbArray[2].toString(16), 2);
	};
	
	m.stateColors = {};
	
	m.calcStateColors = function(dataID,dataYear) {
		var scale, state, dataPoint, dMax, dMin, calcColor, highRGB, lowRGB, zeroRGB, spansZero, dataIndex;
		
		highRGB = m.hexToRGB(m.colorConfig.highColor);
		zeroRGB = m.hexToRGB(m.colorConfig.zeroColor);
		lowRGB = m.hexToRGB(m.colorConfig.lowColor);
		
		calcColor = function(cScale) {
			var rgb = [];
			var rgbVal;
			for (var i=0;i<3;i++) {
				if (spansZero) {
					if (cScale < 0) {
						rgbVal = (0-cScale)*(zeroRGB[i] - lowRGB[i]) + lowRGB[i];
					} else {
						rgbVal = cScale*(highRGB[i] - zeroRGB[i]) + zeroRGB[i];
					}
				} else {
					rgbVal = cScale*(highRGB[i] - lowRGB[i]) + lowRGB[i];
				}
				rgb[i] = Math.round(rgbVal);
			}
			return m.RGBToHex(rgb);
		};
		
		dataIndex = dataYear - m.data.theData[dataID].startYear;
		
		dMax = m.data.meta[dataID].dataMax[dataIndex];
		dMin = m.data.meta[dataID].dataMin[dataIndex];
		
		spansZero = (dMax > 0 && dMin < 0);
		
		m.gradientString = "0-" + m.colorConfig.lowColor + "-";
		
		m.middleTextPos = "off";
		
		if (spansZero) {
			var zeroPercent = Math.round((-dMin)/(dMax - dMin)*100);
			m.gradientString += m.colorConfig.zeroColor + ":" + zeroPercent + "-";
			m.middleTextPos = zeroPercent;
		}
		m.gradientString += m.colorConfig.highColor;
		
	
		
		for (state in m.data.theData[dataID].data) {
			dataPoint = m.data.theData[dataID].data[state][dataIndex];
			
			if (spansZero) {
				//Data has positive and negative values - use a zero color
				if (dataPoint < 0) scale = 0-(dataPoint - dMin)/(0 - dMin);
				else scale = (dataPoint - 0)/(dMax - 0);
			} else {
				//Data is entirely positive or negative - don't use special zero color
				scale = (dataPoint - dMin)/(dMax - dMin); 
			}
			
			m.stateColors[state] = calcColor(scale); 
		}
	};
	
	m.animateStateColor = function(newColors, duration) {
		var startColors = {};
		for (state in newColors) {
			if (m.stateObjs[state]) startColors[state] = m.hexToRGB(m.stateObjs[state].attr("fill"));
		};
		var tracker = 0;
		var r = setInterval(function() {
			if (tracker > duration) {
				clearInterval(r);
				return false;
			}
			var scale = tracker/duration;
			$.each(newColors, function(state,color) {
				if (state == "") return false;
				rgbColor = m.hexToRGB(color);
				var frameColor = [0,0,0];
				for (var i = 0;i<3;i++) {
					frameColor[i] = Math.round((rgbColor[i] - startColors[state][i])*scale + startColors[state][i]);
				}
				m.stateObjs[state].attr("fill",m.RGBToHex(frameColor))
			});
			tracker += 10;
		},10);
	};
	
	m.applyStateColors = function(duration) {
		var formatter = m.data.meta[m.activeDataset].formatter;
		if (m.data.meta[m.activeDataset].legendFormatter) formatter = m.data.meta[m.activeDataset].legendFormatter;
		if (typeof(duration)=="undefined") duration = 0;
		if (duration > 0) toAnimate = {};
		function brightness(hexcolor) {
			var color = m.hexToRGB(hexcolor);
			return color[0] + color[1] + color[2];
		};
		m.legend.attr({"fill":m.gradientString});	
		if (m.middleTextPos == "off") {
			m.legendMiddleText.attr("text","");
		} else {
			m.legendMiddleText.attr({"text":"0%","x":Math.round((m.middleTextPos/100)*(m.width*.8)+m.width*.1)});	
		}
		var year = m.activeYear - m.data.theData[m.activeDataset].startYear;
		m.legendLeftText.attr({"text":formatter(m.data.meta[m.activeDataset].dataMin[year])});
		m.legendRightText.attr({"text":formatter(m.data.meta[m.activeDataset].dataMax[year])});
		if (m.data.meta[m.activeDataset].legendLabel) m.legendLabel.attr({"text":m.data.meta[m.activeDataset].legendLabel});
		for (state in m.stateColors) {
			if (m.stateObjs[state]) {
				if (duration == 0) m.stateObjs[state].attr("fill",m.stateColors[state]);
				else toAnimate[state] = m.stateColors[state];
				if (m.stateLabelObjs[state]) {
					if (brightness(m.stateColors[state]) < 200) {
						m.stateLabelObjs[state].attr("fill","#ffffff");	
					} else {
						m.stateLabelObjs[state].attr("fill","#000000");	
					}
				}
			}
		}
		if (duration>0) m.animateStateColor(toAnimate,duration);
	};
	
	
	
})(prisonMap);
