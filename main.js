// JavaScript Document

var prisonMap = (function() {
	
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
				
				var stateClick = function(e) {
					$("#factStatePicker").val(state);
					$("#factStatePicker").trigger("change");	
				}
				
				m.stateObjs[state].click(stateClick);
				m.stateObjs[state].touchstart(stateClick);
				
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
				
				m.stateLabelObjs[state].click(function(e) {
					var state = $(this[0]).children("tspan").text();
					$("#factStatePicker").val(state);
					$("#factStatePicker").trigger("change");
				});
				
				m.stateLabelObjs[state].hover(function(e) {
					var state = $(this[0]).children("tspan").text();
					stateEnter(state);
				},function(e) {
					var state = $(this[0]).children("tspan").text();
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
			
			$("#map").on("click","div.popup",function() {
				if (m.highlightedStates.length>0) {
					var state = m.highlightedStates[0];
					$("#factStatePicker").val(state);
					$("#factStatePicker").trigger("change");
				}
			});
			
			$("#map").on("mousemove touchstart",function(e) {
				var tag = $(e.target).prop("tagName");
				if (tag == "svg") {
					clearTimeout(m.fadeTimer);
					clearTimeout(m.popupTimer);
					m.fadeoutPopups();
				}
				if (initialized) {
					if ($(e.target).prop("tagName") == "path") {
						if (e.originalEvent.touches) {
							m.mousePos.x = e.originalEvent.touches[0].pageX - $("#map").offset().left;
							m.mousePos.y = e.originalEvent.touches[0].pageY - $("#map").offset().top;
						} else {
							m.mousePos.x = e.pageX - $("#map").offset().left;
							m.mousePos.y = e.pageY - $("#map").offset().top;
						}
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
			
			m.makeCharts("Total");
			
			(function() {
				var option;
				$("#factStatePicker").append("<option value=\"Total\">U.S. Total</option>");
				for (var state in m.data.stateNames) {
					option = $("<option value=\"" + state + "\">" + m.data.stateNames[state] + "</option>");
					$("#factStatePicker").append(option);
				}
				
			})();
			
			$("#factStatePicker").change(function() {
				var state = $(this).val();
				m.makeCharts(state);
				var peakInc = Math.max.apply(Math,m.data.theData["Inc_Total"].data[state]);
				var peakSpend = Math.max.apply(Math,m.data.theData["Spend_Total"].data[state]);
				var peakIncIndex = $.inArray(peakInc,m.data.theData["Inc_Total"].data[state]);
				var peakIncYear = peakIncIndex + m.data.theData["Inc_Total"].startYear;
				var peakSpendIndex = $.inArray(peakSpend,m.data.theData["Spend_Total"].data[state]);
				var peakSpendYear = peakSpendIndex + m.data.theData["Spend_Total"].startYear;
				
				$("#peakIncYear").html(Math.round(peakIncYear));
				$("#peakInc").html(m.utilities.commaSeparateNumber(peakInc));
				$("#peakIncRate").html(m.data.meta["Inc_Rate"].formatter(m.data.theData["Inc_Rate"].data[state][peakIncIndex]));
				$("#peakSpendYear").html(peakSpendYear);
				$("#peakSpend").html(m.data.meta["Spend_Total"].formatter(peakSpend));
			
			});
			
			$("span.embedDomain").html(document.URL);
			$(".embedLink").click(function() {
				if ($("div.embedCode").is(":visible")) {
					$("div.embedCode").fadeOut(200);
				} else {
					$("div.embedCode").fadeIn(200);	
				}
			});
			
			$("#factStatePicker").trigger("change");
			$("#wrapper").css("visibility","visible");
			
			initialized = true;
		}
		
		return {
			
			mapDivID: "map",
			
			resizeMap : function() {
				var width;
				width = $("#" + m.mapDivID).width();
				m.height = width*(5/8);
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
			},
			
			makeCharts: function(selected_state) {
				function makeFlotData(dIndex) {
					var data = [];
					var baseData = m.data.theData[dIndex].data[selected_state];
					var startYear = m.data.theData[dIndex].startYear;
					for (var i = 0;i<baseData.length;i++) {
						if (!(baseData[i] == null || baseData[i] == 0)) data.push([i+startYear,baseData[i]]);	
					}
					return [{data: data, shadowSize:0, color:"#0081a4"}];
				}
				
				$("#charts span.state").html(m.data.stateNames[selected_state]);
				
				var initialLeftData = makeFlotData("Inc_Total");
				var initialRightData = makeFlotData("Spend_Total");
				var yearTicks = function(year) {
					var twoDigitYear = year%100;
					twoDigitYear = twoDigitYear + "";
					if (twoDigitYear.length<2) twoDigitYear = "0" + twoDigitYear;
					return "'" + twoDigitYear;
				}
				
				var chartOptions = function(tickFormatter) {
					this.xaxis = {
						show:true,
						axisMargin:0,
						labelWidth:80,
						font: {
							size:16,
							color:"aaa"	
						},
						tickLength:5,
						tickFormatter: yearTicks
					};
					this.yaxes = [
						{	
							show:true,
							axisMargin:0,
							labelHeight:30,
							min:0,
							font: {
								size:16	,
								color:"aaa"	
							},
							tickFormatter: tickFormatter
						}
					];
					this.grid = {borderWidth:0,hoverable:true};
				};
				
				var leftChartOptions = new chartOptions((function(val) {
					return m.utilities.commaSeparateNumber(Math.round(val));
				}));
				
				var rightChartOptions = new chartOptions((function(val) {
					if (val==0) return "$0";
					if (val>=1000) {
						return "$" + Math.round(val/10)/100 + "B";
					} else {
						return "$" + Math.round(val) + "M";	
					}
				}));
				
				m.leftPlot = $.plot("#incarcerationGraphArea .chartCon",initialLeftData,leftChartOptions);
				m.rightPlot = $.plot("#spendingGraphArea .chartCon",initialRightData,rightChartOptions);
				
				$("<div id='flotTooltip'></div>").appendTo("body");
				
				$("#charts .chartCon").bind("plothover",function(event,pos,item) {
					if (item) {
						var chartID = ($(this).parents('.chartArea').first().attr("id"));
						var format, css;
						css = {top: item.pageY + 5};
						if (chartID == "incarcerationGraphArea") {
							format = format = m.data.meta["Inc_Total"].formatter;
							css.left = item.pageX + 5;
							css.right = "initial";
						} else {
							format = m.data.meta["Spend_Total"].formatter;
							css.right = $("body").width() - (item.pageX - 5);
							css.left = "initial";
						}
						var x = item.datapoint[0].toFixed(2), y = item.datapoint[1].toFixed(2);
						$("#flotTooltip").html("<strong>" + Math.round(x) + "</strong><br />" + format(y))
						.css(css)
						.show();	
					} else {
						$("#flotTooltip").hide();
					}
				});
				
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
			
			switchDisplay: function(state) {
				
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
				},
				//Thanks http://stackoverflow.com/questions/3883342/add-commas-to-a-number-in-jquery
				commaSeparateNumber: function(val){
					while (/(\d+)(\d{3})/.test(val.toString())){
				  		val = val.toString().replace(/(\d+)(\d{3})/, '$1'+','+'$2');
					}
					return val;
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
		prisonMap.pageLoadFunction();		
	}	
});
