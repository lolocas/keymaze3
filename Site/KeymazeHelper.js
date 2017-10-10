(function () {
    'use strict';

    angular.module('Keymaze').service('KeymazeHelper', KeymazeHelper);

    function KeymazeHelper() {
        this.formatTime = formatTime;
        this.timeToSeconds = timeToSeconds;
        this.vitesseMoyenne = vitesseMoyenne;

        this.distanceInKmBetweenEarthCoordinates = distanceInKmBetweenEarthCoordinates;

        function formatTime(timeInSeconds) {
            if (timeInSeconds) {
                timeInSeconds = timeInSeconds / 10;
                var hours = Math.floor(timeInSeconds / 3600);
                var minutes = Math.floor((timeInSeconds - (hours * 3600)) / 60);
                var seconds = timeInSeconds - (hours * 3600) - (minutes * 60);

                // round seconds
                seconds = Math.round(seconds * 100) / 100

                var result = (hours < 10 ? "0" + hours : hours);
                result += ":" + (minutes < 10 ? "0" + minutes : minutes);
                result += ":" + (seconds < 10 ? "0" + seconds : seconds);
                return result;
            }
            else
                return '';
        }

        function timeToSeconds(time) {
            if (time) {
                var timeSplit = time.split(':');
                if (timeSplit.length == 3)
                    return ((+timeSplit[0]) * 3600 + (+timeSplit[1]) * 60 + (+timeSplit[2])) * 10;
                else
                    return 0;
            }
            else
                return 0;
        }


        function vitesseMoyenne(distanceInMeters, timeInSeconds) {
            if (timeInSeconds > 0)
                return ((distanceInMeters / timeInSeconds) * 36).toFixed(2);
            else
                return 0;
        }

        function degreesToRadians(degrees) {
            return degrees * Math.PI / 180;
        }

        function distanceInKmBetweenEarthCoordinates(lat1, lon1, lat2, lon2) {
            var earthRadiusKm = 6371;

            var dLat = degreesToRadians(lat2 - lat1);
            var dLon = degreesToRadians(lon2 - lon1);

            lat1 = degreesToRadians(lat1);
            lat2 = degreesToRadians(lat2);

            var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
            var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            return earthRadiusKm * c;
        }
    }


})();