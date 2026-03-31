# Plugin JeeModale

## Description

Le plugin **JeeModale** permet d'afficher sur un dashboard ou un design un widget cliquable (icône ou image personnalisable) qui ouvre une modale contenant un ou plusieurs équipements complets ou commandes individuelles de votre installation Jeedom.

## Configuration du plugin

La page de configuration du plugin affiche le numéro de version actuel. Le plugin ne nécessite aucune dépendance.

## Configuration des équipements

Chaque équipement JeeModale dispose de :

### Onglet Équipement
- **Paramètres généraux** : nom, objet parent, catégorie, activation et visibilité
- **Apparence du widget** :
  - Classe d'icône (FontAwesome) avec sélecteur intégré
  - Couleur de l'icône
  - Image personnalisée (URL) en remplacement de l'icône
  - Dimensions du widget (largeur et hauteur en pixels)

### Onglet Commandes
Deux boutons permettent d'ajouter des cibles :
- **Ajouter un équipement** : ouvre le sélecteur Jeedom pour choisir un équipement complet
- **Ajouter une commande** : ouvre le sélecteur Jeedom pour choisir une commande individuelle

Les cibles ajoutées sont réorganisables par glisser-déposer.

## Utilisation

Sur le dashboard ou un design, cliquez sur le widget JeeModale pour ouvrir la modale affichant les équipements et commandes configurés.

Le widget est redimensionnable directement depuis le dashboard via la poignée en bas à droite. Les dimensions sont automatiquement mémorisées.

Les éléments dans la modale sont déplaçables par glisser-déposer.
