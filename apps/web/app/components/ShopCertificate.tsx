import React, { forwardRef } from "react";
import { QRCodeSVG } from "qrcode.react";

interface ShopCertificateProps {
  shopName: string;
  shopUrl: string;
}

const ShopCertificate = forwardRef<HTMLDivElement, ShopCertificateProps>(
  ({ shopName, shopUrl }, ref) => {
    return (
      <div
        className="fixed top-0 left-0"
        style={{ position: "absolute", left: "-9999px", top: "-9999px" }}
      >
        {/* A4 Size Ratio (210x297mm) -> roughly 794 x 1123 pixels at 96 DPI */}
        <div
          ref={ref}
          className="bg-white text-gray-900 shadow-2xl relative overflow-hidden flex flex-col items-center"
          style={{ width: "794px", height: "1123px", padding: "60px" }}
        >
          {/* Decorative Border */}
          <div className="absolute inset-4 border-[12px] border-emerald-600 rounded-3xl opacity-20 pointer-events-none" />
          <div className="absolute inset-8 border-4 border-emerald-500 rounded-2xl opacity-40 pointer-events-none" />

          {/* Header */}
          <div className="mt-16 text-center space-y-4 z-10">
            <div className="w-24 h-24 mx-auto bg-gradient-to-br from-emerald-500 to-teal-500 rounded-3xl flex items-center justify-center shadow-lg mb-6">
              <span className="text-white text-5xl font-black">प</span>
            </div>
            <h1 className="text-6xl font-black text-emerald-700 tracking-tight">
              Verified
            </h1>
            <h2 className="text-4xl font-extrabold text-gray-800 tracking-wide uppercase">
              Pehchan Wala
            </h2>
          </div>

          {/* Body */}
          <div className="mt-24 text-center z-10 w-full px-12">
            <p className="text-2xl text-gray-500 font-medium mb-6">
              This certifies that
            </p>
            <h3 className="text-5xl font-bold text-gray-900 border-b-4 border-emerald-500 pb-4 inline-block mb-12 max-w-full truncate px-8">
              {shopName}
            </h3>
            <p className="text-xl text-gray-600 leading-relaxed mb-16">
              is a verified local business on the PehchanWale platform, committed to 
              providing quality goods and services to the community.
            </p>
          </div>

          {/* QR Code Section */}
          <div className="mt-auto mb-16 flex flex-col items-center z-10">
            <div className="bg-white p-6 rounded-3xl shadow-xl border-2 border-emerald-100 mb-6">
              <QRCodeSVG
                value={shopUrl}
                size={220}
                level="H"
                fgColor="#047857" /* emerald-700 */
              />
            </div>
            <p className="text-2xl font-bold text-emerald-700">Scan to visit shop</p>
            <p className="text-gray-500 mt-2">{shopUrl}</p>
          </div>

          {/* Footer */}
          <div className="absolute bottom-0 left-0 w-full bg-emerald-600 h-6" />
        </div>
      </div>
    );
  }
);

ShopCertificate.displayName = "ShopCertificate";

export default ShopCertificate;
