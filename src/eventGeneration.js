var PlatRandomizer = PlatRandomizer || {};
(function () {

    PlatRandomizer.eventGenerator = {};

    var audienceNameForIndex = function (index) {
        switch (index) {
            case 0:
                return "Young"
            case 1:
                return "General"
            case 2:
                return "Mature"
            default:
                return "Unknown"
        }
    }

    var genreNameForIndex = function (index) {
        switch (index) {
            case 0:
                return "Action"
            case 1:
                return "Adventure"
            case 2:
                return "RPG"
            case 3:
                return "Simulation"
            case 4:
                return "Strategy"
            case 5:
                return "Casual"
            default:
                return "Unknown"
        }
    }

    PlatRandomizer.eventGenerator.generatePlatformEvents = function (plat) {
        var eventDetailList = [];
        var publishDate = PlatRandomizer.dateHelper.flattenDateFromString(plat.published);
        var retireDate = Math.min(2000, PlatRandomizer.dateHelper.flattenDateFromString(plat.platformRetireDate));
        var lifespanMarkers = [0.2, 0.4, 0.6, 0.8];
        for (var i = 0; i < lifespanMarkers.length; i++) {
            var marker = lifespanMarkers[i];
            var rand = Math.ceil(PlatRandomizer.random(0, 30));
            var markerDate = PlatRandomizer.lerp(publishDate, retireDate, marker);
            var markerDateString = PlatRandomizer.dateHelper.getDateStringFromInt(markerDate);
            switch (rand) {
                case 1:
                    if (!PlatRandomizer.dataStore.settings.randomSalesEvents)
                        continue;
                    eventDetailList.push({
                        platformId: plat.id,
                        date: markerDateString,
                        type: "Sales",
                        multiplier: PlatRandomizer.random(0, 0.4)
                    });
                    PlatRandomizer.modLog("Adding a negative sales event for {0} at marker {1}".format(plat.name, marker));
                    break;
                case 2:
                case 3:
                case 4:
                    if (!PlatRandomizer.dataStore.settings.randomAudienceEvents)
                        continue;
                    var audienceIndex = Math.floor(PlatRandomizer.random(0, 2.9));
                    eventDetailList.push({
                        platformId: plat.id,
                        date: markerDateString,
                        type: "Audience",
                        audienceIndex: audienceIndex,
                        multiplier: PlatRandomizer.random(0, 1.0)
                    });
                    PlatRandomizer.modLog("Adding a {0} Audience event for {1} at marker {2}".format(audienceNameForIndex(audienceIndex), plat.name, marker));
                    break;
                case 27:
                case 28:
                case 29:
                    if (!PlatRandomizer.dataStore.settings.randomGenreEvents)
                        continue;
                    var genreIndex = Math.floor(PlatRandomizer.random(0, 5.9));
                    eventDetailList.push({
                        platformId: plat.id,
                        date: markerDateString,
                        type: "Genre",
                        genreIndex: genreIndex,
                        multiplier: PlatRandomizer.random(0, 1.0)
                    });
                    PlatRandomizer.modLog("Adding a {0} Genre event for {1} at marker {2}".format(genreNameForIndex(genreIndex), plat.name, marker));
                    break;
                case 30:
                    if (!PlatRandomizer.dataStore.settings.randomSalesEvents)
                        continue;
                    eventDetailList.push({
                        platformId: plat.id,
                        date: markerDateString,
                        type: "Sales",
                        multiplier: PlatRandomizer.random(0.6, 1.0)
                    });
                    PlatRandomizer.modLog("Adding a positive sales event for {0} at marker {1}".format(plat.name, marker))
                    break;
            }
        };

        return eventDetailList;
    }

    PlatRandomizer.eventGenerator.generateAudienceEvent = function (eventDetails) {
        var plat = PlatRandomizer.getPlatformById(eventDetails.platformId);
        var successMultiplier = PlatRandomizer.scaleMultToRange(eventDetails.multiplier, 0.500001, 1.0);
        var audience = eventDetails.audienceIndex;
        var currentWeight = plat.audienceWeightings[audience];
        var newWeight = Math.ceil(successMultiplier * 10) / 10;
        if (newWeight == currentWeight)
            return undefined;
        var success = newWeight > currentWeight;
        var weightDiff = Math.abs(newWeight - currentWeight);
        var largeDiff = weightDiff >= 0.2;
        var diffText = largeDiff ? "sizable" : "small";
        var message = success ?
            "The {0} has recently seen a {2} increase in popularity with {1} audiences"
            : "The {0} has recently seen a {2} decrease in popularity with {1} audiences";
        message = message.format(plat.name, audienceNameForIndex(audience), diffText);
        return {
            id: "platRand_tbd-" + GameManager.getGUID(),
            date: eventDetails.date,
            eventDetails: eventDetails,
            getNotification: function (company) {
                plat.audienceWeightings[audience] = newWeight;
                return new Notification({
                    header: "Platform News".localize(),
                    text: message,
                    image: plat.iconUri
                });
            }
        }
    }

    PlatRandomizer.eventGenerator.generateGenreEvent = function (eventDetails) {
        var plat = PlatRandomizer.getPlatformById(eventDetails.platformId);
        var successMultiplier = PlatRandomizer.scaleMultToRange(eventDetails.multiplier, 0.500001, 1.0);
        var genre = eventDetails.genreIndex;
        var currentWeight = plat.genreWeightings[genre];
        var newWeight = Math.ceil(successMultiplier * 10) / 10;
        if (newWeight == currentWeight)
            return undefined;
        var weightDiff = Math.abs(newWeight - currentWeight);
        var largeDiff = weightDiff >= 0.2;
        var diffText = largeDiff ? "sharp" : "minor";
        var success = newWeight > currentWeight;
        var message = success ?
            "{0} games have seen a {2} increase in popularity for the {1}"
            : "{0} games have seen a {2} decrease in popularity for the {1}";
        message = message.format(genreNameForIndex(genre), plat.name, diffText);
        return {
            id: "platRand_tbd-" + GameManager.getGUID(),
            date: eventDetails.date,
            eventDetails: eventDetails,
            getNotification: function (company) {
                plat.genreWeightings[genre] = newWeight;
                return new Notification({
                    header: "Platform News".localize(),
                    text: message,
                    image: plat.iconUri
                });
            }
        }
    }

    PlatRandomizer.eventGenerator.generateSalesEvent = function (eventDetails) {
        var plat = PlatRandomizer.getPlatformById(eventDetails.platformId);
        var successMultiplier = PlatRandomizer.scaleMultToRange(eventDetails.multiplier, 0.75, 1.25);
        var message = successMultiplier > 1 ?
            "{0} has started a new global marketing campaign for the {1} in an effort to bring the system to wider audiences. Industry experts predict this will have a positive effect on sales for the {1}"
            : "There has been an upsurge of hardware issues reported by users for the {1}. Industry experts predict this will have a negative impact on sales for {0} going forward.";
        message = message.format(plat.company, plat.name);
        return {
            id: "platRand_tbd-" + GameManager.getGUID(),
            date: eventDetails.date,
            eventDetails: eventDetails,
            getNotification: function (company) {
                var dateInt = PlatRandomizer.dateHelper.flattenDateFromString(eventDetails.date);
                var futureDate = dateInt + 4;
                plat.marketKeyPoints = plat.marketKeyPoints || [];
                plat.marketKeyPoints.push({ date: PlatRandomizer.dateHelper.getDateStringFromInt(futureDate), amount: PlatRandomizer.getUnitsForPlatformAtDate(plat, futureDate) * successMultiplier });
                plat.unitsSold *= successMultiplier;
                return new Notification({
                    header: "Platform News".localize(),
                    text: message,
                    image: plat.iconUri
                });
            }
        }
    }

})();