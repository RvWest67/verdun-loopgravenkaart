# Verdun 14–18 · WOI-bezoekersgids

Nederlandstalige bezoekersgids (Leaflet, geschikt voor mobiel, werkt offline als PWA) over de Slag om Verdun en de gevechten rond Verdun 1914–1918.

**Startpagina:** https://rvwest67.github.io/verdun-loopgravenkaart/

- **Loopgravenkaart:** `kaart.html`: forten, de negen verwoeste dorpen, ossuarium, monumenten, begraafplaatsen en musea; frontlijnen feb. 1916, juli 1916, dec. 1916, aug. 1917 en sept. 1918 (≈); zone rouge (≈); loopgraafresten (OSM); gevaarlaag; route via Google Maps; kompas/draaien; eigen locatie. Een plek direct openen: `kaart.html#p=douaumont`. Met de laag **Lidar (loopgraven en kraters zichtbaar)** zie je het echte reliëf onder de bomen (IGN LiDAR HD, alleen online); direct openen met `kaart.html#p=douaumont&lidar`.
- **Simulatie:** `simulatie.html`: 14 fasen van sept. 1914 tot nov. 1918 (bombardement, aanvallen, groenkruis-gas, mijnen, tegenaanvallen, Saint-Mihiel, Meuse-Argonne). Alle bewegingen en lijnen zijn **≈ benaderd**. Een fase direct openen: `simulatie.html#douaumont`.
- **Tijdlijn** (`tijdlijn.html`), **Verhalen** (`verhalen.html`, 11 mensen met foto), **Wapens & tactiek** (`wapens.html`), **Begrippen** (`begrippen.html`), **Wist je dat?** (`wistjedat.html`, met de tags Legende/Omstreden), **Dagprogramma’s** (`programma.html`, 1–3 dagen) en **Praktisch** (`praktisch.html`, openingstijden okt. 2026, veiligheid). Elke pagina heeft genummerde bronnen.

## Wat is benaderd (≈)

- **Echt (niet benaderd):** de lidar-reliëfschaduw (IGN) en de OSM-loopgraafresten. Een open, gevectoriseerde dataset van de loopgraven van Verdun (zoals de plans directeurs) bestaat niet; de lidar laat de echte loopgraven en trechters wel zien als reliëf.

- **Frontlijnen:** er bestaat geen open, gegeorefereerde dataset van de frontlijnen rond Verdun (gezocht in OpenHistoricalMap, data.gouv.fr en GitHub). De lijnen zijn **schematisch** getekend door gedocumenteerde plaatsen te verbinden. De coördinaten van die plaatsen komen uit OpenStreetMap, met rechte stukken ertussen. Reken op afwijkingen van honderden meters.
- **Zone rouge:** de kern op de rechteroever is een schematisch vlak. Het bos van de Mort-Homme is de echte bosgrens uit OSM (relatie 5506965).
- **Simulatie:** frontverloop, pijlen, beschietingen en gaswolken zijn illustratief, niet op schaal.
- **Aantallen** (slachtoffers, granaten, gasgranaten) zijn schattingen (≈); waar de bronnen het oneens zijn, staat ‘omstreden’.
- Openingstijden en prijzen zijn nagekeken in oktober 2026 en kunnen wijzigen.

## Bronnen

1. Coördinaten: © OpenStreetMap-bijdragers (ODbL), via Nominatim en Overpass API (okt. 2026).
2. Loopgraafresten: OpenStreetMap `military=trench` (230 lijnen, ≈ 30 km, opgehaald 19 okt. 2026), © OpenStreetMap-bijdragers, ODbL.
2b. Lidar: reliëfschaduw van het MNT LiDAR HD (0,5 m) van het IGN, via de Géoplateforme-WMTS (`https://data.geopf.fr/wmts`, laag `IGNF_LIDAR-HD_MNT_ELEVATION.ELEVATIONGRIDCOVERAGE.SHADOW`, zoom 11–18, geen sleutel nodig), [Licence Ouverte Etalab 2.0](https://www.etalab.gouv.fr/licence-ouverte-open-licence/). Bron: [IGN LiDAR HD](https://geoservices.ign.fr/lidarhd).
3. Frontlijnen: Wikipedia – [Battle of Verdun](https://en.wikipedia.org/wiki/Battle_of_Verdun), [Bataille de Verdun](https://fr.wikipedia.org/wiki/Bataille_de_Verdun), [Battle of Saint-Mihiel](https://en.wikipedia.org/wiki/Battle_of_Saint-Mihiel), [Meuse-Argonne offensive](https://en.wikipedia.org/wiki/Meuse%E2%80%93Argonne_offensive); kaarten van de West Point Atlas (USMA, publiek domein); Michelin, *Verdun* en *Saint-Mihiel*, Illustrated Michelin Guides to the Battle-Fields (1919, publiek domein).
4. Verwoeste dorpen: [Villages français détruits durant la Première Guerre mondiale](https://fr.wikipedia.org/wiki/Villages_fran%C3%A7ais_d%C3%A9truits_durant_la_Premi%C3%A8re_Guerre_mondiale).
5. Zone rouge: [Wikipedia – Zone rouge](https://en.wikipedia.org/wiki/Zone_rouge); Bausinger, Bonnaire & Preuß (2007), *Science of the Total Environment* 382, 259–271 (Place à Gaz).
6. Openingstijden en prijzen (okt. 2026): [Mémorial de Verdun](https://memorial-verdun.fr/fr/preparer-ma-visite-menu/horaires-tarifs-et-acces) (ook forten Douaumont en Vaux), [Ossuaire de Douaumont](https://www.verdun-douaumont.com/infos-pratiques/), [Citadelle souterraine](https://www.citadelle-souterraine-verdun.fr/infos-pratiques/horaires-et-tarifs/), [Office de Tourisme Grand Verdun](https://www.tourisme-verdun.com/horaires_ouverture_sites_musees), [ABMC](https://www.abmc.gov/).
7. Per plek staan de bronnen in de popup.

## Licenties

- Code: eigen werk. Leaflet 1.9.4 (BSD-2-Clause) en leaflet-rotate (GPL-3.0) staan in `vendor/` met hun licentiebestanden.
- Achtergrond: OpenStreetMap-tegels (ODbL); luchtfoto Esri World Imagery (alleen online).
- Foto’s: alleen Wikimedia Commons met vrije licentie, verkleind en als SVG verpakt (naamsvermelding staat in elk bestand en op de pagina):
- `img/petain.svg`: Philippe Pétain (before 1918).jpg, Henri Manuel, before 1918, Public domain, [Commons](https://commons.wikimedia.org/wiki/File:Philippe_P%C3%A9tain_(before_1918).jpg)
- `img/nivelle.svg`: Robert Georges Nivelle.jpg, onbekend, circa 1917, Public domain, [Commons](https://commons.wikimedia.org/wiki/File:Robert_Georges_Nivelle.jpg)
- `img/mangin.svg`: Général Charles Mangin agence Meurisse BNF Gallica.jpg, Agence de presse Meurisse, 1921, Public domain, [Commons](https://commons.wikimedia.org/wiki/File:G%C3%A9n%C3%A9ral_Charles_Mangin_agence_Meurisse_BNF_Gallica.jpg)
- `img/falkenhayn.svg`: Erich von Falkenhayn-retouched (cropped)(2).jpg, Albert Meyer, 1913, Public domain, [Commons](https://commons.wikimedia.org/wiki/File:Erich_von_Falkenhayn-retouched_(cropped)(2).jpg)
- `img/kronprinz.svg`: Kronprinz Wilhelm 1. Leib-Husarenregiment.jpg, E. Bieber, 1912/13, Public domain, [Commons](https://commons.wikimedia.org/wiki/File:Kronprinz_Wilhelm_1._Leib-Husarenregiment.jpg)
- `img/driant.svg`: Émile Driant 1.jpg, onbekend, Public domain, [Commons](https://commons.wikimedia.org/wiki/File:%C3%89mile_Driant_1.jpg)
- `img/maginot.svg`: Andre maginot loc.jpg, onbekend, 1924, Public domain, [Commons](https://commons.wikimedia.org/wiki/File:Andre_maginot_loc.jpg)
- `img/york.svg`: Alvin C. York 1919.jpg, Underwood & Underwood, 1919-05-25, Public domain, [Commons](https://commons.wikimedia.org/wiki/File:Alvin_C._York_1919.jpg)
- `img/pershing.svg`: General John Joseph Pershing head on shoulders.jpg, Bain News Service, between 1907 and 1916, Public domain, [Commons](https://commons.wikimedia.org/wiki/File:General_John_Joseph_Pershing_head_on_shoulders.jpg)
- `img/genevoix.svg`: MauriceGenevoix-1915.png, onbekend, 1915, Public domain, [Commons](https://commons.wikimedia.org/wiki/File:MauriceGenevoix-1915.png)
- `img/raynal.svg`: Le commandant Raynal.jpg, onbekend, circa 1920, Public domain, [Commons](https://commons.wikimedia.org/wiki/File:Le_commandant_Raynal.jpg)
- `img/vaux1920.svg`: France, Fort de Vaux, La Coupole détruite par le Commandant Raynal et le fort de Douaumont - A23819.jpg, Chevalier Georges, 19 September 1920, CC BY-SA 4.0, [Commons](https://commons.wikimedia.org/wiki/File:France,_Fort_de_Vaux,_La_Coupole_d%C3%A9truite_par_le_Commandant_Raynal_et_le_fort_de_Douaumont_-_A23819.jpg)

## Veiligheid

Rond Verdun ligt nog veel munitie in de grond, ook met gifgas. Raak nooit iets aan, blijf op de paden en betreed geen afgezette terreinen. Munitie gezien: afstand houden en 112 bellen (of 17, gendarmerie).
