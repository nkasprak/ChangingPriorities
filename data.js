// JavaScript Document

(function(m) {
	m.data = {
		theData : {
			"AL" : [-0.212,-0.16],
			"AK" : [-0.013,0.001],
			"AZ" : [-0.378,-0.19],
			"AR" : [0.021,0.018],
			"CA" : [-0.217,-0.173],
			"CO" : [-0.042,-0.074],
			"CT" : [0.042,0.048],
			"DE" : [-0.06,-0.055],
			"FL" : [-0.319,-0.291],
			"GA" : [-0.189,-0.164],
			"HI" : [-0.081,-0.09],
			"ID" : [-0.187,-0.185],
			"IL" : [0.147,0.11],
			"IN" : [0.328,0.029],
			"IA" : [-0.01,0.025],
			"KS" : [-0.095,-0.074],
			"KY" : [-0.072,-0.05],
			"LA" : [-0.015,0.002],
			"ME" : [-0.126,-0.036],
			"MD" : [0.002,-0.041],
			"MA" : [-0.041,0.005],
			"MI" : [-0.037,-0.037],
			"MN" : [-0.04,-0.013],
			"MS" : [-0.14,-0.079],
			"MO" : [0.013,-0.017],
			"MT" : [-0.073,-0.045],
			"NE" : [-0.039,0.002],
			"NV" : [-0.104,-0.163],
			"NH" : [-0.026,0.03],
			"NJ" : [-0.045,-0.005],
			"NM" : [-0.128,-0.103],
			"NY" : [-0.069,0.06],
			"NC" : [-0.134,-0.197],
			"ND" : [0.555,0.13],
			"OH" : [-0.05,-0.035],
			"OK" : [-0.128,-0.116],
			"OR" : [-0.121,-0.077],
			"PA" : [0.034,0.015],
			"RI" : [-0.093,-0.03],
			"SC" : [-0.154,-0.077],
			"SD" : [-0.114,-0.047],
			"TN" : [-0.029,-0.043],
			"TX" : [-0.126,-0.076],
			"UT" : [-0.147,-0.072],
			"VT" : [0.009,0.007],
			"VA" : [-0.149,-0.11],
			"WA" : [-0.074,-0.029],
			"WV" : [0.086,0.239],
			"WI" : [-0.143,-0.05],
			"WY" : [-0.105,-0.102]
		},
		stateNames: {
			"AL":"Alabama",
			"AK":"Alaska",
			"AZ":"Arizona",
			"AR":"Arkansas",
			"CA":"California",
			"CO":"Colorado",
			"CT":"Connecticut",
			"DE":"Delaware",
			"DC":"Distr. of Col.",
			"FL":"Florida",
			"GA":"Georgia",
			"HI":"Hawaii",
			"ID":"Idaho",
			"IL":"Illinois",
			"IN":"Indiana",
			"IA":"Iowa",
			"KS":"Kansas",
			"KY":"Kentucky",
			"LA":"Louisiana",
			"ME":"Maine",
			"MD":"Maryland",
			"MA":"Massachusetts",
			"MI":"Michigan",
			"MN":"Minnesota",
			"MS":"Mississippi",
			"MO":"Missouri",
			"MT":"Montana",
			"NE":"Nebraska",
			"NV":"Nevada",
			"NH":"New Hampshire",
			"NJ":"New Jersey",
			"NM":"New Mexico",
			"NY":"New York",
			"NC":"North Carolina",
			"ND":"North Dakota",
			"OH":"Ohio",
			"OK":"Oklahoma",
			"OR":"Oregon",
			"PA":"Pennsylvania",
			"RI":"Rhode Island",
			"SC":"South Carolina",
			"SD":"South Dakota",
			"TN":"Tennessee",
			"TX":"Texas",
			"UT":"Utah",
			"VT":"Vermont",
			"VA":"Virginia",
			"WA":"Washington",
			"WV":"West Virginia",
			"WI":"Wisconsin",
			"WY":"Wyoming"
		},
		meta : {
			codes: ["stateOnly","stateAndLocal"],
			shortNames: ["State-only spending","State and local spending"],
			longNames: [	"Change in total STATE-ONLY spending per student, FY08-FY12",
							"Change in total STATE & LOCAL spending per student, FY08-FY12"]
		},
		getMaxMin: function() {
			m.data.meta.dataMax = [];
			m.data.meta.dataMin = [];
			var tempArr = [];
			var allArr = [];
			var data = m.data.theData;
			for (var state in data) {
				for (var i=0;i<data[state].length;i++) {
					if (typeof(tempArr[i]) == "undefined") tempArr[i] = [];
					tempArr[i].push(data[state][i]);
					if (m.dataScale=="global") allArr.push(data[state][i]);
				}
			}
			for (i=0;i<tempArr.length;i++) {
				if (m.dataScale=="global") {
					m.data.meta.dataMax[i] = Math.max.apply(Math,allArr);
					m.data.meta.dataMin[i] = Math.min.apply(Math,allArr);
				} else {
					m.data.meta.dataMax[i] = Math.max.apply(Math,tempArr[i]);
					m.data.meta.dataMin[i] = Math.min.apply(Math,tempArr[i]);
				} 
			}
		}
	};
	
	m.data.getMaxMin();

})(k12map);