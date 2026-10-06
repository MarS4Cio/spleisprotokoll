
// Globale Steuerung für den Protokoll-Typ
let currentProtocolType = 'spleiss'; // 'spleiss' oder 'switchbox'

function startSpleissWorkflow() {
  currentProtocolType = 'spleiss';
  showStep('step-1');
}

function startSwitchBoxWorkflow() {
  currentProtocolType = 'switchbox';
  showStep('step-switchbox-1');
}

// Validierung der Fabrikationsnummer (Muss mit 'P' beginnen)
function validateFabrikationsnr(input) {
  let val = input.value.trim().toUpperCase();
  if (val && !val.startsWith('P')) {
    val = 'P' + val;
  }
  input.value = val;
}

// Switch Toggle (IP-Feld nur anzeigen wenn Switch verbaut)
function toggleSwitchFields() {
  const isInstalled = document.getElementById('sw_switch_installed').value === 'ja';
  const ipGroup = document.getElementById('sw_ip_group');
  if (ipGroup) {
    ipGroup.style.display = isInstalled ? 'block' : 'none';
  }
}

// Erstellt die Spleißtabelle für den Kasten (Standard: Neu / DIN VDE)
function startSwitchSpliceConfig() {
  const boxId = document.getElementById('sw_box_id').value || 'Netzwerkschrank';
  const fiberCount = parseInt(document.getElementById('sw_fiber_count').value) || 8;
  const cableType = document.getElementById('sw_cable_type').value || 'neu';

  document.getElementById('adjustTableTitle').textContent = `3. Spleißbelegung im Kasten: ${boxId} (${fiberCount} Fasern)`;

  const tbody = document.getElementById('wizardTableBody');
  tbody.innerHTML = '';

  const headerRow = document.createElement('tr');
  headerRow.className = 'cassette-header-row';
  headerRow.setAttribute('data-kassette-id', 'K1');
  headerRow.setAttribute('data-kassette-title', 'Kassette Schrank');
  headerRow.innerHTML = `<td colspan="9">Spleißkassette ${boxId}</td>`;
  tbody.appendChild(headerRow);

  for (let i = 1; i <= fiberCount; i++) {
    const colA = PALETTES[cableType][(i - 1) % 12];
    const colB = PALETTES['neu'][(i - 1) % 12]; // Pigtails standardmäßig DIN
    const tr = createSpliceRowHTML(i, 'K1', cableType, colA, i, 'neu', colB, i, 'Kabel -> Pigtail');
    tbody.appendChild(tr);
  }

  showStep('step-splice-adjust');
}
