var PlatRandomizer = PlatRandomizer || {};
(function () {
    PlatRandomizer.lerp = function (start, end, amt){
        return (1-amt)*start+amt*end
      }
    
    PlatRandomizer.getPlatformById = function(platId) {
        for (var i = 0; i < Platforms.allPlatforms.length; i++) {
            var plat = Platforms.allPlatforms[i];
            if(plat.id == platId)
            return plat;  
        }
    }

    PlatRandomizer.getUnitsForPlatformAtDate = function(plat, dateInt){
        return Platforms.getMarketSizeForWeek(plat, dateInt, GameManager.company) / 5E6;
    }

    PlatRandomizer.dateHelper = {};
    PlatRandomizer.dateHelper.flattenDateFromString = function(dateString) {
        var splitDate = dateString.split('/');
        var year = splitDate[0] - 1;
        var month = splitDate[1] - 1;
        var week = splitDate[2] - 1;

        var totalMonths = year * 12 + month;
        var totalWeeks = totalMonths * 4;
        return totalWeeks + week;
    }

    PlatRandomizer.dateHelper.flattenDateFromObj = function(dateObj) {
        var year = dateObj.year - 1;
        var month = dateObj.month - 1;
        var week = dateObj.week - 1;

        var totalMonths = year * 12 + month;
        var totalWeeks = totalMonths * 4;
        return totalWeeks + week;
    }

    PlatRandomizer.dateHelper.getDateFromString = function(dateString) {
        var splitDate = dateString.split('/');
        var year = splitDate[0];
        var month = splitDate[1];
        var week = splitDate[2];
        return {
            year: year,
            month: month,
            week: week
        }
    }

    PlatRandomizer.dateHelper.getDateFromInt = function(dateInt) {
        var week = Math.floor(dateInt % 4) + 1;
        var months = Math.floor(dateInt / 4);
        var year = Math.floor(months / 12) + 1;
        return {
            year: year,
            month: Math.floor(months % 12) + 1,
            week: week
        }
    }

    PlatRandomizer.dateHelper.getDateStringFromObj = function(dateObj){
        return dateObj.year + "/" + dateObj.month + "/" + dateObj.week;
    }
    
    PlatRandomizer.dateHelper.getDateStringFromInt = function(dateInt){
        return PlatRandomizer.dateHelper.getDateStringFromObj(PlatRandomizer.dateHelper.getDateFromInt(dateInt));
    }
    PlatRandomizer.dateHelper.lerpDateFromInt = function(firstDateInt, secondDateInt, percentage) {
        var lerpDate = Math.floor(PlatRandomizer.lerp(firstDateInt, secondDateInt, percentage));
        return PlatRandomizer.dateHelper.getDateFromInt(lerpDate);
    }

    PlatRandomizer.dateHelper.lerpDateFromString = function(firstDateString, secondDateString, percentage) {
        var flatDateOne = PlatRandomizer.dateHelper.flattenDateFromString(firstDateString);
        var flatDateTwo = PlatRandomizer.dateHelper.flattenDateFromString(secondDateString);
        return PlatRandomizer.dateHelper.lerpDateFromInt(flatDateOne, flatDateTwo, percentage);
    }

    PlatRandomizer.dateHelper.lerpDateFromObj = function(firstDateObj, secondDateObj, percentage) {
        var flatDateOne = PlatRandomizer.dateHelper.flattenDateFromObj(firstDateObj);
        var flatDateTwo = PlatRandomizer.dateHelper.flattenDateFromObj(secondDateObj);
        return PlatRandomizer.dateHelper.lerpDateFromInt(flatDateOne, flatDateTwo, percentage);
    }
})();