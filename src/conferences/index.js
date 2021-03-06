import mapboxgl from 'mapbox-gl';
import { BLUE } from '../colors';
import createPopup from './createPopup';
import conferencesDataSource, { nextConferences } from './dataSource';

const clusterLayer = {
  id: 'conference-clusters',
  type: 'circle',
  source: 'conferences',
  filter: ['has', 'point_count'],
  paint: {
    'circle-color': BLUE,
    'circle-radius': 15
  }
};

const clusterCountLayer = {
  id: 'conference-cluster-count',
  type: 'symbol',
  source: 'conferences',
  filter: ['has', 'point_count'],
  layout: {
    'text-field': '{point_count_abbreviated}',
    'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
    'text-size': 12
  }
};

const unclusteredConferencesLayer = {
  id: 'unclustered-conferences',
  type: 'symbol',
  minzoom: 5,
  source: 'conferences',
  filter: ['!has', 'point_count'],
  layout: {
    'text-field': '{name}',
    'text-font': ['Open Sans Semibold', 'Arial Unicode MS Bold'],
    'text-offset': [0, -2.2]
  }
};

const unclusteredConferencesPointLayer = {
  id: 'unclustered-conferences-point',
  type: 'circle',
  source: 'conferences',
  filter: ['!has', 'point_count'],
  paint: {
    'circle-color': BLUE,
    'circle-radius': 7,
    'circle-stroke-width': 1,
    'circle-stroke-color': '#fff'
  }
};

const showPopup = (e, map) => {
  const conference = e.features[0];
  map.flyTo({
    zoom: Math.max(map.getZoom(), 8),
    center: conference.geometry.coordinates
  });

  const popup = createPopup(conference);

  new mapboxgl.Popup()
    .setLngLat(conference.geometry.coordinates)
    .setDOMContent(popup)
    .addTo(map);
};

const updateConferencesList = map => {
  const list = document.querySelector('#conferences-list');
  const nextFive = nextConferences.slice(0, 5);
  nextFive.forEach(conference => {
    const li = document.createElement('li');
    const link = document.createElement('a');
    link.innerText = conference.properties.name;
    link.href = '#';
    link.addEventListener('click', () =>
      showPopup({ features: [conference] }, map)
    );
    li.appendChild(link);
    li.append(` (${conference.properties.start})`);
    list.appendChild(li);
  });
};

export default map => {
  map.addSource('conferences', conferencesDataSource);
  map.addLayer(clusterLayer);
  map.addLayer(clusterCountLayer);
  map.addLayer(unclusteredConferencesPointLayer);
  map.addLayer(unclusteredConferencesLayer);

  map.on('click', 'conference-clusters', e => {
    map.flyTo({
      zoom: map.getZoom() + 2,
      center: e.features[0].geometry.coordinates
    });
  });

  map.on('click', 'unclustered-conferences-point', e => showPopup(e, map));
  map.on('click', 'unclustered-conferences', e => showPopup(e, map));

  const showPointer = () => (map.getCanvas().style.cursor = 'pointer');
  const hidePointer = () => (map.getCanvas().style.cursor = '');

  map.on('mouseenter', 'conference-clusters', showPointer);
  map.on('mouseenter', 'unclustered-conferences-point', showPointer);

  map.on('mouseleave', 'conference-clusters', hidePointer);
  map.on('mouseleave', 'unclustered-conferences-point', hidePointer);

  updateConferencesList(map);
};
