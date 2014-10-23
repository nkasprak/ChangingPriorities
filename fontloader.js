var k12_floader = {
	fontsLoaded: false,
	documentReady: false	
};
try{
	Typekit.load({
		active: function() {
			k12_floader.fontsLoaded = true;
			if (k12_floader.fontsLoaded && k12_floader.documentReady) {
				prisonMap.pageLoadFunction();		
			}
		}
	});
}catch(e){}