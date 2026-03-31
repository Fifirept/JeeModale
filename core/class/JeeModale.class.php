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

	public function preInsert() {}
	public function postInsert() {}
	public function preSave() {}
	public function postSave() {}
	public function preUpdate() {}
	public function postUpdate() {}
	public function preRemove() {}
	public function postRemove() {}

	public function toHtml($_version = 'dashboard') {
		$replace = $this->preToHtml($_version);
		if (!is_array($replace)) {
			return $replace;
		}
		$version = jeedom::versionAlias($_version);

		// Icône ou image : HTML brut stocké par jeedomUtils.chooseIcon
		$widgetIconHtml = $this->getConfiguration('widgetIconHtml', '');
		if (empty($widgetIconHtml)) {
			$widgetIconHtml = '<i class="fas fa-window-maximize" style="font-size:2.5em;"></i>';
		}

		// Dimensions de la modale
		$modalWidth = intval($this->getConfiguration('modalWidth', 0));
		$modalHeight = intval($this->getConfiguration('modalHeight', 0));

		// Collecter les IDs cibles
		$targetEqLogics = array();
		$targetCmds = array();
		foreach ($this->getCmd() as $cmd) {
			$conf = $cmd->getConfiguration();
			if (isset($conf['targetType'])) {
				if ($conf['targetType'] === 'eqLogic' && !empty($conf['targetId'])) {
					$targetEqLogics[] = intval($conf['targetId']);
				} elseif ($conf['targetType'] === 'cmd' && !empty($conf['targetId'])) {
					$targetCmds[] = intval($conf['targetId']);
				}
			}
		}

		$eqId = $this->getId();
		$jsonEqLogics = json_encode($targetEqLogics);
		$jsonCmds = json_encode($targetCmds);
		$escapedName = htmlspecialchars($this->getName(), ENT_QUOTES, 'UTF-8');

		// ---- Widget HTML ----
		$html = '<div class="eqLogic eqLogic-widget" data-eqLogic_id="' . $eqId . '"';
		$html .= ' data-eqType="JeeModale"';
		$html .= ' data-version="' . $version . '"';
		$html .= ' style="position:relative;overflow:hidden;"';
		$html .= '>';
		$html .= '<div class="jeeModale-widget-inner" style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:60px;padding:8px;box-sizing:border-box;cursor:pointer;"';
		$html .= ' onclick="jeeModale_openModal(' . $eqId . ')">';
		$html .= '<div style="font-size:1em;">' . $widgetIconHtml . '</div>';
		$html .= '<span style="font-size:0.85em;margin-top:4px;text-align:center;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:100%;">' . $escapedName . '</span>';
		$html .= '</div>';
		$html .= '</div>';

		// ---- JS inline ----
		$html .= '<script type="text/javascript">';
		$html .= 'if(typeof window._jeeModaleData==="undefined"){window._jeeModaleData={};}';
		$html .= 'window._jeeModaleData[' . $eqId . ']={eqLogics:' . $jsonEqLogics . ',cmds:' . $jsonCmds . ',name:"' . addslashes($this->getName()) . '",modalWidth:' . ($modalWidth > 0 ? $modalWidth : 0) . ',modalHeight:' . ($modalHeight > 0 ? $modalHeight : 0) . '};';

		// Fonction d'ouverture de modale
		$html .= 'if(typeof jeeModale_openModal==="undefined"){';
		$html .= 'window.jeeModale_openModal=function(eqId){';
		$html .= '  var d=window._jeeModaleData[eqId];if(!d)return;';
		$html .= '  if(d.eqLogics.length===0&&d.cmds.length===0){';
		$html .= '    if(typeof $.fn.showAlert!=="undefined"){$("#div_alert").showAlert({message:"Aucune cible configurée",level:"warning"});}';
		$html .= '    return;';
		$html .= '  }';
		$html .= '  $.ajax({type:"POST",url:"plugins/JeeModale/core/ajax/JeeModale.ajax.php",';
		$html .= '    data:{action:"getTargetHtml",eqLogicIds:JSON.stringify(d.eqLogics),cmdIds:JSON.stringify(d.cmds),jeedom_token:JEEDOM_AJAX_TOKEN},';
		$html .= '    dataType:"json",';
		$html .= '    success:function(data){';
		$html .= '      if(data.state!=="ok"){alert(data.result);return;}';
		$html .= '      var items=data.result;';
		$html .= '      var html="<div class=\'jeeModale-modal-content\' style=\'padding:10px;\'>";';
		$html .= '      for(var i=0;i<items.length;i++){';
		$html .= '        html+="<div class=\'jeeModale-modal-item\' style=\'margin-bottom:10px;cursor:move;\' data-idx=\'"+i+"\'>";';
		$html .= '        html+=items[i].html;';
		$html .= '        html+="</div>";';
		$html .= '      }';
		$html .= '      html+="</div>";';
		$html .= '      var dlgOpts={modal:true,';
		$html .= '        close:function(){$(this).dialog("destroy").remove();}';
		$html .= '      };';
		// Dimensions de la modale configurées par l'utilisateur
		$html .= '      if(d.modalWidth>0){dlgOpts.width=d.modalWidth;}else{dlgOpts.width=Math.min(800,$(window).width()*0.9);}';
		$html .= '      if(d.modalHeight>0){dlgOpts.height=d.modalHeight;}else{dlgOpts.height="auto";}';
		$html .= '      dlgOpts.open=function(){';
		$html .= '        try{$(this).find(".jeeModale-modal-content").sortable({items:".jeeModale-modal-item",cursor:"move",placeholder:"ui-state-highlight",tolerance:"pointer"});}catch(e){}';
		$html .= '        try{if(typeof jeedomUtils!=="undefined"&&typeof jeedomUtils.initTooltips==="function"){jeedomUtils.initTooltips($(this));}}catch(e){}';
		$html .= '      };';
		$html .= '      var $dlg=$("<div id=\'md_jeeModale_"+eqId+"\' title=\'"+d.name+"\'>"+html+"</div>");';
		$html .= '      $("body").append($dlg);';
		$html .= '      $dlg.dialog(dlgOpts);';
		$html .= '    },';
		$html .= '    error:function(){alert("Erreur lors du chargement de la modale");}';
		$html .= '  });';
		$html .= '};';
		$html .= '}';
		$html .= '</script>';

		return $html;
	}
}

class JeeModaleCmd extends cmd {
	public function execute($_options = array()) {}
}
