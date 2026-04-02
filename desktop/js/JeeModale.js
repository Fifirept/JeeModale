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

/* Ajout cibles */
$('#bt_addTargetEqLogic').off('click').on('click', function () {
	jeedom.eqLogic.getSelectModal({}, function (result) {
		if (!result || !result.id) return
		addCmdToTable({
			name: _jmCleanName(result.human) || ('Equipement ' + result.id),
			type: 'info', subType: 'string',
			configuration: { targetType: 'eqLogic', targetId: String(result.id), targetHuman: result.human || '' }
		})
	})
})

$('#bt_addTargetCmd').off('click').on('click', function () {
	jeedom.cmd.getSelectModal({}, function (result) {
		if (!result) return
		var cmdId = '', cmdHuman = ''
		if (typeof result === 'object') {
			if (result.cmd && result.cmd.id) { cmdId = String(result.cmd.id); cmdHuman = result.human || '' }
			else if (result.id) { cmdId = String(result.id); cmdHuman = result.human || '' }
		}
		if (!cmdId) return
		addCmdToTable({
			name: _jmCleanName(cmdHuman) || ('Commande ' + cmdId),
			type: 'info', subType: 'string',
			configuration: { targetType: 'cmd', targetId: cmdId, targetHuman: cmdHuman }
		})
	})
})

/* Sélecteur icône/image */
$('#bt_chooseWidgetIcon').off('click').on('click', function () {
	jeedomUtils.chooseIcon(function (_icon) {
		$('#in_widgetIconHtml').value(_icon)
		_jmUpdatePreview()
	}, { img: true })
})

$('#bt_clearWidgetIcon').off('click').on('click', function () {
	$('#in_widgetIconHtml').value('')
	_jmUpdatePreview()
})

/* Preview — nettoie les styles existants avant d'appliquer la taille */
function _jmStripStyle(html) {
	return html.replace(/\s*style=['"][^'"]*['"]/gi, '')
}

function _jmApplyIconSize(html, w) {
	// D'abord nettoyer tous les style existants (chooseIcon injecte height:Xpx)
	html = _jmStripStyle(html)
	if (!w) return html
	var px = w + 'px'
	if (html.indexOf('<img') !== -1) {
		return html.replace('<img', "<img style='width:" + px + ";object-fit:contain;'")
	}
	if (html.indexOf('<i') !== -1) {
		return html.replace('<i', "<i style='font-size:" + px + ";'")
	}
	return html
}

function _jmUpdatePreview() {
	var iconHtml = $('#in_widgetIconHtml').value() || ''
	var iconW = $('#in_iconWidth').value() || ''
	var eqName = $('.eqLogicAttr[data-l1key="name"]').value() || ''

	if (iconHtml === '') {
		$('#jeeModale-icon-preview').html('<i class="fas fa-window-maximize" style="font-size:1.5em;color:#ccc;"></i>')
		$('#jeeModale-preview-name').text(eqName || '(aucune icône)')
		return
	}

	$('#jeeModale-icon-preview').html(_jmApplyIconSize(iconHtml, iconW))
	$('#jeeModale-preview-name').text(eqName)
}

$(document).on('change keyup input', '#in_widgetIconHtml, #in_iconWidth', _jmUpdatePreview)
$(document).on('change keyup', '.eqLogicAttr[data-l1key="name"]', function () {
	$('#jeeModale-preview-name').text($(this).value() || '')
})

$('body').off('JeeModale::printEqLogic').on('JeeModale::printEqLogic', function () {
	setTimeout(_jmUpdatePreview, 300)
})

/* addCmdToTable */
function addCmdToTable(_cmd) {
	if (!isset(_cmd)) { var _cmd = { configuration: {} } }
	if (!isset(_cmd.configuration)) { _cmd.configuration = {} }
	if (!_cmd.type) _cmd.type = 'info'
	if (!_cmd.subType) _cmd.subType = 'string'

	var targetType = _cmd.configuration.targetType || '?'
	var targetHuman = _cmd.configuration.targetHuman || ''
	var targetId = _cmd.configuration.targetId || ''
	var targetLabel = targetHuman || (targetType === 'eqLogic' ? 'Equipement #' + targetId : 'Commande #' + targetId)
	var typeBadge = ''
	if (targetType === 'eqLogic') typeBadge = '<span class="label label-success">{{Équipement}}</span>'
	else if (targetType === 'cmd') typeBadge = '<span class="label label-info">{{Commande}}</span>'

	var tr = '<tr class="cmd" data-cmd_id="' + init(_cmd.id) + '">'
	tr += '<td class="hidden-xs"><span class="cmdAttr" data-l1key="id"></span></td>'
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
	tr += '<td style="text-align:center;">'
	tr += '<input type="checkbox" class="cmdAttr" data-l1key="configuration" data-l2key="forceNewLine">'
	tr += '</td>'
	tr += '<td><i class="fas fa-minus-circle pull-right cmdAction cursor" data-action="remove" title="{{Supprimer la commande}}"></i></td>'
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
			if (fHuman) tr.find('.jeeModale-target-label').text(fHuman)
			else if (fId) tr.find('.jeeModale-target-label').text((fType === 'eqLogic' ? 'Equipement #' : 'Commande #') + fId)
		}
	})
}
