var PlatRandomizer = PlatRandomizer || {};
(function () {

    PlatRandomizer.eventGenerator = {};

    let audienceNameForIndex = function (index) {
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

    let genreNameForIndex = function (index) {
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
        let eventDetailList = [];
        let publishDate = PlatRandomizer.dateHelper.flattenDateFromString(plat.published);
        let retireDate = Math.min(2000, PlatRandomizer.dateHelper.flattenDateFromString(plat.platformRetireDate));
        let lifespanMarkers = [0.2, 0.4, 0.6, 0.8];
        lifespanMarkers.forEach(marker => {
            let rand = Math.ceil(PlatRandomizer.random(0, 30));
            let markerDate = PlatRandomizer.lerp(publishDate, retireDate, marker);
            let markerDateString = PlatRandomizer.dateHelper.getDateStringFromInt(markerDate);
            switch (rand) {
                case 1:
                    if (!PlatRandomizer.dataStore.settings.randomSalesEvents)
                        return;
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
                        return;
                    let audienceIndex = Math.floor(PlatRandomizer.random(0, 2.9));
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
                        return;
                    let genreIndex = Math.floor(PlatRandomizer.random(0, 5.9));
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
                        return;
                    eventDetailList.push({
                        platformId: plat.id,
                        date: markerDateString,
                        type: "Sales",
                        multiplier: PlatRandomizer.random(0.6, 1.0)
                    });
                    PlatRandomizer.modLog("Adding a positive sales event for {0} at marker {1}".format(plat.name, marker))
                    break;
            }
        });

        return eventDetailList;
    }

    PlatRandomizer.eventGenerator.generateAudienceEvent = function (eventDetails) {
        let plat = PlatRandomizer.getPlatformById(eventDetails.platformId);
        let successMultiplier = PlatRandomizer.scaleMultToRange(eventDetails.multiplier, 0.500001, 1.0);
        let audience = eventDetails.audienceIndex;
        let currentWeight = plat.audienceWeightings[audience];
        let newWeight = Math.ceil(successMultiplier * 10) / 10;
        if (newWeight == currentWeight)
            return undefined;
        let success = newWeight > currentWeight;
        let weightDiff = Math.abs(newWeight - currentWeight);
        let largeDiff = weightDiff >= 0.2;
        let diffText = largeDiff ? "sizable" : "small";
        let message = success ?
            "The {0} has recently seen a {2} increase in popularity with {1} audiences"
            : "The {0} has recently seen a {2} decrease in popularity with {1} audiences";
        message = message.format(plat.name, audienceNameForIndex(audience), diffText);
        return {
            id: `platRand_tbd-${GameManager.getGUID()}`,
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
        let plat = PlatRandomizer.getPlatformById(eventDetails.platformId);
        let successMultiplier = PlatRandomizer.scaleMultToRange(eventDetails.multiplier, 0.500001, 1.0);
        let genre = eventDetails.genreIndex;
        let currentWeight = plat.genreWeightings[genre];
        let newWeight = Math.ceil(successMultiplier * 10) / 10;
        if (newWeight == currentWeight)
            return undefined;
        let weightDiff = Math.abs(newWeight - currentWeight);
        let largeDiff = weightDiff >= 0.2;
        let diffText = largeDiff ? "sharp" : "minor";
        let success = newWeight > currentWeight;
        let message = success ?
            "{0} games have seen a {2} increase in popularity for the {1}"
            : "{0} games have seen a {2} decrease in popularity for the {1}";
        message = message.format(genreNameForIndex(genre), plat.name, diffText);
        return {
            id: `platRand_tbd-${GameManager.getGUID()}`,
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
        let plat = PlatRandomizer.getPlatformById(eventDetails.platformId);
        let successMultiplier = PlatRandomizer.scaleMultToRange(eventDetails.multiplier, 0.75, 1.25);
        let message = successMultiplier > 1 ?
            `{0} has started a new global marketing campaign for the {1} in an effort to bring the system to wider audiences. Industry experts predict this will have a positive effect on sales for the {1}`
            : `There has been an upsurge of hardware issues reported by users for the {1}. Industry experts predict this will have a negative impact on sales for {0} going forward.`;
        message = message.format(plat.company, plat.name);
        return {
            id: `platRand_tbd-${GameManager.getGUID()}`,
            date: eventDetails.date,
            eventDetails: eventDetails,
            getNotification: function (company) {
                let dateInt = PlatRandomizer.dateHelper.flattenDateFromString(eventDetails.date);
                let futureDate = dateInt + 4;
                plat.marketKeyPoints = plat.marketKeyPoints ?? [];
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