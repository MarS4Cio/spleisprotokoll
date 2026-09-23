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
  img.src = APP_CONFIG.logoPath;
}

function buildVectorPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF('p', 'mm', 'a4');
  const project = document.getElementById('inProject').value;
  const location = document.getElementById('inLocation').value;
  const technician = document.getElementById('inTechnician').value;
  const notes = document.getElementById('finalNotes').value;
  const dateStr = document.getElementById('lblDate').textContent;

  if (loadedLogoDataUrl) {
    const targetHeight = 13;
    const targetWidth = targetHeight * logoAspectRatio;
    doc.addImage(loadedLogoDataUrl, 'PNG', 14, 9, targetWidth, targetHeight);
  } else {
    doc.setFontSize(14);
    doc.setTextColor(23, 84, 103);
    doc.setFont(undefined, 'bold');
    doc.text(APP_CONFIG.companyName.toUpperCase(), 14, 18);
  }

  doc.setFontSize(12);
  doc.setTextColor(23, 84, 103);
  doc.setFont(undefined, 'bold');
  doc.text("SPLEISS- & MESSPROTOKOLL LWL", 196, 17.5, { align: 'right' });

  doc.setDrawColor(232, 92, 36);
  doc.setLineWidth(0.8);
  doc.line(14, 25, 196, 25);

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
      ['Auftraggeber:', APP_CONFIG.companyName, 'Datum:', dateStr],
      ['Projekt / Trasse:', project, 'Monteur:', technician],
      ['Einsatzort / Objekt:', location, 'Firma:', APP_CONFIG.companySubtext]
    ]
  });

  let currentY = doc.lastAutoTable.finalY + 4;

  completedUnits.forEach((unit, uIdx) => {
    if (currentY > 240) { doc.addPage(); currentY = 20; }

    doc.setFontSize(10.5);
    doc.setTextColor(23, 84, 103);
    doc.setFont(undefined, 'bold');
    doc.text(`Einheit ${uIdx + 1}: ${unit.name} (${unit.type})`, 14, currentY);
    currentY += 4;

    unit.cassettes.forEach((cassette) => {
      if (currentY > 230) { doc.addPage(); currentY = 20; }

      const safeTitle = (cassette.title || "Kassette").replace(/[^a-zA-Z0-9 :_()\-]/g, '').trim().toUpperCase();

      doc.setFillColor(23, 84, 103);
      doc.roundedRect(14, currentY, 182, 5.5, 0.5, 0.5, 'F');
      doc.setFontSize(8);
      doc.setTextColor(255, 255, 255);
      doc.setFont(undefined, 'bold');
      doc.text(safeTitle, 17, currentY + 3.8);
      currentY += 6.5;

      const tableData = cassette.rows.map(r => [
        r.nr,
        r.cassette,
        r.colA,
        r.fasA,
        "->",
        r.colB,
        r.fasB,
        r.attenuation,
        r.notes
      ]);

      doc.autoTable({
        startY: currentY,
        head: [['Nr.', 'Kass.', 'Kabel A Farbe', 'Fas. A', '', 'Kabel B / Pigtail', 'Fas. B', 'Daempfung', 'Bemerkung / Kabel']],
        body: tableData,
        theme: 'grid',
        headStyles: { fillColor: [23, 84, 103], textColor: [255, 255, 255], fontStyle: 'bold', halign: 'center', fontSize: 7.5 },
        styles: { fontSize: 7.5, halign: 'center', cellPadding: 1.8, lineColor: [203, 213, 225], lineWidth: 0.1 },
        columnStyles: {
          0: { cellWidth: 9 },
          1: { cellWidth: 12 },
          2: { cellWidth: 26 },
          3: { cellWidth: 12 },
          4: { cellWidth: 7 },
          5: { cellWidth: 26 },
          6: { cellWidth: 12 },
          7: { cellWidth: 20 },
          8: { cellWidth: 'auto' }
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

  const totalPhotos = attachedLocationPhotos.length + attachedSplicePhotos.length;
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
        doc.addImage(p.src, 'JPEG', pX, pY, 85, 60);
        doc.setFontSize(7.5);
        doc.setTextColor(15, 23, 42);
        doc.setFont(undefined, 'normal');
        doc.text(p.desc || `Foto ${idx + 1}`, pX, pY + 64);

        if (pX === 14) {
          pX = 105;
        } else {
          pX = 14;
          pY += 70;
        }
      });

      if (pX === 105) { pX = 14; pY += 70; }
    };

    renderPhotoGroup(attachedLocationPhotos, "1. STANDORT & UMGEBUNG");
    renderPhotoGroup(attachedSplicePhotos, "2. SPLEISS- & MONTAGE-DETAILS");
  }

  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.3);
    doc.line(14, 285, 196, 285);

    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text(`${APP_CONFIG.companyName} - Technisches Protokoll LWL`, 14, 289);
    doc.text(`Seite ${i} von ${totalPages}`, 196, 289, { align: 'right' });
  }

  return doc;
}

function generateVectorPDF(isBlob = false) {
  if (completedUnits.length === 0) {
    alert("Bitte zuerst mindestens eine Einheit erfassen!");
    return;
  }
  const doc = buildVectorPDF();
  const loc = document.getElementById('inLocation').value.replace(/[^a-zA-Z0-9_-]/g, '_');
  const filename = `Spleissprotokoll_${loc}.pdf`;

  if (isBlob) {
    return { blob: doc.output('blob'), filename: filename };
  } else {
    doc.save(filename);
  }
}
