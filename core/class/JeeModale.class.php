<?php
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

require_once __DIR__ . '/../../../../core/php/core.inc.php';

class JeeModale extends eqLogic {

	public static $_widgetPossibility = array(
		'custom' => true,
		'custom::layout' => false
	);

	/*     * *********************Méthodes d'instance************************* */

	public function preInsert() {
	}

	public function postInsert() {
	}

	public function preSave() {
	}

	public function postSave() {
	}

	public function preUpdate() {
	}

	public function postUpdate() {
	}

	public function preRemove() {
	}

	public function postRemove() {
	}

	/**
	 * Génère le widget HTML pour le dashboard/design
	 * Affiche une icône/image cliquable qui ouvre une modale avec les commandes cibles
	 */
	public function toHtml($_version = 'dashboard') {
		$replace = $this->preToHtml($_version);
		if (!is_array($replace)) {
			return $replace;
		}
		$version = jeedom::versionAlias($_version);

		// Récupérer la configuration de l'icône/image
		$iconClass = $this->getConfiguration('iconClass', 'fas fa-window-maximize');
		$iconColor = $this->getConfiguration('iconColor', '#0076b6');
		$customImage = $this->getConfiguration('customImage', '');
		$widgetWidth = $this->getConfiguration('widgetWidth', 120);
		$widgetHeight = $this->getConfiguration('widgetHeight', 120);
		$modalTitle = $this->getName();

		// Collecter les IDs des équipements et commandes cibles
		$targetEqLogics = array();
		$targetCmds = array();
		foreach ($this->getCmd() as $cmd) {
			$conf = $cmd->getConfiguration();
			if (isset($conf['targetType'])) {
				if ($conf['targetType'] === 'eqLogic' && isset($conf['targetId'])) {
					$targetEqLogics[] = intval($conf['targetId']);
				} elseif ($conf['targetType'] === 'cmd' && isset($conf['targetId'])) {
					$targetCmds[] = intval($conf['targetId']);
				}
			}
		}

		$dataEqLogics = htmlspecialchars(json_encode($targetEqLogics), ENT_QUOTES, 'UTF-8');
		$dataCmds = htmlspecialchars(json_encode($targetCmds), ENT_QUOTES, 'UTF-8');

		// Construire le visuel du widget
		if (!empty($customImage)) {
			$iconHtml = '<img src="' . $customImage . '" style="max-width:80%;max-height:80%;object-fit:contain;">';
		} else {
			$iconHtml = '<i class="' . $iconClass . '" style="font-size:2.5em;color:' . $iconColor . ';"></i>';
		}

		$html = '<div class="eqLogic eqLogic-widget" data-eqLogic_id="' . $this->getId() . '"'
			. ' data-eqType="JeeModale"'
			. ' data-version="' . $version . '"'
			. ' style="width:' . $widgetWidth . 'px;height:' . $widgetHeight . 'px;cursor:pointer;position:relative;overflow:hidden;"'
			. ' data-target-eqlogics="' . $dataEqLogics . '"'
			. ' data-target-cmds="' . $dataCmds . '"'
			. '>';
		$html .= '<div class="jeeModale-widget-inner" style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;width:100%;padding:5px;box-sizing:border-box;">';
		$html .= $iconHtml;
		$html .= '<span style="font-size:0.85em;margin-top:5px;text-align:center;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:100%;">' . $this->getName() . '</span>';
		$html .= '</div>';

		// Poignée de redimensionnement
		$html .= '<div class="jeeModale-resize-handle" style="position:absolute;bottom:0;right:0;width:14px;height:14px;cursor:nwse-resize;opacity:0.4;">';
		$html .= '<svg viewBox="0 0 14 14" width="14" height="14"><line x1="10" y1="14" x2="14" y2="10" stroke="gray" stroke-width="1.5"/><line x1="6" y1="14" x2="14" y2="6" stroke="gray" stroke-width="1.5"/><line x1="2" y1="14" x2="14" y2="2" stroke="gray" stroke-width="1.5"/></svg>';
		$html .= '</div>';

		$html .= '</div>';

		return $html;
	}

	/*     * **********************Getteur Setteur*************************** */
}

class JeeModaleCmd extends cmd {

	public function dontRemoveCmd() {
		return true;
	}

	public function execute($_options = array()) {
	}

	/*     * **********************Getteur Setteur*************************** */
}
