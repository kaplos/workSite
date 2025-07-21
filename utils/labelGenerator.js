import PDFDocument from 'pdfkit';
import bwipjs from 'bwip-js';
import fs from 'fs';

async function generateQRLabels(skuList, outputPath = 'labels.pdf') {
    const labelWidth = 2 * 72;  // 2 inches in points
    const labelHeight = 1 * 72; // 1 inch in points
    const margin = 5;

    const doc = new PDFDocument({ autoFirstPage: false });
    const stream = fs.createWriteStream(outputPath);
    doc.pipe(stream);

    for (const { sku, qty } of skuList) {
        for (let i = 0; i < qty; i++) {
            // Generate QR code buffer
            const qrBuffer = await bwipjs.toBuffer({
                bcid: 'qrcode',
                text: sku,
                scale: 2, // smaller QR code size
                includetext: false,
                padding: 0
            });

            doc.addPage({ size: [labelWidth, labelHeight], margin: 0 });

            const qrSize = 40; // Fixed QR code size in points
            const textWidth = doc.widthOfString(sku, { size: 12 });
            const blockWidth = qrSize + 10 + textWidth; // QR + padding + text
            const blockHeight = Math.max(qrSize, 12); // tallest element

            // Center block
            const blockX = (labelWidth - blockWidth) / 2;
            const blockY = (labelHeight - blockHeight) / 2;

            // Draw QR code
            doc.image(qrBuffer, blockX, blockY, { width: qrSize, height: qrSize });

            // Draw SKU text next to QR code
            doc.fontSize(12)
               .text(sku, blockX + qrSize + 10, blockY + (qrSize - 12) / 2);

        }
    }

    doc.end();

    stream.on('finish', () => {
        console.log(`QR code labels saved as ${outputPath}`);
    });
}

// Example usage:
const skuArray = [
  { sku: "ssr-tie-927", qty: 14 },
  { sku: "ssr-tie-928", qty: 11 },
  { sku: "ssr-tie-929", qty: 12 },
  { sku: "ssr-tie-930", qty: 15 },
  { sku: "ssr-tie-931", qty: 6 },
  { sku: "ssr-tie-932", qty: 4 },
  { sku: "ssr-tie-933", qty: 5 },
  { sku: "ssr-tie-934", qty: 3 },
  { sku: "ssr-tie-935", qty: 3 },
  { sku: "ssr-tie-936", qty: 3 },
  { sku: "ssr-tie-937", qty: 3 },
  { sku: "ssr-tie-938", qty: 3 },
  { sku: "ssr-tie-939", qty: 3 },
  { sku: "ssr-tie-940", qty: 5 },
  { sku: "ssr-tie-941", qty: 17 },
  { sku: "ssr-tie-942", qty: 13 },
  { sku: "ssr-tie-943", qty: 6 },
  { sku: "ssr-tie-944", qty: 13 },
  { sku: "ssr-tie-945", qty: 6 },
  { sku: "ssr-tie-946", qty: 10 },
  { sku: "ssr-tie-947", qty: 6 },
  { sku: "ssr-tie-948", qty: 3 },
  { sku: "ssr-tie-949", qty: 4 },
  { sku: "ssr-tie-950", qty: 4 },
  { sku: "ssr-tie-951", qty: 5 },
  { sku: "ssr-tie-952", qty: 7 },
  { sku: "ssr-tie-953", qty: 4 },
  { sku: "ssr-tie-954", qty: 5 },
  { sku: "ssr-tie-955", qty: 8 },
  { sku: "ssr-tie-956", qty: 12 },
  { sku: "ssr-tie-957", qty: 11 },
  { sku: "ssr-tie-958", qty: 4 },
  { sku: "ssr-tie-959", qty: 12 },
  { sku: "ssr-tie-960", qty: 5 },
  { sku: "ssr-tie-961", qty: 10 },
  { sku: "ssr-tie-962", qty: 6 },
  { sku: "ssr-tie-963", qty: 4 },
  { sku: "ssr-tie-964", qty: 9 },
  { sku: "ssr-tie-965", qty: 6 },
  { sku: "ssr-tie-966", qty: 10 },
  { sku: "ssr-tie-967", qty: 6 },
  { sku: "ssr-tie-968", qty: 4 },
  { sku: "ssr-tie-969", qty: 12 },
  { sku: "ssr-tie-970", qty: 10 },
  { sku: "ssr-tie-971", qty: 8 },
  { sku: "ssr-tie-972", qty: 15 },
  { sku: "ssr-tie-973", qty: 13 },
  { sku: "ssr-tie-974", qty: 10 },
  { sku: "ssr-tie-975", qty: 12 },
  { sku: "ssr-tie-976", qty: 6 },
  { sku: "ssr-tie-977", qty: 9 },
  { sku: "ssr-tie-978", qty: 5 },
  { sku: "ssr-tie-979", qty: 5 },
  { sku: "ssr-tie-980", qty: 6 },
  { sku: "ssr-tie-981", qty: 7 },
  { sku: "ssr-tie-982", qty: 5 },
  { sku: "ssr-tie-983", qty: 8 },
  { sku: "ssr-tie-984", qty: 11 },
  { sku: "ssr-tie-985", qty: 5 },
  { sku: "ssr-tie-986", qty: 12 },
  { sku: "ssr-tie-987", qty: 6 },
  { sku: "ssr-tie-989", qty: 7 },
  { sku: "ssr-tie-990", qty: 9 },
  { sku: "ssr-tie-991", qty: 4 },
  { sku: "ssr-tie-992", qty: 3 },
  { sku: "ssr-tie-993", qty: 4 },
  { sku: "ssr-tie-994", qty: 3 },
  { sku: "ssr-tie-995", qty: 3 },
  { sku: "ssr-tie-996", qty: 3 },
  { sku: "ssr-tie-997", qty: 2 },
  { sku: "ssr-tie-998", qty: 3 },
  { sku: "ssr-tie-999", qty: 3 },
  { sku: "ssr-tie-1000", qty: 2 },
  { sku: "ssr-tie-1001", qty: 2 },
  { sku: "ssr-tie-1002", qty: 2 },
  { sku: "ssr-tie-1003", qty: 3 },
  { sku: "ssr-tie-1004", qty: 3 },
  { sku: "ssr-tie-1005", qty: 3 },
  { sku: "ssr-tie-1006", qty: 3 },
  { sku: "ssr-tie-1007", qty: 2 },
  { sku: "ssr-tie-1008", qty: 2 },
  { sku: "ssr-tie-1009", qty: 1 },
  { sku: "ssr-tie-1010", qty: 1 },
  { sku: "ssr-tie-1011", qty: 1 },
  { sku: "ssr-tie-1012", qty: 1 },
  { sku: "ssr-tie-1013", qty: 1 },
  { sku: "ssr-tie-1014", qty: 1 },
  { sku: "ssr-tie-1015", qty: 1 },
  { sku: "ssr-tie-1016", qty: 1 },
  { sku: "ssr-tie-1017", qty: 1 },
  { sku: "ssr-tie-1018", qty: 1 },
  { sku: "ssr-tie-1019", qty: 1 },
  { sku: "ssr-tie-1020", qty: 1 },
  { sku: "ssr-tie-1021", qty: 1 },
  { sku: "ssr-tie-1022", qty: 1 },
  { sku: "ssr-tie-1023", qty: 1 },
  { sku: "ssr-tie-1024", qty: 1 },
  { sku: "ssr-tie-1025", qty: 1 },
  { sku: "ssr-tie-1026", qty: 1 },
];

generateQRLabels(skuArray, "labels.pdf");
