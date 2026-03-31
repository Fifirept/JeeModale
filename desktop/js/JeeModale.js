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
				targetId: result.id,
				targetHuman: result.human || ''
			}
		}
		addCmdToTable(newCmd)
	})
})

/* ========================================================
   Bouton "Ajouter une commande" — browse sélecteur Jeedom
   ======================================================== */
$('#bt_addTargetCmd').off('click').on('click', function () {
	jeedom.cmd.getSelectModal({}, function (result) {
		if (!result || !result.id) return
		var newCmd = {
			name: result.human || ('Commande #' + result.id),
			type: 'info',
			subType: 'string',
			configuration: {
				targetType: 'cmd',
				targetId: result.id,
				targetHuman: result.human || ''
			}
		}
		addCmdToTable(newCmd)
	})
})

/* ========================================================
   Sélecteur d'icône
   ======================================================== */
$('#bt_chooseIcon').off('click').on('click', function () {
	var currentIcon = $('.eqLogicAttr[data-l2key="iconClass"]').value()
	jeedom.chooseIcon(function (_icon) {
		// _icon est du HTML type <i class="fas fa-home"></i>
		var match = _icon.match(/class="([^"]+)"/)
		if (match && match[1]) {
			$('.eqLogicAttr[data-l2key="iconClass"]').value(match[1]).trigger('change')
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

$('.eqLogicAttr[data-l2key="iconClass"]').off('change keyup').on('change keyup', updateIconPreview)
$('.eqLogicAttr[data-l2key="iconColor"]').off('change input').on('change input', updateIconPreview)
$('.eqLogicAttr[data-l2key="customImage"]').off('change keyup').on('change keyup', updateIconPreview)

/* ========================================================
   Mise à jour du preview lors du chargement d'un équipement
   ======================================================== */
$('body').off('JeeModale::printEqLogic').on('JeeModale::printEqLogic', function () {
	setTimeout(updateIconPreview, 200)
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

	var targetType = _cmd.configuration.targetType || '?'
	var targetHuman = _cmd.configuration.targetHuman || ''
	var targetId = _cmd.configuration.targetId || ''
	var targetLabel = targetHuman || (targetType === 'eqLogic' ? 'Équipement #' + targetId : 'Commande #' + targetId)
	var typeBadge = targetType === 'eqLogic'
		? '<span class="label label-success">{{Équipement}}</span>'
		: '<span class="label label-info">{{Commande}}</span>'

	var tr = '<tr class="cmd" data-cmd_id="' + init(_cmd.id) + '">'
	tr += '<td class="hidden-xs">'
	tr += '<span class="cmdAttr" data-l1key="id"></span>'
	tr += '</td>'
	tr += '<td>'
	tr += '<input class="cmdAttr form-control input-sm" data-l1key="name" placeholder="{{Nom}}">'
	tr += '<input class="cmdAttr" data-l1key="type" style="display:none;">'
	tr += '<input class="cmdAttr" data-l1key="subType" style="display:none;">'
	tr += '</td>'
	tr += '<td>' + typeBadge
	tr += '<input class="cmdAttr" data-l1key="configuration" data-l2key="targetType" style="display:none;">'
	tr += '</td>'
	tr += '<td>'
	tr += '<span>' + targetLabel + '</span>'
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
}

/* ========================================================
   Widget dashboard : clic → ouverture modale
   Redimensionnement → sauvegarde AJAX
   ======================================================== */
if (typeof jeedomUtils !== 'undefined') {
	// Écouter l'événement post-render des widgets sur le dashboard
	$('body').off('click.jeeModaleWidget').on('click.jeeModaleWidget', '.eqLogic-widget[data-eqType="JeeModale"] .jeeModale-widget-inner', function (e) {
		e.preventDefault()
		e.stopPropagation()
		var $widget = $(this).closest('.eqLogic-widget')
		var eqId = $widget.data('eqlogic_id')
		var targetEqLogics = $widget.data('target-eqlogics') || []
		var targetCmds = $widget.data('target-cmds') || []

		if (targetEqLogics.length === 0 && targetCmds.length === 0) {
			$('#div_alert').showAlert({ message: '{{Aucune cible configurée pour ce JeeModale}}', level: 'warning' })
			return
		}

		// Appel AJAX pour récupérer le HTML des cibles
		$.ajax({
			type: 'POST',
			url: 'plugins/JeeModale/core/ajax/JeeModale.ajax.php',
			data: {
				action: 'getTargetHtml',
				eqLogicIds: JSON.stringify(targetEqLogics),
				cmdIds: JSON.stringify(targetCmds),
				jeedom_token: JEEDOM_AJAX_TOKEN
			},
			dataType: 'json',
			success: function (data) {
				if (data.state !== 'ok') {
					$('#div_alert').showAlert({ message: data.result, level: 'danger' })
					return
				}
				var items = data.result
				var modalContent = '<div class="jeeModale-modal-content" style="padding:10px;">'
				for (var i = 0; i < items.length; i++) {
					modalContent += '<div class="jeeModale-modal-item" style="margin-bottom:10px;cursor:move;" data-item-index="' + i + '">'
					modalContent += items[i].html
					modalContent += '</div>'
				}
				modalContent += '</div>'

				// Ouvrir la modale jQuery UI
				var $dialog = $('<div title="' + $widget.find('.jeeModale-widget-inner span').text() + '">' + modalContent + '</div>')
				$dialog.dialog({
					modal: true,
					width: 'auto',
					minWidth: 400,
					maxWidth: $(window).width() * 0.9,
					maxHeight: $(window).height() * 0.85,
					close: function () {
						$(this).dialog('destroy').remove()
					},
					open: function () {
						// Rendre les items déplaçables dans la modale
						$(this).find('.jeeModale-modal-content').sortable({
							items: '.jeeModale-modal-item',
							cursor: 'move',
							placeholder: 'ui-state-highlight',
							tolerance: 'pointer'
						})
						// Initialiser les widgets Jeedom dans la modale
						if (typeof jeedomUtils !== 'undefined' && typeof jeedomUtils.initTooltips === 'function') {
							jeedomUtils.initTooltips($(this))
						}
					}
				})
			},
			error: function (error) {
				$('#div_alert').showAlert({ message: '{{Erreur lors du chargement de la modale}}', level: 'danger' })
			}
		})
	})

	/* Redimensionnement du widget */
	$('body').off('mousedown.jeeModaleResize').on('mousedown.jeeModaleResize', '.jeeModale-resize-handle', function (e) {
		e.preventDefault()
		e.stopPropagation()
		var $widget = $(this).closest('.eqLogic-widget')
		var startX = e.pageX
		var startY = e.pageY
		var startW = $widget.outerWidth()
		var startH = $widget.outerHeight()
		var eqId = $widget.data('eqlogic_id')

		function onMouseMove(e) {
			var newW = Math.max(60, startW + (e.pageX - startX))
			var newH = Math.max(60, startH + (e.pageY - startY))
			$widget.css({ width: newW + 'px', height: newH + 'px' })
		}
		function onMouseUp(e) {
			$(document).off('mousemove.jeeModaleResize mouseup.jeeModaleResize')
			var finalW = $widget.outerWidth()
			var finalH = $widget.outerHeight()
			// Sauvegarder via AJAX
			$.ajax({
				type: 'POST',
				url: 'plugins/JeeModale/core/ajax/JeeModale.ajax.php',
				data: {
					action: 'saveWidgetSize',
					id: eqId,
					width: Math.round(finalW),
					height: Math.round(finalH),
					jeedom_token: JEEDOM_AJAX_TOKEN
				},
				dataType: 'json'
			})
		}
		$(document).on('mousemove.jeeModaleResize', onMouseMove)
		$(document).on('mouseup.jeeModaleResize', onMouseUp)
	})
}
