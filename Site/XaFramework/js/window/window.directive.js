(function (local) {
	'use strict';

	local.filter('XaFilterValeurToFormStatus', XaFilterValeurToFormStatus);
	function XaFilterValeurToFormStatus($sce, xaTranslation) {
		return function (valeur) {
			if (valeur && valeur != '') {
				if (valeur.indexOf('CREATE') >= 0) valeur = 'CREATE';
				return $sce.trustAsHtml('<div class="status-bubble status-' + valeur.toLowerCase() + '">' + xaTranslation.instant('TXT_WINDOW_' + valeur) + '</div>')
			}
			else
				return '';
		}
	};

	local.directive('xaWindow', function ($xaWindowStack, $timeout, $rootScope, xaTranslation, xaBenchmark, xaLoadingService, xaFrameworkSetting) {

		return {
			restrict: 'EA',
			scope: {
				index: '@',

				// Properties additional to ui-bootstrap
				disableFocusManagement: '=',
				windowMode: '@',
				relativeElem: '@relativeelem',
				id: '@',
				width: '@',
				height: '@',
				showLoadingOnInit: '=',
				inline: '@',
				container: '@',
				draggable: '@',
				minWidth: '@'
			},
			replace: true,
			transclude: true,
			template: function (tElement, tAttrs) {

				var positioner = "";
				if (tAttrs.relativeelem) {
					positioner = 'xa-positioner="' + tAttrs.relativeelem + '"';
					if (tAttrs.relativeposition)
						positioner += ' force-position="' + tAttrs.relativeposition + '" ';
				}

				return '<div tabindex="-1" role="dialog" class="xa-dialog-container modal fade" ng-style="::modalStyle">\
	                            <div class="xa-dialog">\
		                            <div class="modal-content">\
			                            <div class="window" xa-window-transclude ' + positioner + '></div>\
		                            </div>\
	                            </div>\
                            </div>';
			},
			controller: function () {

				xaBenchmark.timeStep('window directive controller');

			},
			link: function postLink(scope, element, attrs) {

				xaBenchmark.timeStep('window directive start');
				var restoreFocusOnClose = true;

				// TODO: All references added to ctrlScope must be cleaned on destroy.

				//scope.width = attrs.width;
				var hasFixedHeight = false,
					$win = element.find('.window'),
					debugTooltip = 'View: ' + attrs.viewUrl + '\n Controller: ' + attrs.controllerName,
					ttGeneralOptions = {
						placement: "bottom",
						trigger: "focus",
						html: true,
						title: 'default tooltip title',
						container: 'body',
						template: '<div class="error-tooltip tooltip"><div class="tooltip-inner"></div></div>'
					},
					ctrlScope = scope.$parent;


				var currZindex = 1050 + scope.index * 10;
				scope.modalStyle = { 'z-index': currZindex, display: 'block' };

				if (scope.container || scope.windowMode == 'inline') {
					element.addClass("no-round-corners");
				}

				// If inline or tooltip, we need to allow click outside so we remove the dialog container
				if (scope.windowMode == 'inline' || scope.windowMode == 'tooltip')
					element.removeClass('modal').removeClass('xa-dialog-container');

				if (scope.windowMode == 'tooltip') {
					element.addClass('tooltipWindow');
					element.css('visibility', 'hidden');
					$timeout(function () {
						if (element) // Can be null if click fastly on tooltip
							element.css('visibility', 'visible');
					}, 0, false);

					$win.css('z-index', currZindex); //since parent is static, need to pass z-index to child to be able to be on top of other opened windows.
					$win.attr('data-uid', scope.$id);

					//close on click outside
					$(document).on('mouseup.tooltip-' + scope.$id, function (evt) {
						var $target = $(evt.target);

						//not enough. MUST click on curr window!!!
						var targetWin = null;
						if ($target.hasClass('.window')) targetWin = $target;
						else targetWin = $target.closest('.window');


						if (targetWin && targetWin.length > 0 && targetWin.attr('data-uid') == scope.$id) { //click inside THIS window, do nothing
							//raul: what if click in another window??!??!
						}
						else {
							// We force the tooltip to get a close method to close by itself. this to manage esc and click out the same way
							ctrlScope.onClose();
							//closeForm(false);
						}
					});
				}

				if (/%/.test(scope.height)) {
					var hvalue = +scope.height.replace('%', ''); //parse height
					if (hvalue % 10 == 0 && hvalue >= 20 && hvalue <= 100) {
						var heightClass = '_' + hvalue + 'pHwin';
						element.addClass(heightClass);
					} //_50pHwin
					else { //value not in list of possible values
						throw new Error("XaWindow: value for height needs to be >= 20% and not bigger than 100% and needs to be dividable by 10");
					}

					if (!element.hasClass("no-round-corners")) {

						if (hvalue != 100) {
							/*element.find('.modal-content').css({
								'border-radius': '10px',
								'overflow': 'hidden',
								'background-color': 'transparent'
							});*/
							$win.css({ 'border-radius': '10px 10px 0px 0px', });
						}
						else { //no round corners for fullscreen win
							element.addClass('no-round-corners');
						}
					}

				}
				else if (scope.height) {
					$win.height(scope.height);
					hasFixedHeight = true;

					//if (scope.height && scope.height.indexOf('%') == -1)
					element.addClass('fillHeight');


					if (!scope.relativeElem) {
						$('.modal-content', element).css("position", "relative");
					}
				}

				if (scope.relativeElem) {
					$('.modal-content', element).css('position', 'static'); //static is css2 default position
					$win.css('position', 'absolute'); //why???
					$win.addClass('window-shadow'); //no shadow for relative positioned windows...
				}
				if (scope.minWidth) {
					$('.modal-content', element).css('min-width', scope.minWidth);
					$('.xa-dialog', element).css('min-width', scope.minWidth);
					$('.modal-content .window', element).css('min-width', scope.minWidth);
				}


				scope.size = attrs.size;

				if (scope.width) {

					element.find('.xa-dialog').width(scope.width);
					element.find('.modal-content').width(hasFixedHeight ? '100%' : scope.width);

					if (scope.width.indexOf('px') > -1) { //set the actual width to the window.
						element.find('.modal-content .window').width(scope.width);
						//put a margin-top of 10
						element.css('padding-top', '20px');
					}
				}
				else {
					alert("xaWindow: no width was specified for the window! Ex: 400px, 70%, etc");
				}

				var endFocusElem = null;
				var startFocusElem = null;
				function initFocusLoop() {
					endFocusElem = element.find(".endFocus"),
					startFocusElem = element.find(".startFocus"),

					//focus management
					endFocusElem.on("focus", function (evt) {
						// Attention à ne pas selectionner le endFocus pour ne pas obtenir une boucle infini.
						var firstElem = getFocusableElementList(false, false, true).filter(":first");

						// Si le seul contrôle présent est le contrôle de end focus on ne le focus pas sinon on se retoruve avec une boucle infine
						if ($(firstElem).length > 0) {
							$(firstElem).focus();
							firstElem = null;
						}

						evt.preventDefault();
						evt.stopPropagation();
					});
					startFocusElem.on("focus", function (evt) {
						// Attention à ne pas selectionner le endFocus pour ne pas obtenir une boucle infini.
						var lastElem = getFocusableElementList(false, false, true).filter(":last");

						// Si le seul contrôle présent est le contrôle de end focus on ne le focus pas sinon on se retoruve avec une boucle infine
						if (lastElem.length > 0) {
							lastElem.focus();
							lastElem = null;
						}

						evt.preventDefault();
						evt.stopPropagation();
					});
				}


				$(document).on("click.win-" + scope.$id, function (evt) {
					if (evt.target && $(evt.target).hasClass("errIcon")) { } //only hide when is visible
					else {
						$(".errorList", element).hide();
					}
				});

				scope.$on('$destroy', function destroyScope() {
					if (initialFocusTimeout)
						$timeout.cancel(initialFocusTimeout);

					if (displayWindowTimeout)
						$timeout.cancel(displayWindowTimeout);
					
					$(document).off("click.win-" + scope.$id);
					$(element).off('click');
					$(document).off('mouseup.tooltip-' + scope.$id);

					if (endFocusElem) {
						endFocusElem.off("focus");
						endFocusElem = null;
					}

					if (startFocusElem) {
						startFocusElem.off("focus");
						startFocusElem = null;
					}

					if (ctrlScope)
						ctrlScope.onValidate = ctrlScope.close = ctrlScope.onClose = ctrlScope.focusElement = null;

					//focus previous screen management
					if (scope && scope.disableFocusManagement == true) {

					}
					else {
						setTimeout(function () {
							restoreOriginalFocus();
						}, 10)
					}

					ctrlScope = null;

					element.empty();
					element = null;


					function restoreOriginalFocus() {
						function focusGridList(gridList) {
							if (!restoreFocusOnClose) return;

							if (!gridList || gridList.length == 0) return;

							if (gridList.length > 0) {

								for (var idx = 0; idx < gridList.length; idx++) {
								    if (gridList.eq(idx).closest('.xa-dropdown-menu').length == 0
                                        && gridList.eq(idx).closest('.ignoreFocus').length == 0)
								    {
								        //grid is not hosted in xa-combobox
                                        var activeCell = $('.slick-cell.active', gridList.eq(idx));
										if (activeCell.length == 0)
											activeCell = $('.slick-cell:first', gridList.eq(idx));

										activeCell.click();
										return true;
									}
								}
							}


						}
						var topWin = $xaWindowStack.getTop();
						//get active win. if exists, focus it
						if (topWin && topWin.value && topWin.value.windowDomEl) { //window code: focus first control

							//if grid present, focus that first. else, focus input in body
						    var prevGridList = $('.gridContainer', topWin.value.windowDomEl);
							if (prevGridList.length == 0 || !focusGridList(prevGridList))
								topWin.value.windowDomEl.find(".modal-body input, .modal-body a").filter(":enabled").first().focus();
						}
						else { //dashboard code: focus only grid
							var gridList = $('.gridContainer:visible');

							focusGridList(gridList);
						}
					}
				});

				function clearValidationTooltips() {
					$('.has-err-tooltip, .has-error', element).each(function () {
						$(this).removeClass('has-err-tooltip').removeClass('has-error').tooltip("destroy");
					});
				}

				//functionality here
				ctrlScope.close = function (evt) {
					evt.preventDefault();
					evt.stopPropagation();
					var windowInstance = $xaWindowStack.getWindowFromScope(ctrlScope).key;
					$xaWindowStack.dismiss(windowInstance, 'backdrop click');
				};

				//base functionality
				ctrlScope.onValidate = function () {
					// Si la methode validate va etre appellé depuis ctrl+enter on sort
					if (ctrlScope._winValidateRequested)
						return;

					// Blocage du validate si loading encore visible peut arriver si click sur ctrl+enter
					// Car ctrl/enter donne le focus sur le bouton et attends 2 cycle de thread
					// pour les didchange avant de lancer le traitement
					if (xaLoadingService.isVisible())
						return;

					var validateHandler = ctrlScope.validateFn || (ctrlScope.vm || {}).validateFn;
					if (validateHandler) {
						var res = validateHandler();
						if (ctrlScope && ctrlScope.validationErrors && ctrlScope.validationErrors.length > 0) {
							return;
						}
					}
					else {
						throw new Error("You didn't declare the validateFn function, so nothing will happen!!");
					}
				};

				//validate options
				ctrlScope.columnsOptions = [{ field: 'code', displayName: xaTranslation.instant('TXT_CODE'), width: '50px' },
				{ field: 'libelle', displayName: xaTranslation.instant('TXT_LIBELLE') }];

				var valOptions = (ctrlScope.vm || ctrlScope || {}).validateOptions || '';
				var valSelected = (ctrlScope.vm || ctrlScope || {}).validateOptionsSelected || '';
				var validateVisibilityFn = (ctrlScope.vm || ctrlScope || {}).validateVisibilityFn;
				if (valOptions) {
					ctrlScope.hasOptions = true;
					_.forEach(valOptions, function (opt) {
						opt.libelleShort = opt.libelle.substring(0, 3);
						opt.selected = (',' + valSelected + ',').indexOf(',' + opt.code + ',') >= 0;
						opt.visibilityFn = opt.visibilityFn || function () { return true };
					});
					
					ctrlScope.validateOptionSource = valOptions;
					
					ctrlScope.validateOptionVisibilityFn = validateVisibilityFn;
				}

				ctrlScope.optionsChanged = function (item) {
					item.selected = !item.selected; 
					var newVal = _.map(_.filter(ctrlScope.validateOptionSource, function (valeur) { return valeur.selected == true }), function (valeur) { return valeur.code }).join(',');
					if (ctrlScope.vm)
						ctrlScope.vm.validateOptionsSelected = newVal;
					else
						ctrlScope.validateOptionsSelected = newVal;
				};



				//extra actions
				var valExtraActions = (ctrlScope.vm || ctrlScope || {}).extraActions;
				if (valExtraActions) {
					valExtraActions = _.filter(valExtraActions, function (item) {
						if (!item.rightKey)
							return true
						else
							return !xaFrameworkSetting.UserRights.indexOf(item.rightKey) >= 0;
					});
					angular.forEach(valExtraActions, function (action) {
						if (!action.visibilityFn) action.visibilityFn = function () { return true };
					});
					ctrlScope.extraActionsLeft = valExtraActions;

				}

				ctrlScope.onClose = function () {
					var closeHandler = ctrlScope.closeFn || (ctrlScope.vm || {}).closeFn;
					if (closeHandler) {
						var res = closeHandler();
						if (res === false) return; //prevent close
					}
					else {
						throw new Error("You didn't declare the closeFn function, so nothing will happen!!");
					}
				};

				function closeForm(res) {
					if (res === undefined) throw new TypeError("Please pass 'false' to dismiss the window, or an object to close it with a result!"); //todo stefan: can you intercept this error?
					var windowInstance = $xaWindowStack.getWindowFromScope(ctrlScope).key;

					//raul: best time to destroy tooltips. Any later than this, the tooltips will remained orphaned!
					clearValidationTooltips();

					if (res) $xaWindowStack.close(windowInstance, res);
					else $xaWindowStack.dismiss(windowInstance, "closed");
				};
				ctrlScope.closeForm = closeForm;
				if (ctrlScope.vm) ctrlScope.vm.closeForm = closeForm;


				var refreshVal = function (valErrors) {
					ctrlScope.validationErrors = valErrors;
					//remove all validation error classes 
					//remove all toltips
					clearValidationTooltips();

					if (valErrors == null || valErrors.length == 0) {
						return true;
					}

					//add err
					for (var idx = 0; idx < valErrors.length; idx++) {
						if (valErrors[idx].controlID) { //no need to process empty IDs. will most likely trigger a jquery error, or worse, will go through the entire dom.
							var idElem = $("[data-id='" + valErrors[idx].controlID + "'] input, #" + valErrors[idx].controlID + ' input, #' + valErrors[idx].controlID, element);

							if (idElem.length > 1) //if we match more than 1 element with our broad selector, use the most restrictive selector we have!
								idElem = $('#' + valErrors[idx].controlID, element);

							idElem.addClass("has-error");
							var innerElem = $(".xaValidationTooltip", idElem);

							//var ttOptions = angular.extend(angular.copy(ttGeneralOptions), { title: valErrors[idx].message });
							var ttOptions = angular.extend(ttGeneralOptions, { title: valErrors[idx].message });

							var hasTT = false;
							if (innerElem.length > 0) { //apply tooltip on inner elem
								hasTT = true;
								innerElem.addClass('has-err-tooltip').tooltip(ttOptions);
							}
							else if (idElem.length > 0) {
								hasTT = true;
								idElem.addClass('has-err-tooltip').tooltip(ttOptions);
							}
							if (hasTT) idElem.addClass("has-error");
						}
						idElem = null;
						innerElem = null;
					}

					//open validation tooltip
					$(".errorList", element).show();

					return false;
				}
				ctrlScope.refreshValidation = refreshVal;
				if (ctrlScope.vm) ctrlScope.vm.refreshValidation = refreshVal;

				ctrlScope.focusElement = function (id) {
					if (id) {
						var idElem = $("#" + id, element);
						var innerElem = $(".xaValidationTooltip", idElem);
						if (innerElem.length > 0) { //apply tooltip on inner elem
							innerElem.focus();
						}
						else if (idElem.length > 0) {
							idElem.focus();
						}
						else { // exception for searchbox..
							$("[data-id='" + id + "'] input", element).focus();
						}
					}

					$(".errorList", element).hide(); //hide error list

					idElem = null;
					innerElem = null;
				}


				$(element).on('click', ".errIcon", function () {
					$(".errorList", element).toggle();
				});

				if (attrs.windowClass)
					element.addClass(attrs.windowClass);



				var initialFocusTimeout = null;

				function doInitialFocus() {
					var elemToFocus = findItemToFocus(true);
					if (!elemToFocus)
						elemToFocus = findItemToFocus();

					if (elemToFocus) {
						if (elemToFocus.hasClass('slick-cell'))
							elemToFocus.click(); //select first cell in grid
						else {
							elemToFocus.focus();
						}
					}

					initialFocusTimeout = null;

				}

				function getFocusableElementList(includeClass, includeGrid, includeA) {
					var cssClass = includeClass || "";

					return $(".window " + cssClass + " input:enabled, .window " + cssClass + " textarea:enabled, .window " + cssClass + " select:enabled" + (includeGrid ? ", .window " + cssClass + " .gridContainer" : "") + (includeA ? ", .window " + cssClass + " a" : ""), element).filter(":visible:not(.startFocus):not(.endFocus)");
				}

			
				function findItemToFocus(isInitialClass) {

					var includeClass = isInitialClass ? ".initialFocus" : "";
					var focusElemList = getFocusableElementList(includeClass, true);

					var elemToFocus = null;

					if (focusElemList.length > 0) {
						for (var idx = 0; idx < focusElemList.length; idx++) {
							var ctrl = $(focusElemList[idx]);
							if (ctrl.closest('.ignoreFocus').length == 0) {

								if (ctrl.hasClass('gridContainer')) {
									var activeCell = ctrl.find('.slick-cell.active:first');
									if (activeCell.length == 0)
										activeCell = ctrl.find('.slickSearchInput input');
									if (activeCell.length == 0)
										activeCell = ctrl.find('.slick-row:not(.slick-group):first').find('.slick-cell:first')
									if (activeCell.length == 0)
										activeCell = ctrl.find('.slick-row:first').find('.slick-cell:first')

									if (activeCell.length > 0) {
										elemToFocus = activeCell;
										break;
									}
								}
								else {
									elemToFocus = ctrl;
									break;
								}

							}
							else if (ctrl.hasClass('endFocus')) //stop at end focus!
								break;
						}
					}

					if (isInitialClass != true && elemToFocus == null) {
						elemToFocus = $('.window a.small-icon.cancel', element);
						if (elemToFocus.length == 0) elemToFocus = $('.window a.big-icon.save', element);
					}

					return elemToFocus;
				}

				var displayWindowTimeout = null;

				displayWindowTimeout = $timeout(function () {
					$('.img-logo', element).attr('title', debugTooltip); //.img-logo does not exist until the child directives are parsed!

					// TODO: Se fermeture aveant ouverture on a un crash
					if (!element) return;

					element.addClass('in');

					initialFocusTimeout = $timeout(function () {
						initFocusLoop();
						doInitialFocus();

						// Disparition du loading une fois la fenêtre apparu, et le focus donné pour éviter que l'action soit répété, 
						// exemple, si on laisse appuyé entré sur la grille.
						if (scope.showLoadingOnInit)
							xaLoadingService.hide();

						// indiqueer au raccourci clavier que la fenetre est définitivement chargé
						ctrlScope._winLoaded = true;

					}, 0, false);

				}, 0, false);
				// This was 50, but since anymation disable we can put 0, if element is null in scenario we need to find another solution.

				xaBenchmark.timeStep('window directive end');

				//draggable 
				if (scope.draggable) {
					$('.modal-header', element).css('cursor', 'move');

					$('.modal-content', element)
						.drag("start", function (evt) {
							var dragElem = $(evt.target);
							if (dragElem.prop('tagName') == 'A' || dragElem.closest('a').length > 0) return false;

							return $('<div></div>').css({
								width: $(this).width(),
								height: $(this).height(),
								opacity: .75,
								'z-index': 2500,
								'background-color': '#666',
								'cursor': 'move',
								position: 'absolute'
							}).appendTo(document.body);
						}).drag(function (ev, dd) {
							$(dd.proxy).css({
								top: dd.offsetY,
								left: dd.offsetX
							});
						}, { handle: ".modal-header" }).drag("end", function (ev, dd) {
							$(this).animate({
								top: dd.offsetY,
								left: dd.offsetX
							}, 220);
							//need to change dialog size + put it on window
							//need these hacks because window is initially displayd centered! remove that on first drag!
							element.find('.modal-content').width(scope.width);
							element.find('.xa-dialog').width('100%');

							$(dd.proxy).remove();
						});
				}
			}
		};
	}
	);

})(window.XaNgFrameworkWindow);

