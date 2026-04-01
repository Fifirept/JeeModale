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

	public function postSave() {
		// Forcer le rafraîchissement du widget après sauvegarde
		$this->refreshWidget();
	}

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

		$widgetIconHtml = $this->getConfiguration('widgetIconHtml', '');
		if (empty($widgetIconHtml)) {
			$widgetIconHtml = '<i class="fas fa-window-maximize" style="font-size:1.5em;"></i>';
		}

		$modalWidth = intval($this->getConfiguration('modalWidth', 0));
		$modalHeight = intval($this->getConfiguration('modalHeight', 0));

		// Collecter les cibles avec forceNewLine
		$targets = array();
		foreach ($this->getCmd() as $cmd) {
			$conf = $cmd->getConfiguration();
			if (isset($conf['targetType']) && !empty($conf['targetId'])) {
				$targets[] = array(
					'type' => $conf['targetType'],
					'id' => intval($conf['targetId']),
					'forceNewLine' => (!empty($conf['forceNewLine']) && $conf['forceNewLine'] == 1) ? true : false
				);
			}
		}

		$eqId = $this->getId();
		$jsonTargets = json_encode($targets);
		$escapedName = htmlspecialchars($this->getName(), ENT_QUOTES, 'UTF-8');

		// Widget HTML compact
		$html = '<div class="eqLogic eqLogic-widget" data-eqLogic_id="' . $eqId . '"';
		$html .= ' data-eqType="JeeModale"';
		$html .= ' data-version="' . $version . '"';
		$html .= '>';
		$html .= '<div class="jeeModale-widget-inner" style="display:flex;flex-direction:column;align-items:center;justify-content:center;padding:5px;cursor:pointer;"';
		$html .= ' onclick="jeeModale_openModal(' . $eqId . ')">';
		$html .= '<div>' . $widgetIconHtml . '</div>';
		$html .= '<span style="font-size:0.8em;margin-top:3px;text-align:center;">' . $escapedName . '</span>';
		$html .= '</div>';
		$html .= '</div>';

		// JS inline
		$html .= '<script type="text/javascript">';
		$html .= 'if(typeof window._jeeModaleData==="undefined"){window._jeeModaleData={};}';
		$html .= 'window._jeeModaleData[' . $eqId . ']={targets:' . $jsonTargets . ',name:"' . addslashes($this->getName()) . '",mW:' . ($modalWidth > 0 ? $modalWidth : 0) . ',mH:' . ($modalHeight > 0 ? $modalHeight : 0) . '};';

		$html .= 'if(typeof jeeModale_openModal==="undefined"){';
		$html .= 'window.jeeModale_openModal=function(eqId){';
		$html .= '  var d=window._jeeModaleData[eqId];if(!d)return;';
		$html .= '  if(!d.targets||d.targets.length===0){';
		$html .= '    if(typeof $.fn.showAlert!=="undefined"){$("#div_alert").showAlert({message:"Aucune cible configurée",level:"warning"});}';
		$html .= '    return;';
		$html .= '  }';
		$html .= '  var eqIds=[],cmdIds=[];';
		$html .= '  for(var i=0;i<d.targets.length;i++){';
		$html .= '    if(d.targets[i].type==="eqLogic")eqIds.push(d.targets[i].id);';
		$html .= '    else if(d.targets[i].type==="cmd")cmdIds.push(d.targets[i].id);';
		$html .= '  }';
		$html .= '  $.ajax({type:"POST",url:"plugins/JeeModale/core/ajax/JeeModale.ajax.php",';
		$html .= '    data:{action:"getTargetHtml",eqLogicIds:JSON.stringify(eqIds),cmdIds:JSON.stringify(cmdIds),jeedom_token:JEEDOM_AJAX_TOKEN},';
		$html .= '    dataType:"json",';
		$html .= '    success:function(data){';
		$html .= '      if(data.state!=="ok"){alert(data.result);return;}';
		$html .= '      var items=data.result;';
		$html .= '      var mapEq={},mapCmd={};';
		$html .= '      for(var i=0;i<items.length;i++){';
		$html .= '        if(items[i].type==="eqLogic")mapEq[items[i].id]=items[i].html;';
		$html .= '        else mapCmd[items[i].id]=items[i].html;';
		$html .= '      }';
		// Flexbox wrap : éléments côte à côte, retour à la ligne auto selon largeur
		$html .= '      var html="<div class=\'jeeModale-modal-content\' style=\'display:flex;flex-wrap:wrap;gap:8px;padding:10px;align-items:flex-start;\'>";';
		$html .= '      for(var i=0;i<d.targets.length;i++){';
		$html .= '        var t=d.targets[i];';
		$html .= '        var itemHtml=(t.type==="eqLogic")?mapEq[t.id]:mapCmd[t.id];';
		$html .= '        if(!itemHtml)continue;';
		// forceNewLine : insérer un séparateur invisible AVANT l'élément
		$html .= '        if(t.forceNewLine){html+="<div style=\'flex-basis:100%;height:0;\'></div>";}';
		$html .= '        html+="<div class=\'jeeModale-modal-item\'>";';
		$html .= '        html+=itemHtml;';
		$html .= '        html+="</div>";';
		$html .= '      }';
		$html .= '      html+="</div>";';
		$html .= '      var opts={modal:true,close:function(){$(this).dialog("destroy").remove();}};';
		$html .= '      if(d.mW>0)opts.width=d.mW;else opts.width=Math.min(900,$(window).width()*0.9);';
		$html .= '      if(d.mH>0)opts.height=d.mH;else opts.height="auto";';
		$html .= '      opts.open=function(){';
		$html .= '        try{$(this).find(".jeeModale-modal-content").sortable({items:".jeeModale-modal-item",cursor:"move",placeholder:"ui-state-highlight",tolerance:"pointer"});}catch(e){}';
		$html .= '        try{if(typeof jeedomUtils!=="undefined"&&typeof jeedomUtils.initTooltips==="function"){jeedomUtils.initTooltips($(this));}}catch(e){}';
		$html .= '      };';
		$html .= '      var $dlg=$("<div id=\'md_jeeModale_"+eqId+"\' title=\'"+d.name+"\'>"+html+"</div>");';
		$html .= '      $("body").append($dlg);';
		$html .= '      $dlg.dialog(opts);';
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
