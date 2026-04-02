<?php
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

	private function applyIconSize($html) {
		$w = intval($this->getConfiguration('iconWidth', 0));
		if ($w <= 0) return $html;
		$px = $w . 'px';

		// Image <img>
		if (strpos($html, '<img') !== false) {
			$style = 'width:' . $px . ';object-fit:contain;';
			if (strpos($html, "style='") !== false) {
				return preg_replace("/style='([^']*)'/", "style='" . $style . "$1'", $html);
			}
			return str_replace('<img', "<img style='" . $style . "'", $html);
		}
		// Icône <i>
		if (strpos($html, '<i') !== false) {
			$style = 'font-size:' . $px . ';';
			if (strpos($html, "style='") !== false) {
				return preg_replace("/style='([^']*)'/", "style='" . $style . "$1'", $html);
			}
			return str_replace('<i', "<i style='" . $style . "'", $html);
		}
		return $html;
	}

	public function toHtml($_version = 'dashboard') {
		$html = parent::toHtml($_version);
		if ($html == '') {
			return '';
		}

		// Supprimer le HTML des commandes rendues par parent
		$html = preg_replace('/<div class="cmd cmd-widget[^"]*"[^>]*>.*?<\/script>\s*<\/div>/s', '', $html);
		$html = preg_replace('/<div class="cmds[^"]*">(.*?)<\/div>/s', '', $html);

		$widgetIconHtml = $this->getConfiguration('widgetIconHtml', '');
		if (empty($widgetIconHtml)) {
			$widgetIconHtml = '<i class="fas fa-window-maximize" style="font-size:1.5em;"></i>';
		}
		$widgetIconHtml = $this->applyIconSize($widgetIconHtml);

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

		$content = '<div class="jeeModale-widget-inner" style="display:flex;align-items:center;justify-content:center;padding:5px;cursor:pointer;"'
			. ' onclick="jeeModale_openModal(' . $eqId . ')">'
			. $widgetIconHtml
			. '</div>';

		$js = '<script type="text/javascript">';
		$js .= 'if(typeof window._jeeModaleData==="undefined"){window._jeeModaleData={};}';
		$js .= 'window._jeeModaleData[' . $eqId . ']={targets:' . $jsonTargets . ',name:"' . addslashes($this->getName()) . '",mW:' . ($modalWidth > 0 ? $modalWidth : 0) . ',mH:' . ($modalHeight > 0 ? $modalHeight : 0) . '};';

		$js .= 'if(typeof jeeModale_openModal==="undefined"){';
		$js .= 'window.jeeModale_openModal=function(eqId){';
		$js .= '  var d=window._jeeModaleData[eqId];if(!d)return;';
		$js .= '  if(!d.targets||d.targets.length===0){if(typeof $.fn.showAlert!=="undefined"){$("#div_alert").showAlert({message:"Aucune cible configurée",level:"warning"});}return;}';
		$js .= '  var eqIds=[],cmdIds=[];';
		$js .= '  for(var i=0;i<d.targets.length;i++){if(d.targets[i].type==="eqLogic")eqIds.push(d.targets[i].id);else if(d.targets[i].type==="cmd")cmdIds.push(d.targets[i].id);}';
		$js .= '  $.ajax({type:"POST",url:"plugins/JeeModale/core/ajax/JeeModale.ajax.php",';
		$js .= '    data:{action:"getTargetHtml",eqLogicIds:JSON.stringify(eqIds),cmdIds:JSON.stringify(cmdIds),jeedom_token:JEEDOM_AJAX_TOKEN},';
		$js .= '    dataType:"json",';
		$js .= '    success:function(data){';
		$js .= '      if(data.state!=="ok"){alert(data.result);return;}';
		$js .= '      var items=data.result,mapEq={},mapCmd={};';
		$js .= '      for(var i=0;i<items.length;i++){if(items[i].type==="eqLogic")mapEq[items[i].id]=items[i].html;else mapCmd[items[i].id]=items[i].html;}';
		$js .= '      var html="<div class=\'jeeModale-modal-content\' style=\'display:flex;flex-wrap:wrap;gap:8px;padding:10px;align-items:flex-start;\'>";';
		$js .= '      for(var i=0;i<d.targets.length;i++){var t=d.targets[i];var itemHtml=(t.type==="eqLogic")?mapEq[t.id]:mapCmd[t.id];if(!itemHtml)continue;';
		$js .= '        if(t.forceNewLine){html+="<div style=\'flex-basis:100%;height:0;\'></div>";}';
		$js .= '        html+="<div class=\'jeeModale-modal-item\'>"+itemHtml+"</div>";}';
		$js .= '      html+="</div>";';
		$js .= '      var opts={modal:true,close:function(){$(this).dialog("destroy").remove();}};';
		$js .= '      if(d.mW>0)opts.width=d.mW;else opts.width=Math.min(900,$(window).width()*0.9);';
		$js .= '      if(d.mH>0)opts.height=d.mH;else opts.height="auto";';
		$js .= '      opts.open=function(){try{$(this).find(".jeeModale-modal-content").sortable({items:".jeeModale-modal-item",cursor:"move",placeholder:"ui-state-highlight",tolerance:"pointer"});}catch(e){}';
		$js .= '        try{if(typeof jeedomUtils!=="undefined"&&typeof jeedomUtils.initTooltips==="function"){jeedomUtils.initTooltips($(this));}}catch(e){}};';
		$js .= '      var $dlg=$("<div id=\'md_jeeModale_"+eqId+"\' title=\'"+d.name+"\'>"+html+"</div>");';
		$js .= '      $("body").append($dlg);$dlg.dialog(opts);';
		$js .= '    },error:function(){alert("Erreur lors du chargement de la modale");}});';
		$js .= '};';
		$js .= '}';
		$js .= '</script>';

		// Injecter APRÈS le widget-name (titre) — chercher la fermeture </div> du widget-name
		// Le HTML de parent::toHtml est : <div class="eqLogic..."><div class="widget-name">...</div>...contenu...</div>
		$widgetNameEnd = strpos($html, '</div>', strpos($html, 'widget-name'));
		if ($widgetNameEnd !== false) {
			$insertPos = $widgetNameEnd + 6; // après le </div> du widget-name
			$html = substr($html, 0, $insertPos) . $content . $js . substr($html, $insertPos);
		} else {
			// Fallback : injecter avant le dernier </div>
			$lastDivPos = strrpos($html, '</div>');
			if ($lastDivPos !== false) {
				$html = substr($html, 0, $lastDivPos) . $content . $js . substr($html, $lastDivPos);
			}
		}

		return $html;
	}
}

class JeeModaleCmd extends cmd {
	public function execute($_options = array()) {}
}
