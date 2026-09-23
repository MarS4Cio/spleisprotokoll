function getCurrentLocation() {
  if (!navigator.geolocation) {
    alert("Geolocation wird von diesem Smartphone / Browser nicht unterstützt.");
    return;
  }

  const locInput = document.getElementById('inLocation');
  const origVal = locInput.value;
  locInput.value = "📍 Standort wird ermittelt...";

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const lat = position.coords.latitude.toFixed(6);
      const lon = position.coords.longitude.toFixed(6);

      try {
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
        const data = await response.json();
        if (data && data.address) {
          const road = data.address.road || data.address.pedestrian || '';
          const house = data.address.house_number || '';
          const city = data.address.city || data.address.town || data.address.village || '';
          const zip = data.address.postcode || '';
          
          let fullAddr = `${road} ${house}`.trim();
          if (zip || city) fullAddr += `, ${zip} ${city}`.trim();
          fullAddr += ` (${lat}, ${lon})`;

          locInput.value = fullAddr;
        } else {
          locInput.value = `GPS: ${lat}, ${lon}`;
        }
      } catch (e) {
        locInput.value = `GPS: ${lat}, ${lon}`;
      }
    },
    (error) => {
      locInput.value = origVal;
      switch(error.code) {
        case error.PERMISSION_DENIED:
          alert("Standortzugriff wurde auf dem Smartphone abgelehnt.");
          break;
        case error.POSITION_UNAVAILABLE:
          alert("GPS-Signal ist aktuell nicht verfügbar.");
          break;
        case error.TIMEOUT:
          alert("Zeitüberschreitung bei der GPS-Abfrage.");
          break;
      }
    },
    { enableHighAccuracy: true, timeout: 10000 }
  );
}
