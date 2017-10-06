(function () {
    'use strict';

    /*    var data = [{
            id: 'TypeExamen',
            object: this.ficheExamenTo.detailExamen, property: 'codeTypeExamen', selectIfOneValue: true,
            datasource: this.ficheExamenTo.listeDetailExam, datasourcePropertyValue: 'codeTypeExamen',
            reloadFn: undefined
        },
    
                 {
                     id: 'Examen', parent: 'TypeExamen', resetIfParentBlank: false, selectIfOneValue: true,
                     object: this.ficheExamenTo.detailExamen, property: 'codeExamen',
                     datasource: this.ficheExamenTo.listeExamens, datasourcePropertyValue: 'codeExamen',
                     reloadFn: function (valueTypeExamen) {
                         return HELPER.Api.callApiApplication('FicheExamen', 'GetListeExamensFromType', valueTypeExamen, ExamensTo)
                     }
                 },
                 {
                     id: 'Poste', parent: 'Examen', resetIfParentBlank: false, selectIfOneValue: true,
                     object: this.ficheExamenTo.detailExamen, property: 'codePoste',
                     datasource: this.ficheExamenTo.listePostes, datasourcePropertyValue: 'codePoste',
                     reloadFn: function (valueExamen) {
                         return HELPER.Api.callApiApplication('FicheExamen', 'GetPostesFromExamen', valueExamen, PostesTo)
                     }
                 }];
    */


    angular.module('XaCommon').factory('ComboBoxManagerRule', function (HELPER, $q) {
        function ComboBoxManagerRule(data) {
            if (data && data.id)
                this.id = data.id;
            else
                throw new Error("ComboBoxManagerRule - La propriété id est obligatoire");

            this.parent = data ? data.parent : null;

            this.resetIfParentBlank = data ? data.resetIfParentBlank : true;
            this.selectIfOneValue = data ? data.selectIfOneValue : false;
            this.alwaysReloadChild = data ? data.alwaysReloadChild : false;

            if (data && data.object)
                this.object = data.object;
            else
                throw new Error("ComboBoxManagerRule - La propriété object est obligatoire");

            if (data && data.property)
                this.property = data.property;
            else
                throw new Error("ComboBoxManagerRule - La propriété property est obligatoire");

            this.watchIds = data ? data.watchIds : [];
            this.datasource = data ? data.datasource : [];
            this.upperParentControl = data ? data.upperParentControl : [];

            this.datasourcePropertyValue = data ? data.datasourcePropertyValue : [];
            this.reloadFn = data && data.reloadFn ? data.reloadFn : null;
            this.onModified = data && data.onModified ? data.onModified : null;
        }

        return ComboBoxManagerRule;
    });

    angular.module('XaCommon').factory('ComboBoxManagerValueWatcher', function (HELPER) {
        function ComboBoxManagerValueWatcher(data) {
            if (data && data.id)
                this.id = data.id;
            else
                throw new Error("ComboBoxManagerValueWatcher - La propriété id est obligatoire");

            if (data && data.object)
                this.object = data.object;
            else
                throw new Error("ComboBoxManagerValueWatcher - La propriété object est obligatoire");

            if (data && data.property)
                this.property = data.property;
            else
                throw new Error("ComboBoxManagerValueWatcher - La propriété property est obligatoire");

        }

        return ComboBoxManagerValueWatcher;
    });


    angular.module('XaCommon').factory('ComboBoxManager', function (HELPER, $q) {

        function ComboBoxManager(src, watchers) {
            var ctx = this;

            this.configs = src;
            this.values = {};
            this.watchers = watchers;


            HELPER.Array.forEach(this.configs, function (config) {
                this["applyModified" + config.id] = function (valObj) {
                    ctx.processChildReload(config.id, [], valObj.value, true);
                };

                ctx.values[config.id] = config.object[config.property];

            }, this);


            HELPER.Array.forEach(this.watchers, function (config) {
                ctx.values[config.id] = config.object[config.property];
            });


            this.update = function () {
                var rule = HELPER.Array.findFirstFromProperty(this.configs, 'parent', undefined);
                return ctx.processChildReload(rule.id, [], undefined, false);

            }


            var ctx = this;

            this.processChildReload = function (ruleName, rulesProcessed, valFromControl, mainHasChanged, parentValuesChanged) {
                if (!rulesProcessed)
                    rulesProcessed = [];
                if (!parentValuesChanged)
                	parentValuesChanged = [];

                if (HELPER.Array.contains(rulesProcessed, ruleName))
                    return;
                else
                    rulesProcessed.push(ruleName);

                var mainRule = HELPER.Array.findFirstFromProperty(this.configs, 'id', ruleName);
                var childRules = HELPER.Array.findFromProperty(this.configs, 'parent', ruleName);

                // La valeur a changé par rapport à la sauvegarde
                if (mainRule.object[mainRule.property] != ctx.values[mainRule.id]) {
                	mainHasChanged = true;
                	parentValuesChanged.push(mainRule.id)
                }

                // MAJ DE LA VALEUR ELLE MEME
                // Ne devrait vrt plus être utile !!!
            	// mainRule.object[mainRule.property] = valFromControl;

			     // trigger du modified
                if (mainRule.onModified && mainHasChanged == true)
                    mainRule.onModified(mainRule.object);

                // stockage des valeurs sur le manager pour future comparaison
                ctx.values[mainRule.id] = mainRule.object[mainRule.property];



                var def = $q.defer();
                def.resolve(true);
                var promise = def.promise;

                HELPER.Array.forEach(childRules, function (childRule) {

                    // Vérifier si la valeur de detection a changé
                	var watcherChanged = false;
                	var upperParentChanged = false;
                    HELPER.Array.forEach(childRule.watchIds, function (id) {
                        var watcher = HELPER.Array.findFirstFromProperty(ctx.watchers, 'id', id);
                        if (ctx.values[watcher.id] != watcher.object[watcher.property]) {
                            watcherChanged = true;
                            ctx.values[mainRule.id] = watcher.object[watcher.property];
                        }
                    });

                    HELPER.Array.forEach(childRule.upperParentControl, function (ruleName) {
                    	if (HELPER.Array.contains(parentValuesChanged, ruleName))
                    		upperParentChanged = true;
                    });

                    promise = promise.then(function () {
                    	if (mainHasChanged == false && watcherChanged == false && upperParentChanged== false)
                            return 'break';
                        else if (HELPER.Utils.isEmpty(mainRule.object[mainRule.property]) && childRule.resetIfParentBlank == true)
                            return [];
                        else
                            return childRule.reloadFn(mainRule.object[mainRule.property]);

                    })

                    promise = promise.then(function (newArray) {
                        var hasModified = false;
                        if (newArray != 'break')
                            hasModified = ctx.updateDataSourceInChain(childRule.selectIfOneValue, mainRule.object[mainRule.property], childRule.object, childRule.property, childRule.datasource, newArray, childRule.datasourcePropertyValue);

                        return ctx.processChildReload(childRule.id, rulesProcessed, childRule.object[childRule.property], hasModified, parentValuesChanged);
                    });

                });
                return promise;

            }


            this.updateDataSourceInChain = function updateDataSourceInChain(selectIfOnlyOne, parentValue, model, propertyName, datasource, newDataSourceValue, dataSourceCode) {
                datasource.length = 0;

                [].push.apply(datasource, newDataSourceValue);

                var hasModified = false;
                // Desactivation ancienne valeur si ancienne version absente
                if (!HELPER.Utils.isEmpty(model[propertyName]) && HELPER.Array.findFirstFromProperty(datasource, dataSourceCode, model[propertyName]) == null) {
                    model[propertyName] = '';
                    hasModified = true;
                }

                // Saisi automatique du journal si un seul choix
                if (selectIfOnlyOne == true && datasource.length == 1
                     && HELPER.Utils.isEmpty(model[propertyName])
                     && !HELPER.Utils.isEmpty(parentValue)) {
                    model[propertyName] = datasource[0][dataSourceCode];
                    hasModified = true;
                }

                return hasModified;
            }
        }

        return ComboBoxManager;
    });

})();
