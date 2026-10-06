let currentProtocolType = 'spleiss'; // 'spleiss' oder 'switchbox'

function startSpleissWorkflow() {
  currentProtocolType = 'spleiss';
  showStep('step-1');
}

function startSwitchBoxWorkflow() {
  currentProtocolType = 'switchbox';
  
  // Standard-Kabel beim ersten Öffnen vorschlagen (2 Kabel á 4 Fasern)
  const container = document.getElementById('sw_cables_container');
  if (container && container.children.length === 0) {
    addSwitchIncomingCable("Kabel 1 (Stamm)", "neu", 4);
    addSwitchIncomingCable("Kabel 2 (Anschluss)", "neu", 4);
  }

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

// Dynamisches Hinzufügen von Kabeln im Schrank
function addSwitchIncomingCable(nameDef = "", typeDef = "neu", countDef = 4) {
  const container = document.getElementById('sw_cables_container');
  if (!container) return;
  const num = container.children.length + 1;

  const card = document.createElement('div');
  card.className = 'sub-cable-card';
  card.style.cssText = "background: white; padding: 8px 12px; border-radius: 4px; margin-bottom: 8px; border: 1px solid #cbd5e1;";
  card.innerHTML = `
    <div class="grid-3" style="align-items: center;">
      <div class="form-group">
        <label>Kabel-Bezeichnung</label>
        <input type="text" class="sw-cable-name" value="${nameDef || 'Kabel ' + num}">
      </div>
      <div class="form-group">
        <label>Farbstandard</label>
        <select class="sw-cable-type">
          <option value="neu" ${typeDef === 'neu' ? 'selected' : ''}>Neu (DIN VDE: Rot, Grün...)</option>
          <option value="alt" ${typeDef === 'alt' ? 'selected' : ''}>Alt (Corning: Blau, Orange...)</option>
        </select>
      </div>
      <div class="form-group">
        <label>Fasern</label>
        <div style="display: flex; gap: 6px; align-items: center;">
          <select class="sw-cable-count" style="width: 100%;">
            <option value="2" ${countDef === 2 ? 'selected' : ''}>2 Fasern</option>
            <option value="4" ${countDef === 4 ? 'selected' : ''}>4 Fasern</option>
            <option value="8" ${countDef === 8 ? 'selected' : ''}>8 Fasern</option>
            <option value="12" ${countDef === 12 ? 'selected' : ''}>12 Fasern</option>
          </select>
          ${num > 1 ? `<button type="button" class="delete-btn" style="position: static; width: 24px; height: 24px;" onclick="this.closest('.sub-cable-card').remove();">✕</button>` : ''}
        </div>
      </div>
    </div>
  `;
  container.appendChild(card);
}

// Erstellt die Spleißtabelle für den Kasten mit Pigtails ab Rot (1)
function startSwitchSpliceConfig() {
  const boxId = document.getElementById('sw_box_id').value || 'Netzwerkschrank';
  const cableCards = document.querySelectorAll('#sw_cables_container .sub-cable-card');
  
  const tbody = document.getElementById('wizardTableBody');
  tbody.innerHTML = '';

  let globalIndex = 1;
  let pigtailNum = 1; // Startet immer bei Rot (1)
  let totalSplices = 0;

  const headerRow = document.createElement('tr');
  headerRow.className = 'cassette-header-row';
  headerRow.setAttribute('data-kassette-id', 'K1');
  headerRow.setAttribute('data-kassette-title', `Kassette ${boxId}`);
  headerRow.innerHTML = `<td colspan="9">Spleißkassette: ${boxId}</td>`;
  tbody.appendChild(headerRow);

  cableCards.forEach((card, cIdx) => {
    const nameVal = card.querySelector('.sw-cable-name').value || `Kabel ${cIdx + 1}`;
    const typeVal = card.querySelector('.sw-cable-type').value || 'neu';
    const countVal = parseInt(card.querySelector('.sw-cable-count').value) || 4;

    for (let f = 1; f <= countVal; f++) {
      const colA = PALETTES[typeVal][(f - 1) % 12];
      const colB = PALETTES['neu'][(pigtailNum - 1) % 12]; // Pigtails immer DIN VDE ab Rot
      
      const tr = createSpliceRowHTML(globalIndex, 'K1', typeVal, colA, f, 'neu', colB, pigtailNum, `${nameVal}`);
      tbody.appendChild(tr);

      globalIndex++;
      pigtailNum = (pigtailNum % 12) + 1;
      totalSplices++;
    }
  });

  // Material-Feld "Spleiße" automatisch anpassen
  const splicesInput = document.getElementById('mat_splices_count');
  if (splicesInput) {
    splicesInput.value = totalSplices;
  }

  document.getElementById('adjustTableTitle').textContent = `3. Spleißbelegung im Kasten: ${boxId} (${totalSplices} Spleiße)`;
  showStep('step-splice-adjust');
}

// Zusammenfassung des gebuchten Materials für das PDF
function getFormattedMaterialSummary() {
  const boxType = document.getElementById('mat_box_type').value;
  const splices = document.getElementById('mat_splices_count').value;
  const m20Pipe = document.getElementById('mat_m20_pipe').value.trim();
  const m20Clamps = document.getElementById('mat_m20_clamps').value.trim();
  const nym = document.getElementById('mat_nym_cable').value.trim();
  const oelflex = document.getElementById('mat_oelflex_cable').value.trim();
  const other = document.getElementById('mat_other').value.trim();

  let matList = [];
  if (boxType && boxType !== 'Kein / Bestand') matList.push(`• Kasten: ${boxType}`);
  if (splices) matList.push(`• Spleiße: ${splices} Stk.`);
  if (m20Pipe) matList.push(`• M20 Stangenrohr: ${m20Pipe}`);
  if (m20Clamps) matList.push(`• M20 Schellen: ${m20Clamps} Stk.`);
  if (nym) matList.push(`• NYM-J 3x1,5mm²: ${nym}`);
  if (oelflex) matList.push(`• 2YSLCY 3x1,5mm² (Ölflex): ${oelflex}`);
  if (other) matList.push(`• Sonstiges: ${other}`);

  return matList.length > 0 ? matList.join('\n') : 'Standard-Material';
}
// Geht beim Schrank-Protokoll direkt von Schritt 3 zu Schritt 5 (Fotos & PDF)
function handleSwitchBoxNext() {
  if (currentProtocolType === 'switchbox') {
    showStep('step-final');
  } else {
    showStep('step-next-unit-prompt');
  }
}
