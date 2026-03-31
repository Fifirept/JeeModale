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
   Bouton "Ajouter un équipement" — browse sélecteur Jeedom
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
   Bouton "Ajouter une commande" — browse sélecteur Jeedom
   jeedom.cmd.getSelectModal retourne {id: "123", human: "[Objet][Eq][Cmd]", ...}
   Le format du callback peut varier : result peut être un objet ou
   directement contenir cmd_id. On gère les deux cas.
   ======================================================== */
$('#bt_addTargetCmd').off('click').on('click', function () {
	jeedom.cmd.getSelectModal({}, function (result) {
		var cmdId = ''
		var cmdHuman = ''
		if (typeof result === 'object') {
			cmdId = result.cmd_id || result.id || ''
			cmdHuman = result.human || ''
		} else {
			// result peut être directement l'id
			cmdId = String(result)
		}
		if (!cmdId || cmdId === '' || cmdId === 'undefined') return
		var newCmd = {
			name: cmdHuman || ('Commande #' + cmdId),
			type: 'info',
			subType: 'string',
			configuration: {
				targetType: 'cmd',
				targetId: String(cmdId),
				targetHuman: cmdHuman
			}
		}
		addCmdToTable(newCmd)
	})
})

/* ========================================================
   Sélecteur d'icône — API Jeedom 4.x
   ======================================================== */
$('#bt_chooseIcon').off('click').on('click', function () {
	var _cb = function (_icon) {
		var match = _icon.match(/class="([^"]+)"/)
		if (match && match[1]) {
			$('.eqLogicAttr[data-l2key="iconClass"]').value(match[1]).trigger('change')
		}
	}
	if (typeof jeedomUtils !== 'undefined' && typeof jeedomUtils.chooseIcon === 'function') {
		jeedomUtils.chooseIcon(_cb)
	} else {
		$('#mod_selectIcon').modal('show')
		$('#mod_selectIcon').off('select').one('select', function (_e, _icon) {
			_cb(_icon)
			$('#mod_selectIcon').modal('hide')
		})
	}
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

$(document).off('change keyup', '.eqLogicAttr[data-l2key="iconClass"]').on('change keyup', '.eqLogicAttr[data-l2key="iconClass"]', updateIconPreview)
$(document).off('change input', '.eqLogicAttr[data-l2key="iconColor"]').on('change input', '.eqLogicAttr[data-l2key="iconColor"]', updateIconPreview)
$(document).off('change keyup', '.eqLogicAttr[data-l2key="customImage"]').on('change keyup', '.eqLogicAttr[data-l2key="customImage"]', updateIconPreview)

$('body').off('JeeModale::printEqLogic').on('JeeModale::printEqLogic', function () {
	setTimeout(updateIconPreview, 300)
})

/* ========================================================
   Affichage des commandes dans le tableau
   IMPORTANT : les champs type et subType doivent avoir une
   valeur par défaut ET être correctement remplis par setValues.
   On force les valeurs après setValues pour être sûr.
   ======================================================== */
function addCmdToTable(_cmd) {
	if (!isset(_cmd)) {
		var _cmd = { configuration: {} }
	}
	if (!isset(_cmd.configuration)) {
		_cmd.configuration = {}
	}
	// Forcer type/subType si absents
	if (!_cmd.type || _cmd.type === '') {
		_cmd.type = 'info'
	}
	if (!_cmd.subType || _cmd.subType === '') {
		_cmd.subType = 'string'
	}

	var targetType = _cmd.configuration.targetType || '?'
	var targetHuman = _cmd.configuration.targetHuman || ''
	var targetId = _cmd.configuration.targetId || ''
	var targetLabel = targetHuman || (targetType === 'eqLogic' ? 'Équipement #' + targetId : 'Commande #' + targetId)
	var typeBadge = targetType === 'eqLogic'
		? '<span class="label label-success">{{Équipement}}</span>'
		: (targetType === 'cmd'
			? '<span class="label label-info">{{Commande}}</span>'
			: '<span class="label label-default">?</span>')

	var tr = '<tr class="cmd" data-cmd_id="' + init(_cmd.id) + '">'
	tr += '<td class="hidden-xs">'
	tr += '<span class="cmdAttr" data-l1key="id"></span>'
	tr += '</td>'
	tr += '<td>'
	tr += '<input class="cmdAttr form-control input-sm" data-l1key="name" placeholder="{{Nom}}">'
	// type et subType en champs cachés — Jeedom en a besoin pour sauvegarder
	tr += '<span class="type" type="' + init(_cmd.type) + '">' + jeedom.cmd.availableType() + '</span>'
	tr += '<span class="subType" subType="' + init(_cmd.subType) + '"></span>'
	tr += '</td>'
	tr += '<td>' + typeBadge
	tr += '<input class="cmdAttr" data-l1key="configuration" data-l2key="targetType" style="display:none;">'
	tr += '</td>'
	tr += '<td>'
	tr += '<span class="jeeModale-target-label">' + targetLabel + '</span>'
	tr += '<input class="cmdAttr" data-l1key="configuration" data-l2key="targetId" style="display:none;">'
	tr += '<input class="cmdAttr" data-l1key="configuration" data-l2key="targetHuman" style="display:none;">'
	tr += '</td>'
	tr += '<td>'
	tr += '<i class="fas fa-minus-circle pull-right cmdAction cursor" data-action="remove" title="{{Supprimer la commande}}"></i>'
	tr += '</td>'
	tr += '</tr>'

	$('#table_cmd tbody').append(tr)
	var $tr = $('#table_cmd tbody tr').last()
	$tr.setValues(_cmd, '.cmdAttr')
	jeedom.cmd.changeType($tr, init(_cmd.subType))

	// Masquer les sélecteurs type/subType (on ne veut pas que l'utilisateur les modifie)
	$tr.find('.type').hide()
	$tr.find('.subType').hide()

	// Mettre à jour le label affiché après setValues
	var finalHuman = $tr.find('.cmdAttr[data-l2key="targetHuman"]').value()
	var finalId = $tr.find('.cmdAttr[data-l2key="targetId"]').value()
	var finalType = $tr.find('.cmdAttr[data-l2key="targetType"]').value()
	if (finalHuman) {
		$tr.find('.jeeModale-target-label').text(finalHuman)
	} else if (finalId) {
		$tr.find('.jeeModale-target-label').text((finalType === 'eqLogic' ? 'Équipement #' : 'Commande #') + finalId)
	}
}
