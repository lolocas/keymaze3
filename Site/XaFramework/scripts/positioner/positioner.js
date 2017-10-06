    'use strict';
    
    window.positioner = {};

    window.positioner.positionElementToRef = function ($elemToPosition, $elemTarget, forcePosition, autoWidth, isCombo, width) {
        function getBoundingRectangle(el) {
            return el[0].getBoundingClientRect();
        }


        forcePosition = forcePosition || 'auto';
        autoWidth = autoWidth == 'false';

        if ($elemTarget === undefined || $elemTarget.length === 0) {
            return;
        }

        //don't position hidden elements, except the first time to avoid flicking effect
        if ($elemToPosition.is(':hidden') && $elemToPosition.attr('data-positioned')) return;
        $elemToPosition.attr('data-positioned', '1');

        var elemRect = getBoundingRectangle($elemToPosition);
        var targetRect = getBoundingRectangle($elemTarget);
        var targetOffset = $elemTarget.offset();
        var $window = $(window);

        var position = { left: 'auto', right: 'auto' };

        var posWidth;
        // Pour les comobo si la textbox est plus grande que la valeur défini
        if (isCombo && width && targetRect.width > +width.replace('px', ''))
            posWidth = targetRect.width;
        else
            posWidth = width || targetRect.width;

        if (autoWidth) //flag to NOT set auto width, but get it from CSS
            posWidth = $elemToPosition.width();

        var winWidth = $window.width();
        var winHeight = $window.height();

        if (typeof posWidth == 'string') {
            if (posWidth.indexOf('px') > -1)
                posWidth = +posWidth.replace('px', '');
            else if (posWidth.indexOf('%') > -1) {
                var tmp = +posWidth.replace('%', '');
                posWidth = winWidth * tmp / 100;
            }

        }
        if (!autoWidth)
            position.width = posWidth; //set width!

        var alignTop = false;

        var alignLeft = false;
        if (forcePosition != 'auto') { //top left || bottom left
            alignLeft = forcePosition.indexOf('left') > -1;
            alignTop = forcePosition.indexOf('top') > -1;
        }
        else {
            alignLeft = targetOffset.left + posWidth <= winWidth;
            alignTop = targetOffset.top + targetRect.height - $window.scrollTop() + elemRect.height <= winHeight;
            //console.log('auto-aligning: req height: ', parentOffset.top + parentRect.height - windowElement.scrollTop() + rect.height, '; win height: ', winHeight);


            //if it doesn't fit in the window aka posWidth > winWidth, arrange left/right where the most space is!
            if (winWidth < posWidth) {
                var leftSpace = winWidth - (targetOffset.left + posWidth);
                var rightSpace = winWidth - (leftSpace + posWidth);

                alignLeft = leftSpace > rightSpace;
            }
            //if it doesn't fit in the window aka winHeight > rect.height, arrange top/bottom where the most space is.
            var availHeight = winHeight - targetOffset.top - targetRect.height;
            if (availHeight < elemRect.height) {
                var topSpace = targetOffset.top; //space on top of the trigger
                var bottomSpace = winHeight - (targetOffset.top + targetRect.height - $window.scrollTop()); //space below the trigger

                //console.log('popup won\'t fit in the window. top space: ', topSpace, '; bottom space: ', bottomSpace);
                alignTop = bottomSpace > topSpace;
                if (alignTop && bottomSpace < elemRect.height)
                    $elemToPosition.height(bottomSpace);
                else if (!alignTop && topSpace < elemRect.height)
                    $elemToPosition.height(topSpace);
            }
        }


        if (alignLeft)
            position.left = targetOffset.left;
        else position.right = winWidth - targetOffset.left - targetRect.width;

        if (alignTop)
            position.top = targetOffset.top + targetRect.height;
        else position.top = targetOffset.top - $elemToPosition.height();

        //edge case: the dropdown doesn't fit on right / left. pot left: 0 and hope to fit entire window :)
        if (position.right && winWidth - posWidth < position.right)
            position.right = 0;
        else if (position.left && winWidth - posWidth < position.left)
            position.left = 0;

        $elemToPosition.css(position);
    }
