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
		addCmdToTable({
			name: cleanName,
			type: 'info',
			subType: 'string',
			configuration: {
				targetType: 'eqLogic',
				targetId: String(result.id),
				targetHuman: result.human || ''
			}
		})
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
		addCmdToTable({
			name: cleanName,
			type: 'info',
			subType: 'string',
			configuration: {
				targetType: 'cmd',
				targetId: cmdId,
				targetHuman: cmdHuman
			}
		})
	})
})

/* ========================================================
   Sélecteur d'icône — jeedomUtils.chooseIcon (Jeedom 4.4+)
   ======================================================== */
$('#bt_chooseIcon').off('click').on('click', function () {
	jeedomUtils.chooseIcon(function (_icon) {
		// _icon = '<i class="fas fa-home"></i>'
		if (!_icon) return
		var match = _icon.match(/class="([^"]+)"/)
		if (match && match[1]) {
			$('.eqLogicAttr[data-l2key="iconClass"]').value(match[1]).trigger('change')
			$('#jeeModale-icon-preview-inline').html('<i class="' + match[1] + '"></i>')
		}
	})
})

/* ========================================================
   Upload d'image — input file natif + AJAX vers le plugin
   ======================================================== */
$('#bt_uploadImage').off('click').on('click', function () {
	$('#in_uploadImageFile').click()
})

$('#in_uploadImageFile').off('change').on('change', function () {
	var fileInput = this
	if (!fileInput.files || fileInput.files.length === 0) return
	var file = fileInput.files[0]
	var formData = new FormData()
	formData.append('action', 'uploadImage')
	formData.append('file', file)
	formData.append('jeedom_token', JEEDOM_AJAX_TOKEN)

	$.ajax({
		type: 'POST',
		url: 'plugins/JeeModale/core/ajax/JeeModale.ajax.php',
		data: formData,
		processData: false,
		contentType: false,
		dataType: 'json',
		success: function (data) {
			if (data.state !== 'ok') {
				$('#div_alert').showAlert({ message: data.result, level: 'danger' })
				return
			}
			var imagePath = data.result
			$('.eqLogicAttr[data-l2key="customImage"]').value(imagePath).trigger('change')
			$('#jeeModale-image-preview').attr('src', imagePath).show()
			$('#div_alert').showAlert({ message: '{{Image téléchargée avec succès}}', level: 'success' })
		},
		error: function () {
			$('#div_alert').showAlert({ message: '{{Erreur lors du téléchargement}}', level: 'danger' })
		}
	})
	// Reset pour pouvoir re-sélectionner le même fichier
	fileInput.value = ''
})

$('#bt_clearImage').off('click').on('click', function () {
	$('.eqLogicAttr[data-l2key="customImage"]').value('').trigger('change')
	$('#jeeModale-image-preview').attr('src', '').hide()
})

/* ========================================================
   Mise à jour des aperçus au chargement d'un équipement
   ======================================================== */
$('body').off('JeeModale::printEqLogic').on('JeeModale::printEqLogic', function () {
	setTimeout(function () {
		var iconClass = $('.eqLogicAttr[data-l2key="iconClass"]').value() || 'fas fa-window-maximize'
		$('#jeeModale-icon-preview-inline').html('<i class="' + iconClass + '"></i>')

		var customImage = $('.eqLogicAttr[data-l2key="customImage"]').value() || ''
		if (customImage !== '') {
			$('#jeeModale-image-preview').attr('src', customImage).show()
		} else {
			$('#jeeModale-image-preview').attr('src', '').hide()
		}
	}, 300)
})

/* ========================================================
   Affichage des commandes dans le tableau
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
			tr.find('.type').hide()
			tr.find('.subType').hide()

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
