/* const listEl = document.getElementById('care-list');
let map;
let allPlaces = [];
let markers = [];
const API_KEY = window.CONFIG.API_KEY;

// 1. Define the Dynamic Loader
function loadGoogleMaps() {
  return new Promise((resolve, reject) => {
    if (window.google && window.google.maps) {
      resolve(); // Already loaded
      return;
    }

    const script = document.createElement('script');
    // We use the key from config.js here 
    script.src = `https://maps.googleapis.com/maps/api/js?key=${window.CONFIG.API_KEY}&libraries=places&loading=async`;
    script.async = true;
    script.defer = true;
    
    // When the script loads, we resolve the promise
    script.onload = () => resolve();
    script.onerror = (err) => reject(err);

    document.head.appendChild(script);
  });
}

// 2. Start the App
console.log('Loading Maps API...');

loadGoogleMaps()
  .then(() => {
    console.log('Maps API Loaded. Requesting Location...');

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;

        initMap(latitude, longitude);

        // Store the fetched results in our global array
        allPlaces = await findNearbyCare(latitude, longitude);
        renderList(allPlaces); // Render everything initially

        const places = await findNearbyCare(latitude, longitude);
        renderList(places);
      },
      () => {
        listEl.innerHTML = '<p>Unable to access location.</p>';
      }
    );

}).catch((err) => {
    console.error('Failed to load Google Maps:', err);
    listEl.innerHTML = '<p>Error loading maps. Check console.</p>';
  });





function initMap(lat, lng) {
  map = new google.maps.Map(document.getElementById('map'), {
    center: { lat, lng },
    zoom: 13,
  });

  new google.maps.Marker({
    position: { lat, lng },
    map,
    title: 'You are here',
  });
}


async function findNearbyCare(lat, lng) {
  const url = 'https://places.googleapis.com/v1/places:searchNearby';

  const body = {
    includedTypes: ['hospital', 'doctor', 'pharmacy'],
    maxResultCount: 10,
    locationRestriction: {
      circle: {
        center: { latitude: lat, longitude: lng },
        radius: 5000,
      },
    },
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key':API_KEY,
      'X-Goog-FieldMask': 'places.displayName,places.formattedAddress,places.location,places.types',
    },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  return data.places || [];
}

function renderList(places) {
  // 1. Clear existing markers from the map
  markers.forEach((m) => m.setMap(null));
  markers = [];

  if (!places.length) {
    listEl.innerHTML = '<p>No care facilities found nearby.</p>';
    return;
  }

  listEl.innerHTML = places
    .map(
      (p) => `
      <article class="card">
        <h3>${p.displayName.text}</h3>
        <p>${p.formattedAddress}</p>
      </article>
    `,
    )
    .join('');

  places.forEach((p) => {
    const type = p.types?.[0] || 'care';

    const icons = {
      hospital: 'https://maps.gstatic.com/mapfiles/ms2/micons/hospitals.png',
      doctor: 'https://maps.gstatic.com/mapfiles/ms2/micons/doctor.png',
      pharmacy: 'https://maps.gstatic.com/mapfiles/ms2/micons/pharmacy.png',
      care: 'https://maps.gstatic.com/mapfiles/ms2/micons/blue-dot.png',
    };

    const marker = new google.maps.Marker({
      position: {
        lat: p.location.latitude,
        lng: p.location.longitude,
      },
      map,
      title: p.displayName.text,
      icon: {
        url: icons[type] || icons.care,
        scaledSize: new google.maps.Size(32, 32),
      },
      animation: google.maps.Animation.DROP,
    });

    const info = new google.maps.InfoWindow({
      content: `
        <strong>${p.displayName.text}</strong><br>
        ${p.formattedAddress}
      `,
    });

   markers.push(marker);
   
    marker.addListener('click', () => info.open(map, marker));
 
 });
 
 
  }


document.querySelectorAll('.care-filters button').forEach((button) => {
  button.addEventListener('click', () => {
    const type = button.getAttribute('data-type');

    // If 'all' is clicked, show the full original list
    if (type === 'all') {
      renderList(allPlaces);
      return;
    }

    // Otherwise, filter by the specific type
    const filtered = allPlaces.filter(
      (place) => place.types && place.types.includes(type),
    );


document.querySelectorAll('.care-filters button').forEach(btn => btn.classList.remove('active'));
button.classList.add('active');




    renderList(filtered);
  });





});
 */




const listEl = document.getElementById('care-list');
const filterButtons = document.querySelectorAll('.care-filters button');

let map;
let allPlaces = [];
let markers = [];

/* -------------------------------------------------------
   Start App
------------------------------------------------------- */
navigator.geolocation.getCurrentPosition(
  async (pos) => {
    const { latitude, longitude } = pos.coords;

    initMap(latitude, longitude);

    allPlaces = await findNearbyCare(latitude, longitude);

    renderUI(allPlaces);
  },
  () => {
    listEl.innerHTML = '<p>Unable to access location.</p>';
  },
);

/* -------------------------------------------------------
   Map Setup
------------------------------------------------------- */
function initMap(lat, lng) {
  map = new google.maps.Map(document.getElementById('map'), {
    center: { lat, lng },
    zoom: 13,
  });

  new google.maps.Marker({
    position: { lat, lng },
    map,
    title: 'You are here',
  });
}

/* -------------------------------------------------------
   Google Places API
------------------------------------------------------- */
async function findNearbyCare(lat, lng) {
  const url = 'https://places.googleapis.com/v1/places:searchNearby';

  const body = {
    includedTypes: ['hospital', 'doctor', 'pharmacy'],
    maxResultCount: 15,
    locationRestriction: {
      circle: {
        center: { latitude: lat, longitude: lng },
        radius: 5000,
      },
    },
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': window.CONFIG.API_KEY,
      'X-Goog-FieldMask':
        'places.id,places.displayName,places.formattedAddress,places.location,places.types',
    },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  return data.places || [];
}

/* -------------------------------------------------------
   Normalize Place Type
------------------------------------------------------- */
function getPrimaryType(place) {
  if (place.types?.includes('hospital')) return 'hospital';
  if (place.types?.includes('doctor') || place.types?.includes('physician'))
    return 'doctor';
  if (place.types?.includes('pharmacy')) return 'pharmacy';
  return 'other';
}

/* -------------------------------------------------------
   Unified Render Function
------------------------------------------------------- */
function renderUI(places) {
  renderList(places);
  renderMarkers(places);
}

/* -------------------------------------------------------
   Render List
------------------------------------------------------- */
function renderList(places) {
  if (!places.length) {
    listEl.innerHTML = '<p>No care facilities found nearby.</p>';
    return;
  }

  listEl.innerHTML = places
    .map(
      (p) => `
      <article class="card" data-id="${p.id}">
        <h3>${p.displayName.text}</h3>
        <p>${p.formattedAddress}</p>
      </article>
    `,
    )
    .join('');

  // Card → Marker interaction
  document.querySelectorAll('.card').forEach((card) => {
    card.addEventListener('click', () => {
      const id = card.dataset.id;
      const marker = markers.find((m) => m.placeId === id);

      if (!marker) return;

      map.panTo(marker.getPosition());
      map.setZoom(15);

      marker.setAnimation(google.maps.Animation.BOUNCE);
      setTimeout(() => marker.setAnimation(null), 1400);
    });
  });
}








/* -------------------------------------------------------
   Render Markers
------------------------------------------------------- */
function renderMarkers(places) {
  // Clear old markers
  markers.forEach((m) => m.setMap(null));
  markers = [];

  const icons = {
    hospital: 'https://maps.gstatic.com/mapfiles/ms2/micons/hospitals.png',
    doctor: 'https://maps.gstatic.com/mapfiles/ms2/micons/doctor.png',
    pharmacy: 'https://maps.gstatic.com/mapfiles/ms2/micons/pharmacy.png',
    other: 'https://maps.gstatic.com/mapfiles/ms2/micons/blue-dot.png',
  };

  places.forEach((p) => {
    const type = getPrimaryType(p);

    const marker = new google.maps.Marker({
      position: {
        lat: p.location.latitude,
        lng: p.location.longitude,
      },
      map,
      title: p.displayName.text,
      icon: {
        url: icons[type],
        scaledSize: new google.maps.Size(32, 32),
      },
      animation: google.maps.Animation.DROP,
    });

     marker.placeId = p.id;

    const info = new google.maps.InfoWindow({
      content: `
        <strong>${p.displayName.text}</strong><br>
        ${p.formattedAddress}
      `,
    });

    marker.addListener('click', () => info.open(map, marker));

    markers.push(marker);
  });
}







/* -------------------------------------------------------
   Filters (Optimized)
------------------------------------------------------- */
filterButtons.forEach((button) => {
  button.addEventListener('click', () => {
    // Active state
    filterButtons.forEach((btn) => btn.classList.remove('active'));
    button.classList.add('active');

    const type = button.dataset.type;

    const filtered =
      type === 'all'
        ? allPlaces
        : allPlaces.filter((place) => getPrimaryType(place) === type);

    renderUI(filtered);
  });
});
