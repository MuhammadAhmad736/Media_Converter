import { CloudDownload } from "lucide-react";

const productLinks = ["Downloader", "Features", "How It Works", "FAQ"];

const companyLinks = ["About", "Contact", "Testimonials"];

const legalLinks = ["Privacy Policy", "Terms of Service", "Copyright & DMCA"];

export default function Footer() {
  return (
    <footer className="relative w-full overflow-hidden bg-background px-4 py-12 sm:px-6 sm:py-14 md:px-8 lg:px-10 lg:py-16">
      <div className="pointer-events-none absolute -right-24 -top-28 hidden h-72 w-72 rounded-full bg-[#E2E8FF] opacity-60 sm:block" />
      <div className="relative mx-auto grid max-w-6xl grid-cols-2 gap-x-5 gap-y-9 sm:gap-x-8 md:grid-cols-[2fr_1fr_1fr_1fr] md:gap-8">
        {/* Brand */}
        <div className="col-span-2 md:col-span-1">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[linear-gradient(145deg,#4B7BFF,#2C4DE2)] shadow-[0_8px_18px_rgba(44,77,226,0.2)]">
              <CloudDownload
                size={18}
                strokeWidth={2.5}
                className="text-white"
              />
            </div>

            <span className="text-base font-bold text-[#0F172A]">
              Media Converter
            </span>
          </div>

          <p className="max-w-70 text-sm leading-6 text-[#5B6472]">
            A simple and convenient video downloading experience designed for
            instant extraction across platforms.
          </p>

          {/* Status */}
          <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-[#B9EDE0] bg-white px-3 py-1.5 shadow-[0_4px_12px_rgba(8,122,91,0.06)]">
            <span className="h-2 w-2 rounded-full bg-[#00B88A]" />

            <span className="text-[10px] font-bold text-[#087A5B]">
              All Systems Operational
            </span>
          </div>
        </div>

        {/* Product */}
        <div>
          <h3 className="mb-4 text-xs font-bold uppercase tracking-[0.12em] text-[#0F172A]">
            Product
          </h3>

          <ul className="space-y-2">
            {productLinks.map((link) => (
              <li key={link}>
                <a
                  href="#"
                  className="text-sm text-[#5B6472] transition-colors hover:translate-x-0.5 hover:text-[#3B6BFF]"
                >
                  {link}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Company */}
        <div>
          <h3 className="mb-4 text-xs font-bold uppercase tracking-[0.12em] text-[#0F172A]">
            Company
          </h3>

          <ul className="space-y-2">
            {companyLinks.map((link) => (
              <li key={link}>
                <a
                  href="#"
                  className="text-sm text-[#5B6472] transition-colors hover:translate-x-0.5 hover:text-[#3B6BFF]"
                >
                  {link}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Legal */}
        <div>
          <h3 className="mb-4 text-xs font-bold uppercase tracking-[0.12em] text-[#0F172A]">
            Legal
          </h3>

          <ul className="space-y-2">
            {legalLinks.map((link) => (
              <li key={link}>
                <a
                  href="#"
                  className="text-sm text-[#5B6472] transition-colors hover:translate-x-0.5 hover:text-[#3B6BFF]"
                >
                  {link}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
