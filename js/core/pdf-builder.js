let loadedLogoDataUrl = null;
let logoAspectRatio = 3.44;

function preloadLocalLogo() {
  const img = new Image();
  img.crossOrigin = "Anonymous";
  img.onload = function() {
    logoAspectRatio = img.naturalWidth / img.naturalHeight;
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
    loadedLogoDataUrl = canvas.toDataURL('image/png');
    const headerImg = document.getElementById('webHeaderLogo');
    if (headerImg) headerImg.src = loadedLogoDataUrl;
  };
  img.onerror = function() {
    console.warn("Logo konnte nicht geladen werden.");
  };
  img.src = typeof APP_CONFIG !== 'undefined' && APP_CONFIG.logoPath ? APP_CONFIG.logoPath : 'GUH_Logo.png';
}

function buildVectorPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF('p', 'mm', 'a4');

  const isSwitchBox = (typeof currentProtocolType !== 'undefined' && currentProtocolType === 'switchbox');

  // STAMMDATEN HOLEN
  const project = isSwitchBox 
    ? (document.getElementById('sw_project')?.value || '—')
    : (document.getElementById('inProject')?.value || '—');
    
  const location = isSwitchBox 
    ? (document.getElementById('sw_address')?.value || '—')
    : (document.getElementById('inLocation')?.value || '—');
    
  const technician = document.getElementById('inTechnician')?.value || 'Florian Elstein';
  const notes = document.getElementById('finalNotes')?.value || '';
  
  const now = new Date();
  const dateStr = now.toLocaleDateString('de-DE') + ' ' + now.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });

  // 1. LOGO & HEADER
  if (loadedLogoDataUrl) {
    const targetHeight = 13;
    const targetWidth = targetHeight * logoAspectRatio;
    doc.addImage(loadedLogoDataUrl, 'PNG', 14, 9, targetWidth, targetHeight);
  } else {
    doc.setFontSize(13);
    doc.setTextColor(23, 84, 103);
    doc.setFont(undefined, 'bold');
    doc.text(typeof APP_CONFIG !== 'undefined' ? APP_CONFIG.companyName.toUpperCase() : 'GEOTHERMIE UNTERHACHING', 14, 18);
  }

  doc.setFontSize(11);
  doc.setTextColor(23, 84, 103);
  doc.setFont(undefined, 'bold');
  doc.text(isSwitchBox ? "LWL-KASTEN & SWITCH PROTOKOLL" : "SPLEISS- & MESSPROTOKOLL LWL", 196, 17.5, { align: 'right' });

  doc.setDrawColor(232, 92, 36);
  doc.setLineWidth(0.8);
  doc.line(14, 25, 196, 25);

  // STAMMDATEN TABELLE
  doc.autoTable({
    startY: 28,
    theme: 'plain',
    styles: { fontSize: 8.5, cellPadding: 1.5, textColor: [15, 23, 42] },
    columnStyles: {
      0: { fontStyle: 'bold', textColor: [23, 84, 103], cellWidth: 35 },
      1: { cellWidth: 60 },
      2: { fontStyle: 'bold', textColor: [23, 84, 103], cellWidth: 25 },
      3: { cellWidth: 'auto' }
    },
    body: [
      ['Auftraggeber:', typeof APP_CONFIG !== 'undefined' ? APP_CONFIG.companyName : 'Geothermie Unterhaching', 'Datum:', dateStr],
      ['Projekt / Trasse:', project, 'Monteur:', technician],
      ['Einsatzort / Objekt:', location, 'Firma:', typeof APP_CONFIG !== 'undefined' ? APP_CONFIG.companySubtext : 'Geothermie Unterhaching GmbH & Co. KG']
    ]
  });

  let currentY = doc.lastAutoTable.finalY + 4;

 // 2. HARDWARE & MATERIAL (NUR BEI LWL-KASTEN)
if (isSwitchBox) {
  doc.setFillColor(241, 245, 249);
  doc.rect(14, currentY, 182, 22, 'F');
  
  doc.setFontSize(8.5);
  doc.setTextColor(23, 84, 103);
  doc.setFont(undefined, 'bold');
  doc.text('HARDWARE & NETZWERK-EINSTELLUNGEN:', 17, currentY + 4.5);
  
  doc.setFont(undefined, 'normal');
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);

  const fabNr = document.getElementById('sw_fab_nr')?.value || '—';
  const regAddr = document.getElementById('sw_regler_addr')?.value || '—';
  const switchInst = document.getElementById('sw_switch_installed')?.value || 'nein';
  const switchIp = document.getElementById('sw_ip')?.value || '—';
  const workTime = document.getElementById('sw_work_duration')?.value || '—';

  // Zeile 1
  doc.text(`Fabrikations-Nr.: ${fabNr}`, 17, currentY + 10);
  doc.text(`Regleradresse: ${regAddr}`, 85, currentY + 10);
  doc.text(`Arbeitszeit: ${workTime}`, 145, currentY + 10);

  // Zeile 2
  doc.text(`Switch verbaut: ${switchInst.toUpperCase()}`, 17, currentY + 16);
  if (switchInst === 'ja') {
    doc.text(`Switch-IP: ${switchIp}`, 85, currentY + 16);
  }

  currentY += 26;

  if (typeof getFormattedMaterialSummary === 'function') {
    const matSummary = getFormattedMaterialSummary();
    doc.setFontSize(8.5);
    doc.setTextColor(23, 84, 103);
    doc.setFont(undefined, 'bold');
    doc.text("VERWENDETES MATERIAL:", 14, currentY);
    
    doc.setFont(undefined, 'normal');
    doc.setFontSize(8);
    doc.setTextColor(15, 23, 42);
    const splitMat = doc.splitTextToSize(matSummary, 182);
    doc.text(splitMat, 14, currentY + 4);
    currentY += 6 + (splitMat.length * 3.8);
  }
}

  // 3. SPLEISSTABELLE ERZEUGEN
  if (isSwitchBox) {
    // --- LWL-KASTEN PROTOKOLL (Liest direkt aus der Formular-Tabelle) ---
    const tableRows = [];
    const rows = document.querySelectorAll('#wizardTableBody tr');

    rows.forEach(tr => {
      if (tr.classList.contains('cassette-header-row')) {
        const title = tr.textContent.replace(/SPLEIKASSETTE/g, 'SPLEISSKASSETTE').replace(/[^a-zA-Z0-9 :_()\-]/g, '').trim().toUpperCase();
        tableRows.push([{ content: title, colSpan: 9, styles: { fillColor: [23, 84, 103], textColor: [255, 255, 255], fontStyle: 'bold', halign: 'left' } }]);
      } else {
        const tds = tr.querySelectorAll('td');
        if (tds.length >= 7) {
          const nr = tds[0].textContent.trim();
          const cass = tds[1] ? tds[1].textContent.trim() : 'K1';
          
          const selectA = tds[2].querySelector('select');
          const colA = selectA ? selectA.options[selectA.selectedIndex]?.text : (tds[2].getAttribute('data-color-name') || tds[2].textContent.trim());
          const fasA = tds[3].querySelector('input')?.value || tds[3].textContent.trim() || nr;

          const selectB = tds[5].querySelector('select');
          const colB = selectB ? selectB.options[selectB.selectedIndex]?.text : (tds[5].getAttribute('data-color-name') || tds[5].textContent.trim());
          const fasB = tds[6].querySelector('input')?.value || tds[6].textContent.trim() || nr;

          const lossInput = tr.querySelector('.loss-input');
          const loss = lossInput ? lossInput.value : '—';
          const remInput = tr.querySelector('.remark-input');
          const rem = remInput ? remInput.value : '';

          tableRows.push([nr, cass, colA, fasA, "->", colB, fasB, loss, rem]);
        }
      }
    });

    if (tableRows.length > 0) {
      doc.autoTable({
        startY: currentY,
        head: [['Nr.', 'Kass.', 'Kabel A Farbe', 'Fas. A', '', 'Kabel B / Pigtail', 'Fas. B', 'Daempfung', 'Bemerkung / Kabel']],
        body: tableRows,
        theme: 'grid',
        headStyles: { fillColor: [23, 84, 103], textColor: [255, 255, 255], fontStyle: 'bold', halign: 'center', fontSize: 7.5 },
        styles: { fontSize: 7.5, halign: 'center', cellPadding: 1.8, lineColor: [203, 213, 225], lineWidth: 0.1 },
        columnStyles: {
          0: { cellWidth: 9 }, 1: { cellWidth: 12 }, 2: { cellWidth: 26 }, 3: { cellWidth: 12 },
          4: { cellWidth: 7 }, 5: { cellWidth: 26 }, 6: { cellWidth: 12 }, 7: { cellWidth: 20 }, 8: { cellWidth: 'auto' }
        },
        didParseCell: function(data) {
          if (data.section === 'body' && data.row.cells[0]?.raw?.content === undefined) {
            if (data.column.index === 2 || data.column.index === 3) {
              const hex = getColorHex(data.row.cells[2].raw);
              data.cell.styles.fillColor = hex;
              data.cell.styles.textColor = (hex === '#ffffff' || hex === '#eab308') ? [0, 0, 0] : [255, 255, 255];
              data.cell.styles.fontStyle = 'bold';
            }
            if (data.column.index === 5 || data.column.index === 6) {
              const hex = getColorHex(data.row.cells[5].raw);
              data.cell.styles.fillColor = hex;
              data.cell.styles.textColor = (hex === '#ffffff' || hex === '#eab308') ? [0, 0, 0] : [255, 255, 255];
              data.cell.styles.fontStyle = 'bold';
            }
          }
        }
      });
      currentY = doc.lastAutoTable.finalY + 6;
    }

  } else {
    // --- SPLEISSPROTOKOLL (Liest ALLE gespeicherten Einheiten aus completedUnits) ---
    const unitsToRender = (typeof completedUnits !== 'undefined' && completedUnits.length > 0)
      ? completedUnits
      : [];

    if (unitsToRender.length === 0) {
      alert("Keine Einheiten zum Generieren des PDFs gefunden!");
      return;
    }

    unitsToRender.forEach((unit, uIdx) => {
      if (currentY > 230) { doc.addPage(); currentY = 20; }

      // Überschrift der Einheit (z. B. "Einheit 1: Spleißbox 1 (Spleißbox)")
      doc.setFontSize(10.5);
      doc.setTextColor(23, 84, 103);
      doc.setFont(undefined, 'bold');
      doc.text(`Einheit ${uIdx + 1}: ${unit.name} (${unit.type})`, 14, currentY);
      currentY += 4;

      unit.cassettes.forEach((cassette) => {
        if (currentY > 220) { doc.addPage(); currentY = 20; }

        const safeTitle = (cassette.title || "Kassette").replace(/[^a-zA-Z0-9 :_()\-]/g, '').trim().toUpperCase();

        const tableData = cassette.rows.map(r => [
          r.nr,
          r.cassette,
          r.colA,
          r.fasA,
          "->",
          r.colB,
          r.fasB,
          r.attenuation || "—",
          r.notes || ""
        ]);

        doc.autoTable({
          startY: currentY,
          head: [[{ content: safeTitle, colSpan: 9, styles: { fillColor: [23, 84, 103], textColor: [255, 255, 255], fontStyle: 'bold', halign: 'left' } }],
                 ['Nr.', 'Kass.', 'Kabel A Farbe', 'Fas. A', '', 'Kabel B / Pigtail', 'Fas. B', 'Daempfung', 'Bemerkung / Kabel']],
          body: tableData,
          theme: 'grid',
          headStyles: { fillColor: [23, 84, 103], textColor: [255, 255, 255], fontStyle: 'bold', halign: 'center', fontSize: 7.5 },
          styles: { fontSize: 7.5, halign: 'center', cellPadding: 1.8, lineColor: [203, 213, 225], lineWidth: 0.1 },
          columnStyles: {
            0: { cellWidth: 9 }, 1: { cellWidth: 12 }, 2: { cellWidth: 26 }, 3: { cellWidth: 12 },
            4: { cellWidth: 7 }, 5: { cellWidth: 26 }, 6: { cellWidth: 12 }, 7: { cellWidth: 20 }, 8: { cellWidth: 'auto' }
          },
          didParseCell: function(data) {
            if (data.section === 'body') {
              const rawRow = cassette.rows[data.row.index];
              if (rawRow) {
                if (data.column.index === 2 || data.column.index === 3) {
                  const hex = getColorHex(rawRow.colA);
                  data.cell.styles.fillColor = hex;
                  data.cell.styles.textColor = (hex === '#ffffff' || hex === '#eab308') ? [0, 0, 0] : [255, 255, 255];
                  data.cell.styles.fontStyle = 'bold';
                }
                if (data.column.index === 5 || data.column.index === 6) {
                  const hex = getColorHex(rawRow.colB);
                  data.cell.styles.fillColor = hex;
                  data.cell.styles.textColor = (hex === '#ffffff' || hex === '#eab308') ? [0, 0, 0] : [255, 255, 255];
                  data.cell.styles.fontStyle = 'bold';
                }
              }
            }
          }
        });

        currentY = doc.lastAutoTable.finalY + 5;
      });

      currentY += 3;
    });
  }

  // 4. BEMERKUNGEN
  if (notes) {
    if (currentY > 240) { doc.addPage(); currentY = 20; }
    doc.setFontSize(9);
    doc.setTextColor(23, 84, 103);
    doc.setFont(undefined, 'bold');
    doc.text("Hinweise / Bemerkungen:", 14, currentY);
    doc.setFont(undefined, 'normal');
    doc.setFontSize(8);
    doc.setTextColor(15, 23, 42);
    doc.text(notes, 14, currentY + 4.5);
    currentY += 12;
  }

  // 5. FOTODOKUMENTATION
  const locPhotos = typeof attachedLocationPhotos !== 'undefined' ? attachedLocationPhotos : [];
  const splPhotos = typeof attachedSplicePhotos !== 'undefined' ? attachedSplicePhotos : [];
  const totalPhotos = locPhotos.length + splPhotos.length;

  if (totalPhotos > 0) {
    doc.addPage();
    doc.setFontSize(11);
    doc.setTextColor(23, 84, 103);
    doc.setFont(undefined, 'bold');
    doc.text("FOTODOKUMENTATION", 14, 18);
    
    doc.setDrawColor(232, 92, 36);
    doc.setLineWidth(0.5);
    doc.line(14, 21, 196, 21);

    let pX = 14, pY = 26;

    const renderPhotoGroup = (photos, title) => {
      if (photos.length === 0) return;
      
      doc.setFontSize(9.5);
      doc.setTextColor(23, 84, 103);
      doc.setFont(undefined, 'bold');
      if (pY > 240) { doc.addPage(); pY = 20; pX = 14; }
      doc.text(title, 14, pY);
      pY += 5;

      photos.forEach((p, idx) => {
        if (pY > 210) {
          doc.addPage();
          pY = 20;
          pX = 14;
        }
        try {
          doc.addImage(p.src, 'JPEG', pX, pY, 85, 60);
          doc.setFontSize(7.5);
          doc.setTextColor(15, 23, 42);
          doc.setFont(undefined, 'normal');
          doc.text(p.desc || `Foto ${idx + 1}`, pX, pY + 64);
        } catch(e) {
          console.error("Foto konnte nicht im PDF platziert werden", e);
        }

        if (pX === 14) {
          pX = 105;
        } else {
          pX = 14;
          pY += 70;
        }
      });

      if (pX === 105) { pX = 14; pY += 70; }
    };

    renderPhotoGroup(locPhotos, "1. STANDORT & UMGEBUNG");
    renderPhotoGroup(splPhotos, "2. SPLEISS- & MONTAGE-DETAILS");
  }

  // 6. SEITENZAHLEN
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.3);
    doc.line(14, 285, 196, 285);

    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text(`${typeof APP_CONFIG !== 'undefined' ? APP_CONFIG.companyName : 'Geothermie Unterhaching'} - Technisches Protokoll LWL`, 14, 289);
    doc.text(`Seite ${i} von ${totalPages}`, 196, 289, { align: 'right' });
  }

  return doc;
}

function generateVectorPDF(isBlob = false) {
  const isSwitchBox = (typeof currentProtocolType !== 'undefined' && currentProtocolType === 'switchbox');
  const locRaw = isSwitchBox 
    ? (document.getElementById('sw_address')?.value || document.getElementById('sw_box_id')?.value || 'Kasten')
    : (document.getElementById('inLocation')?.value || 'SpleissProtokoll');

  const loc = locRaw.replace(/[^a-zA-Z0-9_-]/g, '_');
  const doc = buildVectorPDF();
  const filename = `${isSwitchBox ? 'Kasten' : 'Spleissprotokoll'}_${loc}.pdf`;

  if (isBlob) {
    return { blob: doc.output('blob'), filename: filename };
  } else {
    doc.save(filename);
  }
}

// Logo direkt beim Skriptstart laden
preloadLocalLogo();
