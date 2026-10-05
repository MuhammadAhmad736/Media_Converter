import VideoPreview from "./VideoPreview";

// ============================================================
// HERO SECTION
// Wraps the badge, headline, subtext, and the VideoPreview
// component that lets users paste a link and download.
// ============================================================
const Hero = () => {
  return (
    <main id="home" className="w-full bg-background">
      {/* ======================================================
          HERO HEADER
          Centered text block: badge → headline → subtext
          ====================================================== */}
      <section className="mx-auto flex w-full max-w-6xl flex-col items-center justify-center px-4 pb-6 pt-9 text-center sm:px-6 sm:pb-8 sm:pt-12 lg:pt-14">

        {/* ---------- BADGE ---------- */}
        <div className="flex items-center gap-2 text-xs sm:text-sm text-blue-800 bg-blue-50 border border-blue-200 rounded-full px-3.5 py-1.5 shadow-sm">
          {/* Lightning icon */}
          <svg
            width="13"
            height="14"
            viewBox="0 0 13 14"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="shrink-0"
          >
            <path
              d="M1.613 8.2a.62.62 0 0 1-.553-.341.59.59 0 0 1 .076-.637l6.048-6.118a.31.31 0 0 1 .375-.069c.061.033.11.084.137.147a.3.3 0 0 1 .014.197L6.537 4.991a.59.59 0 0 0 .07.552.61.61 0 0 0 .504.257h4.276a.62.62 0 0 1 .553.341.59.59 0 0 1-.076.637l-6.048 6.119a.31.31 0 0 1-.375.067.295.295 0 0 1-.15-.344l1.172-3.61a.59.59 0 0 0-.07-.553.61.61 0 0 0-.504-.257z"
              stroke="#1E4BAF"
              strokeMiterlimit="5.759"
              strokeLinecap="round"
            />
          </svg>
          <span className="font-medium tracking-wide">
            Fast · Simple · Free
          </span>
        </div>

        {/* ---------- HEADLINE ---------- */}
        <h1 className="mt-5 max-w-4xl text-3xl font-bold leading-tight text-gray-900 sm:mt-6 sm:text-4xl md:text-5xl lg:text-[3.5rem]">
          Download Videos From Your{" "}
          <span className="text-indigo-600">Favorite Platforms</span>
        </h1>

        {/* ---------- SUBTEXT ---------- */}
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-gray-500 sm:mt-4 sm:text-base">
          Paste a video link from a supported social media platform and
          download your video quickly and easily.
        </p>
      </section>

      {/* ======================================================
          VIDEO PREVIEW / DOWNLOADER
          The interactive part: input + preview card.
          ====================================================== */}
      <section className="flex w-full justify-center px-4 pb-12 sm:px-6 sm:pb-16 lg:pb-20">
        <VideoPreview />
      </section>
    </main>
  );
};

export default Hero;