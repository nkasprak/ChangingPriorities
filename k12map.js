// JavaScript Document

var k12map = (function() {
	
	var m = (function() {
		
		var hideDC = true;
		var initialized = false;
		var initialWidth;
		var initialize = function() {
			
			function makeState(state) {
				var pathString = map_paths[state].path;
				
				
				m.stateObjs[state] = m.paper.path(pathString);
				m.stateObjs[state].transform(m.transformString);
				m.stateObjs[state].attr({
					cursor: "pointer",
					fill: "#999",
					"stroke-width":0.5
				});
				
				
				m.stateObjs[state].hover(function(e) {
					if (m.stateCodes) var state = m.stateCodes[this.id];
					stateEnter(state);
				},function(e) {
					if (m.stateCodes) var state = m.stateCodes[this.id];
					stateLeave(state);
				});
				
				//store raphael IDs of each state
				m.stateIDs[state] = m.stateObjs[state].node.raphaelid;
				//and for reverse lookup
				m.stateCodes[m.stateObjs[state].node.raphaelid] = state;
				
			};
			
			function stateEnter(state) {
				if (initialized) {
					clearTimeout(m.fadeTimer);
					if (state != m.currentStatePopup) {
						m.currentStatePopup = state;
						m.popupTimer = setTimeout(function() {
							m.popupState(m.currentStatePopup);
						},50);
					}
				}
			};
			
			function stateLeave(state) {
				if (initialized) {
					clearTimeout(m.fadeTimer);
					m.fadeTimer = setTimeout(m.fadeoutPopups,100);
					
				}
			}
			
			function makeText(coords) {
				if (text_configs.offset[state]) {
					coords[0] += text_configs.offset[state][0];
					coords[1] += text_configs.offset[state][1];
				}
			
				m.stateLabelObjs[state] = m.paper.text(coords[0],coords[1],state);
				m.stateLabelObjs[state].attr({
					"font-size":18,
					"font-family":$("#" + m.mapDivID).css("font-family")
				});
				
				m.stateLabelObjs[state].hover(function(e) {
					var state = $(this[0]).children("tspan").html();
					stateEnter(state);
				},function(e) {
					var state = $(this[0]).children("tspan").html();
					stateLeave(state);
				});
				
				//store raphael IDs of each label
				m.stateTextIDs[state] = m.stateLabelObjs[state].node.raphaelid;
				
			}
			
			function setSelectors() {
				for (var dataSet in m.data.theData) {
					if (!m.data.theData[dataSet].hideFromMap) {
						$("#dataSet").append("<option value=\"" + dataSet + "\">" + m.data.meta[dataSet].shortName + "</option>");
					}
				}
			}
			setSelectors();
			
			m.paper = Raphael(m.mapDivID,m.width,m.height);
			
			for (var state in map_paths) {
				if (!(hideDC == true && state == "DC")) { 
					makeState(state);
					if (text_configs.hide[state]) {} else {
						makeText(m.utilities.pathCenter(m.stateObjs[state]));
					}
				}
			}
			
			m.activeDataset = "Inc_Rate";
			
			
			
			
			/*m.activeYear = 1978;*/
			
			var makeLegend = function() {
				var height = $("#legend").height();
				var width = $("#legend").width();
				m.legendPaper = Raphael("legend",width,height);
				m.legend = m.legendPaper.rect(0,0,width,height*.5);
				m.legend.attr({"stroke":"#aaa","stroke-width":0.8});
				m.legendLeftText = m.legendPaper.text(0,height*.7,"").attr({'text-anchor':'start'});
				m.legendRightText = m.legendPaper.text(width,height*.7,"").attr({'text-anchor':'end'});
				m.legendMiddleText = m.legendPaper.text(width*.5,height*.5,"0%");
				
				
				var attrs = {
					"font-size":18,
					"font-family":$("#" + m.mapDivID).css("font-family")
				};
				m.legendLeftText.attr(attrs);
				m.legendRightText.attr(attrs);
				m.legendMiddleText.attr(attrs);
				
			}
			makeLegend();
			
			function slideChangeFunc(event, ui) {
				var year = ui.value;
				m.activeYear = year;
				m.calcStateColors(m.activeDataset,m.activeYear);
				m.applyStateColors(0);
				$("#yearSlider .ui-slider-handle").html("<span>" + year + "</span>");
			}
			$("#yearSlider").slider({
				min: 1978,
				max: 2013,
				value: 1978,
				slide: slideChangeFunc
			});
			
			slideChangeFunc(null,{value:1978});
			
			
			m.calcStateColors("Inc_Rate", m.activeYear);
			
			m.applyStateColors();
			
			$("#map").on("mouseleave","div.popup",function() {
				stateLeave("none");
			});
			
			$("#map").on("mouseenter","div.popup",function() {
				clearTimeout(m.fadeTimer);
			});
			
			$("#map").on("mousemove",function(e) {
				var tag = $(e.target).prop("tagName");
				if (tag == "svg") {
					clearTimeout(m.fadeTimer);
					clearTimeout(m.popupTimer);
					m.fadeoutPopups();
				}
				if (initialized) {
					if ($(e.target).prop("tagName") == "path") {
						m.mousePos.x = e.offsetX;
						m.mousePos.y = e.offsetY;
					}
				}
				
			});
			
			
			
			$("select#dataSet").trigger("change");
			
			
			
			
			function drawSliderLines() {
				for (var year=1978;year<=2013;year++) {
					var percent = Math.round((year-1978)/(2013-1978)*1000)/10;
					var style = "left:" + percent + "%";
					if (year%5==0) {
						style += ";height:10px;top:-5px;"
					} 
					if ($.inArray(year,[1978,1990,2000,2010,2013]) >= 0) {
						$("#yearSlider .hLine").append("<div class=\"yLabel\" style=\"left:" + percent + "%\"><div>" + year + "</div></div>");
					}
					
					$("#yearSlider .hLine").append("<div class=\"vLine\" style=\"" + style + "\">");
				}
			}
			drawSliderLines();
			
		
			initialized = true;
		}
		
		return {
			
			mapDivID: "map",
			
			resizeMap : function() {
				var width;
				width = $("#" + m.mapDivID).width();
				m.height = width*0.8;
				m.width = width;
				if (!initialized) initialWidth = m.width;
				$("#" + m.mapDivID).css("height",m.height);
				
				m.path_scale = Math.round(m.width * 100 / 940) / 100;
				m.text_scale = Math.round(m.width/initialWidth * 100)/100;
			
				m.transformString = "s" + m.path_scale + "," + m.path_scale + ",0,0";
				m.textTransformString = "s" + m.text_scale + "," + m.text_scale + ",0,0";
				
				
				
				if (initialized == true) m.applyNewTransform();
			},
			
			mousePos: {x: 0, y:0},
			
			dataScale : "global", //set to "local" to rescale when switching data
			
			activeDataset: 0,
			
			highlightedStates: [],
			
			applyNewTransform: function() {
				var state;
				for (state in map_paths) {
					if (m.stateObjs[state]) m.stateObjs[state].transform(m.transformString);
					if (m.stateLabelObjs[state]) m.stateLabelObjs[state].transform(m.textTransformString);
				}
				m.legend.attr({"x":m.width*.1,"y":m.height*.9,width:m.width*.8,height:m.height*0.035});
				m.legendLeftText.transform(m.textTransformString);
				m.legendRightText.transform(m.textTransformString);
				m.legendMiddleText.transform(m.textTransformString);
			},
			
			pageLoadFunction : function() {
				m.resizeMap();
				$(window).resize(m.resizeMap);
				initialize();
			},
			
			setFadeoutTimer: function() {
				clearTimeout(m.fadeTimer);
				m.fadeTimer = setTimeout(function() {
					m.fadeoutPopups();
				},3000);
			},
			
			fadeoutPopups : function() {
				$("#map .popup").fadeOut(200,null,function() {
					$(this).remove();	
				});
				m.currentStatePopup = "none";
				for (var i = 0;i<m.highlightedStates.length;i++) {
					var toAnimate = {};
					var state = m.highlightedStates[i];
					toAnimate[state] = m.stateColors[state];
					m.animateStateColor(toAnimate,200);
				};
				m.highlightedStates = [];
			},
						
			currentStatePopup : "none",
			
			popupState: function(state) {
				if (state != "none") {
					var coords = [m.mousePos.x,m.mousePos.y];
					var popup = $("<div class=\"popup\" style=\"display:none\">");
					m.fadeoutPopups();
					popup.html(m.popupTemplate(state));
					if (coords[1] < m.height/2) {
						popup.css("top",coords[1]);
					} else {
						popup.css("bottom",m.height - coords[1]);
					}
					if (coords[0] < m.width/2) {
						popup.css("left",coords[0]);
					} else {
						popup.css("right",m.width - coords[0]);
					}
					$("#map").append(popup);
					popup.fadeIn(200);
					m.setFadeoutTimer();
					
					var toAnimate = {};
					toAnimate[state] = m.colorConfig.hoverColor;
					m.animateStateColor(toAnimate,200);
					m.highlightedStates.push(state);
					
				}
			},
			
			popupTemplate: function(state) {
				
				var formatter, year;
				
				if (typeof(m.data.theData[m.activeDataset].data[state]) == "undefined") return "No data";
				var htmlString = "";
				
				htmlString += "<h4>" + m.data.stateNames[state] + "</h4>";
				htmlString += "<ul>";
				for (var dataSet in m.data.meta) {
					year = m.activeYear - m.data.theData[dataSet].startYear;
					formatter = m.data.meta[dataSet].formatter;
					if (typeof(m.data.theData[dataSet].data[state][year]) != "undefined") {
						htmlString += "<li>" + m.data.meta[dataSet].shortName;
						htmlString += ": ";
						htmlString += formatter(m.data.theData[dataSet].data[state][year]);
						htmlString += "</li>";	
					}
				}
				htmlString += "</ul>";
				return htmlString;
			},
			
			stateObjs: {},
			
			stateLabelObjs: {},
			
			stateIDs: {},
			
			stateTextIDs: {},
			
			stateCodes: {},
			
			utilities: {
				pathCenter: function(p) {
					var box,x,y 
					box = p.getBBox(); 
					x = Math.floor(box.x + box.width/2.0); 
					y = Math.floor(box.y + box.height/2.0);
					return [x,y];
				}
			},
			resetYearSelect : function(dIndex) {
				$("select#yearSelect").html("");
				for (var i = 0;i<m.data.theData[dIndex].data["CA"].length;i++) {
					var year = i + m.data.theData[dIndex].startYear;
					$("select#yearSelect").append("<option value=\"" + year + "\">" + year + "</option>");
				}
			}
		}
	}());
	
	return m;
}());

$(document).ready(function() {
	k12_floader.documentReady = true;
	if (k12_floader.fontsLoaded && k12_floader.documentReady) {
		k12map.pageLoadFunction();		
	}	
});
