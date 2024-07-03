var PlatRandomizer = PlatRandomizer || {};
(function() {
    PlatRandomizer.dataStore = GDT.getDataStore('platrand_tbd');

    let modLog = function(message) {
        console.log("platrand_tbd: " + message);
    }
    PlatRandomizer.modLog = modLog;

    let random = function(min, max) {
        return GameManager.company.getRandom() * (max - min) + min;
    }
    PlatRandomizer.random = random;

    let scaleMultToRange = function(multiplier, min, max){
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
        let dataStoreSettings = PlatRandomizer.dataStore.settings;
        let defaultSettings = {
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
        dataStoreSettings.darkBG = dataStoreSettings.darkBG ?? defaultSettings.darkBG;
        if (dataStoreSettings.darkBG)
            $("head").append('<link id="platRand_tbd-dark" rel="stylesheet" href="' + platRand_TBD.path + '/css/darkBG.css" rel="stylesheet" type="text/css">');
        dataStoreSettings.enabled = dataStoreSettings.enabled ?? defaultSettings.enabled;
        dataStoreSettings.randomizeLifespans = dataStoreSettings.randomizeLifespans ?? defaultSettings.randomizeLifespans;
        dataStoreSettings.randomizeAudienceWeights = dataStoreSettings.randomizeAudienceWeights ?? defaultSettings.randomizeAudienceWeights;
        dataStoreSettings.randomizeGenreWeights = dataStoreSettings.randomizeGenreWeights ?? defaultSettings.randomizeGenreWeights;
        dataStoreSettings.randomizeLicenseCost = dataStoreSettings.randomizeLicenseCost ?? defaultSettings.randomizeLicenseCost;
        dataStoreSettings.randomizeDevCost = dataStoreSettings.randomizeDevCost ?? defaultSettings.randomizeDevCost;
        dataStoreSettings.randomSalesEvents = dataStoreSettings.randomSalesEvents ?? defaultSettings.randomSalesEvents;
        dataStoreSettings.randomAudienceEvents = dataStoreSettings.randomAudienceEvents ?? defaultSettings.randomAudienceEvents;
        dataStoreSettings.randomGenreEvents = dataStoreSettings.randomGenreEvents ?? defaultSettings.randomGenreEvents;
        DataStore.saveSettings();
    }

    PlatRandomizer.init = function () {
        // Initialize Default Settings Values
        PlatRandomizer.initializeSettings();
        // Setup Settings Menu
        let settingsDiv = $(document.createElement('div'));
        settingsDiv.html(`
        <div class="selectableGameFeatureItem ${PlatRandomizer.dataStore.settings.darkBG ? "selectedFeature" : ""}" onclick="PlatRandomizer.toggleSetting(this, 'darkBG')">Dark Main Background Overlay</div>
        <div class="windowTitle smallerWindowTitle">Randomizer Options</div>        
        <div class="selectableGameFeatureItem ${PlatRandomizer.dataStore.settings.enabled ? "selectedFeature" : ""}" onclick="PlatRandomizer.toggleSetting(this, 'enabled')">Enabled</div>
        <div class="selectableGameFeatureItem ${PlatRandomizer.dataStore.settings.randomizeLifespans ? "selectedFeature" : ""}" onclick="PlatRandomizer.toggleSetting(this, 'randomizeLifespans')">Randomize Platform Retire Dates</div>
        <div class="selectableGameFeatureItem ${PlatRandomizer.dataStore.settings.randomizeAudienceWeights ? "selectedFeature" : ""}" onclick="PlatRandomizer.toggleSetting(this, 'randomizeAudienceWeights')">Randomize Platform Audience Weights</div>
        <div class="selectableGameFeatureItem ${PlatRandomizer.dataStore.settings.randomizeGenreWeights ? "selectedFeature" : ""}" onclick="PlatRandomizer.toggleSetting(this, 'randomizeGenreWeights')">Randomize Platform Genre Weights</div>
        <div class="selectableGameFeatureItem ${PlatRandomizer.dataStore.settings.randomizeLicenseCost ? "selectedFeature" : ""}" onclick="PlatRandomizer.toggleSetting(this, 'randomizeLicenseCost')">Randomize Platform License Cost</div>
        <div class="selectableGameFeatureItem ${PlatRandomizer.dataStore.settings.randomizeDevCost ? "selectedFeature" : ""}" onclick="PlatRandomizer.toggleSetting(this, 'randomizeDevCost')">Randomize Platform Development Cost</div>
        <h3>Random Platform Events</h3>
        <div class="selectableGameFeatureItem ${PlatRandomizer.dataStore.settings.randomSalesEvents ? "selectedFeature" : ""}" onclick="PlatRandomizer.toggleSetting(this, 'randomSalesEvents')">Sales Events</div>
        <div class="selectableGameFeatureItem ${PlatRandomizer.dataStore.settings.randomAudienceEvents ? "selectedFeature" : ""}" onclick="PlatRandomizer.toggleSetting(this, 'randomAudienceEvents')">Audience Shift Events</div>
        <div class="selectableGameFeatureItem ${PlatRandomizer.dataStore.settings.randomGenreEvents ? "selectedFeature" : ""}" onclick="PlatRandomizer.toggleSetting(this, 'randomGenreEvents')">Genre Shift Events</div>
        `);
        GDT.addSettingsTab("P-Rand", settingsDiv)
        // Store reference to original platforms
        PlatRandomizer.defaultPlatforms = Platforms.allPlatforms;

        GDT.on(GDT.eventKeys.saves.newGame, function () {
            modLog("New game...");
            PlatRandomizer.dataStore.data.saveSettings = {}
            PlatRandomizer.dataStore.data.saveSettings = $.extend(true, {}, PlatRandomizer.dataStore.settings);
            if (PlatRandomizer.dataStore.data.saveSettings.enabled) {
                modLog("Randomizing...");
                PlatRandomizer.randomize();
                PlatRandomizer.fixIcons();
            }
        });
        GDT.on(GDT.eventKeys.saves.loading, function (e) {
            modLog("Save loading...");
            if (PlatRandomizer.dataStore.data.saveSettings?.enabled) {
                modLog("Applying saved randomizations");
                let storedData = e.data.modData.platrand_tbd;
                // Only apply modified platforms that have a matching platform in AllPlatforms?
                // This is to account for a platform no longer existing due to a mod being disabled/removed
                Platforms.allPlatforms = storedData.platforms.filter(x => Platforms.allPlatforms.filter(y => y.id == x.id).length > 0);
                PlatRandomizer.fixIcons();
                //Remove all events from this mod and apply stored Random events
                DecisionNotifications.modNotifications = DecisionNotifications.modNotifications.filter(x => !x.id.startsWith("platRand_tbd-"));
                storedData.randomEvents.forEach(eventDetails => {
                    // Ignore events that don't have a matching platform
                    let platform = PlatRandomizer.getPlatformById(eventDetails.platformId);
                    if(platform == undefined)
                        return;
                    let event = PlatRandomizer.generateEvent(eventDetails);
                    if(event != undefined)
                        GDT.addEvent(event);
                });
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
        let originalPlatforms = $.extend(true, {}, Platforms.allPlatforms);
        let randomEvents = [];
        for (var i = 0; i < Platforms.allPlatforms.length; i++) {
            let plat = Platforms.allPlatforms[i];

            // Events must be added with GDT.addEvent
            // Should be safe to call to add if already added since addEvent returns if uniqueness check fails
            // Keep collection of random platform events instead of attaching events directly to platform
            // On randomize end/load, add all random platform events
            // Put platform modification logic in getnotification for event where relevant
            // For market point events, can just schedule them at relevant date

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

            let platformEvents = PlatRandomizer.eventGenerator.generatePlatformEvents(plat);
            randomEvents.push(...platformEvents);
        }
        // Remove all events from this mod and apply stored Random events
        DecisionNotifications.modNotifications = DecisionNotifications.modNotifications.filter(x => !x.id.startsWith("platRand_tbd-"));
        randomEvents.forEach(eventDetails => {
            let event = PlatRandomizer.generateEvent(eventDetails);
            if(event != undefined)
                GDT.addEvent(event);
        });
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
        let multiplier = PlatRandomizer.random(0.5, 2.0);
        plat.developmentCosts *= multiplier;
        modLog('Changed {0} development cost to {1} using multiplier of {2}'.format(
            plat.name, plat.developmentCosts, multiplier));
    }

    PlatRandomizer.randomizePlatLicenseCost = function(plat){
        let multiplier = PlatRandomizer.random(0.5, 2.0);
        plat.licencePrize *= multiplier;
        modLog('Changed {0} license cost to {1} using multiplier of {2}'.format(
            plat.name, plat.licencePrize, multiplier));
    }
    
    PlatRandomizer.randomizePlatLifespan = function(plat) {
        // Don't Randomize lifespan for PC, and other platforms with a lifespan past year 100
        let retireDateObj = PlatRandomizer.dateHelper.getDateFromString(plat.platformRetireDate);
        if (plat.id == "PC" || retireDateObj.year >= 100)
            return;
        // Generate Lifespan modifier between 0.75 and 1.25
        let lifeSpanModifier = PlatRandomizer.random(0.75, 1.25);
        let originalPublishDate = PlatRandomizer.dateHelper.flattenDateFromString(plat.published);
        let originalRetireDate = PlatRandomizer.dateHelper.flattenDateFromString(plat.platformRetireDate);
        let originalLifeSpan = originalRetireDate - originalPublishDate;
        let modifiedLifespan = originalLifeSpan * lifeSpanModifier;
        let newRetireDate = PlatRandomizer.dateHelper.getDateStringFromObj(
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
})();