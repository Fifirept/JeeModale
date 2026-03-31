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

		if (is_array($eqLogicIds)) {
			foreach ($eqLogicIds as $eqId) {
				$eqLogic = eqLogic::byId($eqId);
				if (is_object($eqLogic)) {
					$result[] = array(
						'type' => 'eqLogic',
						'id' => $eqId,
						'name' => $eqLogic->getHumanName(true),
						'html' => $eqLogic->toHtml('dashboard')
					);
				}
			}
		}

		if (is_array($cmdIds)) {
			foreach ($cmdIds as $cmdId) {
				$cmd = cmd::byId($cmdId);
				if (is_object($cmd)) {
					$result[] = array(
						'type' => 'cmd',
						'id' => $cmdId,
						'name' => $cmd->getHumanName(true),
						'html' => $cmd->toHtml('dashboard')
					);
				}
			}
		}

		ajax::success($result);
	}

	if (init('action') == 'uploadImage') {
		if (!isset($_FILES['file'])) {
			throw new Exception(__('Aucun fichier reçu', __FILE__));
		}
		$file = $_FILES['file'];
		// Vérifier le type MIME
		$allowedTypes = array('image/png', 'image/jpeg', 'image/gif', 'image/svg+xml', 'image/webp');
		if (!in_array($file['type'], $allowedTypes)) {
			throw new Exception(__('Type de fichier non autorisé. Formats acceptés : PNG, JPG, GIF, SVG, WebP', __FILE__));
		}
		// Dossier de destination
		$uploadDir = __DIR__ . '/../../../../data/img/JeeModale';
		if (!is_dir($uploadDir)) {
			mkdir($uploadDir, 0775, true);
		}
		// Nom de fichier sécurisé
		$ext = pathinfo($file['name'], PATHINFO_EXTENSION);
		$safeName = 'jeeModale_' . time() . '_' . mt_rand(1000, 9999) . '.' . $ext;
		$destPath = $uploadDir . '/' . $safeName;

		if (!move_uploaded_file($file['tmp_name'], $destPath)) {
			throw new Exception(__('Erreur lors de la copie du fichier', __FILE__));
		}
		// Retourner le chemin relatif accessible via le navigateur
		$webPath = 'data/img/JeeModale/' . $safeName;
		ajax::success($webPath);
	}

	throw new Exception(__('Aucune méthode correspondante à', __FILE__) . ' : ' . init('action'));
} catch (Exception $e) {
	ajax::error(displayException($e), $e->getCode());
}
