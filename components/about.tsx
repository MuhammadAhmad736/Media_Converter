import {
  Check,
  CloudDownload,
} from "lucide-react";

const points = [
  {
    title: "Privacy First Architecture",
    description:
      "We never store copies of your downloaded media files or track your browser history.",
    active: true,
  },
  {
    title: "Continuous Engine Updates",
    description:
      "Our scrapers update continuously to guarantee zero downtime whenever video platforms change.",
    active: false,
  },
  {
    title: "Pure Consumer Polish",
    description:
      "An uncluttered SaaS experience without flashing advertisements, timers, or deceptive links.",
    active: false,
  },
];

export default function about() {
  return (
    <section id="about" data-nav-section="About" className="w-full bg-background px-4 py-14 sm:px-6 sm:py-16 md:px-8 md:py-20 lg:px-10 lg:py-24">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-8 lg:flex-row lg:justify-between lg:gap-12">

        {/* Left Content */}
        <div className="w-full min-w-0 lg:max-w-[55%]">

          {/* Small Heading */}
          <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.15em] text-[#3B6BFF]">
            OUR PHILOSOPHY
          </p>

          {/* Main Heading */}
          <h2 className="mb-5 text-2xl font-bold tracking-tight text-[#0F172A] sm:text-3xl md:text-4xl">
            About Media Converter
          </h2>

          {/* Description */}
          <p className="mb-6 text-sm leading-7 text-[#5B6472] sm:text-base">
            MediaConverter is designed to make saving supported online videos simple
            and convenient. Instead of navigating through complicated interfaces
            or risking untrustworthy popups, users can paste a video link and
            access the available download options from one clean tool.
          </p>

          {/* Points */}
          <div className="stagger-children space-y-4">
            {points.map((point) => (
              <div
                key={point.title}
                className="flex items-start gap-3"
              >
                {/* Check Icon */}
                <div
                  className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                    point.active
                      ? "bg-[#00E5B0]"
                      : "bg-[#DCE5FF]"
                  }`}
                >
                  <Check
                    size={10}
                    strokeWidth={3}
                    className={
                      point.active
                        ? "text-[#063B32]"
                        : "text-[#3B6BFF]"
                    }
                  />
                </div>

                {/* Text */}
                <div>
                  <h3 className="text-sm font-bold text-[#0F172A]">
                    {point.title}
                  </h3>

                  <p className="mt-1 text-xs leading-5 text-[#5B6472] sm:text-sm">
                    {point.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Illustration Card */}
        <div className="group relative hidden min-h-[250px] w-full max-w-[360px] flex-col items-center justify-center overflow-hidden rounded-2xl border border-[#DCE5FF] bg-[linear-gradient(145deg,#F4F7FF_0%,#E8EEFF_100%)] px-5 py-7 shadow-[0_20px_50px_rgba(65,116,255,0.12)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(65,116,255,0.18)] lg:flex lg:min-h-[290px] lg:rounded-[24px] lg:px-6 lg:py-8">

          <div className="pointer-events-none absolute -right-16 -top-16 hidden h-40 w-40 rounded-full bg-[#DCE5FF] opacity-70 transition-transform duration-700 group-hover:scale-125 sm:block" />

          {/* Cloud Illustration */}
          <div className="relative mb-7 flex h-[125px] w-[125px] items-center justify-center transition-transform duration-500 group-hover:scale-105">

            {/* Dashed Circle */}
            <div className="absolute inset-0 rounded-full border border-dashed border-[#B9CBFF] "  />

            {/* Cloud */}
            <div className="relative flex h-14 w-16 items-center justify-center rounded-full bg-[#B9CCF7] shadow-[0_10px_24px_rgba(7,93,229,0.18)]">
              <CloudDownload
                size={27}
                strokeWidth={2.5}
                className="text-[#075DE5]"
              />
            </div>

            {/* Top Right Dot */}
            <div className="absolute right-[5px] top-[27px] h-[18px] w-[18px] rounded-full bg-[#087A5B]" />

            {/* Left Dot */}
            <div className="absolute left-[3px] top-[27px] h-[18px] w-[18px] rounded-full bg-[#075DE5]" />

            {/* Bottom Dot */}
            <div className="absolute bottom-[2px] left-1/2 h-[18px] w-[18px] -translate-x-1/2 rounded-full bg-[#075DE5]" />
          </div>

          {/* Card Text */}
          <h3 className="text-center text-base font-bold text-[#0F172A]">
            Safe, Streamlined Cloud Parser
          </h3>

          <p className="mt-2 max-w-[230px] text-center text-xs leading-5 text-[#5B6472]">
            Direct stream retrieval straight to your local storage.
          </p>
        </div>

      </div>
    </section>
  );
}