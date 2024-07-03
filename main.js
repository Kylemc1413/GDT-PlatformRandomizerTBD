var platRand_TBD = {};
(function () {
	platRand_TBD.path = GDT.getRelativePath();

	var ready = function () {
		PlatRandomizer.init();
	};

	var error = function () {
	};

	GDT.loadJs(['src/helpers.js', 'src/eventGeneration.js', 'src/platRandomizer.js'], ready, error);
})();