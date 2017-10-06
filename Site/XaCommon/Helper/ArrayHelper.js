(function () {
    'use strict';

    angular.module('XaCommon').service('ArrayHelper', ArrayHelper);

    function ArrayHelper(UtilsHelper) {

        this.isEmpty = isEmpty;
        this.clear = clear;
        this.isArray = isArray;
        this.removeItem = removeItem;
        this.removeItems = removeItems;
        this.removeItemFromProperty = removeItemFromProperty;
        this.removeItemsFromProperty = removeItemsFromProperty;
        this.removeDuplicateFromProperty = removeDuplicateFromProperty;
        this.removeItemsFromFunction = removeItemsFromFunction;
        this.clearEmptyItems = clearEmptyItems;
        
        this.generateIds = generateIds;
        this.shuffleItems = shuffleItems;

        this.findItem = findItem;
        this.replaceItemWithSameKey = replaceItemWithSameKey;
        this.updateItemWithSameKey = updateItemWithSameKey;

        this.findFirstFromProperty = findFirstFromProperty;
        this.findFirstFromFunction = findFirstFromFunction;
        this.findFromProperty = findFromProperty;
        this.findFromFunction = findFromFunction;
        this.findItemsWithIdsNotInValue = findItemsWithIdsNotInValue;
        this.forEach = forEach;
        this.contains = contains;
        this.groupBy = groupBy;
        this.splitSubArrayWithLimit = splitSubArrayWithLimit;
        this.sortByProperty = sortByProperty;
        this.sortByPropertyCaseInsensitive = sortByPropertyCaseInsensitive;
        this.joinArrays = joinArrays;
        this.getStringFromProperty = getStringFromProperty;
        this.getStringFromArray = getStringFromArray;

        this.mapFunction = mapFunction;
        this.mapProperty = mapProperty;
        this.sumProperty = sumProperty;
        this.minProperty = minProperty;
        this.maxProperty = maxProperty;
        this.distinctProperty = distinctProperty;
        this.distinctByFromProperty = distinctByFromProperty;

        this.addItemsIfNotExist = addItemsIfNotExist;
        this.addItemIfNotExist = addItemIfNotExist;

        this.moveItemToFirstPosition = moveItemToFirstPosition;
        this.moveIdToFirstPosition = moveIdToFirstPosition;

        this.toDisplayStringFromProperties = toDisplayStringFromProperties;
        this.toDisplayStringFromFunction = toDisplayStringFromFunction;

        function toDisplayStringFromProperties(array, fn, separator) {
            var result = '';
            forEach(array, function (item) {
                if (result != '') result += separator;
                for (var i = 0; i < properties.length; i++) {
                    if (i != 0) result += ' ';
                    result += item[properties[i]];
                }
            })
            return result;
        }

        function toDisplayStringFromFunction(array, fn, separator) {
            var result = '';
            forEach(array, function (item) {
                if (result != '') result += separator;
                result += fn(item);
            })
            return result;
        }

        function removeDuplicateFromProperty(array, property) {
            return _.uniq(array, function (item) {
                return item[property];
            });
        }

        function generateIds(array) {
            var i = 0;
            _.forEach(array, function (item) {
                item.id = i++;
            })
        }

        function moveIdToFirstPosition(array, property, value) {
            var item = findFirstFromProperty(array, property, value)
            return moveItemToFirstPosition(array, item);
        }

        function moveItemToFirstPosition(array, item) {
            if (item != null) {
                var index = array.indexOf(item);
                if (index > 0) {
                    var temp = array[0];
                    array[0] = array[index];
                    array[index] = temp;
                }
            }
            return array;
        }



        function clear(array) {
            return array.length = 0;
        }

        function addItemIfNotExist(array, item, propKey, replaceItemIfExist) {
            return addItemsIfNotExist(array, [item], propKey, replaceItemIfExist);
        }

        function addItemsIfNotExist(array, arrayNew, propKey, replaceItemIfExist) {
            if (arrayNew == undefined || arrayNew == null)
                return array;

            if (isEmpty(propKey))
                throw new Error("UtilsHelper.addItemsIfNotExist - une clé propKey doit être fournie en troisième paramètre");

            forEach(arrayNew, function (item) {
                if (item != null) {
                    var existingItem = findFirstFromProperty(array, propKey, item[propKey]);
                    if (existingItem == null)
                        array.push(item);
                    else if (replaceItemIfExist === true) {
                        var index = array.indexOf(existingItem);
                        array[index] = item;
                        //array.splice(index, 1, existingItem);
                    }
                }
            });

            return array;
        }

        function isEmpty(array) {
            if (array == undefined || array == null)
                return true;

            if (array.length == 0)
                return true;

            return false;

        }

        function isArray(param) {
            return Array.isArray(param);
        }


        function findItem(array, value, prop) {
            if (prop)
                return _.find(array, function (item) {
                    return item[prop] === value
                });
            else
                return _.find(array, function (item) { item === value });
        }


        function replaceItemWithSameKey(array, newItem, propKey) {
            var itemInTable = findFirstFromProperty(array, propKey, newItem[propKey]);
            if (!itemInTable)
                throw new Error("Impossible de trouver l'objet avec cet identifiant.");

            var idx = array.indexOf(itemInTable);
            array[idx] = newItem;
        }

        function updateItemWithSameKey(array, newItem, propKey) {
            var itemInTable = findFirstFromProperty(array, propKey, newItem[propKey]);
            if (!itemInTable)
                throw new Error("Impossible de trouver l'objet avec cet identifiant.");

            _.extend(itemInTable, newItem);
        }

        function removeItem(array, item) {
            for (var i = array.length - 1; i >= 0; i--) {
                if (array[i] === item) {
                    array.splice(i, 1);
                    break;
                }
            }
        }

        function removeItems(array, itemsToRemove) {
            /*for (var i = array.length - 1; i >= 0; i--) {
                if (array[i] === item) {
                    array.splice(i, 1);
                    break;
                }
            }*/

            _.forEach(itemsToRemove, function (item) {
                var idx = array.indexOf(item);

                if (idx > -1)
                    array.splice(idx, 1);

            })
        }


        function removeItemsFromFunction(array, func) {

            var itemsToRemove = findFromFunction(array, func);

            _.forEach(itemsToRemove, function (item) {
                var idx = array.indexOf(item);
                if (idx > -1)
                    array.splice(idx, 1);

            })
        }

        function removeItemsFromProperty(array, ids, property) {
            if (array && array.length > 0) {
                forEach(ids, function (item) {
                    var item = findFirstFromProperty(array, property, item)

                    if (item == null)
                        throw new Error('removeItemsFromProperty - Impossible de trouver l\'élément dans le tableau.');
                    else
                        removeItem(array, item);
                });
            }
            else
                throw new Error('removeItemsFromProperty - Impossible de trouver l\'élément dans le tableau.');

            return array;
        }
      

        function removeItemFromProperty(array, property, value) {
            if (array && array.length > 0) {
                var item = findFirstFromProperty(array, property, value)

                if (item == null)
                    throw new Error('removeItemFromProperty - Impossible de trouver l\'élément dans le tableau.');
                else
                    removeItem(array, item);
            }
            else
                throw new Error('removeItemFromProperty - Impossible de trouver l\'élément dans le tableau.');
        }

        function clearEmptyItems(value) {
            var value = _.clone(value);
            var keys = _.keys(value);
            for (var i = 0; i < keys.length; i++) {
                var key = keys[i];
                if (value[key] === false || UtilsHelper.isEmpty(value[key]) || UtilsHelper.dateIsEmpty(value[key]))
                    delete value[key];
            }
            return value;
        }

        function sumProperty(array, property) {
            var result = 0;
            forEach(array, function (item) {
                if (item[property])
                    result += parseFloat(item[property]);
            });
            return result;
        }

        function minProperty(array, property) {
            return Math.min.apply(Math, array.map(function (o)
            { return o[property]; }
            ))
        }

        function maxProperty(array, property) {
            return Math.max.apply(Math, array.map(function (o)
            { return o[property]; }
            ))
        }

        function distinctProperty(array, property) {
            if (array && array.length > 0) {
                return _.uniq(mapProperty(array, property));
            }
            else
                return null;
        }

        function distinctByFromProperty(array, property) {
            if (array && array.length > 0) {
                return _.uniq(array, function (item) {
                    return item[property];
                });
            }
            else
                return null;
        }


        function findFirstFromProperty(array, property, value) {
            if (array && array.length > 0) {
                var findObj = {};
                findObj[property] = value;
                return _.findWhere(array, findObj);
            }
            else
                return null;
        }

        function joinArrays(array1, array2) {
            return _.union(array1, array2);
        }

        function sortByProperty(array, property) {
            if (array && property && array.length > 0) {
                return _.sortBy(array, property);
            }
            else
                return [];
        }

        function sortByPropertyCaseInsensitive(array, property) {
        	if (array && property && array.length > 0) {
        		return _.sortBy(array, function (item) { return item[property].toUpperCaseWithoutAccent() });
        	}
        	else
        		return [];
        }

        function findFirstFromFunction(array, func, ctx) {
            if (array && array.length > 0) {
                return _.find(array, func, ctx);
            }
            else
                return null;
        }


        function findFromProperty(array, property, value) {
            if (array && array.length > 0) {
                var findObj = {};
                findObj[property] = value;
                return _.where(array, findObj);
            }
            else
                return [];
        }

        function findFromFunction(array, func, ctx) {
            if (array && array.length > 0) {
                return _.filter(array, func, ctx);
            }
            else
                return [];
        }

        function findItemsWithIdsNotInValue(collection, idsToExclude, referenceValue, propertyId, separator) {
        	return findFromFunction(collection, function (item) {
        		if (idsToExclude.indexOf(item[propertyId]) >= 0) {
        			if (referenceValue && (separator + referenceValue + separator).indexOf(separator + item[propertyId] + separator) >= 0)
        				return true;
        			else
        				return false;
        		}
        		return true;
        	});
        }


        function forEach(array, func, ctx) {
            if (array && array.length > 0) {
                _.each(array, func, ctx);
            }
            else
                null;
        }

        function contains(array, value) {
            if (array && array.length > 0) {
                return _.contains(array, value);
            }
            else
                return false;
        }

        //LCA Fonction de groupement
        function groupBy(array, iteratee) {
            return _.toArray(_.groupBy(array, iteratee));
        }

        //Découpe un array en limitant le nombre d'item d'un array 
        function splitSubArrayWithLimit(array, limit) {

            for (var i = 0; i < array.length; i++) {
                while (array[i].length > limit) {
                    var items = array[i].splice(0, limit);
                    array.splice(i, 0, items);
                }
            }
            return array;
        }

        function mapFunction(array, func, ctx) {
            if (array && array.length > 0) {
                return _.map(array, func, ctx);
            }
            else
                return [];
        }

        function mapProperty(array, propertyName) {
            if (array && array.length > 0) {
                return _.pluck(array, propertyName);
            }
            else
                return [];
        }

        function getStringFromProperty(array, propertyName, separator) {

            if (array && array.length > 0) {
                var result = '';
                forEach(array, function (item) {
                    if (result != '')
                        result += (separator ? separator : ',');
                    result += item[propertyName];
                });
                return result;
            }
            else
                return '';

        }

        function getStringFromArray(array, separator) {

            if (array && array.length > 0) {
                var result = '';
                forEach(array, function (item) {
                    if (result != '')
                        result += (separator ? separator : ',');
                    result += item;
                });
                return result;
            }
            else
                return '';
        }

        function shuffleItems(array) {
        	for (var i = array.length - 1; i > 0; i--) {
        		var j = Math.floor(Math.random() * (i + 1));
        		var temp = array[i];
        		array[i] = array[j];
        		array[j] = temp;
        	}
        	return array;
        }

    };
})();




