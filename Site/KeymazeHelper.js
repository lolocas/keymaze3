(function () {
    'use strict';

    angular.module('Keymaze').service('KeymazeHelper', KeymazeHelper);

    function KeymazeHelper() {
        this.formatTime = formatTime;
        this.timeToSeconds = timeToSeconds;
        this.vitesseMoyenne = vitesseMoyenne;

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
    }


})();