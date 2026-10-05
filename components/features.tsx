import {
  Gauge,
  Layers,
  Link2,
  Video,
  MonitorSmartphone,
  FileVideo,
} from "lucide-react";

const features = [
  {
    icon: Gauge,
    title: "Fast Downloads",
    description:
      "Quickly process supported video links with lightning-fast cloud conversion and multi-thread delivery.",
  },
  {
    icon: Layers,
    title: "Multiple Platforms",
    description:
      "One downloader for multiple popular platforms including YouTube, Instagram, Facebook, and TikTok.",
  },
  {
    icon: Link2,
    title: "Easy to Use",
    description:
      "No complicated settings or technical knowledge required. Just paste your link and hit download.",
  },
  {
    icon: Video,
    title: "Multiple Qualities",
    description:
      "Select available video quality options from crisp 4K and 1080p Full HD down to lightweight 480p and audio.",
  },
  {
    icon: MonitorSmartphone,
    title: "Mobile Friendly",
    description:
      "Designed to work smoothly on iOS Safari, Android Chrome, and all desktop browsers with zero app installs.",
  },
  {
    icon: FileVideo,
    title: "Simple Interface",
    description:
      "No unnecessary clutter, intrusive popups, or confusing fake download buttons. Pure clean utility.",
  },
];

export default function Features() {
  return (
    <section id="features" data-nav-section="Features" className="w-full bg-background px-4 py-14 sm:px-6 sm:py-16 md:px-8 md:py-20 lg:px-10 lg:py-24">
      <div className="mx-auto max-w-6xl">

        {/* Heading */}
        <div className="mx-auto mb-8 max-w-3xl text-center sm:mb-10">
          <p className="mb-2 text-[9px] font-bold uppercase tracking-[0.18em] text-[#3B6BFF]">
            ENGINEERED FOR PERFORMANCE
          </p>

          <h2 className="text-2xl font-bold tracking-tight text-[#0F172A] sm:text-3xl md:text-4xl">
            Everything You Need in One Simple Tool
          </h2>

          <p className="mt-3 text-sm leading-6 text-[#5B6472] md:text-base">
            Engineered for speed, compatibility, and pristine video quality
            with zero clutter or annoying redirects.
          </p>
        </div>

        {/* Feature Cards */}
        <div className="stagger-children grid grid-cols-2 gap-2 sm:gap-4 lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;

            return (
              <div
                key={feature.title}
                className="group rounded-xl border border-[#E2E8FF] bg-[#F4F7FF] p-3 shadow-[0_8px_22px_rgba(65,116,255,0.04)] transition-all duration-300 hover:-translate-y-1 hover:border-[#C9D6FF] hover:bg-white hover:shadow-[0_16px_30px_rgba(65,116,255,0.1)] sm:rounded-2xl sm:p-6"
              >
                {/* Icon */}
                <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-xl bg-[#0957E8] transition-transform duration-300 group-hover:scale-105">
                  <Icon
                    size={15}
                    strokeWidth={2}
                    className="text-white"
                  />
                </div>

                {/* Title */}
                <h3 className="mb-2 text-sm font-bold text-[#0F172A] sm:text-base">
                  {feature.title}
                </h3>

                {/* Description */}
                <p className="text-xs leading-5 text-[#5B6472] sm:text-sm sm:leading-6">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}