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

require_once dirname(__FILE__) . '/../../../core/php/core.inc.php';
include_file('core', 'authentification', 'php');
if (!isConnect()) {
	include_file('desktop', '404', 'php');
	die();
}
$pluginInfo = json_decode(file_get_contents(dirname(__FILE__) . '/info.json'), true);
$pluginVersion = isset($pluginInfo['pluginVersion']) ? $pluginInfo['pluginVersion'] : '???';
?>
<form class="form-horizontal">
	<fieldset>
		<div class="form-group">
			<label class="col-md-4 control-label">{{Version du plugin}}</label>
			<div class="col-md-4">
				<span class="label label-info" style="font-size:1.1em;"><?php echo $pluginVersion; ?></span>
			</div>
		</div>
	</fieldset>
</form>
