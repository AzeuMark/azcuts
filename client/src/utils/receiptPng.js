import html2canvas from 'html2canvas';

export async function downloadReceiptPng(element, filename = 'azcuts-receipt.png') {
  const canvas = await html2canvas(element, { scale: 2, useCORS: true });
  const link = document.createElement('a');
  link.download = filename;
  link.href = canvas.toDataURL('image/png');
  link.click();
}
