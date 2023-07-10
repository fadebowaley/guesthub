const fs = require("fs");
const PDFDocument = require("pdfkit");
const path = require('path');


// function to generate Booking Receipt
function generateReceipt(guest, filteredReservations, itemId) {
  const doc = new PDFDocument({ size: 'A5', layout: 'landscape', margin: 15 });  

  // Generate the first copy of the receipt
  generateContent(doc, guest, filteredReservations);
  generateWaterMarks(doc, 'Official Copy')
  
  // Add a new page for the second copy of the receipt
  doc.addPage();
  
  // Generate the second copy of the receipt
  generateContent(doc, guest, filteredReservations);
  generateWaterMarks(doc, 'Customers Copy')

  // Save the PDF
  const filePath = path.join(__dirname, '..', 'documents', `${itemId}.pdf`);
  doc.pipe(fs.createWriteStream(filePath));
  doc.end();
}


function generateContent(doc, guest, filteredReservations) {
    //genenerate Header
  generateHeader(doc, filteredReservations);
//generate Tables 
  generateGuestDetails(doc, guest, filteredReservations);  
 //generate Room Tables 
  generateRoomDetails(doc, filteredReservations);
  //Generate Document
  generateFooter(doc);  
}
//function to generate Header
function generateHeader( doc, filteredReservations) {
  // Load and add logo
  doc.image("documents/crm2logo.jpg", 30, 30, { width: 50 });

  // Set font styles and header text
  doc.font('Helvetica-Bold').fontSize(20).text('The Redeemed Christian Church of God', { align: 'center' });
  doc.font('Helvetica').fontSize(16).text('CRM Hospitality Unit', { align: 'center' });
 
  // Add title header and format
  doc.fillColor('black').rect(100, 60, 400, 30).fill('blue');
  doc.font('Helvetica-Bold').fontSize(18).fillColor('white').text(`${filteredReservations[0].room_type.hotel.name}`, 50, 70, { align: 'center' });

  // Add address and contact details
  doc.font('Helvetica').fontSize(10).fillColor('black').text(`${filteredReservations[0].room_type.hotel.address} ${filteredReservations[0].room_type.hotel.city}, ${filteredReservations[0].room_type.hotel.state}, ${filteredReservations[0].room_type.hotel.zip}`, 50, 98, { align: 'center' });
  doc.font('Helvetica').fontSize(10).fillColor('black').text(`Tel: ${filteredReservations[0].room_type.hotel.phone} email:  ${filteredReservations[0].room_type.hotel.email}, web: ${filteredReservations[0].room_type.hotel.website}`, 50, 110, { align: 'center' });

}

function generateGuestDetails(doc, guest, filteredReservations) {

     // Add a bigger table to encompass guest details and date booked
  const bigTable = {
    x: 50,
    y: 130,
    rowHeight: 20,
    colWidth: 450,
  };

  // Add table for guest details inside the bigger table
  const guestTable = {
    x: bigTable.x,
    y: bigTable.y,
    rowHeight: bigTable.rowHeight,
    colWidth: bigTable.colWidth / 2,
  };

  doc.font('Helvetica-Bold').fontSize(12).text('Guest Details', guestTable.x, guestTable.y);
  doc.rect(guestTable.x, guestTable.y + 20, guestTable.colWidth, guestTable.rowHeight * 3).stroke();
  doc.lineWidth(0.5);
  doc.moveTo(guestTable.x, guestTable.y + 40).lineTo(guestTable.x + guestTable.colWidth, guestTable.y + 40).stroke();
  doc.moveTo(guestTable.x, guestTable.y + 60).lineTo(guestTable.x + guestTable.colWidth, guestTable.y + 60).stroke();
  doc.font('Helvetica-Bold').fontSize(10).text('Name:', guestTable.x + 10, guestTable.y + 30);
  doc.font('Helvetica-Bold').fontSize(10).text('Purpose:', guestTable.x + 10, guestTable.y + 50);
  doc.font('Helvetica-Bold').fontSize(10).text('Identification:', guestTable.x + 10, guestTable.y + 70);
  doc.font('Helvetica').fontSize(10).text(`${guest.first_name} ${guest.last_name}`, guestTable.x + 110, guestTable.y + 30);
  doc.font('Helvetica').fontSize(10).text(`${guest.purpose}`, guestTable.x + 110, guestTable.y + 50);
  doc.font('Helvetica').fontSize(10).text(`${guest.identification}`, guestTable.x + 110, guestTable.y + 70);


  const formatDate = (dateString) => new Date(dateString).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }).replace(/\d+/, (day) => day + (["th", "st", "nd", "rd"][(day - 1) % 10 > 3 ? 0 : (day - 1) % 10] || "th"));
  const checkInDate = formatDate(filteredReservations[0].check_in_date);
  const checkOutDate = formatDate(filteredReservations[0].check_out_date);
  // Add table for date booked inside the bigger table
  const dateTable = {
    x: bigTable.x + bigTable.colWidth / 2,
    y: bigTable.y,
    rowHeight: bigTable.rowHeight,
    colWidth: bigTable.colWidth / 2,
  };

  doc.font('Helvetica-Bold').fontSize(12).text('Booking Details', dateTable.x, dateTable.y);
  doc.rect(dateTable.x, dateTable.y + 20, dateTable.colWidth, dateTable.rowHeight * 3).stroke();
  doc.lineWidth(0.5);
  doc.moveTo(dateTable.x, dateTable.y + 40).lineTo(dateTable.x + dateTable.colWidth, dateTable.y + 40).stroke();
  doc.moveTo(dateTable.x, dateTable.y + 60).lineTo(dateTable.x + dateTable.colWidth, dateTable.y + 60).stroke();
  doc.font('Helvetica-Bold').fontSize(10).text('Room Category:', dateTable.x + 10, dateTable.y + 30);
  doc.font('Helvetica').fontSize(10).text(`${filteredReservations[0].room_type.name}`, dateTable.x + 110, dateTable.y + 30);
  doc.font('Helvetica-Bold').fontSize(10).text('Check-In', dateTable.x + 10, dateTable.y + 50);
  doc.font('Helvetica-Bold').fontSize(10).text('Check-out:', dateTable.x + 10, dateTable.y + 70);
  doc.font('Helvetica').fontSize(10).text(checkInDate, dateTable.x + 110, dateTable.y + 50);
  doc.font('Helvetica').fontSize(10).text(checkOutDate, dateTable.x + 110, dateTable.y + 70);
}

function generateRoomDetails(doc, filteredReservations) {  
  
     // Add a bigger table to encompass guest details and date booked
  const bigTable = {
    x: 50,
    y: 130,
    rowHeight: 20,
    colWidth: 450,
  };

  const roomIDs = filteredReservations.map((reservation) => reservation.room_id.roomID);
  const numRooms = roomIDs.length;
  
// Add a new table for room details
const roomTable = {
  x: bigTable.x,
  y: bigTable.y + 90, // Adjust the y-coordinate for the new table
  rowHeight: bigTable.rowHeight,
  colWidth: bigTable.colWidth / 3,
};

doc.font('Helvetica-Bold').fontSize(12).text(`${numRooms} Room Details`, roomTable.x, roomTable.y);

// Draw table border
doc.lineWidth(1).rect(roomTable.x, roomTable.y + 20, roomTable.colWidth * 3, roomTable.rowHeight + roomIDs.length * roomTable.rowHeight).stroke();

// Draw table header
doc.rect(roomTable.x, roomTable.y + 20, roomTable.colWidth, roomTable.rowHeight).fillAndStroke('blue', 'black');
doc.rect(roomTable.x + roomTable.colWidth, roomTable.y + 20, roomTable.colWidth, roomTable.rowHeight).fillAndStroke('blue', 'black');
doc.rect(roomTable.x + roomTable.colWidth * 2, roomTable.y + 20, roomTable.colWidth, roomTable.rowHeight).fillAndStroke('blue', 'black');
doc.lineWidth(1).moveTo(roomTable.x, roomTable.y + 20 + roomTable.rowHeight).lineTo(roomTable.x + roomTable.colWidth * 3, roomTable.y + 20 + roomTable.rowHeight).stroke();
doc.lineWidth(1).moveTo(roomTable.x + roomTable.colWidth, roomTable.y + 20).lineTo(roomTable.x + roomTable.colWidth, roomTable.y + 20 + roomTable.rowHeight).stroke();
doc.lineWidth(1).moveTo(roomTable.x + roomTable.colWidth * 2, roomTable.y + 20).lineTo(roomTable.x + roomTable.colWidth * 2, roomTable.y + 20 + roomTable.rowHeight).stroke();
doc.font('Helvetica-Bold').fontSize(10).fillColor('white').text('SN', roomTable.x + 10, roomTable.y + 30);
doc.font('Helvetica-Bold').fontSize(10).fillColor('white').text('Room Number', roomTable.x + roomTable.colWidth + 10, roomTable.y + 30);
doc.font('Helvetica-Bold').fontSize(10).fillColor('white').text('Room Type', roomTable.x + roomTable.colWidth * 2 + 10, roomTable.y + 30);

// Draw table rows
let currentRow = roomTable.y + 21 + roomTable.rowHeight;
let sn = 1;
roomIDs.forEach((roomID, index) => {
  const roomNumber = `Room ${roomID}`;
  const roomType = filteredReservations[index].room_type.name;

  // Draw row lines
  doc.lineWidth(1).moveTo(roomTable.x, currentRow).lineTo(roomTable.x + roomTable.colWidth * 3, currentRow).stroke();

  // Draw column lines
  doc.lineWidth(1).moveTo(roomTable.x + roomTable.colWidth, roomTable.y + 20).lineTo(roomTable.x + roomTable.colWidth, currentRow + roomTable.rowHeight).stroke();
  doc.lineWidth(1).moveTo(roomTable.x + roomTable.colWidth * 2, roomTable.y + 20).lineTo(roomTable.x + roomTable.colWidth * 2, currentRow + roomTable.rowHeight).stroke();

  doc.font('Helvetica').fontSize(10).fillColor('black').text(sn, roomTable.x + 10, currentRow + 5);
  doc.font('Helvetica').fontSize(10).fillColor('black').text(roomNumber, roomTable.x + roomTable.colWidth + 10, currentRow + 5);
  doc.font('Helvetica').fontSize(10).fillColor('black').text(roomType, roomTable.x + roomTable.colWidth * 2 + 10, currentRow + 5);
  currentRow += roomTable.rowHeight;
  sn++;
});

// Draw table bottom line
doc.lineWidth(1).moveTo(roomTable.x, currentRow).lineTo(roomTable.x + roomTable.colWidth * 3, currentRow).stroke();
doc.lineWidth(1).moveTo(roomTable.x, roomTable.y + 20).lineTo(roomTable.x, currentRow).stroke();
doc.lineWidth(1).moveTo(roomTable.x + roomTable.colWidth, roomTable.y + 20).lineTo(roomTable.x + roomTable.colWidth, currentRow).stroke();
doc.lineWidth(1).moveTo(roomTable.x + roomTable.colWidth * 2, roomTable.y + 20).lineTo(roomTable.x + roomTable.colWidth * 2, currentRow).stroke();
doc.lineWidth(1).moveTo(roomTable.x + roomTable.colWidth * 3, roomTable.y + 20).lineTo(roomTable.x + roomTable.colWidth * 3, currentRow).stroke();
}

function generateWaterMarks(doc, watermarkText) {
  const watermarkOpacity = 0.4; // Adjust the opacity as needed
  const watermarkSize = 50; // Adjust the size as needed
  const watermarkMargin = 45; // Adjust the margin as needed

  // Calculate the position for watermark
  const centerX = (doc.page.width - watermarkMargin) / 7;
  const centerY = (doc.page.height - watermarkMargin) / 2;

  // Add watermark
  doc.fillColor('lightgrey')
    .fontSize(watermarkSize)
    .opacity(watermarkOpacity)
    .text(watermarkText, centerX, centerY, {
      align: 'center',
      valign: 'center',
      opacity: watermarkOpacity,
      rotate: 35,
      bold: true
    });
}

function generateFooter(doc){
    // Add footer
  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
  });

  const footerText = `Generated by CRM Hospitality Unit on ${formattedDate}`;
  const footerWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
  const footerX = doc.page.margins.left;
  const footerY = doc.page.height - doc.page.margins.bottom - 20; // Adjust the Y position as needed

  doc.fontSize(10).text(footerText, footerX, footerY, {
    align: 'center',
    width: footerWidth,
  });
};



module.exports = generateReceipt;
