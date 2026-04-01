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
		$this->refreshWidget();
	}

	public function preUpdate() {}
	public function postUpdate() {}
	public function preRemove() {}
	public function postRemove() {}

	public function toHtml($_version = 'dashboard') {
		$html = parent::toHtml($_version);
		if ($html == '') {
			return '';
		}

		$widgetIconHtml = $this->getConfiguration('widgetIconHtml', '');
		if (empty($widgetIconHtml)) {
			$widgetIconHtml = '<i class="fas fa-window-maximize" style="font-size:1.5em;"></i>';
		}

		$modalWidth = intval($this->getConfiguration('modalWidth', 0));
		$modalHeight = intval($this->getConfiguration('modalHeight', 0));

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

		// Contenu cliquable
		$content = '<div class="jeeModale-widget-inner" style="display:flex;flex-direction:column;align-items:center;justify-content:center;padding:5px;cursor:pointer;min-height:40px;"'
			. ' onclick="jeeModale_openModal(' . $eqId . ')">'
			. '<div>' . $widgetIconHtml . '</div>'
			. '</div>';

		// JS inline
		$js = '<script type="text/javascript">';
		$js .= 'if(typeof window._jeeModaleData==="undefined"){window._jeeModaleData={};}';
		$js .= 'window._jeeModaleData[' . $eqId . ']={targets:' . $jsonTargets . ',name:"' . addslashes($this->getName()) . '",mW:' . ($modalWidth > 0 ? $modalWidth : 0) . ',mH:' . ($modalHeight > 0 ? $modalHeight : 0) . '};';

		$js .= 'if(typeof jeeModale_openModal==="undefined"){';
		$js .= 'window.jeeModale_openModal=function(eqId){';
		$js .= '  var d=window._jeeModaleData[eqId];if(!d)return;';
		$js .= '  if(!d.targets||d.targets.length===0){';
		$js .= '    if(typeof $.fn.showAlert!=="undefined"){$("#div_alert").showAlert({message:"Aucune cible configurée",level:"warning"});}';
		$js .= '    return;';
		$js .= '  }';
		$js .= '  var eqIds=[],cmdIds=[];';
		$js .= '  for(var i=0;i<d.targets.length;i++){';
		$js .= '    if(d.targets[i].type==="eqLogic")eqIds.push(d.targets[i].id);';
		$js .= '    else if(d.targets[i].type==="cmd")cmdIds.push(d.targets[i].id);';
		$js .= '  }';
		$js .= '  $.ajax({type:"POST",url:"plugins/JeeModale/core/ajax/JeeModale.ajax.php",';
		$js .= '    data:{action:"getTargetHtml",eqLogicIds:JSON.stringify(eqIds),cmdIds:JSON.stringify(cmdIds),jeedom_token:JEEDOM_AJAX_TOKEN},';
		$js .= '    dataType:"json",';
		$js .= '    success:function(data){';
		$js .= '      if(data.state!=="ok"){alert(data.result);return;}';
		$js .= '      var items=data.result;';
		$js .= '      var mapEq={},mapCmd={};';
		$js .= '      for(var i=0;i<items.length;i++){';
		$js .= '        if(items[i].type==="eqLogic")mapEq[items[i].id]=items[i].html;';
		$js .= '        else mapCmd[items[i].id]=items[i].html;';
		$js .= '      }';
		$js .= '      var html="<div class=\'jeeModale-modal-content\' style=\'display:flex;flex-wrap:wrap;gap:8px;padding:10px;align-items:flex-start;\'>";';
		$js .= '      for(var i=0;i<d.targets.length;i++){';
		$js .= '        var t=d.targets[i];';
		$js .= '        var itemHtml=(t.type==="eqLogic")?mapEq[t.id]:mapCmd[t.id];';
		$js .= '        if(!itemHtml)continue;';
		$js .= '        if(t.forceNewLine){html+="<div style=\'flex-basis:100%;height:0;\'></div>";}';
		$js .= '        html+="<div class=\'jeeModale-modal-item\'>";';
		$js .= '        html+=itemHtml;';
		$js .= '        html+="</div>";';
		$js .= '      }';
		$js .= '      html+="</div>";';
		$js .= '      var opts={modal:true,close:function(){$(this).dialog("destroy").remove();}};';
		$js .= '      if(d.mW>0)opts.width=d.mW;else opts.width=Math.min(900,$(window).width()*0.9);';
		$js .= '      if(d.mH>0)opts.height=d.mH;else opts.height="auto";';
		$js .= '      opts.open=function(){';
		$js .= '        try{$(this).find(".jeeModale-modal-content").sortable({items:".jeeModale-modal-item",cursor:"move",placeholder:"ui-state-highlight",tolerance:"pointer"});}catch(e){}';
		$js .= '        try{if(typeof jeedomUtils!=="undefined"&&typeof jeedomUtils.initTooltips==="function"){jeedomUtils.initTooltips($(this));}}catch(e){}';
		$js .= '      };';
		$js .= '      var $dlg=$("<div id=\'md_jeeModale_"+eqId+"\' title=\'"+d.name+"\'>"+html+"</div>");';
		$js .= '      $("body").append($dlg);';
		$js .= '      $dlg.dialog(opts);';
		$js .= '    },';
		$js .= '    error:function(){alert("Erreur lors du chargement de la modale");}';
		$js .= '  });';
		$js .= '};';
		$js .= '}';
		$js .= '</script>';

		// Injecter le contenu AVANT le dernier </div> du widget
		// parent::toHtml produit : <div class="eqLogic...">...<div class="widget-name">...</div>...commandes...</div>
		// On insère notre contenu + JS juste avant la fermeture finale
		$lastDivPos = strrpos($html, '</div>');
		if ($lastDivPos !== false) {
			$html = substr($html, 0, $lastDivPos) . $content . $js . substr($html, $lastDivPos);
		}

		return $html;
	}
}

class JeeModaleCmd extends cmd {
	public function execute($_options = array()) {}
}
