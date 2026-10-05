import {
  Copy,
  ClipboardPaste,
  CloudDownload,
} from "lucide-react";

const steps = [
  {
    number: "01",
    icon: Copy,
    title: "Copy the Video Link",
    description:
      "Copy the URL of the video you want to download from your browser or mobile app share sheet.",
  },
  {
    number: "02",
    icon: ClipboardPaste,
    title: "Paste the Link",
    description:
      "Paste the video URL into the downloader above and let our engine automatically process the stream.",
  },
  {
    number: "03",
    icon: CloudDownload,
    title: "Download Your Video",
    description:
      "Choose your preferred format or quality and download directly to your smartphone, tablet, or PC.",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" data-nav-section="How It Works" className="w-full bg-background px-4 py-14 sm:px-6 sm:py-16 md:px-8 md:py-20 lg:px-10 lg:py-24">
      <div className="mx-auto max-w-6xl">

        {/* Heading */}
        <div className="mx-auto mb-8 max-w-2xl text-center sm:mb-10">
          <p className="mb-2 text-[9px] font-bold uppercase tracking-[0.18em] text-[#3B6BFF]">
            SIMPLE 3-STEP PROCESS
          </p>

          <h2 className="text-2xl font-bold tracking-tight text-[#0F172A] sm:text-3xl md:text-4xl">
            How It Works
          </h2>

          <p className="mt-3 text-sm leading-6 text-[#5B6472] md:text-base">
            Download your favorite videos in three simple, frictionless steps
            right from your browser.
          </p>
        </div>

        {/* Steps */}
        <div className="stagger-children grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-3">
          {steps.map((step) => {
            const Icon = step.icon;

            return (
              <div
                key={step.number}
                className={`group relative min-h-[190px] rounded-xl border border-[#E2E8FF] bg-white p-3 shadow-[0_8px_22px_rgba(65,116,255,0.04)] transition-all duration-300 hover:-translate-y-1 hover:border-[#C9D6FF] hover:shadow-[0_16px_30px_rgba(65,116,255,0.1)] sm:rounded-2xl sm:p-6 ${step.number === "03" ? "mx-auto w-full md:col-span-2 md:max-w-2xl lg:col-span-1 lg:max-w-none" : ""}`}
              >
                {/* Number */}
                <span className="absolute right-4 top-4 text-lg font-medium text-[#B7C5F5]">
                  {step.number}
                </span>

                {/* Icon */}
                <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-[#E8EFFF] transition-colors group-hover:bg-[#DCE5FF]">
                  <Icon
				    
                    size={24}
                    strokeWidth={2}
                    className="text-[#4174FF]"
                  />
                </div>

                {/* Content */}
                <h3 className="mb-2 text-sm font-bold text-[#0F172A] sm:text-base">
                  {step.title}
                </h3>

                <p className="max-w-prose text-xs leading-5 text-[#5B6472] sm:text-sm sm:leading-6">
                  {step.description}
                </p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}