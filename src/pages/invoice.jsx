import { useState, useRef } from "react";
import html2pdf from "html2pdf.js";

export default function InvoicePage() {
  const [invoiceData, setInvoiceData] = useState({
    invoiceNo: `HS-${new Date().getFullYear()}${Math.floor(100 + Math.random() * 900)}`,
    invoiceDate: new Date().toLocaleDateString(),
    clientName: "",
    clientPhone: "",
    clientEmail: "",
    clientAddress: "",
    description: "",
    areaNo: 1,
    ratePerHour: 0,
    total: 0,
    hours: 0,
    parkingFee: 0,
    serviceNotes: "",
  });

  const invoiceRef = useRef();

  const handleDownload = () => {
    html2pdf().from(invoiceRef.current).save();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setInvoiceData({ ...invoiceData, [name]: value });
  };

  const calculateTotals = () => {
    const serviceTotal = invoiceData.areaNo * invoiceData.ratePerHour;
    const grandTotal = serviceTotal + Number(invoiceData.parkingFee);
    return { serviceTotal, grandTotal };
  };

  const { serviceTotal, grandTotal } = calculateTotals();

  return (
    <div className="p-6">
      {/* Form Section */}
      <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
        <input name="clientName" placeholder="Client Name" onChange={handleChange} className="border p-2" />
        <input name="clientPhone" placeholder="Client Phone" onChange={handleChange} className="border p-2" />
        <input name="clientEmail" placeholder="Client Email" onChange={handleChange} className="border p-2" />
        <input name="clientAddress" placeholder="Client Address" onChange={handleChange} className="border p-2" />
        <input name="description" placeholder="Service Description" onChange={handleChange} className="border p-2" />
        <input name="areaNo" placeholder="Area No" type="number" onChange={handleChange} className="border p-2" />
        <input name="ratePerHour" placeholder="Rate/Hour" type="number" onChange={handleChange} className="border p-2" />
        <input name="hours" placeholder="Hours" type="number" onChange={handleChange} className="border p-2" />
        <input name="parkingFee" placeholder="Parking Fee" type="number" onChange={handleChange} className="border p-2" />
        <textarea name="serviceNotes" placeholder="Service Notes" onChange={handleChange} className="border p-2 col-span-1 md:col-span-2" />
      </div>

      <button onClick={handleDownload} className="mb-6 px-4 py-2 bg-blue-600 text-white rounded">
        Download PDF
      </button>

      {/* Invoice Preview Section */}
      <div ref={invoiceRef} className="p-8 border max-w-4xl mx-auto text-gray-800">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold">HARBOURSPARKLE.COM</h1>
          <p>+61 452 548 451 | harboursparkle@gmail.com</p>
          <p>11 Webb Street, Riverwood, Sydney, Australia</p>
        </div>

        <h2 className="text-xl font-semibold mb-4">INVOICE</h2>

        <div className="mb-6">
          <p><strong>Invoice To:</strong> {invoiceData.clientName}</p>
          <p>{invoiceData.clientPhone}</p>
          <p>{invoiceData.clientEmail}</p>
          <p>{invoiceData.clientAddress}</p>
          <p><strong>Date:</strong> {invoiceData.invoiceDate}</p>
          <p><strong>Invoice No:</strong> {invoiceData.invoiceNo}</p>
        </div>

        <table className="w-full text-left mb-6">
          <thead>
            <tr>
              <th className="border px-2 py-1">DESCRIPTION</th>
              <th className="border px-2 py-1">AREA NO</th>
              <th className="border px-2 py-1">RATE/HR</th>
              <th className="border px-2 py-1">TOTAL</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border px-2 py-1">{invoiceData.description}</td>
              <td className="border px-2 py-1">{invoiceData.areaNo}</td>
              <td className="border px-2 py-1">${invoiceData.ratePerHour}</td>
              <td className="border px-2 py-1">${serviceTotal.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>

        <div className="mb-4">
          <p><strong>Service Total:</strong> ${serviceTotal.toFixed(2)}</p>
          <p><strong>Parking Fee:</strong> ${invoiceData.parkingFee}</p>
          <p className="text-lg font-bold">GRAND TOTAL: ${grandTotal.toFixed(2)}</p>
        </div>

        <div className="mb-4">
          <h3 className="font-semibold">Payment Info:</h3>
          <p>Account Name: Nabin Siwakoti</p>
          <p>Bank Name: Commonwealth Bank</p>
          <p>BSB: 062-256</p>
          <p>Account Number: 11521128</p>
        </div>

        <div className="mb-4">
          <h3 className="font-semibold">Service Notes:</h3>
          <p>{invoiceData.serviceNotes}</p>
        </div>

        <div className="text-center mt-8">
          <p>Thank you for business with us!</p>
          <p>Please send payment within 30 days.</p>
          <p>10% interest will be charged on late invoices.</p>
        </div>

        <div className="text-right mt-8">
          <p className="font-bold">Unique Shiwakoti</p>
          <p>Administrator</p>
        </div>
      </div>
    </div>
  );
}
