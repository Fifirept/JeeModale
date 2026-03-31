<?php
if (!isConnect('admin')) {
	throw new Exception('{{401 - Accès non autorisé}}');
}
$plugin = plugin::byId('JeeModale');
sendVarToJS('eqType', $plugin->getId());
$eqLogics = eqLogic::byType($plugin->getId());
?>

<div class="row row-overflow">
	<!-- Page d'accueil du plugin -->
	<div class="col-xs-12 eqLogicThumbnailDisplay">
		<legend><i class="fas fa-cog"></i> {{Gestion}}</legend>
		<div class="eqLogicThumbnailContainer">
			<div class="cursor eqLogicAction logoPrimary" data-action="add">
				<i class="fas fa-plus-circle"></i>
				<br>
				<span>{{Ajouter}}</span>
			</div>
			<div class="cursor eqLogicAction logoSecondary" data-action="gotoPluginConf">
				<i class="fas fa-wrench"></i>
				<br>
				<span>{{Configuration}}</span>
			</div>
		</div>
		<legend><i class="fas fa-table"></i> {{Mes JeeModales}}</legend>
		<?php
		if (count($eqLogics) == 0) {
			echo '<br><div class="text-center" style="font-size:1.2em;font-weight:bold;">{{Aucun équipement JeeModale trouvé, cliquer sur "Ajouter" pour commencer}}</div>';
		} else {
			echo '<div class="input-group" style="margin:5px;">';
			echo '<input class="form-control roundedLeft" placeholder="{{Rechercher}}" id="in_searchEqlogic">';
			echo '<div class="input-group-btn">';
			echo '<a id="bt_resetSearch" class="btn" style="width:30px"><i class="fas fa-times"></i></a>';
			echo '<a class="btn roundedRight hidden" id="bt_pluginDisplayAsTable" data-coreSupport="1" data-state="0"><i class="fas fa-grip-lines"></i></a>';
			echo '</div>';
			echo '</div>';
			echo '<div class="eqLogicThumbnailContainer">';
			foreach ($eqLogics as $eqLogic) {
				$opacity = ($eqLogic->getIsEnable()) ? '' : 'disableCard';
				echo '<div class="eqLogicDisplayCard cursor ' . $opacity . '" data-eqLogic_id="' . $eqLogic->getId() . '">';
				echo '<img src="' . $eqLogic->getImage() . '"/>';
				echo '<br>';
				echo '<span class="name">' . $eqLogic->getHumanName(true, true) . '</span>';
				echo '<span class="hiddenAsCard displayTableRight hidden">';
				echo ($eqLogic->getIsVisible() == 1) ? '<i class="fas fa-eye" title="{{Equipement visible}}"></i>' : '<i class="fas fa-eye-slash" title="{{Equipement non visible}}"></i>';
				echo '</span>';
				echo '</div>';
			}
			echo '</div>';
		}
		?>
	</div>

	<!-- Page de présentation de l'équipement -->
	<div class="col-xs-12 eqLogic" style="display: none;">
		<div class="input-group pull-right" style="display:inline-flex;">
			<span class="input-group-btn">
				<a class="btn btn-sm btn-default eqLogicAction roundedLeft" data-action="configure"><i class="fas fa-cogs"></i><span class="hidden-xs"> {{Configuration avancée}}</span>
				</a><a class="btn btn-sm btn-default eqLogicAction" data-action="copy"><i class="fas fa-copy"></i><span class="hidden-xs"> {{Dupliquer}}</span>
				</a><a class="btn btn-sm btn-success eqLogicAction" data-action="save"><i class="fas fa-check-circle"></i> {{Sauvegarder}}
				</a><a class="btn btn-sm btn-danger eqLogicAction roundedRight" data-action="remove"><i class="fas fa-minus-circle"></i> {{Supprimer}}
				</a>
			</span>
		</div>

		<ul class="nav nav-tabs" role="tablist">
			<li role="presentation"><a href="#" class="eqLogicAction" aria-controls="home" role="tab" data-toggle="tab" data-action="returnToThumbnailDisplay"><i class="fas fa-arrow-circle-left"></i></a></li>
			<li role="presentation" class="active"><a href="#eqlogictab" aria-controls="home" role="tab" data-toggle="tab"><i class="fas fa-tachometer-alt"></i> {{Equipement}}</a></li>
			<li role="presentation"><a href="#commandtab" aria-controls="home" role="tab" data-toggle="tab"><i class="fas fa-list"></i> {{Commandes}}</a></li>
		</ul>

		<div class="tab-content">
			<!-- Onglet Equipement -->
			<div role="tabpanel" class="tab-pane active" id="eqlogictab">
				<form class="form-horizontal">
					<fieldset>
						<div class="col-lg-6">
							<legend><i class="fas fa-wrench"></i> {{Paramètres généraux}}</legend>
							<div class="form-group">
								<label class="col-sm-4 control-label">{{Nom de l'équipement}}</label>
								<div class="col-sm-6">
									<input type="text" class="eqLogicAttr form-control" data-l1key="id" style="display:none;">
									<input type="text" class="eqLogicAttr form-control" data-l1key="name" placeholder="{{Nom de l'équipement}}">
								</div>
							</div>
							<div class="form-group">
								<label class="col-sm-4 control-label">{{Objet parent}}</label>
								<div class="col-sm-6">
									<select id="sel_object" class="eqLogicAttr form-control" data-l1key="object_id">
										<option value="">{{Aucun}}</option>
										<?php
										foreach ((jeeObject::buildTree(null, false)) as $object) {
											echo '<option value="' . $object->getId() . '">' . str_repeat('&nbsp;&nbsp;', $object->getConfiguration('parentNumber')) . $object->getName() . '</option>';
										}
										?>
									</select>
								</div>
							</div>
							<div class="form-group">
								<label class="col-sm-4 control-label">{{Catégorie}}</label>
								<div class="col-sm-6">
									<?php
									foreach (jeedom::getConfiguration('eqLogic:category') as $key => $value) {
										echo '<label class="checkbox-inline">';
										echo '<input type="checkbox" class="eqLogicAttr" data-l1key="category" data-l2key="' . $key . '" >' . $value['name'];
										echo '</label>';
									}
									?>
								</div>
							</div>
							<div class="form-group">
								<label class="col-sm-4 control-label">{{Options}}</label>
								<div class="col-sm-6">
									<label class="checkbox-inline"><input type="checkbox" class="eqLogicAttr" data-l1key="isEnable" checked>{{Activer}}</label>
									<label class="checkbox-inline"><input type="checkbox" class="eqLogicAttr" data-l1key="isVisible" checked>{{Visible}}</label>
								</div>
							</div>

							<legend><i class="fas fa-cogs"></i> {{Apparence du widget}}</legend>
							<div class="form-group">
								<label class="col-sm-4 control-label">{{Icône du widget}}
									<sup><i class="fas fa-question-circle tooltips" title="{{Cliquez sur l'icône à droite pour en choisir une}}"></i></sup>
								</label>
								<div class="col-sm-6">
									<div class="input-group">
										<input type="text" class="eqLogicAttr form-control roundedLeft" data-l1key="configuration" data-l2key="iconClass" placeholder="fas fa-window-maximize">
										<span class="input-group-btn">
											<a class="btn btn-default" id="bt_chooseIcon" title="{{Choisir une icône}}"><i class="fas fa-flag"></i></a>
										</span>
									</div>
								</div>
							</div>
							<div class="form-group">
								<label class="col-sm-4 control-label">{{Couleur de l'icône}}</label>
								<div class="col-sm-3">
									<input type="color" class="eqLogicAttr form-control" data-l1key="configuration" data-l2key="iconColor" value="#0076b6" style="width:60px;padding:2px;">
								</div>
							</div>
							<div class="form-group">
								<label class="col-sm-4 control-label">{{Image personnalisée}}
									<sup><i class="fas fa-question-circle tooltips" title="{{Sélectionnez une image (remplace l'icône). Laisser vide pour utiliser l'icône.}}"></i></sup>
								</label>
								<div class="col-sm-6">
									<div class="input-group">
										<input type="text" class="eqLogicAttr form-control roundedLeft" data-l1key="configuration" data-l2key="customImage" placeholder="{{Laisser vide pour utiliser l'icône}}">
										<span class="input-group-btn">
											<a class="btn btn-default" id="bt_selectImage" title="{{Choisir une image}}"><i class="fas fa-image"></i></a>
										</span>
									</div>
								</div>
							</div>
							<div class="form-group">
								<label class="col-sm-4 control-label">{{Largeur du widget (px)}}</label>
								<div class="col-sm-3">
									<input type="number" class="eqLogicAttr form-control" data-l1key="configuration" data-l2key="widgetWidth" placeholder="120" min="40">
								</div>
							</div>
							<div class="form-group">
								<label class="col-sm-4 control-label">{{Hauteur du widget (px)}}</label>
								<div class="col-sm-3">
									<input type="number" class="eqLogicAttr form-control" data-l1key="configuration" data-l2key="widgetHeight" placeholder="120" min="40">
								</div>
							</div>
						</div>

						<!-- Partie droite -->
						<div class="col-lg-6">
							<legend><i class="fas fa-info"></i> {{Informations}}</legend>
							<div class="form-group">
								<label class="col-sm-4 control-label">{{Description}}</label>
								<div class="col-sm-6">
									<textarea class="form-control eqLogicAttr autogrow" data-l1key="comment"></textarea>
								</div>
							</div>
							<div class="form-group">
								<label class="col-sm-4 control-label">{{Aperçu}}</label>
								<div class="col-sm-6">
									<div id="jeeModale-icon-preview" style="width:120px;height:120px;border:1px dashed #ccc;border-radius:8px;display:flex;align-items:center;justify-content:center;background:#f8f8f8;">
										<i class="fas fa-window-maximize" style="font-size:2.5em;color:#0076b6;"></i>
									</div>
								</div>
							</div>
						</div>
					</fieldset>
				</form>
			</div>

			<!-- Onglet Commandes -->
			<div role="tabpanel" class="tab-pane" id="commandtab">
				<div class="pull-right" style="margin-top:5px;">
					<a class="btn btn-success btn-sm" id="bt_addTargetEqLogic"><i class="fas fa-plus-circle"></i> {{Ajouter un équipement}}</a>
					<a class="btn btn-info btn-sm" id="bt_addTargetCmd"><i class="fas fa-plus-circle"></i> {{Ajouter une commande}}</a>
				</div>
				<br><br>
				<div class="table-responsive">
					<table id="table_cmd" class="table table-bordered table-condensed">
						<thead>
							<tr>
								<th class="hidden-xs" style="min-width:50px;width:70px;">ID</th>
								<th style="min-width:200px;width:300px;">{{Nom}}</th>
								<th style="min-width:100px;width:120px;">{{Type cible}}</th>
								<th style="min-width:200px;">{{Cible}}</th>
								<th style="min-width:80px;width:150px;">{{Actions}}</th>
							</tr>
						</thead>
						<tbody>
						</tbody>
					</table>
				</div>
			</div>

		</div>
	</div>
</div>

<?php include_file('desktop', 'JeeModale', 'js', 'JeeModale'); ?>
<?php include_file('core', 'plugin.template', 'js'); ?>
