import { formatCurrency } from "@/pages/catalog/detail";
import { Asset } from "@/types";
import dayjs from "dayjs";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import "dayjs/locale/id";

interface PrintableAssetProps {
  asset: Asset;
  onClose?: () => void;
  assetImageUrl: string;
  companyLogoUrl: string;
}

const PrintableAsset = ({
  asset,
  onClose,
  assetImageUrl,
  companyLogoUrl,
}: PrintableAssetProps) => {
  const technicalFields = [
    { label: "ID", value: asset.id },
    { label: "Nama", value: asset.name },
    { label: "Merek", value: asset.brand || "-" },
    { label: "Model", value: asset.model || "-" },
    { label: "Kategori", value: asset.category },
    { label: "Sub-Kategori", value: asset.sub_category },
    { label: "No. Seri", value: asset.serial_number || "-" },
    { label: "No. Part", value: asset.part_number || "-" },
    { label: "Div. Pemilik", value: asset.department_owner },
    { label: "Pengguna Utama", value: asset.primary_user },
    {
      label: "Tanggal Penggunaan Pertama",
      value: asset.active_date
        ? dayjs(asset.active_date).locale("id").format("DD MMMM YYYY")
        : "-",
    },
    { label: "Status", value: asset.status },
  ];

  const financialFields = [
    {
      label: "Tanggal Pembelian",
      value: asset.purchase_date
        ? dayjs(asset.active_date).locale("id").format("DD MMMM YYYY")
        : "-",
    },
    { label: "No. Purchase Order", value: asset.purchase_order_number },
    { label: "Vendor", value: asset.vendor_supplier },
    { label: "Garansi", value: asset.warranty },
    { label: "Harga Pembelian", value: formatCurrency(asset.purchase_price) },
    {
      label: "Ekspektasi Umur Guna",
      value: `${asset.expected_lifespan} tahun`,
    },
    { label: "Metode Depresiasi", value: asset.depreciation_method },
    {
      label: "Laju Depresiasi per Tahun",
      value: `${asset.depreciation_rate}%`,
    },
    {
      label: "Nilai Buku Sekarang",
      value: formatCurrency(asset.current_book_value),
    },
  ];

  const generatePdf = async () => {
    try {
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage([595, 842]); // A4 size

      // Improved image loading with format detection
      const loadImage = async (url: string) => {
        try {
          const response = await fetch(url);
          if (!response.ok) throw new Error(`HTTP ${response.status}`);
          const bytes = await response.arrayBuffer();

          // Detect image type from URL or Content-Type
          const contentType = response.headers.get("content-type");
          const isJpeg =
            url.toLowerCase().endsWith(".jpg") ||
            url.toLowerCase().endsWith(".jpeg") ||
            contentType?.includes("jpeg");
          const isPng =
            url.toLowerCase().endsWith(".png") || contentType?.includes("png");

          if (isPng) {
            return await pdfDoc.embedPng(bytes);
          } else if (isJpeg) {
            return await pdfDoc.embedJpg(bytes);
          } else {
            console.warn("Unknown image type, trying PNG then JPEG");
            try {
              return await pdfDoc.embedPng(bytes);
            } catch {
              return await pdfDoc.embedJpg(bytes);
            }
          }
        } catch (e) {
          console.warn(`Failed to load image ${url}:`, e);
          return null;
        }
      };

      const [assetImage, companyLogo] = await Promise.all([
        loadImage(assetImageUrl),
        loadImage(companyLogoUrl),
      ]);

      if (assetImage) {
        page.drawImage(assetImage, {
          x: 50,
          y: 623,
          width: 140,
          height: 140,
        });
      }

      const font = await pdfDoc.embedFont(StandardFonts.Courier);
      const boldFont = await pdfDoc.embedFont(StandardFonts.CourierBold);

      const drawText = (
        text: string,
        x: number,
        y: number,
        size = 12,
        isBold = false,
        color = rgb(0, 0, 0)
      ) => {
        page.drawText(text, {
          x,
          y,
          size,
          font: isBold ? boldFont : font,
          color,
        });
      };

      // Header
      drawText("ASSET DETAILS", 50, 800, 20, true);
      drawText(
        `Dikeluarkan: ${dayjs().locale("id").format("DD MMMM YYYY HH:mm")}`,
        50,
        775,
        10
      );

      // Technical Information (positioned after images)
      drawText("INFORMASI TEKNIS", 50, 600, 16, true, rgb(0.2, 0.4, 0.6));
      let yPosition = 570;

      technicalFields.forEach((field) => {
        drawText(`${field.label}:`, 50, yPosition, 12, true);
        drawText(field.value.toString(), 300, yPosition);
        yPosition -= 20;
      });

      // Financial Information
      yPosition -= 20;
      drawText(
        "INFORMASI FINANSIAL",
        50,
        yPosition,
        16,
        true,
        rgb(0.2, 0.4, 0.6)
      );
      yPosition -= 25;

      financialFields.forEach((field) => {
        drawText(`${field.label}:`, 50, yPosition, 12, true);
        drawText(field.value.toString(), 300, yPosition);
        yPosition -= 20;
      });

      const dragonIconBytes = await fetch("/dragon.png").then((res) =>
        res.arrayBuffer()
      );
      const dragonImage = await pdfDoc.embedPng(dragonIconBytes);
      page.drawImage(dragonImage, {
        x: page.getWidth() - 40,
        y: 20,
        width: 20,
        height: 20,
        opacity: 0.3,
      });

      const pdfBytes = await pdfDoc.save();
      // @ts-ignore
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `Asset_${asset.id}_${dayjs()
        .locale("id")
        .format("DDMMYYYY")}.pdf`;
      document.body.appendChild(link);
      link.click();

      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 100);
    } catch (error) {
      console.error("Error generating PDF:", error);
    }
  };

  return (
    <div className="p-6 bg-gray-800 border-2 border-amber-400 rounded-lg shadow-lg max-w-4xl mx-auto font-mono text-amber-300">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold tracking-wider border-b-2 border-amber-400 pb-2">
            PRINTABLE ASSET DETAILS
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-1 gap-8">
        <div>
          <div className="mb-4">
            <img
              src={assetImageUrl}
              alt="Asset"
              className="w-full max-h-48 object-contain border-2 border-amber-400"
            />
          </div>
          <h2 className="text-xl font-bold mb-4 pb-2 border-b border-amber-400">
            Informasi Teknis
          </h2>
          {/* todo -- ganti bahasa indonesia */}
          <div className="space-y-3">
            {technicalFields.map((field) => (
              <div
                key={field.label}
                className="flex justify-between gap-4 text-sm"
              >
                <span className="font-bold">{field.label}: </span>
                <span className="text-right">{field.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-xl font-bold mb-4 pb-2 border-b border-amber-400">
            Informasi Finansial
          </h2>
          <div className="space-y-3">
            {financialFields.map((field) => (
              <div
                key={field.label}
                className="flex justify-between gap-4 text-sm"
              >
                <span className="font-bold">{field.label}: </span>
                <span className="text-right">{field.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="my-8 text-sm text-amber-400">
        <p>
          Dokumen dikeluarkan pada:{" "}
          {dayjs().locale("id").format("DD MMMM YYYY HH:mm")}
        </p>
      </div>

      <div className="flex gap-2">
        <button
          onClick={generatePdf}
          className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-black border-2 border-amber-500 font-bold transition-all"
        >
          Download PDF
        </button>
        {onClose && (
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-amber-300 border-2 border-amber-400 font-bold transition-all"
          >
            Close
          </button>
        )}
      </div>
    </div>
  );
};

export default PrintableAsset;
