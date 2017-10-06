angular.module('XaNgTemplates', ['../js/accordion/accordion.tpl.html', '../js/accordion/accordiongroup.tpl.html', '../js/buttonfilter/buttonfilter.tpl.html', '../js/buttons/button.advanced.tpl.html', '../js/buttons/button.tpl.html', '../js/colorpicker/colorpicker.popup.tpl.html', '../js/colorpicker/colorpicker.tpl.html', '../js/combobox/xa-combobox.selector.tpl.html', '../js/combobox/xa-combobox.tpl.html', '../js/datepicker/datepicker.tpl.html', '../js/gridslick/slickgrid.tpl.html', '../js/imagebutton/imagebutton.tpl.html', '../js/imagecheckbox/imagecheckbox.tpl.html', '../js/imageserver/imageserver.tpl.html', '../js/loading/loading.tpl.html', '../js/multibutton/multibutton.tpl.html', '../js/numerictextbox/numerictextbox.tpl.html', '../js/phonenumber/phonenumber.tpl.html', '../js/radio/radiolist.tpl.html', '../js/searchbox/searchbox.pattern.tpl.html', '../js/searchbox/searchbox.selector.tpl.html', '../js/searchbox/searchbox.tpl.html', '../js/selection/selection.tpl.html', '../js/services/dialogs/confirm.tpl.html', '../js/services/dialogs/error.tpl.html', '../js/services/dialogs/notify.tpl.html', '../js/services/errors/errors.client.tpl.html', '../js/services/errors/errors.noserver.tpl.html', '../js/services/errors/errors.server.tpl.html', '../js/services/toaster/xatoaster.tpl.html', '../js/simplemenu/accordionmenu.popup.tpl.html', '../js/simplemenu/simplemenu.popup.tpl.html', '../js/simplemenu/simplemenu.tpl.html', '../js/slider/slider.base.tpl.html', '../js/slider/slider.tpl.html', '../js/tab/tab.tpl.html', '../js/tab/tabitem.tpl.html', '../js/textarea/textarea.tpl.html', '../js/textbox/textbox-advanced.tpl.html', '../js/textbox/textbox.tpl.html', '../js/timepicker/timepicker.tpl.html', '../js/upload/upload.tpl.html', '../js/viewers/imageviewer.tpl.html', '../js/widgetcontainer/widget.tpl.html', '../js/widgetcontainer/widgetcontainer.tpl.html', '../js/window/advancedheader.tpl.html', '../js/window/backdrop.tpl.html', '../js/window/defaultheader.tpl.html', '../js/window/empty.tpl.html', '../js/xmldata/xmldata.tpl.html']);

angular.module("../js/accordion/accordion.tpl.html", []).run(["$templateCache", function ($templateCache) {
  $templateCache.put("../js/accordion/accordion.tpl.html",
    "<div class=\"panel-group\" ng-transclude></div>");
}]);

angular.module("../js/accordion/accordiongroup.tpl.html", []).run(["$templateCache", function ($templateCache) {
  $templateCache.put("../js/accordion/accordiongroup.tpl.html",
    "<div class=\"panel panel-default\">\n" +
    "  <div class=\"panel-heading\">\n" +
    "    <h4 class=\"panel-title\">\n" +
    "      <a class=\"accordion-toggle\" ng-click=\"toggleOpen();\" xa-accordion-transclude=\"heading\" href=\"javascript:void(0);\">\n" +
    "        <i class=\"pull-left glyphicon\" ng-class=\"{'glyphicon-chevron-down': isOpen, 'glyphicon-chevron-right': !isOpen}\"></i>\n" +
    "        <span ng-class=\"{'text-muted': isDisabled}\">{{heading}}</span>\n" +
    "      </a>\n" +
    "    </h4>\n" +
    "  </div>\n" +
    "  <div class=\"panel-collapse\" collapse=\"!isOpen\">\n" +
    "      <div class=\"panel-body\">\n" +
    "          <div ng-transclude ng-if=\"wasExpanded || !virtualise\"></div>\n" +
    "      </div>  \n" +
    "  </div>\n" +
    "</div>");
}]);

angular.module("../js/buttonfilter/buttonfilter.tpl.html", []).run(["$templateCache", function ($templateCache) {
  $templateCache.put("../js/buttonfilter/buttonfilter.tpl.html",
    "<div class=\"buttonFilterContainer\">\n" +
    "    <div class=\"pull-left leftContainer\">\n" +
    "        <div class=\"buttonContainer pull-left\">\n" +
    "            <xa-button-advanced ng-repeat=\"opt in options\"\n" +
    "                                xa-draggable\n" +
    "                                class=\"{{opt.typeFilter=='P' ? 'green': ''}}\"\n" +
    "                                drag-context=\"delete{{::idControl}}\"\n" +
    "                                drag-data=\"opt\"\n" +
    "                                text=\"opt.text\"\n" +
    "                                click=\"itemClick(opt)\"\n" +
    "                                selected=\"selectedItem == opt\">\n" +
    "            </xa-button-advanced>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "    <div class=\"pull-right rightContainer\">\n" +
    "        <div class=\"scrollMask\">\n" +
    "            <div class=\"fakeScroll\">&nbsp;</div>\n" +
    "        </div>\n" +
    "        <div class=\"actionButtonContainer pull-left\">\n" +
    "            <a href=\"javascript:void(0)\"\n" +
    "               class=\"delete-icon rotate\"\n" +
    "               xa-drop-target\n" +
    "               test-id=\"btnDeleteFilter\"\n" +
    "               drag-context=\"delete{{::idControl}}\"\n" +
    "               on-drop=\"itemDrop(data)\"\n" +
    "               ng-show=\"hasDelete\"></a>\n" +
    "\n" +
    "            <a href=\"javascript:void(0)\"\n" +
    "               class=\"conf-icon rotate\"\n" +
    "               test-id=\"btnConfFilter\"\n" +
    "               ng-click=\"confClick()\"\n" +
    "               ng-show=\"hasConf\"></a>\n" +
    "\n" +
    "            <a href=\"javascript:void(0)\"\n" +
    "             \n" +
    "               class=\"visu-icon rotate\"\n" +
    "               test-id=\"btnVisuFilter\"\n" +
    "               ng-click=\"visuClick()\"></a>\n" +
    "\n" +
    "        </div>\n" +
    "    </div>\n" +
    "    <div class=\"clearfix\"></div>\n" +
    "</div>");
}]);

angular.module("../js/buttons/button.advanced.tpl.html", []).run(["$templateCache", function ($templateCache) {
  $templateCache.put("../js/buttons/button.advanced.tpl.html",
    "<a class=\"xang xa-form-button\" ng-click=\"click()\" ng-class=\"{ selected: selected, disabled: disabled }\" href=\"javascript:void(0);\">\n" +
    "    <div class=\"back\">\n" +
    "        {{text}}\n" +
    "    </div>\n" +
    "</a>");
}]);

angular.module("../js/buttons/button.tpl.html", []).run(["$templateCache", function ($templateCache) {
  $templateCache.put("../js/buttons/button.tpl.html",
    "<a class=\"xang xa-form-button\" ng-click=\"click()\" href=\"javascript:void(0);\">\n" +
    "    <div class=\"back\">\n" +
    "        {{::text}}\n" +
    "    </div>\n" +
    "</a>");
}]);

angular.module("../js/colorpicker/colorpicker.popup.tpl.html", []).run(["$templateCache", function ($templateCache) {
  $templateCache.put("../js/colorpicker/colorpicker.popup.tpl.html",
    "<ul class=\"colorPickerPopup xa-dropdown-menu dropdown-menu\">\n" +
    "    <li ng-repeat=\"col in colorList\" ng-class=\"{'selected': $parent.color == col}\"><a href=\"javascript:void(0);\" ng-click=\"$parent.selectColor(col)\" ng-style=\"{'background-color': col}\"></a></li>\n" +
    "    <li class=\"customColorContainer\">\n" +
    "        <input type=\"text\" class=\"form-control customColor\" ng-model=\"customColor\" style=\"\" />\n" +
    "        <xa-button-advanced click=\"selectColor(customColor, $event)\" class=\"customButton\" text=\"SELECT_COLOR\"></xa-button-advanced>\n" +
    "    </li>\n" +
    "\n" +
    "</ul>\n" +
    "");
}]);

angular.module("../js/colorpicker/colorpicker.tpl.html", []).run(["$templateCache", function ($templateCache) {
  $templateCache.put("../js/colorpicker/colorpicker.tpl.html",
    "<div class=\"colorPicker form-control\">\n" +
    "    <a class=\"selColor\" ng-style=\"{'background-color': color}\" ng-click=\"togglePopup($event)\"></a>\n" +
    "    <a class=\"remove\" ng-click=\"removeColor()\"><i class=\"glyphicon glyphicon-remove\" /></a>\n" +
    "</div>");
}]);

angular.module("../js/combobox/xa-combobox.selector.tpl.html", []).run(["$templateCache", function ($templateCache) {
  $templateCache.put("../js/combobox/xa-combobox.selector.tpl.html",
    "<div class=\"xa-dropdown-menu dropdown-menu\"\n" +
    "	 ng-show=\"show\"\n" +
    "	 xa-positioner=\"{{::ownerId}}\"\n" +
    "	 xa-positioner-on-scroll=\"onContainerScroll()\"\n" +
    "	 role=\"listbox\">\n" +
    "	<div class=\"rows\">\n" +
    "		<xa-slick-grid grid-options=\"gridOptions\"></xa-slick-grid>\n" +
    "	</div>\n" +
    "</div>");
}]);

angular.module("../js/combobox/xa-combobox.tpl.html", []).run(["$templateCache", function ($templateCache) {
  $templateCache.put("../js/combobox/xa-combobox.tpl.html",
    "<div class=\"xa-combobox xaInputControl\" ng-class=\"{'controlDisabled': !canedit}\">\n" +
    "    <div class=\"right-inner-addon\">\n" +
    "        <i class=\"glyphicon xaHideOnDisable glyphicon-chevron-down\" tabindex=\"-1\" ></i>\n" +
    "        <input type=\"text\"\n" +
    "               xa-combo-box-input=\"\"\n" +
    "               ng-model=\"dataSource.displayText\"\n" +
    "               ng-disabled=\"!canedit\"\n" +
    "               ng-trim=\":false\"\n" +
    "               class=\"form-control xaValidationTooltip\"\n" +
    "               autocomplete=\"off\"\n" +
    "               ng-class=\"{'xaDisabledIgnore': !canedit }\" />\n" +
    "    </div>\n" +
    "</div> ");
}]);

angular.module("../js/datepicker/datepicker.tpl.html", []).run(["$templateCache", function ($templateCache) {
  $templateCache.put("../js/datepicker/datepicker.tpl.html",
    "<div class=\"xa-date-picker date-picker xaInputControl\" ng-class=\"{'controlDisabled': !canedit}\">\n" +
    "\n" +
    "	<div class=\"xa-date-picker-wrap\">\n" +
    "\n" +
    "        <input type=\"text\"\n" +
    "               class=\"form-control xaValidationTooltip xaDatePicker\"\n" +
    "               ng-class=\"{focus: focus}\"\n" +
    "               ng-model=\"displayValue\"\n" +
    "               ng-model-options=\"{ updateOn: 'blur' }\"\n" +
    "               placeholder=\"{{datePlaceholder}}\"\n" +
    "               ng-disabled=\"!canedit\" maxlength=\"10\" />\n" +
    "\n" +
    "		<div class=\"date-picker-buttons\" ng-show=\"!isDisabled\">\n" +
    "			<div class=\"date-picker-button left xaHideOnDisable\">\n" +
    "\n" +
    "				<div class=\"up\" ng-click=\"up()\">\n" +
    "					<span class=\"helper\">\n" +
    "						<i class=\"glyphicon glyphicon-chevron-up\"></i>\n" +
    "					</span>\n" +
    "				</div>\n" +
    "\n" +
    "				<div class=\"down\" ng-click=\"down()\">\n" +
    "					<span class=\"helper\">\n" +
    "						<i class=\"glyphicon glyphicon-chevron-down\"></i>\n" +
    "					</span>\n" +
    "				</div>\n" +
    "			</div>\n" +
    "\n" +
    "			<div class=\"date-picker-button right toggle xaHideOnDisable\" ng-click=\"toggle()\">\n" +
    "				<span class=\"helper\">\n" +
    "					<i class=\"glyphicon glyphicon-calendar\"></i>\n" +
    "				</span>\n" +
    "			</div>\n" +
    "		</div>\n" +
    "\n" +
    "	</div>\n" +
    "\n" +
    "</div>");
}]);

angular.module("../js/gridslick/slickgrid.tpl.html", []).run(["$templateCache", function ($templateCache) {
  $templateCache.put("../js/gridslick/slickgrid.tpl.html",
    "<div class=\"gridContainer xa-slick-grid\" ng-class=\"{ 'no-header': gridOptions.noGroupingHeader }\" data-gridname=\"{{gridOptions.gridName}}\">\n" +
    "    <xa-upload-button ng-if=\"gridOptions.uploadOptions\" upload-options=\"gridOptions.uploadOptions\"></xa-upload-button>\n" +
    "  \n" +
    " 	<div class=\"xa-slick-grid-header\" ng-hide=\"gridOptions.noGroupingHeader\">\n" +
    "		<div class=\"xa-slick-grid-group-elements\">\n" +
    "           	<span class=\"group-indicator\" ng-if=\"!groups.length\">{{::'TXT_GRID_GROUP_INDICATOR' | tr}}</span>\n" +
    "			<ul ng-if=\"groups.length\" class=\"groupList\">\n" +
    "				<li ng-repeat=\"group in groups\">\n" +
    "					<span class=\"grip-group-label\">\n" +
    "						<span ng-click=\"sortGroup($index)\">\n" +
    "							<span ng-bind=\"group.name\"></span>\n" +
    "							<span class=\"slick-sort-indicator\" ng-class=\"group.sortClassName\"></span>\n" +
    "						</span>\n" +
    "                        <span class=\"remove\" ng-click=\"removeGroup($index)\">x</span>\n" +
    "					</span>\n" +
    "					<span ng-if=\"!$last\" class=\"group-arrow\"></span>\n" +
    "				</li>\n" +
    "			</ul>\n" +
    "		</div>\n" +
    "\n" +
    "		<ul class=\"xa-slick-grid-header-buttons gridButtons\">\n" +
    "            <li ng-if=\"::quickSearchFn\">\n" +
    "                <xa-label resource-key=\"TXT_RECHERCHE\"></xa-label>:\n" +
    "            </li>\n" +
    "            <li ng-if=\"::quickSearchFn\">\n" +
    "                <xa-text-box input-value=\"$parent.searchValue\" on-enter=\"quickSearchFn\" class=\"slickSearchInput\"></xa-text-box>\n" +
    "            </li>\n" +
    "			<li id=\"gridRowCount\"></li>\n" +
    "			<li ng-repeat=\"btn in ::gridOptions.gridButtons\" ng-show=\"isHeaderButtonVisible(btn)\">\n" +
    "                <xa-image-button click=\"btn.click(gridOptions);\" imgurl=\"{{:: btn.imgUrl}}\" resource-key=\"{{::btn.resourceKey}}\" class=\"{{::btn.cssClass}}\"></xa-image-button>\n" +
    "			</li>\n" +
    "            <li ng-if=\"::deleteFn\" style=\"width:30px\">\n" +
    "                <xa-image-button dynimgurl=\"imgTrashUrl\" resource-key=\"TXT_SUPPRIMER\" class=\"delete{{::gridOptions.gridName}}\"></xa-image-button>\n" +
    "            </li>\n" +
    "		</ul>\n" +
    "	</div>\n" +
    "\n" +
    "	<div class=\"xa-slick-grid-host\" style=\"\"></div>\n" +
    "</div>");
}]);

angular.module("../js/imagebutton/imagebutton.tpl.html", []).run(["$templateCache", function ($templateCache) {
  $templateCache.put("../js/imagebutton/imagebutton.tpl.html",
    "<a class=\"icon\" ng-click=\"clickFn();\" href=\"javascript:void(0)\">\n" +
    "    <img  class=\"rotate\"  />\n" +
    "</a> ");
}]);

angular.module("../js/imagecheckbox/imagecheckbox.tpl.html", []).run(["$templateCache", function ($templateCache) {
  $templateCache.put("../js/imagecheckbox/imagecheckbox.tpl.html",
    "<a class=\"imageCheckbox xaInputControl\">\n" +
    "    <img />\n" +
    "    <span class=\"lbl\"></span>\n" +
    "</a>");
}]);

angular.module("../js/imageserver/imageserver.tpl.html", []).run(["$templateCache", function ($templateCache) {
  $templateCache.put("../js/imageserver/imageserver.tpl.html",
    "<img ng-src=\"{{ imageServerUrl }}\" />\n" +
    "  ");
}]);

angular.module("../js/loading/loading.tpl.html", []).run(["$templateCache", function ($templateCache) {
  $templateCache.put("../js/loading/loading.tpl.html",
    "<div id=\"LoadingPanel\" class=\"xa-loading-indicator\">\n" +
    "    <div class=\"overlayContainer\"></div>\n" +
    "    <div class=\"loadingContent\">\n" +
    "        <p>\n" +
    "            <span class=\"title\">Please Wait...</span>\n" +
    "            <span class=\"subtitlefixed\">Loading In Progress...</span>\n" +
    "            <span class=\"subtitle\">{{loadingCustomMessage}}</span>\n" +
    "            <span class=\"indicator\" ng-if=\"::!loadingImage\"></span>\n" +
    "            <span class=\"subtitle\"><input type=\"button\" ng-if=\"loadingCancel\" ng-click=\"cancelClick()\" value=\"ANNULER\" id=\"loadingCancelButton\"></input></span>\n" +
    "        </p>\n" +
    "    </div>\n" +
    "</div>");
}]);

angular.module("../js/multibutton/multibutton.tpl.html", []).run(["$templateCache", function ($templateCache) {
  $templateCache.put("../js/multibutton/multibutton.tpl.html",
    "<div class=\"btn-group multiButton xaInputControl\"> \n" +
    "  <button type=\"button\" class=\"btn xaButton\" ng-click=\"actionClick(selectedAction,$event)\" test-id=\"mbtn{{ selectedAction.label | uppercase }}\">{{ selectedAction.label }}</button>\n" +
    "  <button type=\"button\" class=\"btn xaButton dropdown-toggle\" ng-disabled=\"!enableMenu\" ng-click=\"toggleMenu($event)\" test-id=\"btnChangeAction\">\n" +
    "    <span class=\"caret\"></span>\n" +
    "    <span class=\"sr-only\">Toggle Dropdown</span>\n" +
    "  </button>\n" +
    "  <ul class=\"dropdown-menu\" role=\"menu\" ng-show=\"enableMenu\">\n" +
    "    <li ng-repeat=\"action in menuActions track by action.code\">\n" +
    "        <a href=\"javascript:void(0);\" test-id=\"{{ ::action.testId }}\" ng-click=\"actionClick(action, $event)\">{{ ::action.label }}</a>\n" +
    "    </li>\n" +
    "  </ul>\n" +
    "</div>");
}]);

angular.module("../js/numerictextbox/numerictextbox.tpl.html", []).run(["$templateCache", function ($templateCache) {
  $templateCache.put("../js/numerictextbox/numerictextbox.tpl.html",
    "<input type=\"text\" class=\"xa-textbox xa-textboxnumeric form-control xaValidationTooltip xaInputControl\" ng-class=\"{'xaDisabledIgnore': canedit }\" ng-model-options=\"{ updateOn: 'blur'}\" ng-model=\"internValue\" ng-disabled=\"!canedit\" />");
}]);

angular.module("../js/phonenumber/phonenumber.tpl.html", []).run(["$templateCache", function ($templateCache) {
  $templateCache.put("../js/phonenumber/phonenumber.tpl.html",
    "<div class=\"right-inner-addon xaInputControl\" ng-class=\"{'controlDisabled': !canedit}\">\n" +
    "    <i class=\"glyphicon glyphicon-earphone xaHideOnDisable\"></i>\n" +
    "    <input type=\"text\" class=\"form-control\" ng-model=\"internValue\" maxlength=\"25\" ng-model-options=\"{ updateOn: 'blur'}\" ng-disabled=\"!canedit\" />\n" +
    "</div>");
}]);

angular.module("../js/radio/radiolist.tpl.html", []).run(["$templateCache", function ($templateCache) {
  $templateCache.put("../js/radio/radiolist.tpl.html",
    "<ul class=\"XaRadioList radioList\">\n" +
    "    <li ng-repeat=\"val in _innerSource track by $index\" ng-style=\"{ 'width': itemWidth }\">\n" +
    "        <a class=\"radioButton\" test-id=\"{{::val.testId}}\" ng-class=\"{selected: $parent.selection == val.value, disabled: !$parent.canedit, 'xaValidationTooltip': $first}\" tabindex=\"0\" ng-click=\"internalChange(val)\" ng-keypress=\"keyPress(val, $event)\">\n" +
    "            <span class=\"icon\"></span>\n" +
    "            <span class=\"text\">{{::val.text}}</span>\n" +
    "        </a>\n" +
    "    </li>\n" +
    "</ul>");
}]);

angular.module("../js/searchbox/searchbox.pattern.tpl.html", []).run(["$templateCache", function ($templateCache) {
  $templateCache.put("../js/searchbox/searchbox.pattern.tpl.html",
    "<div class=\"xa-searchbox-pattern xaHideOnDisable\">\n" +
    "	<span ng-bind-html=\"controlSettings.searchPattern | searchboxPatternHighlight:highlightText:activeSeparatorInterval\"></span>\n" +
    "</div>");
}]);

angular.module("../js/searchbox/searchbox.selector.tpl.html", []).run(["$templateCache", function ($templateCache) {
  $templateCache.put("../js/searchbox/searchbox.selector.tpl.html",
    "<div class=\"xa-searchbox-selector xa-dropdown-menu dropdown-menu\"\n" +
    "	 xa-positioner=\"{{::ownerId}}\"\n" +
    "	 xa-positioner-on-scroll=\"onContainerScroll()\"\n" +
    "	 ng-show=\"visible()\"\n" +
    "	 role=\"listbox\"\n" +
    "	 ng-style=\"popupStyle\">\n" +
    "	<div class=\"rows\">\n" +
    "		<xa-slick-grid grid-options=\"gridOptions\"></xa-slick-grid>\n" +
    "	</div>\n" +
    "	<div class=\"xa-searchbox-messages\" ng-if=\"showTooManyRows\">\n" +
    "		{{::maxDataReachedMessage}}\n" +
    "	</div>\n" +
    "</div>");
}]);

angular.module("../js/searchbox/searchbox.tpl.html", []).run(["$templateCache", function ($templateCache) {
  $templateCache.put("../js/searchbox/searchbox.tpl.html",
    "<div class=\"xa-searchbox xaInputControl\" ng-class=\"{ focus: (focus || show) && !readonly, 'controlDisabled': !canedit }\">\n" +
    "\n" +
    "    <xa-search-box-pattern></xa-search-box-pattern>\n" +
    "\n" +
    "    <input type=\"text\"\n" +
    "           xa-search-box-input=\"\"\n" +
    "           ng-readonly=\"readonly\"\n" +
    "           ng-style=\"inputStyle\"\n" +
    "           ng-model=\"selectedText\"\n" +
    "           class=\"form-control\"\n" +
    "           ng-disabled=\"!canedit\"\n" +
    "           autocomplete=\"off\" />\n" +
    "\n" +
    "    <div class=\"searchbox-buttons\">\n" +
    "        <ul>\n" +
    "        <li class=\"search-button glyphicon xaHideOnDisable\" ng-mousedown=\"$event.preventDefault(); search(); \" ng-if=\"!readonly\"><img test-id=\"btnRechercher\" src=\"XaFramework/img/search.png\" /></li>\n" +
    "        <li class=\"custom-button glyphicon xaHideOnDisable\" ng-click=\"clear();\"  ng-if=\"readonly\"><img test-id=\"btnAnnuler\" src=\"XaFramework/img/erase.png\" /></li>\n" +
    "		<li class=\"custom-button glyphicon\" \n" +
    "		   tabindex=\"-1\"\n" +
    "           ng-repeat=\"action in visibleCustomActions\"\n" +
    "		   ng-mousedown=\"runAction(action)\"><img title=\"{{:: action.text }}\" test-id=\"{{:: action.testId }}\" ng-src=\"{{:: action.img }}\" /></li>\n" +
    "        </ul>\n" +
    "    </div>\n" +
    "\n" +
    "    <div class=\"xa-searchbox-messages no-results\" ng-show=\"showNoDataFound\">\n" +
    "        <div>{{::'TXT_SEARCHBOX_NODATA' | tr}}</div>\n" +
    "    </div>\n" +
    "\n" +
    "</div>");
}]);

angular.module("../js/selection/selection.tpl.html", []).run(["$templateCache", function ($templateCache) {
  $templateCache.put("../js/selection/selection.tpl.html",
    "<div class=\"listType action-bar-background\" ng-click=\"toggle()\" title=\"{{value.text}}\">\n" +
    "    <div class=\"sel-bg-hoverable\"></div>\n" +
    "    <div class=\"head\">\n" +
    "        <span class=\"selText\">{{:: currSelText}}</span>\n" +
    "        <span class=\"currSel truncate {{ inputValue.style }}\">{{inputValue.text}}</span>\n" +
    "    </div>\n" +
    "    <ul class=\"ng-hide listMenu ngShowAnimation\" ng-show=\"showListSelection\">\n" +
    "        <li ng-repeat=\"opt in options track by $index\" ng-title=\"opt.val\" ng-mouseenter=\"activateIndex($index)\">\n" +
    "            <a ng-click=\"changeFn(opt)\" href=\"javascript:void(0);\" test-id=\"{{::opt.resourceKey}}\" ng-class=\"{ active: isActive($index) }\">{{::opt.text}}</a>\n" +
    "        </li>\n" +
    "    </ul>\n" +
    "</div>");
}]);

angular.module("../js/services/dialogs/confirm.tpl.html", []).run(["$templateCache", function ($templateCache) {
  $templateCache.put("../js/services/dialogs/confirm.tpl.html",
    "<xa-window-default-header dyntitle=\"header\" icon=\"XaFramework/img/popup/MsgIconQuestion.png\"></xa-window-default-header>\n" +
    "<div class=\"modal-body window-content clearfix dialog-body\">\n" +
    "    <div test-id=\"txtConfirmMessage\" ng-bind-html=\"::msg\"></div>\n" +
    "</div>\n" +
    "<xa-window-footer></xa-window-footer>\n" +
    "");
}]);

angular.module("../js/services/dialogs/error.tpl.html", []).run(["$templateCache", function ($templateCache) {
  $templateCache.put("../js/services/dialogs/error.tpl.html",
    "<xa-window-default-header dyntitle=\"header\" hidevalidate=\"true\" hideclose=\"hideClose\"  icon=\"XaFramework/img/popup/MsgIconError.png\"></xa-window-default-header>\n" +
    "<div class=\"modal-body window-content clearfix dialog-body\">\n" +
    "    <div test-id=\"txtErrorMessage\" ng-bind-html=\"::msg\"></div>\n" +
    "</div>\n" +
    "<xa-window-footer></xa-window-footer>\n" +
    "");
}]);

angular.module("../js/services/dialogs/notify.tpl.html", []).run(["$templateCache", function ($templateCache) {
  $templateCache.put("../js/services/dialogs/notify.tpl.html",
    "<xa-window-default-header dyntitle=\"header\" hidevalidate=\"true\" icon=\"XaFramework/img/popup/MsgIconInfo.png\"></xa-window-default-header>\n" +
    "<div class=\"modal-body window-content clearfix dialog-body\">\n" +
    "    <div test-id=\"txtNotifyMessage\" ng-bind-html=\"::msg\"></div>\n" +
    "</div>\n" +
    "<xa-window-footer></xa-window-footer>\n" +
    " ");
}]);

angular.module("../js/services/errors/errors.client.tpl.html", []).run(["$templateCache", function ($templateCache) {
  $templateCache.put("../js/services/errors/errors.client.tpl.html",
    "<xa-window-default-header icon=\"XaFramework/img/popup/MsgIconError.png\" hidevalidate=\"true\" hideclose=\"false\" resource-key=\"Javascript Exception\"></xa-window-default-header>\n" +
    "<div class=\"modal-body window-content clearfix\">\n" +
    "        \n" +
    "    <div class=\"error-body\">\n" +
    "        <div><span class=\"field\">message:</span><span>{{error.instance.exception.message}}</span></div>\n" +
    "        <div><span class=\"field\">cause:</span><span>{{error.instance.cause}}</span></div>\n" +
    "        <div><span class=\"field\">stack:</span><pre>{{error.instance.exception.stack}}</pre></div>\n" +
    "    </div>\n" +
    "\n" +
    "</div>\n" +
    "<xa-window-footer></xa-window-footer>\n" +
    "");
}]);

angular.module("../js/services/errors/errors.noserver.tpl.html", []).run(["$templateCache", function ($templateCache) {
  $templateCache.put("../js/services/errors/errors.noserver.tpl.html",
    "<xa-window-default-header resource-key=\"Erreur / Error\" hidevalidate=\"true\" hidecancel=\"true\"></xa-window-default-header>\n" +
    "<div class=\"modal-body window-content clearfix dialog-body\">\n" +
    "    <div align=\"center\">\n" +
    "        Impossible de contacter le serveur / Unable to contact the server <br /><br />\n" +
    "        Si le problème persiste veuillez contacter votre administrateur <br />  If the problem continue please contact your administrator.';\n" +
    "        <br /><br />\n" +
    "        Url : {{ error.instance.config.url}}\n" +
    "        <br />\n" +
    "        <br />\n" +
    "        <div align=\"center\"><input onclick=\"javascript:location.reload()\" type=\"button\" value=\"Redemarrer l'application\" /></div>\n" +
    "    </div>\n" +
    "</div>\n" +
    "<xa-window-footer></xa-window-footer>\n" +
    "");
}]);

angular.module("../js/services/errors/errors.server.tpl.html", []).run(["$templateCache", function ($templateCache) {
  $templateCache.put("../js/services/errors/errors.server.tpl.html",
    "<xa-window-default-header icon=\"XaFramework/img/popup/MsgIconError.png\" hidevalidate=\"true\" hideclose=\"false\" dyntitle=\"error.instance.statusText\"></xa-window-default-header>\n" +
    "<div class=\"modal-body window-content clearfix\">\n" +
    "        \n" +
    "    <div class=\"error-body\">\n" +
    "        <div><span class=\"field\">Request:</span><span>{{error.instance.config.method + ' - ' + error.instance.config.url}}</span></div>\n" +
    "        <div><span class=\"field\">exceptionMessage:</span><span>{{error.instance.data.ExceptionMessage}}</span></div>\n" +
    "        <div><span class=\"field\">exceptionType:</span><span>{{error.instance.data.ExceptionType}}</span></div>\n" +
    "        <div><span class=\"field\">message:</span><span>{{error.instance.data.Message}}</span></div>\n" +
    "        <div><span class=\"field\">stackTrace:</span><pre>{{error.instance.data.StackTrace}}</pre></div>\n" +
    "    </div>\n" +
    "\n" +
    "</div>\n" +
    "<xa-window-footer></xa-window-footer>\n" +
    "");
}]);

angular.module("../js/services/toaster/xatoaster.tpl.html", []).run(["$templateCache", function ($templateCache) {
  $templateCache.put("../js/services/toaster/xatoaster.tpl.html",
    "<div id=\"toast-container\" ng-class=\"config.position\">\n" +
    "    <div ng-repeat=\"toaster in toasters track by $index\" class=\"toast\" ng-class=\"toaster.type\" ng-click=\"click(toaster)\" ng-mouseover=\"stopTimer(toaster)\" ng-mouseout=\"restartTimer(toaster)\">\n" +
    "        <button class=\"toast-close-button\" ng-show=\"config.closeButton\">&times;</button>\n" +
    "        <div ng-class=\"config.title\">{{toaster.title}}</div>\n" +
    "        <div ng-class=\"config.message\" ng-switch on=\"toaster.bodyOutputType\">\n" +
    "            <div ng-switch-when=\"trustedHtml\" ng-bind-html=\"toaster.html\"></div>\n" +
    "            <div ng-switch-when=\"template\">\n" +
    "                <div ng-include=\"toaster.bodyTemplate\"></div>\n" +
    "            </div>\n" +
    "            <div ng-switch-default><p class=\"toast-message\">{{toaster.body}}</p></div>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</div>\n" +
    "");
}]);

angular.module("../js/simplemenu/accordionmenu.popup.tpl.html", []).run(["$templateCache", function ($templateCache) {
  $templateCache.put("../js/simplemenu/accordionmenu.popup.tpl.html",
    "<div class=\"ng-hide listMenu ngShowAnimation menuDropdown menuAccordion\" ng-show=\"showListSelection\">\n" +
    "    <xa-accordion close-others=\"true\">\n" +
    "        <xa-accordion-group ng-repeat=\"opt in options track by $index\" resource-key=\"{{::opt.resourceKey}}\" is-open=\"opt.isOpen\">\n" +
    "            <ul>\n" +
    "                <li ng-repeat=\"l2 in opt.items\" ng-class=\"{ 'active': l2 == selectedItem }\">\n" +
    "                    <a ng-click=\"changeFn(l2);\" test-id=\"{{:: l2.testId}}\">\n" +
    "                         <img ng-src=\"{{::l2.icon}}\" ng-if=\"l2.icon\" />\n" +
    "                        {{l2.text}}\n" +
    "                    </a>\n" +
    "                </li>\n" +
    "            </ul>\n" +
    "        </xa-accordion-group>\n" +
    "    </xa-accordion>\n" +
    "</div>");
}]);

angular.module("../js/simplemenu/simplemenu.popup.tpl.html", []).run(["$templateCache", function ($templateCache) {
  $templateCache.put("../js/simplemenu/simplemenu.popup.tpl.html",
    "<ul class=\"ng-hide listMenu ngShowAnimation menuDropdown\" ng-show=\"showListSelection\">\n" +
    "    <li ng-repeat=\"opt in ::options track by $index\" ng-title=\"opt.val\" ng-mouseenter=\"activateIndex($index)\" ng-class=\"{'header': opt.isHeader }\">\n" +
    "        <a ng-click=\"changeFn(opt)\" href=\"javascript:void(0);\" ng-class=\"{ active: isActive($index) }\" test-id=\"{{:: opt.testId}}\">\n" +
    "            <img ng-src=\"{{::opt.icon}}\" ng-if=\"opt.icon\" />\n" +
    "            <span ng-bind-html=\"opt.text\"></span>\n" +
    "        </a>\n" +
    "    </li>\n" +
    "</ul>\n" +
    "");
}]);

angular.module("../js/simplemenu/simplemenu.tpl.html", []).run(["$templateCache", function ($templateCache) {
  $templateCache.put("../js/simplemenu/simplemenu.tpl.html",
    "<div class=\"simpleMenu action-bar-background\" ng-show=\":: showMenu\" ng-click=\"toggle($event)\">\n" +
    "    <div class=\"sel-bg-hoverable\"></div>\n" +
    "    <div class=\"head\">\n" +
    "        <span class=\"selText\"><img ng-src=\"{{menuIcon}}\" ng-if=\"menuIcon\" /> {{menuText}}</span>\n" +
    "    </div>\n" +
    "</div> ");
}]);

angular.module("../js/slider/slider.base.tpl.html", []).run(["$templateCache", function ($templateCache) {
  $templateCache.put("../js/slider/slider.base.tpl.html",
    "<div class=\"xa-slider-wrap\">\n" +
    "	<div class=\"xa-slider-handle\"></div>\n" +
    "</div>");
}]);

angular.module("../js/slider/slider.tpl.html", []).run(["$templateCache", function ($templateCache) {
  $templateCache.put("../js/slider/slider.tpl.html",
    "<div class=\"xa-slider\" ng-class=\"{ 'xa-slider-enabled': slider.canedit }\">\n" +
    "	<xa-slider-base slider-value=\"slider.sliderPercent\"\n" +
    "					  realtime=\"slider.realtime\"\n" +
    "					  step=\"slider.percentageStep\"\n" +
    "					  canedit=\"slider.canedit\"></xa-slider-base>\n" +
    "</div>\n" +
    "");
}]);

angular.module("../js/tab/tab.tpl.html", []).run(["$templateCache", function ($templateCache) {
  $templateCache.put("../js/tab/tab.tpl.html",
    "<div class=\"tabContainer tabStandalone {{theme}}\">\n" +
    "  <ul class=\"nav nav-{{type || 'tabs'}}\" ng-class=\"{'nav-stacked': vertical, 'nav-justified': justified}\" ng-transclude></ul>\n" +
    "  <div class=\"tab-content clearfix\">\n" +
    "    <div class=\"tab-pane\" \n" +
    "         ng-repeat=\"tab in tabs track by $index\" \n" +
    "         ng-class=\"{active: tab.active}\">\n" +
    "        <div xa-tab-content-transclude=\"tab\"></div> \n" +
    "    </div>\n" +
    "  </div>\n" +
    "</div>");
}]);

angular.module("../js/tab/tabitem.tpl.html", []).run(["$templateCache", function ($templateCache) {
  $templateCache.put("../js/tab/tabitem.tpl.html",
    "<li ng-class=\"{active: active, disabled: disabled}\">\n" +
    "	<xa-button-advanced text=\"heading\" resource-key=\"{{ ::resourceKey }}\" click=\"select()\" selected=\"active\"></xa-button-advanced>\n" +
    "</li>");
}]);

angular.module("../js/textarea/textarea.tpl.html", []).run(["$templateCache", function ($templateCache) {
  $templateCache.put("../js/textarea/textarea.tpl.html",
    "<textarea type=\"text\" class=\"form-control xaInputControl\" ng-class=\"{'xaDisabledIgnore': !canedit }\" ng-model-options=\"{ updateOn: 'blur'}\" ng-model=\"internalValue\" ng-readonly=\"!canedit\"></textarea>");
}]);

angular.module("../js/textbox/textbox-advanced.tpl.html", []).run(["$templateCache", function ($templateCache) {
  $templateCache.put("../js/textbox/textbox-advanced.tpl.html",
    "<div class=\"xaInputControl xaTextbox\">\n" +
    "    <xa-text-box canedit=\"canedit\"  will-change=\"willChange\"  input-value=\"inputValue\" did-change=\"didChange\" on-enter=\"onEnter\"  only-numeric=\"{{onlyNumeric}}\" minlength=\"{{minlength}}\" ignore-chars=\"{{ignoreChars}}\" maxlength=\"{{maxlength}}\" capitalize=\"{{capitalize}}\"></xa-text-box>\n" +
    "    <a   ng-click=\"restoreDefaultValue();\" href=\"javascript:void(0);\" class=\"restore\"><i class=\"glyphicon glyphicon-circle-arrow-left xaHideOnDisable\"></i></a>\n" +
    "</div>\n" +
    "");
}]);

angular.module("../js/textbox/textbox.tpl.html", []).run(["$templateCache", function ($templateCache) {
  $templateCache.put("../js/textbox/textbox.tpl.html",
    "<div class=\"xaInputControl xaTextbox\">\n" +
    "<input type=\"text\" class=\"xa-textbox form-control xaValidationTooltip\" ng-class=\"{'xaDisabledIgnore': !canedit }\" ng-model-options=\"{ updateOn: 'blur'}\" ng-model=\"internalValue\" ng-disabled=\"!canedit\" />\n" +
    "\n" +
    "</div>");
}]);

angular.module("../js/timepicker/timepicker.tpl.html", []).run(["$templateCache", function ($templateCache) {
  $templateCache.put("../js/timepicker/timepicker.tpl.html",
    "<div class=\"timePickerContainer\">\n" +
    "    <input type=\"text\" class=\"form-control xaInputControl time-picker\"\n" +
    "           ng-model=\"internalValue\"\n" +
    "           ng-class=\"{'controlDisabled': !canedit }\"\n" +
    "           ng-disabled=\"!canedit\"\n" +
    "           placeholder=\"__:__\" maxlength=\"5\" />\n" +
    "</div>");
}]);

angular.module("../js/upload/upload.tpl.html", []).run(["$templateCache", function ($templateCache) {
  $templateCache.put("../js/upload/upload.tpl.html",
    "<div class=\"uploadWrapper\" ng-hide=\"uploadOptions.hidden\">\n" +
    "    <input type=\"file\" class=\"xaInputControl\" multiple />\n" +
    "    <div class=\"dropToUpload\">\n" +
    "        {{'TXT_DROP_TO_UPLOAD' | translate}}\n" +
    "    </div>\n" +
    "</div>");
}]);

angular.module("../js/viewers/imageviewer.tpl.html", []).run(["$templateCache", function ($templateCache) {
  $templateCache.put("../js/viewers/imageviewer.tpl.html",
    "<div class=\"imageViewer\">\n" +
    "    <div class=\"imageList\" ng-show=\"content.length > 1\">\n" +
    "        <ul class=\"sideList\">\n" +
    "            <li ng-repeat=\"img in content track by $index\">\n" +
    "                <a ng-class=\"{active: img == currentImage}\" href=\"javascript:void(0);\" ng-click=\"selectImg(img)\">\n" +
    "                    <img ng-src=\"{{img.imgUrl || img.imgContent}}\" />\n" +
    "                    <label>{{img.imgName}}</label>\n" +
    "                </a>\n" +
    "            </li>\n" +
    "        </ul>\n" +
    "    </div>\n" +
    "    <div class=\"imageDetails\" ng-class=\"{'fullWidth': content.length == 1}\">\n" +
    "        <div class=\"mainImgContainer\">\n" +
    "            <img class=\"center-block\" ng-style=\"imgStyle\" ng-src=\"{{currentImage.imgUrl || currentImage.imgContent}}\" />\n" +
    "        </div>\n" +
    "        <div class=\"toolbarContainer\">\n" +
    "            <div class=\"center-block\" style=\"width:355px\">\n" +
    "                <ul class=\"toolbar center-block\">\n" +
    "                    <li><a href=\"javascript:void(0);\" class=\"print\" ng-click=\"print()\"></a></li>\n" +
    "                    <li><a href=\"javascript:void(0);\" class=\"zoomReset\" ng-click=\"zoom('auto')\"></a></li>\n" +
    "                    <li><a href=\"javascript:void(0);\" class=\"fullScreen\" ng-click=\"zoom(100,true)\"></a></li>\n" +
    "                    <li><a href=\"javascript:void(0);\" class=\"zoomIn\" ng-click=\"zoom(10)\"></a></li>\n" +
    "                    <li><a href=\"javascript:void(0);\" class=\"zoomOut\" ng-click=\"zoom(-10)\"></a></li>\n" +
    "                    <li><a href=\"javascript:void(0);\" class=\"rotateLeft\" ng-click=\"rotate(-90)\"></a></li>\n" +
    "                    <li style=\"margin-right:0\"><a href=\"javascript:void(0);\" class=\"rotateRight\" ng-click=\"rotate(90)\"></a></li>\n" +
    "                </ul>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</div>");
}]);

angular.module("../js/widgetcontainer/widget.tpl.html", []).run(["$templateCache", function ($templateCache) {
  $templateCache.put("../js/widgetcontainer/widget.tpl.html",
    "<div class=\"wContainer\" ng-class=\"{'selected': widgetInfo.selected}\">\n" +
    "    <div class=\"widget\"></div>\n" +
    "\n" +
    "    <ul class=\"widgetMenu\">\n" +
    "        <li ng-repeat=\"mitem in ::menu.menuOptionList\">\n" +
    "            <a href=\"javascript:\" ng-click=\"menu.click(mitem)\" test-id=\"{{::mitem.val}}\" ng-bind-html=\"::mitem.text\"></a>\n" +
    "        </li>\n" +
    "    </ul>\n" +
    "</div>");
}]);

angular.module("../js/widgetcontainer/widgetcontainer.tpl.html", []).run(["$templateCache", function ($templateCache) {
  $templateCache.put("../js/widgetcontainer/widgetcontainer.tpl.html",
    "<div class=\"widgetContainer\">\n" +
    "    <div class=\"widgetBackdrop\"></div>\n" +
    "    <xa-widget ng-repeat=\"w in innerItemList\" widget-info=\"w\" ng-if=\"w.visible\"></xa-widget>\n" +
    "</div> ");
}]);

angular.module("../js/window/advancedheader.tpl.html", []).run(["$templateCache", function ($templateCache) {
  $templateCache.put("../js/window/advancedheader.tpl.html",
    "<div class=\"modal-header clearfix\">\n" +
    "    <div class=\"left status-container\">\n" +
    "        <img class=\"img-logo\" ng-src=\"{{modalIcon}}\" alt=\"\" style=\"padding-left: 3px\" />\n" +
    "        <span class=\"winTitle\">{{modalTitle}}</span>\n" +
    "        <span ng-bind-html=\"formStatus | XaFilterValeurToFormStatus\"></span>\n" +
    "    </div>\n" +
    "    <div class=\"center\">\n" +
    "        <div ng-include=\"menuCenterTemplateUrl\"></div>\n" +
    "    </div>\n" +
    "    <div class=\"right\">\n" +
    "        <div ng-include=\"menuLeftTemplateUrl\" class=\"leftTemplate\"></div>\n" +
    "        <ul class=\"defaultButtons\">\n" +
    "            <li ng-if=\"hasOptions\" class=\"advancedOptionsContainer ignoreFocus\" ng-show=\"validateOptionVisibilityFn()\">\n" +
    "                <div class=\"advancedOptionsItem option{{ item.selected }}\" ng-click=\"optionsChanged(item)\" ng-repeat=\"item in ::validateOptionSource\" title=\"{{::item.libelle}}\" test-id=\"opt{{ ::item.code }}\" ng-show=\"item.visibilityFn()\">{{::item.libelleShort}}</div>\n" +
    "            </li>\n" +
    "            <li ng-show=\"validationErrors && validationErrors.length > 0\" style=\"position: relative\">\n" +
    "                <a class=\"validationIcon rotate errIcon\" href=\"javascript:void(0);\">{{validationErrors.length}}</a>\n" +
    "                <ul style=\"display:none\" class=\"errorList\">\n" +
    "                    <li ng-repeat=\"err in validationErrors\"><a href=\"javascript:void(0);\" ng-click=\"focusElement(err.controlID)\">{{::err.message}}</a></li>\n" +
    "                </ul>\n" +
    "            </li>\n" +
    "            <li ng-repeat=\"button in ::extraActionsLeft\">\n" +
    "                <xa-image-button class=\"extraAction\" click=\"button.applyFn()\" imgurl=\"{{::button.img}}\" ng-show=\"button.visibilityFn()\" resource-key=\"{{::button.title}}\" id=\"{{::button.id}}\"></xa-image-button>\n" +
    "            </li>\n" +
    "            <li ng-hide=\"hideClose\"><a class=\"small-icon cancel rotate\" test-id=\"btnANNULER\" href=\"javascript:void(0);\" ng-click=\"onClose()\"></a></li>\n" +
    "            <li ng-hide=\"hideValidate\"><a class=\"big-icon save rotate\" test-id=\"btnVALIDER\" href=\"javascript:void(0);\" ng-click=\"onValidate()\"></a></li>\n" +
    "        </ul>\n" +
    "        <div ng-include=\"menuRightTemplateUrl\" class=\"rightTemplate\"></div>\n" +
    "    </div>\n" +
    "</div>");
}]);

angular.module("../js/window/backdrop.tpl.html", []).run(["$templateCache", function ($templateCache) {
  $templateCache.put("../js/window/backdrop.tpl.html",
    "<div class=\"modal-backdrop fade in\"\n" +
    "     ng-style=\"{'z-index': 1040 + (index && 1 || 0) + index*10 + 2}\">\n" +
    "</div>");
}]);

angular.module("../js/window/defaultheader.tpl.html", []).run(["$templateCache", function ($templateCache) {
  $templateCache.put("../js/window/defaultheader.tpl.html",
    "<div class=\"modal-header clearfix\">\n" +
    "    <div class=\"left status-container\">\n" +
    "        <img class=\"img-logo\" ng-src=\"{{modalIcon}}\" alt=\"\" style=\"padding-left: 3px\" />\n" +
    "        <span class=\"winTitle\">{{modalTitle}}</span>\n" +
    "        <span ng-bind-html=\"formStatus | XaFilterValeurToFormStatus\"></span>\n" +
    "    </div>\n" +
    "    <div class=\"right\">\n" +
    "        <div style=\"position: absolute; top: -1000px;left: -1000px;\" class=\"ignoreFocus\"><input type=\"text\" class=\"startFocus\" /></div>\n" +
    "        <ul class=\"defaultButtons\">\n" +
    "            <li ng-show=\"validationErrors && validationErrors.length > 0\" style=\"position: relative\">\n" +
    "                <a class=\"validationIcon rotate errIcon\" href=\"javascript:void(0);\">{{validationErrors.length}}</a>\n" +
    "                <ul style=\"display:none\" class=\"errorList\">\n" +
    "                    <li ng-repeat=\"err in validationErrors\"><a href=\"javascript:void(0);\" ng-click=\"focusElement(err.controlID)\">{{::err.message}}</a></li>\n" +
    "                </ul>\n" +
    "            </li>\n" +
    "            <li ng-repeat=\"button in ::extraActionsLeft\">\n" +
    "                <xa-image-button class=\"extraAction\" click=\"button.applyFn()\" imgurl=\"{{::button.img}}\" ng-show=\"button.visibilityFn()\" resource-key=\"{{::button.title}}\" id=\"{{::button.id}}\"></xa-image-button>\n" +
    "            </li>\n" +
    "             <li ng-if=\"hasOptions\" class=\"advancedOptionsContainer ignoreFocus\" ng-show=\"validateOptionVisibilityFn()\">\n" +
    "                <div class=\"advancedOptionsItem option{{ item.selected }}\" ng-click=\"optionsChanged(item)\" ng-repeat=\"item in ::validateOptionSource\"  ng-show=\"item.visibilityFn()\" test-id=\"opt{{ ::item.code }}\" title=\"{{::item.libelle}}\">{{::item.libelleShort}}</div>\n" +
    "            </li>\n" +
    "            <li ng-hide=\"hideClose\"><a class=\"small-icon cancel rotate\" test-id=\"btnANNULER\" href=\"javascript:void(0);\" ng-click=\"onClose()\"></a></li>\n" +
    "            <li ng-hide=\"hideValidate\"><a class=\"big-icon save rotate\" test-id=\"btnVALIDER\" href=\"javascript:void(0);\" ng-click=\"onValidate()\"></a></li>\n" +
    "        </ul>\n" +
    "        </div>\n" +
    "</div>");
}]);

angular.module("../js/window/empty.tpl.html", []).run(["$templateCache", function ($templateCache) {
  $templateCache.put("../js/window/empty.tpl.html",
    "");
}]);

angular.module("../js/xmldata/xmldata.tpl.html", []).run(["$templateCache", function ($templateCache) {
  $templateCache.put("../js/xmldata/xmldata.tpl.html",
    "<div class=\"tabContainer xmlData\">\n" +
    "    <ul class=\"nav nav-tabs masterTabs\"></ul>\n" +
    "    <div class=\"tabMasterContent\">\n" +
    "        <div class=\"tabContainer\">\n" +
    "            <ul class=\"nav nav-tabs childTabs\"></ul>\n" +
    "            <div class=\"printContainer\"><img  src=\"XaFramework/Img/Printer_xml.png\"/></div>\n" +
    " \n" +
    "        </div>\n" +
    "    </div>\n" +
    "    <div class=\"htmlContent inheritFit\">\n" +
    "\n" +
    "    </div>\n" +
    "</div>");
}]);
