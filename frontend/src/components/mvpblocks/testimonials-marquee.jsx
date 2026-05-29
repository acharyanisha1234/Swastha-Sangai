"use client";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { Marquee } from "@/components/ui/marquee";

export function Highlight({ children, className }) {
  return (
    <span
      className={cn(
        "bg-primary/10 p-1 py-0.5 font-bold text-primary",
        className
      )}>
      {children}
    </span>
  );
}

export function TestimonialCard({
  description,
  name,
  img,
  role,
  className,
  ...props
}) {
  return (
    <div
      className={cn(
        "mb-4 flex w-full cursor-pointer break-inside-avoid flex-col items-center justify-between gap-6 rounded-xl p-4",
        "border-border bg-card/50 border shadow-sm",
        "transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md",
        className
      )}
      {...props}>
      <div className="text-muted-foreground text-sm font-normal select-none">
        {description}
        <div className="flex flex-row py-1">
          <Star className="size-4 fill-primary text-primary" />
          <Star className="size-4 fill-primary text-primary" />
          <Star className="size-4 fill-primary text-primary" />
          <Star className="size-4 fill-primary text-primary" />
          <Star className="size-4 fill-primary text-primary" />
        </div>
      </div>

      <div className="flex w-full items-center justify-start gap-5 select-none">
        <img
          width={40}
          height={40}
          src={img || ""}
          alt={name}
          className="size-10 rounded-full ring-1 ring-primary/20 ring-offset-2"
        />

        <div>
          <p className="text-foreground font-medium">{name}</p>
          <p className="text-muted-foreground text-xs font-normal">{role}</p>
        </div>
      </div>
    </div>
  );
}

const testimonials = [
  {
    name: "Arjun Sharma",
    role: "Fitness App User",
    img: "https://randomuser.me/api/portraits/men/22.jpg",
    description: (
      <p>
        This platform has completely changed how I track my workouts.
        <Highlight>
          The fitness profile insights help me improve week after week.
        </Highlight>{" "}
        I’ve never felt more motivated.
      </p>
    ),
  },
  {
    name: "Sita Lama",
    role: "Daily Mood Tracker User",
    img: "https://randomuser.me/api/portraits/women/33.jpg",
    description: (
      <p>
        I love the clean interface and smart recommendations.
        <Highlight>
          The mood-based quotes feel so personalized every day.
        </Highlight>{" "}
        It’s a simple feature but so meaningful.
      </p>
    ),
  },
  {
    name: "Rohan Shrestha",
    role: "Environmental Supporter",
    img: "https://randomuser.me/api/portraits/men/32.jpg",
    description: (
      <p>
        Donating through this system felt incredibly easy.
        <Highlight>The transparency and impact tracking are amazing.</Highlight>{" "}
        I feel connected to the causes I support.
      </p>
    ),
  },
  {
    name: "Priya Magar",
    role: "Remote Worker",
    img: "https://randomuser.me/api/portraits/women/44.jpg",
    description: (
      <p>
        The video calling is outstanding.
        <Highlight>
          Smooth, stable, and works even on slow connections.
        </Highlight>{" "}
        Perfect for both work and personal calls.
      </p>
    ),
  },
  {
    name: "Daniel Kim",
    role: "Fitness Enthusiast",
    img: "https://randomuser.me/api/portraits/men/55.jpg",
    description: (
      <p>
        The analytics helped me discover patterns I didn’t realize.
        <Highlight>
          My progress improved by nearly 40% in two months.
        </Highlight>{" "}
        Highly recommended for anyone serious about fitness.
      </p>
    ),
  },
  {
    name: "Anjali Thapa",
    role: "Student",
    img: "https://randomuser.me/api/portraits/women/67.jpg",
    description: (
      <p>
        Super easy to use and beautifully designed.
        <Highlight>
          The reminders and micro-interactions feel so polished.
        </Highlight>{" "}
        It’s a joy to use every day.
      </p>
    ),
  },
  {
    name: "Michael Lee",
    role: "Creative Freelancer",
    img: "https://randomuser.me/api/portraits/men/78.jpg",
    description: (
      <p>
        The whole experience is smooth from start to finish.
        <Highlight>
          I love how consistent the design feels across all features.
        </Highlight>{" "}
        A very thoughtful product.
      </p>
    ),
  },
  {
    name: "Luna Garcia",
    role: "E-commerce Manager",
    img: "https://randomuser.me/api/portraits/women/89.jpg",
    description: (
      <p>
        The platform’s dark mode is beautiful.
        <Highlight>
          The UI is optimized perfectly for mobile and desktop.
        </Highlight>{" "}
        Amazing experience overall.
      </p>
    ),
  },
  {
    name: "Aarav Patel",
    role: "Health Consultant",
    img: "https://randomuser.me/api/portraits/men/92.jpg",
    description: (
      <p>
        The accessibility features were a pleasant surprise.
        <Highlight>
          Works perfectly for elderly clients with minimal effort.
        </Highlight>{" "}
        The forms and navigation are incredibly user-friendly.
      </p>
    ),
  },
  {
    name: "Emily Zhang",
    role: "Teacher",
    img: "https://randomuser.me/api/portraits/women/29.jpg",
    description: (
      <p>
        My students love using this platform.
        <Highlight>
          The interactive components keep them engaged and consistent.
        </Highlight>{" "}
        A wonderful tool for daily well-being.
      </p>
    ),
  },
];

export default function Testimonials() {
  return (
    <section className="relative container py-10">
      <div className="absolute top-20 -left-20 z-10 h-64 w-64 rounded-full bg-primary/5 blur-3xl" />
      <div className="absolute -right-20 bottom-20 z-10 h-64 w-64 rounded-full bg-primary/5 blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}>
        <h2 className="text-foreground mb-4 text-center text-4xl leading-[1.2] font-bold tracking-tighter md:text-5xl">
          What Our Users Are Saying
        </h2>
        <h3 className="text-muted-foreground mx-auto mb-8 max-w-lg text-center text-lg font-medium tracking-tight text-balance">
          Real people. Real experiences.  
          <span className="bg-linear-to-r from-primary to-secondary bg-clip-text text-transparent">
            Built for everyday life
          </span>{" "}
          and trusted by users worldwide.
        </h3>
      </motion.div>

      <div className="relative mt-6 max-h-screen overflow-hidden">
        <div className="gap-4 md:columns-2 xl:columns-3 2xl:columns-4">
          {Array(Math.ceil(testimonials.length / 3))
            .fill(0)
            .map((_, i) => (
              <Marquee
                vertical
                key={i}
                className={cn({
                  "[--duration:60s]": i === 1,
                  "[--duration:30s]": i === 2,
                  "[--duration:70s]": i === 3,
                })}>
                {testimonials.slice(i * 3, (i + 1) * 3).map((card, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{
                      delay: Math.random() * 0.8,
                      duration: 1.2,
                    }}>
                    <TestimonialCard {...card} />
                  </motion.div>
                ))}
              </Marquee>
            ))}
        </div>
        <div className="from-background pointer-events-none absolute inset-x-0 bottom-0 h-1/4 w-full bg-linear-to-t from-20%"></div>
        <div className="from-background pointer-events-none absolute inset-x-0 top-0 h-1/4 w-full bg-linear-to-b from-20%"></div>
      </div>
    </section>
  );
}
