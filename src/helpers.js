var PlatRandomizer = PlatRandomizer || {};
(function () {
    PlatRandomizer.lerp = function (start, end, amt){
        return (1-amt)*start+amt*end
      }
    
    PlatRandomizer.getPlatformById = function(platId) {
        return Platforms.allPlatforms.find(x => x.id == platId);
    }

    PlatRandomizer.getUnitsForPlatformAtDate = function(plat, dateInt){
        return Platforms.getMarketSizeForWeek(plat, dateInt, GameManager.company) / 5E6;
    }

    PlatRandomizer.dateHelper = {};
    PlatRandomizer.dateHelper.flattenDateFromString = function(dateString) {
        let splitDate = dateString.split('/');
        let year = splitDate[0] - 1;
        let month = splitDate[1] - 1;
        let week = splitDate[2] - 1;

        let totalMonths = year * 12 + month;
        let totalWeeks = totalMonths * 4;
        return totalWeeks + week;
    }

    PlatRandomizer.dateHelper.flattenDateFromObj = function(dateObj) {
        let year = dateObj.year - 1;
        let month = dateObj.month - 1;
        let week = dateObj.week - 1;

        let totalMonths = year * 12 + month;
        let totalWeeks = totalMonths * 4;
        return totalWeeks + week;
    }

    PlatRandomizer.dateHelper.getDateFromString = function(dateString) {
        let splitDate = dateString.split('/');
        let year = splitDate[0];
        let month = splitDate[1];
        let week = splitDate[2];
        return {
            year: year,
            month: month,
            week: week
        }
    }

    PlatRandomizer.dateHelper.getDateFromInt = function(dateInt) {
        let week = Math.floor(dateInt % 4) + 1;
        let months = Math.floor(dateInt / 4);
        let year = Math.floor(months / 12) + 1;
        return {
            year: year,
            month: Math.floor(months % 12) + 1,
            week: week
        }
    }

    PlatRandomizer.dateHelper.getDateStringFromObj = function(dateObj){
        return `${dateObj.year}/${dateObj.month}/${dateObj.week}`;
    }
    
    PlatRandomizer.dateHelper.getDateStringFromInt = function(dateInt){
        return PlatRandomizer.dateHelper.getDateStringFromObj(PlatRandomizer.dateHelper.getDateFromInt(dateInt));
    }
    PlatRandomizer.dateHelper.lerpDateFromInt = function(firstDateInt, secondDateInt, percentage) {
        let lerpDate = Math.floor(PlatRandomizer.lerp(firstDateInt, secondDateInt, percentage));
        return PlatRandomizer.dateHelper.getDateFromInt(lerpDate);
    }

    PlatRandomizer.dateHelper.lerpDateFromString = function(firstDateString, secondDateString, percentage) {
        let flatDateOne = PlatRandomizer.dateHelper.flattenDateFromString(firstDateString);
        let flatDateTwo = PlatRandomizer.dateHelper.flattenDateFromString(secondDateString);
        return PlatRandomizer.dateHelper.lerpDateFromInt(flatDateOne, flatDateTwo, percentage);
    }

    PlatRandomizer.dateHelper.lerpDateFromObj = function(firstDateObj, secondDateObj, percentage) {
        let flatDateOne = PlatRandomizer.dateHelper.flattenDateFromObj(firstDateObj);
        let flatDateTwo = PlatRandomizer.dateHelper.flattenDateFromObj(secondDateObj);
        return PlatRandomizer.dateHelper.lerpDateFromInt(flatDateOne, flatDateTwo, percentage);
    }
})();