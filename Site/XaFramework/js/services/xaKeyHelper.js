(function (local, key) {
    'use strict';

local.service('xaKeyHelper', function () {

    var ctx = this;

    //a pain to handle!!!! see https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent
    ctx.getKey = function (evt, evtType) {
        return evt.which || evt.keyCode || 0; //evt.key ||  -> this returns the actual key that was pressed!
    }

    ctx.isNumber = function (keyCode, isCtrlPressed, isShiftPressed) {
        return (keyCode >= 48 && keyCode <= 57);
    };

    ctx.isNavigationKey = function (keyCode) {
        return ctx.isEsc(keyCode) || ctx.isTab(keyCode) || ctx.isBackspace(keyCode) || ctx.isDelete(keyCode) || ctx.isArrowLeftRight(keyCode);
    };

    ctx.isCtrlA = function (keyCode, isCtrl) {
    	return keyCode == 97 && isCtrl;
    }

    ctx.isCtrlEnter = function (keyCode, isCtrl) {
        return ctx.isEnter(keyCode) && isCtrl;
    }

    ctx.getChar = function (keyCode) {
        return String.fromCharCode(keyCode);
    };

    ctx.padLeft = function (val, charCnt, padChar) {
        val = val || '';
        padChar = padChar || '0';
        var tmpVal = (val || '').toString();
        while (tmpVal.length < charCnt)
            tmpVal = padChar + tmpVal;

        return tmpVal;
    };

    ctx.insertCharAt = function (str, index, chr) {
        if (index == str.length) return str + chr;
        if (index > str.length - 1) return str;
        if (str.charAt(index) == chr) return str;

        return str.substr(0, index) + chr + str.substr(index);
    };

    ctx.setCharAt = function (str, index, chr) {
        if (index == str.length) return str + chr;
        if (index > str.length - 1) return str;
        if (str.charAt(index) == chr) return str;

        return str.substr(0, index) + chr + str.substr(index + 1);
    };

    ctx.isChar = function (keyCode, charToMatch) {
        return ctx.getChar(keyCode) == charToMatch;
    };

    ctx.isEsc = function (keyCode) {
        return keyCode == 27;
    };
    ctx.isSpace = function (keyCode) {
        return keyCode == 32;
    };
    ctx.isEnter = function (keyCode) {
        return keyCode == 13;
    };
    ctx.isTab = function (keyCode) {
        return keyCode == 9;
    };
    ctx.isBackspace = function (keyCode) {
        return keyCode == 8;
    };
    ctx.isDelete = function (keyCode) {
        return keyCode == 46;
    };
    ctx.isArrowLeftRight = function (keyCode) {
		// 39 right - 37 left - 38 Up 40 
    	//return (keyCode >=37 &&  keyCode <= 40);
    	return keyCode == 39 || keyCode == 37;
    };

    ctx.isArrow = function (keyCode) {
    	// 39 right - 37 left - 38 Up 40 
    	//return (keyCode >=37 &&  keyCode <= 40);
    	return keyCode >=37 &&  keyCode <= 40;
    };

    ctx.isArrowLeft = function (keyCode) {
        return keyCode == 37;
    };
    ctx.isArrowRight = function (keyCode) {
        return keyCode == 39;
    };
    ctx.isArrowUp = function (keyCode) {
        return keyCode == 38;
    };
    ctx.isArrowDown = function (keyCode) {
        return keyCode == 40;
    };
});
})(window.XaNgFrameworkServices, key);