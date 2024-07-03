var PlatRandomizer = PlatRandomizer || {};
(function() {
    PlatRandomizer.dataStore = GDT.getDataStore('platrand_tbd');

    var modLog = function(message) {
        console.log("platrand_tbd: " + message);
    }
    PlatRandomizer.modLog = modLog;

    var random = function(min, max) {
        return GameManager.company.getRandom() * (max - min) + min;
    }
    PlatRandomizer.random = random;

    var scaleMultToRange = function(multiplier, min, max){
        return multiplier * (max - min) + min;
    }
    PlatRandomizer.scaleMultToRange = scaleMultToRange;

    PlatRandomizer.reset = function() {
        Platforms.allPlatforms = PlatRandomizer.defaultPlatforms;
        PlatRandomizer.dataStore.data = {};
    }

    PlatRandomizer.toggleSetting = function (element, setting) {
        PlatRandomizer.dataStore.settings[setting] = !PlatRandomizer.dataStore.settings[setting];
        $(element).toggleClass("selectedFeature");
        if (setting == "darkBG") {
            if ($("#platRand_tbd-dark").length) {
                $("#platRand_tbd-dark").remove();
            }
            else {
                $("head").append('<link id="platRand_tbd-dark" rel="stylesheet" href="' + platRand_TBD.path + '/css/darkBG.css" rel="stylesheet" type="text/css">');
            }
        }
        DataStore.saveSettings();
    }
    PlatRandomizer.initializeSettings = function () {
        var dataStoreSettings = PlatRandomizer.dataStore.settings;
        var defaultSettings = {
            darkBG: true,
            enabled: true,
            randomizeLifespans: true,
            randomizeAudienceWeights: true,
            randomizeGenreWeights: true,
            randomizeLicenseCost: true,
            randomizeDevCost: true,
            randomSalesEvents: true,
            randomAudienceEvents: true,
            randomGenreEvents: true
        }
        dataStoreSettings.darkBG = dataStoreSettings.darkBG || defaultSettings.darkBG;
        if (dataStoreSettings.darkBG)
            $("head").append('<link id="platRand_tbd-dark" rel="stylesheet" href="' + platRand_TBD.path + '/css/darkBG.css" rel="stylesheet" type="text/css">');
        dataStoreSettings.enabled = dataStoreSettings.enabled || defaultSettings.enabled;
        dataStoreSettings.randomizeLifespans = dataStoreSettings.randomizeLifespans || defaultSettings.randomizeLifespans;
        dataStoreSettings.randomizeAudienceWeights = dataStoreSettings.randomizeAudienceWeights || defaultSettings.randomizeAudienceWeights;
        dataStoreSettings.randomizeGenreWeights = dataStoreSettings.randomizeGenreWeights || defaultSettings.randomizeGenreWeights;
        dataStoreSettings.randomizeLicenseCost = dataStoreSettings.randomizeLicenseCost || defaultSettings.randomizeLicenseCost;
        dataStoreSettings.randomizeDevCost = dataStoreSettings.randomizeDevCost || defaultSettings.randomizeDevCost;
        dataStoreSettings.randomSalesEvents = dataStoreSettings.randomSalesEvents || defaultSettings.randomSalesEvents;
        dataStoreSettings.randomAudienceEvents = dataStoreSettings.randomAudienceEvents || defaultSettings.randomAudienceEvents;
        dataStoreSettings.randomGenreEvents = dataStoreSettings.randomGenreEvents || defaultSettings.randomGenreEvents;
        DataStore.saveSettings();
    }

    PlatRandomizer.init = function () {
        // Initialize Default Settings Values
        PlatRandomizer.initializeSettings();
        // Setup Settings Menu
        var settingsDiv = $(document.createElement('div'));
        var settingsHtml = "";
        // Dark BG
        settingsHtml += ('<div class="selectableGameFeatureItem {0}" onclick="PlatRandomizer.toggleSetting(this, \'darkBG\')">Dark Main Background Overlay</div>'
        .format(PlatRandomizer.dataStore.settings.darkBG ? "selectedFeature" : ""));
        settingsHtml += ('<div class="windowTitle smallerWindowTitle">Randomizer Options</div>');
        // Enabled
        settingsHtml += ('<div class="selectableGameFeatureItem {0}" onclick="PlatRandomizer.toggleSetting(this, \'enabled\')">Enabled</div>'
        .format(PlatRandomizer.dataStore.settings.enabled ? "selectedFeature" : ""));
        // Randomize Platform Retire Dates
        settingsHtml += ('<div class="selectableGameFeatureItem {0}" onclick="PlatRandomizer.toggleSetting(this, \'randomizeLifespans\')">Randomize Platform Retire Dates</div>'
        .format(PlatRandomizer.dataStore.settings.randomizeLifespans ? "selectedFeature" : ""));
        // Randomize Platform Audience Weights
        settingsHtml += ('<div class="selectableGameFeatureItem {0}" onclick="PlatRandomizer.toggleSetting(this, \'randomizeAudienceWeights\')">Randomize Platform Audience Weights</div>'
        .format(PlatRandomizer.dataStore.settings.randomizeAudienceWeights ? "selectedFeature" : ""));
        // Randomize Platform Genre Weights
        settingsHtml += ('<div class="selectableGameFeatureItem {0}" onclick="PlatRandomizer.toggleSetting(this, \'randomizeGenreWeights\')">Randomize Platform Audience Weights</div>'
        .format(PlatRandomizer.dataStore.settings.randomizeGenreWeights ? "selectedFeature" : ""));
        // Randomize Platform License Cost
        settingsHtml += ('<div class="selectableGameFeatureItem {0}" onclick="PlatRandomizer.toggleSetting(this, \'randomizeLicenseCost\')">Randomize Platform License Cost</div>'
        .format(PlatRandomizer.dataStore.settings.randomizeLicenseCost ? "selectedFeature" : ""));
        // Randomize Platform Development Cost
        settingsHtml += ('<div class="selectableGameFeatureItem {0}" onclick="PlatRandomizer.toggleSetting(this, \'randomizeDevCost\')">Randomize Platform Development Cost</div>'
        .format(PlatRandomizer.dataStore.settings.randomizeDevCost ? "selectedFeature" : ""));
        settingsHtml += ('<h3>Random Platform Events</h3>');
        // Sales Events
        settingsHtml += ('<div class="selectableGameFeatureItem {0}" onclick="PlatRandomizer.toggleSetting(this, \'randomSalesEvents\')">Sales Events</div>'
        .format(PlatRandomizer.dataStore.settings.randomSalesEvents ? "selectedFeature" : ""));
        // Audience Shift Events
        settingsHtml += ('<div class="selectableGameFeatureItem {0}" onclick="PlatRandomizer.toggleSetting(this, \'randomAudienceEvents\')">Audience Shift Events</div>'
        .format(PlatRandomizer.dataStore.settings.randomAudienceEvents ? "selectedFeature" : ""));
        // Genre Shift Events
        settingsHtml += ('<div class="selectableGameFeatureItem {0}" onclick="PlatRandomizer.toggleSetting(this, \'randomGenreEvents\')">Genre Shift Events</div>'
        .format(PlatRandomizer.dataStore.settings.randomGenreEvents ? "selectedFeature" : ""));
        settingsDiv.html(settingsHtml);

        GDT.addSettingsTab("P-Rand", settingsDiv)
        // Store reference to original platforms
        PlatRandomizer.defaultPlatforms = Platforms.allPlatforms;
        GDT.on(GDT.eventKeys.gameplay.weekProceeded, function () {
            PlatRandomizer.updateIconForPC();
        });

        GDT.on(GDT.eventKeys.saves.newGame, function () {
            modLog("New game...");
            PlatRandomizer.dataStore.data.saveSettings = {}
            PlatRandomizer.dataStore.data.saveSettings = $.extend(true, {}, PlatRandomizer.dataStore.settings);
            if (PlatRandomizer.dataStore.data.saveSettings.enabled) {
                modLog("Randomizing...");
                PlatRandomizer.randomize();
                PlatRandomizer.fixIcons();
                PlatRandomizer.updateIconForPC();
            }
        });
        GDT.on(GDT.eventKeys.saves.loading, function (e) {
            modLog("Save loading...");
            if (PlatRandomizer.dataStore.data.saveSettings != undefined && PlatRandomizer.dataStore.data.saveSettings.enabled) {
                modLog("Applying saved randomizations");
                var storedData = e.data.modData.platrand_tbd;
                // Only apply modified platforms that have a matching platform in AllPlatforms?
                // This is to account for a platform no longer existing due to a mod being disabled/removed
                var allPlatformsHasPlatform = function(plat) {
                    for (var index = 0; index < Platforms.allPlatforms.length; index++) {
                        var platTwo = Platforms.allPlatforms[index];
                        if(plat.id == platTwo.id)
                        return true;
                    }
                    return false;
                }
                Platforms.allPlatforms = storedData.platforms.filter(allPlatformsHasPlatform);
                PlatRandomizer.fixIcons();
                PlatRandomizer.updateIconForPC();
                //Remove all events from this mod and apply stored Random events
                var doesNotStartWithModId = function(notif) {
                    return !notif.id.startsWith("platRand_tbd-");
                }
                DecisionNotifications.modNotifications = DecisionNotifications.modNotifications.filter(doesNotStartWithModId);
                for (var eventIndex = 0; eventIndex < storedData.randomEvents.length; eventIndex++) {
                    var eventDetails = storedData.randomEvents[eventIndex];
                    // Ignore events that don't have a matching platform
                    var platform = PlatRandomizer.getPlatformById(eventDetails.platformId);
                    if(platform == undefined)
                        return;
                    var event = PlatRandomizer.generateEvent(eventDetails);
                    if(event != undefined)
                        GDT.addEvent(event);
                }
            }
            else {
                modLog("Restoring default platforms");
                Platforms.allPlatforms = PlatRandomizer.defaultPlatforms;
            }
        });
    }

    PlatRandomizer.generateEvent = function (eventDetails) {
        switch (eventDetails.type) {
            case "Sales":
                return PlatRandomizer.eventGenerator.generateSalesEvent(eventDetails);
            case "Audience":
                return PlatRandomizer.eventGenerator.generateAudienceEvent(eventDetails);
            case "Genre":
                return PlatRandomizer.eventGenerator.generateGenreEvent(eventDetails);
            default:
                modLog("Unknown event type, skipping...");
                return undefined;
        }
    }
    PlatRandomizer.randomize = function () {
        var originalPlatforms = $.extend(true, {}, Platforms.allPlatforms);
        var randomEvents = [];
        for (var i = 0; i < Platforms.allPlatforms.length; i++) {
            var plat = Platforms.allPlatforms[i];

            // Randomize retire dates
            if (PlatRandomizer.dataStore.settings.randomizeLifespans)
                PlatRandomizer.randomizePlatLifespan(plat);

            // Debug code adjusting gameling lifespan
            // if (plat.name == "Gameling") {
            //     plat.published = "1/1/2";
            //     plat.platformRetireDate = "1/4/1";
            // }

            // Randomize audience weights
            if (PlatRandomizer.dataStore.settings.randomizeAudienceWeights)
                PlatRandomizer.randomizePlatAudienceWeights(plat);
            // Randomize genre weights
            if (PlatRandomizer.dataStore.settings.randomizeGenreWeights)
                PlatRandomizer.randomizePlatGenreWeights(plat);
            // Randomize Development Cost
            if (PlatRandomizer.dataStore.settings.randomizeDevCost)
                PlatRandomizer.randomizePlatDevCost(plat);
            // Randomize License Cost
            if (PlatRandomizer.dataStore.settings.randomizeLicenseCost)
                PlatRandomizer.randomizePlatLicenseCost(plat);

            var platformEvents = PlatRandomizer.eventGenerator.generatePlatformEvents(plat);
            randomEvents = randomEvents.concat(platformEvents);
        }
        // Remove all events from this mod and apply stored Random events
        var doesNotStartWithModId = function(notif) {
            return !notif.id.startsWith("platRand_tbd-");
        }
        DecisionNotifications.modNotifications = DecisionNotifications.modNotifications.filter(doesNotStartWithModId);
        for (var eventIndex = 0; eventIndex < randomEvents.length; eventIndex++) {
            var eventDetails = randomEvents[eventIndex];
            var event = PlatRandomizer.generateEvent(eventDetails);
            if(event != undefined)
                GDT.addEvent(event);
        }
        PlatRandomizer.dataStore.data.randomEvents = randomEvents;
        PlatRandomizer.dataStore.data.originalPlatforms = originalPlatforms;
        PlatRandomizer.dataStore.data.platforms = Platforms.allPlatforms;
    }


    PlatRandomizer.randomizePlatAudienceWeights = function(plat) {
        plat.audienceWeightings = PlatRandomizer.randomWeightingsArray(3);
        modLog('Changed {0} audience appeal to {1}'.format(
            plat.name, plat.audienceWeightings));
    }

    PlatRandomizer.randomizePlatGenreWeights = function(plat) {
        plat.genreWeightings = PlatRandomizer.randomWeightingsArray(6);
        modLog('Changed {0} genre appeal to {1}'.format(
            plat.name, plat.genreWeightings));
    }

    PlatRandomizer.randomizePlatDevCost = function(plat) {
        var multiplier = PlatRandomizer.random(0.5, 2.0);
        plat.developmentCosts = Math.floor(plat.developmentCosts * multiplier);
        modLog('Changed {0} development cost to {1} using multiplier of {2}'.format(
            plat.name, plat.developmentCosts, multiplier));
    }

    PlatRandomizer.randomizePlatLicenseCost = function(plat) {
        var multiplier = PlatRandomizer.random(0.5, 2.0);
        plat.licencePrize = Math.floor(plat.licencePrize * multiplier);
        modLog('Changed {0} license cost to {1} using multiplier of {2}'.format(
            plat.name, plat.licencePrize, multiplier));
    }
    
    PlatRandomizer.randomizePlatLifespan = function(plat) {
        // Don't Randomize lifespan for PC, and other platforms with a lifespan past year 100
        var retireDateObj = PlatRandomizer.dateHelper.getDateFromString(plat.platformRetireDate);
        if (plat.id == "PC" || retireDateObj.year >= 100)
            return;
        // Generate Lifespan modifier between 0.75 and 1.25
        var lifeSpanModifier = PlatRandomizer.random(0.75, 1.25);
        var originalPublishDate = PlatRandomizer.dateHelper.flattenDateFromString(plat.published);
        var originalRetireDate = PlatRandomizer.dateHelper.flattenDateFromString(plat.platformRetireDate);
        var originalLifeSpan = originalRetireDate - originalPublishDate;
        var modifiedLifespan = originalLifeSpan * lifeSpanModifier;
        var newRetireDate = PlatRandomizer.dateHelper.getDateStringFromObj(
            PlatRandomizer.dateHelper.getDateFromInt(originalPublishDate + modifiedLifespan));
        modLog("Modified Retire Date for platform {0} from {1} to {2} with modifier of {3}".format(
            plat.name, plat.platformRetireDate, newRetireDate, lifeSpanModifier
        ));
    }

    // Credit to the original Platform Randomiser mod
	/**
	 * Get a random array of weightings between 0.6 and 1.0 rounded to one
	 * decimal place that are suitable for use as audience weightings or 
	 * genre weightings.
	 *
	 * len - The length of the array to generate.
	 */    
    PlatRandomizer.randomWeightingsArray = function (length) {
        var weightings = []
        for (var j = 0; j < length; j++) {
            var randomNum = (GameManager.company.getRandom() / 2) + 0.500001
            weightings[j] = Math.ceil(randomNum * 10) / 10;
        }
        return weightings;
    }
    /**
	 * fix Icons for the PC, G64, TES, Gameling, MasterV which 
	 * are not in the superb directory unlike everything else.
	 */
     PlatRandomizer.fixIcons = function() {
		var affectedPlatforms = [/*"PC"*/, "G64", "TES", "Gameling", "Master V"];
		for(var i = 0; i < Platforms.allPlatforms.length; i++) {
			var plat = Platforms.allPlatforms[i];
			if(affectedPlatforms.indexOf(plat.id) != -1) {
				plat.iconUri = './images/platforms/{0}.png'.format(plat.id);
			}
		}
	};
    // PC has multiple icons so update the icon every week based on the PC icon dates the game has
    PlatRandomizer.updateIconForPC = function() {
        if(PlatRandomizer.dataStore.data.saveSettings != undefined && PlatRandomizer.dataStore.data.saveSettings.enabled){
            var currentDate = GameManager.company.currentWeek;
            var pcImage = currentDate >= 1072 ? 4 : currentDate >= 728 ? 3 : currentDate >= 176 ? 2 : 1;
            if(pcImage == 1)
                PlatRandomizer.getPlatformById("PC").iconUri = "./images/platforms/PC.png";
            else
                PlatRandomizer.getPlatformById("PC").iconUri = "./images/platforms/superb/PC-" + pcImage + ".png";
        }
    }
})();