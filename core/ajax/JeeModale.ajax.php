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

try {
	require_once dirname(__FILE__) . '/../../../../core/php/core.inc.php';
	include_file('core', 'authentification', 'php');

	if (!isConnect('admin')) {
		throw new Exception(__('401 - Accès non autorisé', __FILE__));
	}

	ajax::init();

	if (init('action') == 'saveWidgetSize') {
		$eqLogic = JeeModale::byId(init('id'));
		if (!is_object($eqLogic)) {
			throw new Exception(__('Équipement introuvable', __FILE__));
		}
		$eqLogic->setConfiguration('widgetWidth', init('width'));
		$eqLogic->setConfiguration('widgetHeight', init('height'));
		$eqLogic->save(true);
		ajax::success();
	}

	if (init('action') == 'getTargetHtml') {
		$eqLogicIds = json_decode(init('eqLogicIds'), true);
		$cmdIds = json_decode(init('cmdIds'), true);
		$result = array();

		// Récupérer le HTML des équipements cibles
		if (is_array($eqLogicIds)) {
			foreach ($eqLogicIds as $eqId) {
				$eqLogic = eqLogic::byId($eqId);
				if (is_object($eqLogic)) {
					$html = $eqLogic->toHtml('dashboard');
					$result[] = array(
						'type' => 'eqLogic',
						'id' => $eqId,
						'name' => $eqLogic->getHumanName(true),
						'html' => $html
					);
				}
			}
		}

		// Récupérer le HTML des commandes cibles
		if (is_array($cmdIds)) {
			foreach ($cmdIds as $cmdId) {
				$cmd = cmd::byId($cmdId);
				if (is_object($cmd)) {
					$html = $cmd->toHtml('dashboard');
					$result[] = array(
						'type' => 'cmd',
						'id' => $cmdId,
						'name' => $cmd->getHumanName(true),
						'html' => $html
					);
				}
			}
		}

		ajax::success($result);
	}

	throw new Exception(__('Aucune méthode correspondante à', __FILE__) . ' : ' . init('action'));
} catch (Exception $e) {
	ajax::error(displayException($e), $e->getCode());
}
