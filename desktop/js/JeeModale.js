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

/**
 * Nettoyer un nom pour enlever les caractères spéciaux Jeedom (#[])
 */
function _jmCleanName(str) {
	if (!str) return ''
	return str.replace(/#/g, '').replace(/\[/g, '').replace(/\]/g, '').trim()
}

/* ========================================================
   Bouton "Ajouter un équipement cible"
   ======================================================== */
$('#bt_addTargetEqLogic').off('click').on('click', function () {
	jeedom.eqLogic.getSelectModal({}, function (result) {
		if (!result || !result.id) return
		var cleanName = _jmCleanName(result.human) || ('Equipement ' + result.id)
		var newCmd = {
			name: cleanName,
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
   ======================================================== */
$('#bt_addTargetCmd').off('click').on('click', function () {
	jeedom.cmd.getSelectModal({}, function (result) {
		if (!result) return
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
		var cleanName = _jmCleanName(cmdHuman) || ('Commande ' + cmdId)
		var newCmd = {
			name: cleanName,
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
   Sélecteur d'icône
   ======================================================== */
$('#bt_chooseIcon').off('click').on('click', function () {
	var $selectIcon = $('#mod_selectIcon')
	if ($selectIcon.length === 0) {
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
	if (!_icon) return
	var match = _icon.match(/class="([^"]+)"/)
	if (match && match[1]) {
		$('.eqLogicAttr[data-l2key="iconClass"]').value(match[1]).trigger('change')
	}
}

/* ========================================================
   Sélecteur d'image
   ======================================================== */
$('#bt_selectImage').off('click').on('click', function () {
	if (typeof jeedom.selectImage === 'function') {
		jeedom.selectImage({
			success: function (_path) {
				$('.eqLogicAttr[data-l2key="customImage"]').value(_path).trigger('change')
			}
		})
	} else {
		alert('Fonction jeedom.selectImage non disponible')
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

$(document).off('change.jmIcon keyup.jmIcon', '.eqLogicAttr[data-l2key="iconClass"]').on('change.jmIcon keyup.jmIcon', '.eqLogicAttr[data-l2key="iconClass"]', updateIconPreview)
$(document).off('change.jmIcon input.jmIcon', '.eqLogicAttr[data-l2key="iconColor"]').on('change.jmIcon input.jmIcon', '.eqLogicAttr[data-l2key="iconColor"]', updateIconPreview)
$(document).off('change.jmIcon keyup.jmIcon', '.eqLogicAttr[data-l2key="customImage"]').on('change.jmIcon keyup.jmIcon', '.eqLogicAttr[data-l2key="customImage"]', updateIconPreview)

$('body').off('JeeModale::printEqLogic').on('JeeModale::printEqLogic', function () {
	setTimeout(updateIconPreview, 300)
})

/* ========================================================
   Affichage des commandes dans le tableau
   IMPORTANT : les <span class="type"> et <span class="subType">
   sont OBLIGATOIRES pour que Jeedom sérialise type/subType
   à la sauvegarde. Sans eux → "Le type de la commande ne peut
   pas être vide".
   ======================================================== */
function addCmdToTable(_cmd) {
	if (!isset(_cmd)) {
		var _cmd = { configuration: {} }
	}
	if (!isset(_cmd.configuration)) {
		_cmd.configuration = {}
	}
	if (!_cmd.type) _cmd.type = 'info'
	if (!_cmd.subType) _cmd.subType = 'string'

	var targetType = _cmd.configuration.targetType || '?'
	var targetHuman = _cmd.configuration.targetHuman || ''
	var targetId = _cmd.configuration.targetId || ''
	var targetLabel = targetHuman || (targetType === 'eqLogic' ? 'Equipement #' + targetId : 'Commande #' + targetId)
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
	// --- OBLIGATOIRE : spans type/subType pour la sérialisation Jeedom ---
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
	var tr = $('#table_cmd tbody tr').last()
	jeedom.eqLogic.buildSelectCmd({
		id: $('.eqLogicAttr[data-l1key=id]').value(),
		filter: { type: 'info' },
		error: function (error) {
			$('#div_alert').showAlert({ message: error.message, level: 'danger' })
		},
		success: function (result) {
			tr.setValues(_cmd, '.cmdAttr')
			jeedom.cmd.changeType(tr, init(_cmd.subType))
			// Masquer les sélecteurs type/subType (l'utilisateur n'a pas à les modifier)
			tr.find('.type').hide()
			tr.find('.subType').hide()

			// Mettre à jour le label affiché
			var fHuman = tr.find('.cmdAttr[data-l2key="targetHuman"]').value()
			var fId = tr.find('.cmdAttr[data-l2key="targetId"]').value()
			var fType = tr.find('.cmdAttr[data-l2key="targetType"]').value()
			if (fHuman) {
				tr.find('.jeeModale-target-label').text(fHuman)
			} else if (fId) {
				tr.find('.jeeModale-target-label').text((fType === 'eqLogic' ? 'Equipement #' : 'Commande #') + fId)
			}
		}
	})
}
