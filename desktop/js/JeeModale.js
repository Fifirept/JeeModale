/* This file is part of Jeedom.
*
* Jeedom is free software: you can redistribute it and/or modify
* it under the terms of the GNU General Public License as published by
* the Free Software Foundation, either version 3 of the License, or
* (at your option) any later version.
*
* Jeedom is distributed in the hope that it will be useful,
* but WITHOUT ANY WARRANTY; without even the implied warranty of
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
* GNU General Public License for more details.
*
* You should have received a copy of the GNU General Public License
* along with Jeedom. If not, see <http://www.gnu.org/licenses/>.
*/

/* Réorganisation des commandes par drag & drop */
$('#table_cmd').sortable({
	axis: 'y',
	cursor: 'move',
	items: '.cmd',
	placeholder: 'ui-state-highlight',
	tolerance: 'intersect',
	forcePlaceholderSize: true
})

/* ========================================================
   Bouton "Ajouter un équipement cible"
   ======================================================== */
$('#bt_addTargetEqLogic').off('click').on('click', function () {
	jeedom.eqLogic.getSelectModal({}, function (result) {
		if (!result || !result.id) return
		var newCmd = {
			name: result.human || ('Équipement #' + result.id),
			type: 'info',
			subType: 'string',
			configuration: {
				targetType: 'eqLogic',
				targetId: String(result.id),
				targetHuman: result.human || ''
			}
		}
		addCmdToTable(newCmd)
	})
})

/* ========================================================
   Bouton "Ajouter une commande cible"
   jeedom.cmd.getSelectModal callback : result = {human: "#[..]#", cmd: {id:X, ...}}
   ou parfois result = {id:X, human:"..."}
   ======================================================== */
$('#bt_addTargetCmd').off('click').on('click', function () {
	jeedom.cmd.getSelectModal({}, function (result) {
		if (!result) return
		// Extraire l'id — le format varie selon la version Jeedom
		var cmdId = ''
		var cmdHuman = ''
		if (typeof result === 'object') {
			if (result.cmd && result.cmd.id) {
				cmdId = String(result.cmd.id)
				cmdHuman = result.human || ''
			} else if (result.id) {
				cmdId = String(result.id)
				cmdHuman = result.human || ''
			}
		}
		if (!cmdId) return
		var newCmd = {
			name: cmdHuman || ('Commande #' + cmdId),
			type: 'info',
			subType: 'string',
			configuration: {
				targetType: 'cmd',
				targetId: cmdId,
				targetHuman: cmdHuman
			}
		}
		addCmdToTable(newCmd)
	})
})

/* ========================================================
   Sélecteur d'icône pour le widget
   Utilise la modale Jeedom #mod_selectIcon (standard 4.x)
   ======================================================== */
$('#bt_chooseIcon').off('click').on('click', function () {
	var $selectIcon = $('#mod_selectIcon')
	if ($selectIcon.length === 0) {
		// Jeedom 4.4+ peut ne pas avoir le mod_selectIcon, tenter jeedomUtils
		if (typeof jeedomUtils !== 'undefined' && typeof jeedomUtils.chooseIcon === 'function') {
			jeedomUtils.chooseIcon(function (_icon) {
				_applyIcon(_icon)
			})
		}
		return
	}
	$selectIcon.modal('show')
	$selectIcon.off('select').one('select', function (_e, _icon) {
		_applyIcon(_icon)
		$selectIcon.modal('hide')
	})
})

function _applyIcon(_icon) {
	// _icon = '<i class="fas fa-home"></i>' ou '<span class="..."></span>'
	if (!_icon) return
	var match = _icon.match(/class="([^"]+)"/)
	if (match && match[1]) {
		$('.eqLogicAttr[data-l2key="iconClass"]').value(match[1]).trigger('change')
	}
}

/* ========================================================
   Sélecteur d'image — upload via l'API Jeedom
   ======================================================== */
$('#bt_selectImage').off('click').on('click', function () {
	jeedom.selectImage({
		success: function (_path) {
			$('.eqLogicAttr[data-l2key="customImage"]').value(_path).trigger('change')
		}
	})
})

/* ========================================================
   Aperçu de l'icône en temps réel
   ======================================================== */
function updateIconPreview() {
	var iconClass = $('.eqLogicAttr[data-l2key="iconClass"]').value() || 'fas fa-window-maximize'
	var iconColor = $('.eqLogicAttr[data-l2key="iconColor"]').value() || '#0076b6'
	var customImage = $('.eqLogicAttr[data-l2key="customImage"]').value() || ''
	var previewHtml = ''
	if (customImage !== '') {
		previewHtml = '<img src="' + customImage + '" style="max-width:80%;max-height:80%;object-fit:contain;">'
	} else {
		previewHtml = '<i class="' + iconClass + '" style="font-size:2.5em;color:' + iconColor + ';"></i>'
	}
	$('#jeeModale-icon-preview').html(previewHtml)
}

$(document).off('change.jmIcon keyup.jmIcon', '.eqLogicAttr[data-l2key="iconClass"]').on('change.jmIcon keyup.jmIcon', '.eqLogicAttr[data-l2key="iconClass"]', updateIconPreview)
$(document).off('change.jmIcon input.jmIcon', '.eqLogicAttr[data-l2key="iconColor"]').on('change.jmIcon input.jmIcon', '.eqLogicAttr[data-l2key="iconColor"]', updateIconPreview)
$(document).off('change.jmIcon keyup.jmIcon', '.eqLogicAttr[data-l2key="customImage"]').on('change.jmIcon keyup.jmIcon', '.eqLogicAttr[data-l2key="customImage"]', updateIconPreview)

$('body').off('JeeModale::printEqLogic').on('JeeModale::printEqLogic', function () {
	setTimeout(updateIconPreview, 300)
})

/* ========================================================
   Affichage des commandes dans le tableau
   Pattern standard Jeedom avec jeedom.cmd.availableType()
   + jeedom.eqLogic.buildSelectCmd + jeedom.cmd.changeType
   ======================================================== */
function addCmdToTable(_cmd) {
	if (!isset(_cmd)) {
		var _cmd = { configuration: {} }
	}
	if (!isset(_cmd.configuration)) {
		_cmd.configuration = {}
	}
	// Forcer type/subType
	if (!_cmd.type) _cmd.type = 'info'
	if (!_cmd.subType) _cmd.subType = 'string'

	var targetType = _cmd.configuration.targetType || '?'
	var targetHuman = _cmd.configuration.targetHuman || ''
	var targetId = _cmd.configuration.targetId || ''
	var targetLabel = targetHuman || (targetType === 'eqLogic' ? 'Équipement #' + targetId : 'Commande #' + targetId)
	var typeBadge = ''
	if (targetType === 'eqLogic') {
		typeBadge = '<span class="label label-success">{{Équipement}}</span>'
	} else if (targetType === 'cmd') {
		typeBadge = '<span class="label label-info">{{Commande}}</span>'
	}

	var tr = '<tr class="cmd" data-cmd_id="' + init(_cmd.id) + '">'
	tr += '<td class="hidden-xs">'
	tr += '<span class="cmdAttr" data-l1key="id"></span>'
	tr += '</td>'
	tr += '<td>'
	tr += '<input class="cmdAttr form-control input-sm" data-l1key="name" placeholder="{{Nom}}">'
	// type/subType : pattern standard du template Jeedom
	tr += '<select class="cmdAttr form-control input-sm" data-l1key="value" style="display:none;margin-top:5px;" title="{{Commande info liée}}">'
	tr += '<option value="">{{Aucune}}</option>'
	tr += '</select>'
	tr += '</td>'
	tr += '<td>' + typeBadge + '</td>'
	tr += '<td>'
	tr += '<span class="jeeModale-target-label">' + targetLabel + '</span>'
	tr += '<input class="cmdAttr" data-l1key="configuration" data-l2key="targetType" style="display:none;">'
	tr += '<input class="cmdAttr" data-l1key="configuration" data-l2key="targetId" style="display:none;">'
	tr += '<input class="cmdAttr" data-l1key="configuration" data-l2key="targetHuman" style="display:none;">'
	tr += '</td>'
	tr += '<td>'
	tr += '<i class="fas fa-minus-circle pull-right cmdAction cursor" data-action="remove" title="{{Supprimer la commande}}"></i>'
	tr += '</td>'
	tr += '</tr>'

	$('#table_cmd tbody').append(tr)
	var tr = $('#table_cmd tbody tr').last()
	jeedom.eqLogic.buildSelectCmd({
		id: $('.eqLogicAttr[data-l1key=id]').value(),
		filter: { type: 'info' },
		error: function (error) {
			$('#div_alert').showAlert({ message: error.message, level: 'danger' })
		},
		success: function (result) {
			tr.find('.cmdAttr[data-l1key=value]').append(result)
			tr.setValues(_cmd, '.cmdAttr')
			jeedom.cmd.changeType(tr, init(_cmd.subType))

			// Mettre à jour le label affiché
			var fHuman = tr.find('.cmdAttr[data-l2key="targetHuman"]').value()
			var fId = tr.find('.cmdAttr[data-l2key="targetId"]').value()
			var fType = tr.find('.cmdAttr[data-l2key="targetType"]').value()
			if (fHuman) {
				tr.find('.jeeModale-target-label').text(fHuman)
			} else if (fId) {
				tr.find('.jeeModale-target-label').text((fType === 'eqLogic' ? 'Équipement #' : 'Commande #') + fId)
			}
		}
	})
}
