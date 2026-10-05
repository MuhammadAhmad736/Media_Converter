import { Star } from "lucide-react";

const testimonials = [
  {
    quote:
      "Never simple and fast. I didn't have to go through a complicated process or endure dozens of ad redirects like other websites.",
    name: "Marcus Reed",
    role: "Digital Marketer",
    initials: "MR",
    avatarColor: "bg-[#0B5BE7]",
  },
  {
    quote:
      "The interface is clean and the downloader is incredibly easy to understand. I use it weekly for archiving my tutorial references.",
    name: "Elena Rostova",
    role: "Content Creator",
    initials: "ER",
    avatarColor: "bg-[#0B5BE7]",
  },
  {
    quote:
      "I like that everything is available on one page instead of having to search through different tools or install sketchy browser extensions.",
    name: "Liam Chen",
    role: "Video Editor",
    initials: "LC",
    avatarColor: "bg-[#087F5B]",
  },
];

export default function Testimonials() {
  return (
    <section id="testimonials" data-nav-section="Testimonials" className="w-full bg-background px-4 py-14 sm:px-6 sm:py-16 md:px-8 md:py-20 lg:px-10 lg:py-24">
      <div className="mx-auto max-w-6xl">

        {/* Heading */}
        <div className="mx-auto mb-8 max-w-3xl text-center sm:mb-10">
          <p className="mb-2 text-[9px] font-bold uppercase tracking-[0.18em] text-[#3B6BFF]">
            COMMUNITY REVIEWS
          </p>

          <h2 className="text-2xl font-bold tracking-tight text-[#0F172A] sm:text-3xl md:text-4xl">
            What Our Users Say
          </h2>

          <p className="mt-3 text-sm leading-6 text-[#5B6472] md:text-base">
            Loved by content creators, students, social managers, and everyday
            video savers worldwide.
          </p>
        </div>

        {/* Testimonials */}
        <div className="stagger-children grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.name}
              className={`group rounded-xl border border-[#E2E8FF] bg-white p-3 shadow-[0_8px_22px_rgba(65,116,255,0.04)] transition-all duration-300 hover:-translate-y-1 hover:border-[#C9D6FF] hover:shadow-[0_16px_30px_rgba(65,116,255,0.1)] sm:rounded-2xl sm:p-6 ${testimonial.name === "Liam Chen" ? "mx-auto w-full md:col-span-2 md:max-w-2xl lg:col-span-1 lg:max-w-none" : ""}`}
            >
              {/* Stars */}
              <div className="mb-2 flex gap-1">
                {[...Array(5)].map((_, index) => (
                  <Star
                    key={index}
                    size={12}
                    strokeWidth={0}
                    fill="#FF9800"
                    className="text-[#FF9800]"
                  />
                ))}
              </div>

              {/* Quote */}
              <p className="min-h-13 text-xs italic leading-5 text-[#0F172A] sm:text-sm sm:leading-6">
                &quot;{testimonial.quote}&quot;
              </p>

              {/* Divider */}
              <div className="my-3 h-px bg-[#E8EFFF]" />

              {/* User */}
              <div className="flex items-center gap-3">
                <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${testimonial.avatarColor}`}
                >
                  {testimonial.initials}
                </div>

                <div>
                  <h3 className="text-xs font-bold text-[#0F172A]">
                    {testimonial.name}
                  </h3>

                  <p className="text-xs text-[#5B6472]">
                    {testimonial.role}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}