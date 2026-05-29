import { ArrowRight, ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
const FeatureDescription = ({
  badge,
  heading,
  description,
  buttons = {},
  image = {},
  reverse = false,
}) => {
  return (
    <section className="py-32 px-15">
      <div className="container">
        <div className="grid items-center gap-8 lg:grid-cols-2">

          {/* TEXT */}
          <div
            className={`flex flex-col items-center text-center lg:items-start lg:text-left 
              ${reverse ? "order-2" : "order-1"}`}>

            {badge && (
              <Badge variant="outline">
                {badge}
                <ArrowUpRight className="ml-2 size-4" />
              </Badge>
            )}

            <h1 className="my-6 text-pretty text-4xl font-bold lg:text-6xl">
              {heading}
            </h1>

            <p className="text-muted-foreground mb-8 max-w-xl lg:text-xl">
              {description}
            </p>

            <div className="flex w-full flex-col justify-center gap-2 sm:flex-row lg:justify-start">
              {buttons.secondary && (
                <Button asChild variant="outline" className="w-full sm:w-auto">
                  <Link to={buttons.secondary.url}>
                    {buttons.secondary.text}
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
              )}
            </div>
          </div>

          {/* IMAGE */}
          <img
            src={image.src}
            alt={image.alt}
            className={`max-h-96 w-full transform scale-x-[-1] rounded-md object-cover 
              ${reverse ? "order-1" : "order-2"}`}
          />
        </div>
      </div>
    </section>
  );
};

export {FeatureDescription};