const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const TAMIL_FONT = path.join(__dirname, '..', 'fonts', 'NotoSansTamil-Regular.ttf');
const TAMIL_BOLD_FONT = path.join(__dirname, '..', 'fonts', 'NotoSansTamil-Bold.ttf');
const EMBLEM_PATH = path.join(__dirname, '..', 'asset1', 'tamilnadu-emblem.png');

const UPLOADS_DIR = path.join(__dirname, '..', 'uploads', 'certificates');
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

function formatFieldLabel(key) {
  const labels = {
    childName: 'Child Name / குழந்தையின் பெயர்',
    parentName: 'Parent Name / பெற்றோர் பெயர்',
    hospitalName: 'Hospital Name / மருத்துவமனை பெயர்',
    dateOfBirth: 'Date of Birth / பிறந்த தேதி',
    gender: 'Gender / பாலினம்',
    placeOfBirth: 'Place of Birth / பிறந்த இடம்',
    address: 'Address / முகவரி',
    ownerName: 'Owner Name / உரிமையாளர் பெயர்',
    surveyNumber: 'Survey Number / சர்வே எண்',
    landArea: 'Land Area / நிலப்பரப்பு',
    areaSize: 'Area Size / பரப்பளவு',
    landLocation: 'Land Location / நிலத்தின் இடம்',
    taluk: 'Taluk / தாலுக்கு',
    district: 'District / மாவட்டம்',
    villageDistrict: 'Village / District',
    pattaNumber: 'Patta Number / பட்டா எண்',
    applicantName: 'Applicant Name / விண்ணப்பதாரர் பெயர்',
    annualIncome: 'Annual Income / வருடாந்திர வருமானம்',
    occupation: 'Occupation / தொழில்',
    familyMembersCount: 'Family Members Count / குடும்ப உறுப்பினர் எண்ணிக்கை',
    buildingType: 'Building Type / கட்டிட வகை',
    plotNumber: 'Plot Number / பிளாட் எண்',
    streetArea: 'Street / Area / தெரு / பகுதி',
    buildingArea: 'Building Area / கட்டிட பரப்பு',
    businessName: 'Business Name / வணிகத்தின் பெயர்',
    businessType: 'Business Type / வணிக வகை',
    registrationNumber: 'Registration Number / பதிவு எண்',
    shopAddress: 'Shop / Office Address / கடை / அலுவலக முகவரி',
    contactNumber: 'Contact Number / தொடர்பு எண்',
    houseNumber: 'House Number / வீட்டு எண்',
    existingWaterSource: 'Existing Water Source / தற்போதைய நீர் மூலாதாரம்',
    approvedBy: 'Approved By / அங்கீகரித்தவர்',
    issueDate: 'Issue Date / வழங்கப்பட்ட தேதி',
  };

  return labels[key] || String(key).replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase());
}

function drawCenteredBlock(doc, lines, startY, opts = {}) {
  const {
    width = doc.page.width - 120,
    x = 60,
    lineGap = 4,
  } = opts;

  let y = startY;
  lines.forEach((line) => {
    if (!line?.text) return;
    doc
      .font(line.font)
      .fontSize(line.size)
      .fillColor(line.color || '#111827')
      .text(line.text, x, y, {
        width,
        align: 'center',
        lineGap: line.lineGap ?? 0,
      });
    y = doc.y + lineGap;
  });
  return y;
}

function drawGovTemplate(doc, { title, titleTamil, certId, issueDate, approvedBy }) {
  const pageWidth = doc.page.width;
  const pageHeight = doc.page.height;
  const contentX = 60;
  const contentWidth = pageWidth - 120;

  doc.save();
  doc.lineWidth(2).strokeColor('#0B3D91').rect(30, 30, pageWidth - 60, pageHeight - 60).stroke();
  doc.lineWidth(0.75).strokeColor('#C9A227').rect(38, 38, pageWidth - 76, pageHeight - 76).stroke();
  doc.restore();

  doc.save();
  doc.rotate(-30, { origin: [pageWidth / 2, pageHeight / 2] });
  doc.fillColor('#0B3D91').opacity(0.08).fontSize(68).font('Helvetica-Bold')
    .text('GOVERNMENT', 0, pageHeight / 2 - 70, { align: 'center', width: pageWidth });
  doc.opacity(1).restore();

  let y = 62;
  y = drawCenteredBlock(doc, [
    { text: 'GOVERNMENT OF TAMIL NADU', font: 'Helvetica-Bold', size: 17, color: '#0B3D91' },
    { text: 'தமிழ்நாடு அரசு', font: TAMIL_BOLD_FONT, size: 13, color: '#111827' },
    { text: 'e-Governance Services Portal', font: 'Helvetica', size: 10.5, color: '#111827' },
    { text: 'மின் ஆளுமை சேவை தளம்', font: TAMIL_FONT, size: 10, color: '#111827' },
  ], y, { x: contentX, width: contentWidth, lineGap: 2 });

  const emblemWidth = 78;
  const emblemHeight = 78;
  const emblemX = (pageWidth - emblemWidth) / 2;
  const emblemY = y + 4;

  if (fs.existsSync(EMBLEM_PATH)) {
    doc.image(EMBLEM_PATH, emblemX, emblemY, {
      fit: [emblemWidth, emblemHeight],
      align: 'center',
      valign: 'center',
    });
  }

  const lineY = emblemY + emblemHeight + 18;
  doc.moveTo(contentX, lineY).lineTo(pageWidth - contentX, lineY).lineWidth(1).strokeColor('#E5E7EB').stroke();

  let titleY = lineY + 22;
  titleY = drawCenteredBlock(doc, [
    { text: title.toUpperCase(), font: 'Helvetica-Bold', size: 19, color: '#111827' },
    ...(titleTamil ? [{ text: titleTamil, font: TAMIL_BOLD_FONT, size: 13, color: '#111827' }] : []),
  ], titleY, { x: contentX, width: contentWidth, lineGap: 2 });

  const metaTop = titleY + 14;

  doc.font('Helvetica').fontSize(10).fillColor('#374151');
  doc.text(`Certificate No.: ${certId}`, contentX, metaTop, {
    width: 220,
    align: 'left',
  });
  doc.font(TAMIL_FONT).fontSize(9).fillColor('#374151');
  doc.text(`சான்றிதழ் எண்: ${certId}`, contentX, metaTop + 15, {
    width: 220,
    align: 'left',
  });

  doc.font('Helvetica').fontSize(10).fillColor('#374151');
  doc.text(`Date of Issue: ${issueDate}`, pageWidth - 280, metaTop, {
    width: 220,
    align: 'right',
  });
  doc.font(TAMIL_FONT).fontSize(9).fillColor('#374151');
  doc.text(`வழங்கப்பட்ட தேதி: ${issueDate}`, pageWidth - 280, metaTop + 15, {
    width: 220,
    align: 'right',
  });

  const statementY = metaTop + 42;
  doc.fillColor('#111827').font('Helvetica').fontSize(11);
  doc.text(
    'This is to certify that the particulars stated herein are true and correct as per records verified by the competent authorities.',
    contentX,
    statementY,
    { width: contentWidth, align: 'justify', lineGap: 2 }
  );

  doc.fillColor('#374151').font(TAMIL_FONT).fontSize(10);
  doc.text(
    'இங்கே குறிப்பிடப்பட்டுள்ள விவரங்கள் அதிகாரப்பூர்வ பதிவுகளின் அடிப்படையில் சரியானவை என்று இதன் மூலம் சான்றளிக்கப்படுகிறது.',
    contentX,
    doc.y + 8,
    { width: contentWidth, align: 'justify', lineGap: 2 }
  );

  return doc.y + 18;
}

function drawFieldRow(doc, leftLabel, leftValue, rightLabel, rightValue, y) {
  const leftX = 72;
  const rightX = 330;

  const labelWidth = 150;
  const valueWidth = 95;
  const columnGap = 10;

  const safeLeftLabel = leftLabel ? `${leftLabel}:` : '';
  const safeRightLabel = rightLabel ? `${rightLabel}:` : '';
  const safeLeftValue = String(leftValue ?? 'N/A');
  const safeRightValue = String(rightValue ?? 'N/A');

  const leftLabelHeight = safeLeftLabel
    ? doc.heightOfString(safeLeftLabel, { width: labelWidth, align: 'left' })
    : 0;

  const leftValueHeight = doc.heightOfString(safeLeftValue, {
    width: valueWidth,
    align: 'left',
  });

  const rightLabelHeight = safeRightLabel
    ? doc.heightOfString(safeRightLabel, { width: labelWidth, align: 'left' })
    : 0;

  const rightValueHeight = safeRightLabel
    ? doc.heightOfString(safeRightValue, {
        width: valueWidth,
        align: 'left',
      })
    : 0;

  const leftBlockHeight = Math.max(leftLabelHeight, leftValueHeight);
  const rightBlockHeight = Math.max(rightLabelHeight, rightValueHeight);
  const rowHeight = Math.max(leftBlockHeight, rightBlockHeight, 24);

  if (safeLeftLabel) {
    doc.fillColor('#374151')
      .font(TAMIL_FONT)
      .fontSize(10)
      .text(safeLeftLabel, leftX, y, {
        width: labelWidth,
        align: 'left',
        lineGap: 1,
      });
  }

  doc.fillColor('#111827')
    .font(TAMIL_FONT)
    .fontSize(10.5)
    .text(safeLeftValue, leftX + labelWidth + columnGap, y, {
      width: valueWidth,
      align: 'left',
      lineGap: 1,
    });

  if (safeRightLabel) {
    doc.fillColor('#374151')
      .font(TAMIL_FONT)
      .fontSize(10)
      .text(safeRightLabel, rightX, y, {
        width: labelWidth,
        align: 'left',
        lineGap: 1,
      });

    doc.fillColor('#111827')
      .font(TAMIL_FONT)
      .fontSize(10.5)
      .text(safeRightValue, rightX + labelWidth + columnGap, y, {
        width: valueWidth,
        align: 'left',
        lineGap: 1,
      });
  }

  return y + rowHeight + 14;
}

function drawKeyValueTable(doc, data, startY) {
  const entries = Object.entries(data || {}).filter(
    ([k]) => !['approvedBy', 'issueDate'].includes(k)
  );

  let y = startY;

  for (let i = 0; i < entries.length; i += 2) {
    const [k1, v1] = entries[i] || [];
    const [k2, v2] = entries[i + 1] || [];

    y = drawFieldRow(
      doc,
      k1 ? formatFieldLabel(k1) : '',
      v1 ?? 'N/A',
      k2 ? formatFieldLabel(k2) : '',
      v2 ?? 'N/A',
      y
    );
  }

  return y;
}

function drawFooter(doc, approvedBy) {
  const pageWidth = doc.page.width;
  const pageHeight = doc.page.height;
  const footerY = pageHeight - 150;

  doc.strokeColor('#D1D5DB').lineWidth(1)
    .moveTo(60, footerY).lineTo(pageWidth / 2 - 30, footerY).stroke()
    .moveTo(pageWidth / 2 + 30, footerY).lineTo(pageWidth - 60, footerY).stroke();

  doc.fillColor('#111827').font('Helvetica').fontSize(10);
  doc.text('Applicant Signature', 60, footerY + 8, {
    width: pageWidth / 2 - 90,
    align: 'center'
  });
  doc.font(TAMIL_FONT).fontSize(9);
  doc.text('விண்ணப்பதாரர் கையொப்பம்', 60, footerY + 22, {
    width: pageWidth / 2 - 90,
    align: 'center'
  });

  doc.fillColor('#111827').font('Helvetica').fontSize(10);
  doc.text('Issuing Authority', pageWidth / 2 + 30, footerY + 8, {
    width: pageWidth / 2 - 90,
    align: 'center'
  });
  doc.font(TAMIL_FONT).fontSize(9);
  doc.text('வழங்கும் அதிகாரி', pageWidth / 2 + 30, footerY + 22, {
    width: pageWidth / 2 - 90,
    align: 'center'
  });

  doc.fillColor('#374151').font('Helvetica').fontSize(9);
  doc.text(
    approvedBy ? `Approved by: ${approvedBy}` : 'Approved by: Authorized Officer',
    pageWidth / 2 + 30,
    footerY + 38,
    {
      width: pageWidth / 2 - 90,
      align: 'center'
    }
  );

  doc.font(TAMIL_FONT).fontSize(8);
  doc.text(
    `அங்கீகரித்தவர்: ${approvedBy || 'Authorized Officer'}`,
    pageWidth / 2 + 30,
    footerY + 52,
    {
      width: pageWidth / 2 - 90,
      align: 'center'
    }
  );

  doc.fillColor('#6B7280').font('Helvetica').fontSize(7.8);
  doc.text(
    'Note: This is a digitally generated certificate. No physical signature is required. Verify using Certificate No. at the portal.',
    65,
    pageHeight - 92,
    { width: pageWidth - 130, align: 'center' }
  );

  doc.font(TAMIL_FONT).fontSize(7.6);
  doc.text(
    'குறிப்பு: இது மின்னணு முறையில் உருவாக்கப்பட்ட சான்றிதழ். உடற்கூறு கையொப்பம் தேவையில்லை.',
    65,
    pageHeight - 78,
    { width: pageWidth - 130, align: 'center' }
  );
}

function generateBirthCertificate(data) {
  const certId = `BC${Date.now().toString().slice(-6)}`;
  const filename = `birth_${certId}.pdf`;
  const filepath = path.join(UPLOADS_DIR, filename);

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    const stream = fs.createWriteStream(filepath);
    doc.pipe(stream);

    const bodyStart = drawGovTemplate(doc, {
      title: 'Birth Certificate',
      titleTamil: 'பிறப்புச் சான்றிதழ்',
      certId,
      issueDate: data.issueDate || new Date().toLocaleDateString(),
      approvedBy: data.approvedBy || 'Municipality Officer'
    });

    drawKeyValueTable(doc, {
      childName: data.childName || 'N/A',
      parentName: data.parentName || 'N/A',
      gender: data.gender || 'N/A',
      hospitalName: data.hospitalName || 'N/A',
      dateOfBirth: data.dateOfBirth || 'N/A',
      placeOfBirth: data.placeOfBirth || 'N/A',
      address: data.address || 'N/A',
    }, bodyStart);

    drawFooter(doc, data.approvedBy || 'Municipality Officer');

    doc.end();
    stream.on('finish', () => resolve({ filepath, filename, certificateId: certId }));
    stream.on('error', reject);
  });
}

function generateLandCertificate(data) {
  const certId = `LC${Date.now().toString().slice(-6)}`;
  const filename = `land_${certId}.pdf`;
  const filepath = path.join(UPLOADS_DIR, filename);

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    const stream = fs.createWriteStream(filepath);
    doc.pipe(stream);

    const bodyStart = drawGovTemplate(doc, {
      title: 'Land Ownership Certificate',
      titleTamil: 'நில உரிமைச் சான்றிதழ்',
      certId,
      issueDate: data.issueDate || new Date().toLocaleDateString(),
      approvedBy: data.approvedBy || 'Revenue Officer'
    });

    drawKeyValueTable(doc, {
      ownerName: data.ownerName || 'N/A',
      parentName: data.parentName || 'N/A',
      surveyNumber: data.surveyNumber || 'N/A',
      landLocation: data.landLocation || 'N/A',
      taluk: data.taluk || 'N/A',
      district: data.district || 'N/A',
      areaSize: data.areaSize || data.landArea || 'N/A',
      pattaNumber: data.pattaNumber || 'N/A',
      address: data.address || 'N/A',
    }, bodyStart);

    drawFooter(doc, data.approvedBy || 'Revenue Officer');

    doc.end();
    stream.on('finish', () => resolve({ filepath, filename, certificateId: certId }));
    stream.on('error', reject);
  });
}

function generateIncomeCertificate(data) {
  const certId = `IC${Date.now().toString().slice(-6)}`;
  const filename = `income_${certId}.pdf`;
  const filepath = path.join(UPLOADS_DIR, filename);

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    const stream = fs.createWriteStream(filepath);
    doc.pipe(stream);

    const bodyStart = drawGovTemplate(doc, {
      title: 'Income Certificate',
      titleTamil: 'வருமானச் சான்றிதழ்',
      certId,
      issueDate: data.issueDate || new Date().toLocaleDateString(),
      approvedBy: data.approvedBy || 'Revenue Officer'
    });

    drawKeyValueTable(doc, {
      applicantName: data.applicantName || 'N/A',
      parentName: data.parentName || 'N/A',
      annualIncome: data.annualIncome || 'N/A',
      occupation: data.occupation || 'N/A',
      familyMembersCount: data.familyMembersCount || 'N/A',
      address: data.address || 'N/A',
    }, bodyStart);

    drawFooter(doc, data.approvedBy || 'Revenue Officer');

    doc.end();
    stream.on('finish', () => resolve({ filepath, filename, certificateId: certId }));
    stream.on('error', reject);
  });
}

function generateGenericCertificate(documentType, data) {
  const certId = `${documentType.slice(0, 2).toUpperCase()}${Date.now().toString().slice(-6)}`;
  const filename = `${documentType.replace(/\s/g, '_').toLowerCase()}_${certId}.pdf`;
  const filepath = path.join(UPLOADS_DIR, filename);

  const tamilTitleMap = {
    'Building Approval': 'கட்டிடம் அனுமதி',
    'Business License': 'வணிக உரிமம்',
    'New Water Connection': 'புதிய நீர் இணைப்பு',
    'Electricity Connection': 'மின்சார இணைப்பு',
  };

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    const stream = fs.createWriteStream(filepath);
    doc.pipe(stream);

    const bodyStart = drawGovTemplate(doc, {
      title: documentType,
      titleTamil: tamilTitleMap[documentType] || '',
      certId,
      issueDate: data.issueDate || new Date().toLocaleDateString(),
      approvedBy: data.approvedBy || 'Authorized Officer'
    });

    drawKeyValueTable(doc, data || {}, bodyStart);

    drawFooter(doc, data.approvedBy || 'Authorized Officer');

    doc.end();
    stream.on('finish', () => resolve({ filepath, filename, certificateId: certId }));
    stream.on('error', reject);
  });
}

async function generateCertificate(documentType, documentData, approvedBy) {
  const issueDate = new Date().toLocaleDateString();
  const base = { ...documentData, approvedBy, issueDate };

  if (documentType === 'Birth Certificate') return generateBirthCertificate(base);
  if (documentType === 'Land Ownership Certificate') return generateLandCertificate(base);
  if (documentType === 'Income Certificate') return generateIncomeCertificate(base);
  return generateGenericCertificate(documentType, base);
}

module.exports = { generateCertificate, UPLOADS_DIR };