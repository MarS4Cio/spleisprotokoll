const PALETTES = {
  neu: [
    { name: "Rot", class: "col-rot", hex: "#ef4444", num: 1 },
    { name: "Grün", class: "col-gruen", hex: "#22c55e", num: 2 },
    { name: "Blau", class: "col-blau", hex: "#3b82f6", num: 3 },
    { name: "Gelb", class: "col-gelb", hex: "#eab308", num: 4 },
    { name: "Weiß", class: "col-weiss", hex: "#ffffff", num: 5 },
    { name: "Grau", class: "col-grau", hex: "#94a3b8", num: 6 },
    { name: "Braun", class: "col-braun", hex: "#854d0e", num: 7 },
    { name: "Violett", class: "col-violett", hex: "#a855f7", num: 8 },
    { name: "Türkis", class: "col-tuerkis", hex: "#14b8a6", num: 9 },
    { name: "Schwarz", class: "col-schwarz", hex: "#1e293b", num: 10 },
    { name: "Orange", class: "col-orange", hex: "#f97316", num: 11 },
    { name: "Rosa", class: "col-rosa", hex: "#ec4899", num: 12 }
  ],
  alt: [
    { name: "Blau", class: "col-blau", hex: "#3b82f6", num: 1 },
    { name: "Orange", class: "col-orange", hex: "#f97316", num: 2 },
    { name: "Grün", class: "col-gruen", hex: "#22c55e", num: 3 },
    { name: "Braun", class: "col-braun", hex: "#854d0e", num: 4 },
    { name: "Grau", class: "col-grau", hex: "#94a3b8", num: 5 },
    { name: "Weiß", class: "col-weiss", hex: "#ffffff", num: 6 },
    { name: "Rot", class: "col-rot", hex: "#ef4444", num: 7 },
    { name: "Schwarz", class: "col-schwarz", hex: "#1e293b", num: 8 },
    { name: "Gelb", class: "col-gelb", hex: "#eab308", num: 9 },
    { name: "Violett", class: "col-violett", hex: "#a855f7", num: 10 },
    { name: "Rosa", class: "col-rosa", hex: "#ec4899", num: 11 },
    { name: "Türkis", class: "col-tuerkis", hex: "#14b8a6", num: 12 }
  ]
};

let completedUnits = [];
let currentUnitType = '';
let editingUnitIndex = -1;

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('lblDate').textContent = new Date().toLocaleDateString('de-DE');
  preloadLocalLogo();
});

function showStep(stepId) {
  document.querySelectorAll('.step-card').forEach(el => el.classList.remove('active'));
  document.getElementById(stepId).classList.add('active');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function startMuffeWorkflow() {
  editingUnitIndex = -1;
  currentUnitType = 'Muffe';
  showStep('step-muffe-config');
}

function startBoxWorkflow() {
  editingUnitIndex = -1;
  currentUnitType = 'Spleißbox';
  renderCassetteForms();
  showStep('step-box-config');
}

function toggleMuffeMode() {
  const mode = document.getElementById('muffe_mode').value;
  document.getElementById('muffe_2cable_grid').style.display = mode === 'standard' ? 'grid' : 'none';
  document.getElementById('muffe_3cable_grid').style.display = mode === 'ymuffe' ? 'grid' : 'none';
}

function renderCassetteForms() {
  const countSelect = document.getElementById('box_cassette_count');
  const count = parseInt(countSelect ? countSelect.value : 2) || 2;
  const container = document.getElementById('cassetteFormsContainer');
  if (!container) return;
  container.innerHTML = '';

  let nextSuggestedPigtail = 1;

  for (let c = 1; c <= count; c++) {
    const box = document.createElement('div');
    box.className = 'cassette-box';
    box.id = `cassette_box_${c}`;
    box.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
        <h4 style="margin: 0; color: var(--primary-color); font-size: 14px;">Kassette ${c}</h4>
        <div style="display: flex; align-items: center; gap: 8px;">
          <label style="font-size: 11px; font-weight: bold; text-transform: uppercase;">Kabel-Modus:</label>
          <select id="box_c${c}_cableMode" onchange="toggleCableMode(${c})">
            <option value="single">1 Kabel / Bündel</option>
            <option value="multi" selected>Mehrere Kabel / Bündel</option>
          </select>
        </div>
      </div>

      <div id="box_c${c}_single_wrapper" class="grid-3" style="display: none;">
        <div class="form-group">
          <label>Kabel A Standard</label>
          <select id="box_c${c}_cableType">
            <option value="neu">Neu (DIN: Rot, Grün...)</option>
            <option value="alt">Alt (Corning: Blau, Orange...)</option>
          </select>
        </div>
        <div class="form-group">
          <label>Fasern in dieser Kassette</label>
          <select id="box_c${c}_fiberCount" onchange="updatePigtailChain()">
            <option value="4">4 Fasern</option>
            <option value="8" selected>8 Fasern</option>
            <option value="12">12 Fasern</option>
          </select>
        </div>
        <div class="form-group">
          <label>Start-Pigtail Faser (1-12)</label>
          <input type="number" id="box_c${c}_pigtailStart" value="${nextSuggestedPigtail}" min="1" max="12" onchange="updatePigtailChain()">
        </div>
      </div>

      <div id="box_c${c}_multi_wrapper" style="display: block;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 12px; font-weight: bold; color: #475569;">Teilkabel:</span>
            <label style="font-size: 11px; font-weight: bold;">Start-Pigtail:</label>
            <input type="number" id="box_c${c}_multi_pigtailStart" value="${nextSuggestedPigtail}" min="1" max="12" style="width: 55px; padding: 2px 4px;" onchange="updatePigtailChain()">
          </div>
          <button class="btn btn-outline" style="font-size: 11px; padding: 3px 8px;" onclick="addSubCable(${c})">➕ Weiteres Kabel</button>
        </div>
        <div id="box_c${c}_subcables_container"></div>
      </div>
    `;
    container.appendChild(box);

    addSubCable(c, "Kabel 1", "neu", 4);
    addSubCable(c, "Kabel 2", c === 1 ? "neu" : "alt", 4);

    nextSuggestedPigtail = ((nextSuggestedPigtail + 8 - 1) % 12) + 1;
  }

  updatePigtailChain();
}

function updatePigtailChain() {
  const countSelect = document.getElementById('box_cassette_count');
  if (!countSelect) return;
  const count = parseInt(countSelect.value) || 1;

  const firstSingle = document.getElementById('box_c1_single_wrapper');
  if (!firstSingle) return;

  let currentStart = parseInt(firstSingle.style.display !== 'none' 
    ? (document.getElementById('box_c1_pigtailStart') ? document.getElementById('box_c1_pigtailStart').value : 1)
    : (document.getElementById('box_c1_multi_pigtailStart') ? document.getElementById('box_c1_multi_pigtailStart').value : 1)) || 1;

  for (let c = 1; c <= count; c++) {
    const singleEl = document.getElementById(`box_c${c}_single_wrapper`);
    if (!singleEl) continue;
    const isSingle = singleEl.style.display !== 'none';
    let fibersInBox = 0;

    if (isSingle) {
      const pStart = document.getElementById(`box_c${c}_pigtailStart`);
      if (pStart) pStart.value = currentStart;
      const fCount = document.getElementById(`box_c${c}_fiberCount`);
      fibersInBox = parseInt(fCount ? fCount.value : 8) || 8;
    } else {
      const mpStart = document.getElementById(`box_c${c}_multi_pigtailStart`);
      if (mpStart) mpStart.value = currentStart;
      document.querySelectorAll(`#box_c${c}_subcables_container .sub-count`).forEach(sel => {
        fibersInBox += parseInt(sel.value) || 4;
      });
    }

    currentStart = ((currentStart + fibersInBox - 1) % 12) + 1;
  }
}

function toggleCableMode(c) {
  const mode = document.getElementById(`box_c${c}_cableMode`).value;
  const singleWrap = document.getElementById(`box_c${c}_single_wrapper`);
  const multiWrap = document.getElementById(`box_c${c}_multi_wrapper`);

  if (mode === 'multi') {
    singleWrap.style.display = 'none';
    multiWrap.style.display = 'block';
  } else {
    singleWrap.style.display = 'grid';
    multiWrap.style.display = 'none';
  }
  updatePigtailChain();
}

function addSubCable(c, nameDef = "", typeDef = "neu", countDef = 4) {
  const container = document.getElementById(`box_c${c}_subcables_container`);
  if (!container) return;
  const num = container.children.length + 1;
  const card = document.createElement('div');
  card.className = 'sub-cable-card';
  card.innerHTML = `
    <div class="grid-3">
      <div class="form-group">
        <label>Kabel-Bezeichnung</label>
        <input type="text" class="sub-name" value="${nameDef || 'Kabel ' + num}">
      </div>
      <div class="form-group">
        <label>Farbstandard</label>
        <select class="sub-type">
          <option value="neu" ${typeDef === 'neu' ? 'selected' : ''}>Neu (DIN)</option>
          <option value="alt" ${typeDef === 'alt' ? 'selected' : ''}>Alt (Corning)</option>
        </select>
      </div>
      <div class="form-group">
        <label>Fasern</label>
        <div style="display: flex; gap: 6px; align-items: center;">
          <select class="sub-count" style="width: 100%;" onchange="updatePigtailChain()">
            <option value="2" ${countDef === 2 ? 'selected' : ''}>2 Fasern</option>
            <option value="4" ${countDef === 4 ? 'selected' : ''}>4 Fasern</option>
            <option value="6" ${countDef === 6 ? 'selected' : ''}>6 Fasern</option>
            <option value="8" ${countDef === 8 ? 'selected' : ''}>8 Fasern</option>
            <option value="12" ${countDef === 12 ? 'selected' : ''}>12 Fasern</option>
          </select>
          <button class="delete-btn" style="position: static; width: 24px; height: 24px;" onclick="this.closest('.sub-cable-card').remove(); updatePigtailChain();">✕</button>
        </div>
      </div>
    </div>
  `;
  container.appendChild(card);
  updatePigtailChain();
}

function buildMuffeSpliceTable() {
  const mode = document.getElementById('muffe_mode').value;
  const tbody = document.getElementById('wizardTableBody');
  tbody.innerHTML = '';

  if (mode === 'standard') {
    const typeA = document.getElementById('muffe_cableA_type').value;
    const countA = parseInt(document.getElementById('muffe_cableA_count').value);
    const typeB = document.getElementById('muffe_cableB_type').value;
    const countB = parseInt(document.getElementById('muffe_cableB_count').value);
    const maxCount = Math.max(countA, countB);

    document.getElementById('adjustTableTitle').textContent = `3. Faserbelegung für Muffe (${maxCount} Fasern)`;

    const headerRow = document.createElement('tr');
    headerRow.className = 'cassette-header-row';
    headerRow.setAttribute('data-kassette-id', 'K1');
    headerRow.setAttribute('data-kassette-title', 'Muffe');
    headerRow.innerHTML = `<td colspan="9">Muffe (Kabel A ➜ Kabel B)</td>`;
    tbody.appendChild(headerRow);

    for (let i = 1; i <= maxCount; i++) {
      const colA = PALETTES[typeA][(i - 1) % 12];
      const colB = PALETTES[typeB][(i - 1) % 12];
      const tr = createSpliceRowHTML(i, "K1", typeA, colA, colA.num, typeB, colB, colB.num, "Kabel A -> Kabel B");
      tbody.appendChild(tr);
    }
  } else {
    const t1 = document.getElementById('ymuffe_c1_type').value;
    const t2 = document.getElementById('ymuffe_c2_type').value;
    const t3 = document.getElementById('ymuffe_c3_type').value;

    document.getElementById('adjustTableTitle').textContent = `3. Faserbelegung: Y-Muffe (Kabel 1 ➜ Kabel 2 ➜ Kabel 3)`;

    addYBlock(tbody, "K1", "Kassette 1: Kabel 1 (Fas. 1-2) auf Kabel 2 (Fas. 1-2)", 1, t1, 1, 2, t2, 1, 2, "Kabel 1 -> Kabel 2");
    addYBlock(tbody, "K2", "Kassette 2: Kabel 2 (Fas. 3-4) auf Kabel 3 (Fas. 1-2)", 3, t2, 3, 4, t3, 1, 2, "Kabel 2 -> Kabel 3");
    addYBlock(tbody, "K3", "Kassette 3: Kabel 3 (Fas. 3-4) auf Kabel 1 (Fas. 3-4)", 5, t3, 3, 4, t1, 3, 4, "Kabel 3 -> Kabel 1");
  }

  showStep('step-splice-adjust');
}

function addYBlock(tbody, kId, title, startNr, typeA, aStart, aEnd, typeB, bStart, bEnd, note) {
  const headerRow = document.createElement('tr');
  headerRow.className = 'cassette-header-row';
  headerRow.setAttribute('data-kassette-id', kId);
  headerRow.setAttribute('data-kassette-title', title);
  headerRow.innerHTML = `<td colspan="9">${title}</td>`;
  tbody.appendChild(headerRow);

  let nr = startNr;
  let bFas = bStart;
  for (let aFas = aStart; aFas <= aEnd; aFas++) {
    const colA = PALETTES[typeA][(aFas - 1) % 12];
    const colB = PALETTES[typeB][(bFas - 1) % 12];
    const tr = createSpliceRowHTML(nr, kId, typeA, colA, aFas, typeB, colB, bFas, note);
    tbody.appendChild(tr);
    nr++;
    bFas++;
  }
}

function buildBoxSpliceTable() {
  const countSelect = document.getElementById('box_cassette_count');
  const cassetteCount = parseInt(countSelect ? countSelect.value : 2) || 2;
  const globalPigtailType = document.getElementById('box_global_pigtail_type').value;
  const tbody = document.getElementById('wizardTableBody');
  tbody.innerHTML = '';
  document.getElementById('adjustTableTitle').textContent = `3. Faserbelegung für Spleißbox (${cassetteCount} Kassetten)`;

  let globalIndex = 1;

  for (let c = 1; c <= cassetteCount; c++) {
    const modeEl = document.getElementById(`box_c${c}_cableMode`);
    const mode = modeEl ? modeEl.value : 'single';

    const headerRow = document.createElement('tr');
    headerRow.className = 'cassette-header-row';
    headerRow.setAttribute('data-kassette-id', `K${c}`);
    headerRow.setAttribute('data-kassette-title', `Kassette ${c}`);
    headerRow.innerHTML = `<td colspan="9">Kassette ${c}</td>`;
    tbody.appendChild(headerRow);

    if (mode === 'single') {
      const typeEl = document.getElementById(`box_c${c}_cableType`);
      const typeCable = typeEl ? typeEl.value : 'neu';
      const fiberEl = document.getElementById(`box_c${c}_fiberCount`);
      const fiberCount = parseInt(fiberEl ? fiberEl.value : 8) || 8;
      const pStartEl = document.getElementById(`box_c${c}_pigtailStart`);
      let pigtailNum = parseInt(pStartEl ? pStartEl.value : 1) || 1;

      for (let f = 1; f <= fiberCount; f++) {
        const colA = PALETTES[typeCable][(f - 1) % 12];
        const colB = PALETTES[globalPigtailType][(pigtailNum - 1) % 12];
        const tr = createSpliceRowHTML(globalIndex, `K${c}`, typeCable, colA, f, globalPigtailType, colB, pigtailNum, "Kabel -> Pigtail");
        tbody.appendChild(tr);
        globalIndex++;
        pigtailNum = (pigtailNum % 12) + 1;
      }
    } else {
      const subCards = document.querySelectorAll(`#box_c${c}_subcables_container .sub-cable-card`);
      const mpStartEl = document.getElementById(`box_c${c}_multi_pigtailStart`);
      let pigtailNum = parseInt(mpStartEl ? mpStartEl.value : 1) || 1;

      subCards.forEach((card, subIdx) => {
        const nameEl = card.querySelector('.sub-name');
        const cableName = nameEl ? nameEl.value : `Kabel ${subIdx + 1}`;
        const typeEl = card.querySelector('.sub-type');
        const cableType = typeEl ? typeEl.value : 'neu';
        const countEl = card.querySelector('.sub-count');
        const fiberCount = parseInt(countEl ? countEl.value : 4) || 4;

        for (let f = 1; f <= fiberCount; f++) {
          const colA = PALETTES[cableType][(f - 1) % 12];
          const colB = PALETTES[globalPigtailType][(pigtailNum - 1) % 12];
          const tr = createSpliceRowHTML(globalIndex, `K${c}`, cableType, colA, f, globalPigtailType, colB, pigtailNum, `${cableName}`);
          tbody.appendChild(tr);
          globalIndex++;
          pigtailNum = (pigtailNum % 12) + 1;
        }
      });
    }
  }

  showStep('step-splice-adjust');
}

function createSpliceRowHTML(nr, kassette, typeA, defaultColA, faserA, typeB, defaultColB, faserB, remarkText = "") {
  const tr = document.createElement('tr');
  tr.className = 'splice-data-row';
  tr.setAttribute('data-kassette-ref', kassette);
  tr.setAttribute('data-type-a', typeA);
  tr.setAttribute('data-type-b', typeB);

  tr.innerHTML = `
    <td style="font-weight: bold;">${nr}</td>
    <td><input class="input-cell" type="text" value="${kassette}"></td>
    
    <td class="${defaultColA.class}" id="cell-colA-${nr}">
      <select class="color-select" onchange="onColorSelectChange(this, 'A', ${nr})">
        ${PALETTES[typeA].map(c => `<option value="${c.name}" data-class="${c.class}" data-num="${c.num}" ${c.name === defaultColA.name ? 'selected' : ''}>${c.name}</option>`).join('')}
      </select>
    </td>
    <td class="${defaultColA.class}" id="cell-fasA-${nr}">
      <input class="input-cell" type="number" value="${faserA}" min="1" max="12" onchange="onFiberInputChange(this, 'A', ${nr})">
    </td>

    <td style="color: #64748b; font-weight: bold;">-></td>

    <td class="${defaultColB.class}" id="cell-colB-${nr}">
      <select class="color-select" onchange="onColorSelectChange(this, 'B', ${nr})">
        ${PALETTES[typeB].map(c => `<option value="${c.name}" data-class="${c.class}" data-num="${c.num}" ${c.name === defaultColB.name ? 'selected' : ''}>${c.name}</option>`).join('')}
      </select>
    </td>
    <td class="${defaultColB.class}" id="cell-fasB-${nr}">
      <input class="input-cell" type="number" value="${faserB}" min="1" max="12" onchange="onFiberInputChange(this, 'B', ${nr})">
    </td>

    <td><input class="input-cell" type="text" value="0.02 dB"></td>
    <td><input class="input-cell" type="text" value="${remarkText}"></td>
  `;
  return tr;
}

function onColorSelectChange(selectEl, side, nr) {
  const tr = selectEl.closest('tr');
  const selectedOption = selectEl.selectedOptions[0];
  const newNum = selectedOption.getAttribute('data-num');
  const newClass = selectedOption.getAttribute('data-class');

  const fiberInput = tr.querySelector(`#cell-fas${side}-${nr} input`);
  if (fiberInput) fiberInput.value = newNum;

  applyCellColor(tr, side, nr, newClass);
}

function onFiberInputChange(inputEl, side, nr) {
  const tr = inputEl.closest('tr');
  const type = tr.getAttribute(`data-type-${side.toLowerCase()}`) || 'neu';
  let num = parseInt(inputEl.value) || 1;
  if (num < 1) num = 1;
  const colorIndex = (num - 1) % 12;
  const colorObj = PALETTES[type][colorIndex];

  if (colorObj) {
    const colorSelect = tr.querySelector(`#cell-col${side}-${nr} select`);
    if (colorSelect) colorSelect.value = colorObj.name;
    applyCellColor(tr, side, nr, colorObj.class);
  }
}

function applyCellColor(tr, side, nr, newClass) {
  const colCell = tr.querySelector(`#cell-col${side}-${nr}`);
  const fasCell = tr.querySelector(`#cell-fas${side}-${nr}`);
  const allClasses = Object.values(PALETTES).flat().map(c => c.class);

  allClasses.forEach(cls => {
    if (colCell) colCell.classList.remove(cls);
    if (fasCell) fasCell.classList.remove(cls);
  });

  if (colCell) colCell.classList.add(newClass);
  if (fasCell) fasCell.classList.add(newClass);
}

function goBackFromAdjust() {
  if (editingUnitIndex >= 0) {
    editingUnitIndex = -1;
    showStep('step-next-unit-prompt');
  } else {
    if (currentUnitType === 'Muffe') showStep('step-muffe-config');
    else showStep('step-box-config');
  }
}

function saveCurrentUnitAndAskNext() {
  const unitName = document.getElementById('inUnitName').value || `${currentUnitType} ${completedUnits.length + 1}`;
  const cassetteMap = new Map();

  document.querySelectorAll('#wizardTableBody tr').forEach(tr => {
    if (tr.classList.contains('cassette-header-row')) {
      const kId = tr.getAttribute('data-kassette-id') || 'K1';
      let kTitle = tr.getAttribute('data-kassette-title') || 'Kassette';
      kTitle = kTitle.replace(/[^a-zA-Z0-9 :_()\-]/g, '').trim();
      if (!cassetteMap.has(kId)) {
        cassetteMap.set(kId, { title: kTitle, rows: [] });
      }
    } else if (tr.classList.contains('splice-data-row')) {
      const kId = tr.cells[1].querySelector('input').value.trim() || 'K1';
      if (!cassetteMap.has(kId)) {
        cassetteMap.set(kId, { title: `Kassette ${kId.replace(/[^0-9]/g, '')}`, rows: [] });
      }
      cassetteMap.get(kId).rows.push({
        nr: tr.cells[0].textContent.trim(),
        cassette: kId,
        colA: tr.cells[2].querySelector('select').selectedOptions[0].text,
        fasA: tr.cells[3].querySelector('input').value,
        colB: tr.cells[5].querySelector('select').selectedOptions[0].text,
        fasB: tr.cells[6].querySelector('input').value,
        attenuation: tr.cells[7].querySelector('input').value,
        notes: tr.cells[8].querySelector('input').value
      });
    }
  });

  const unitData = {
    type: currentUnitType,
    name: unitName,
    cassettes: Array.from(cassetteMap.values())
  };

  if (editingUnitIndex >= 0) {
    completedUnits[editingUnitIndex] = unitData;
    editingUnitIndex = -1;
  } else {
    completedUnits.push(unitData);
  }

  updateConfiguredUnitsSummary();
  showStep('step-next-unit-prompt');
}

function editUnit(index) {
  editingUnitIndex = index;
  const unit = completedUnits[index];
  currentUnitType = unit.type;
  document.getElementById('inUnitName').value = unit.name;
  document.getElementById('adjustTableTitle').textContent = `3. Bearbeite: ${unit.name} (${unit.type})`;

  const tbody = document.getElementById('wizardTableBody');
  tbody.innerHTML = '';

  unit.cassettes.forEach((cassette, cIdx) => {
    const headerRow = document.createElement('tr');
    headerRow.className = 'cassette-header-row';
    headerRow.setAttribute('data-kassette-id', `K${cIdx + 1}`);
    headerRow.setAttribute('data-kassette-title', cassette.title);
    headerRow.innerHTML = `<td colspan="9">${cassette.title}</td>`;
    tbody.appendChild(headerRow);

    cassette.rows.forEach(r => {
      const isCorningA = (r.colA === "Blau" && parseInt(r.fasA) === 1) || (r.colA === "Orange" && parseInt(r.fasA) === 2);
      const isCorningB = (r.colB === "Blau" && parseInt(r.fasB) === 1) || (r.colB === "Orange" && parseInt(r.fasB) === 2);
      const typeA = isCorningA ? 'alt' : 'neu';
      const typeB = isCorningB ? 'alt' : 'neu';

      const colObjA = PALETTES[typeA].find(c => c.name === r.colA) || PALETTES.neu[0];
      const colObjB = PALETTES[typeB].find(c => c.name === r.colB) || PALETTES.neu[0];

      const tr = createSpliceRowHTML(r.nr, r.cassette, typeA, colObjA, r.fasA, typeB, colObjB, r.fasB, r.notes);
      tr.querySelector('input[value="0.02 dB"]').value = r.attenuation;
      tbody.appendChild(tr);
    });
  });

  showStep('step-splice-adjust');
}

function deleteUnit(index) {
  if (confirm(`Möchtest du "${completedUnits[index].name}" wirklich löschen?`)) {
    completedUnits.splice(index, 1);
    updateConfiguredUnitsSummary();
  }
}

function updateConfiguredUnitsSummary() {
  const list = document.getElementById('configuredUnitsList');
  list.innerHTML = '<h3>Bisher erfasste Einheiten:</h3>';
  if (completedUnits.length === 0) {
    list.innerHTML += '<p style="font-size: 13px; color: #64748b;">Noch keine Einheiten vorhanden.</p>';
    return;
  }
  completedUnits.forEach((u, i) => {
    let totalFibers = 0;
    u.cassettes.forEach(c => totalFibers += c.rows.length);

    const div = document.createElement('div');
    div.className = 'unit-card';
    div.innerHTML = `
      <div class="unit-card-header">
        <span>${i + 1}. ${u.name} (${u.type}) - <small style="color: #64748b;">${u.cassettes.length} Kassetten / ${totalFibers} Spleiße</small></span>
        <div class="unit-card-actions">
          <button class="btn btn-sm btn-outline" onclick="editUnit(${i})">✏️ Bearbeiten</button>
          <button class="btn btn-sm btn-danger-outline" onclick="deleteUnit(${i})">🗑️ Löschen</button>
        </div>
      </div>
    `;
    list.appendChild(div);
  });
}

function addNewUnitWorkflow(type) {
  editingUnitIndex = -1;
  currentUnitType = type;
  document.getElementById('inUnitName').value = `${type} ${completedUnits.length + 1}`;
  if (type === 'Muffe') showStep('step-muffe-config');
  else showStep('step-box-config');
}

function goToFinalOverview() {
  showStep('step-final');
}

function getColorHex(colorName) {
  const all = [...PALETTES.neu, ...PALETTES.alt];
  const match = all.find(c => c.name.toLowerCase() === colorName.toLowerCase());
  return match ? match.hex : '#ffffff';
}
