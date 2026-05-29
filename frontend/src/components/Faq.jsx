import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const Faq = ({
  heading = "Frequently Asked Questions",
  items = [
    {
      id: "faq-1",
      question: "What is the User Fitness Profile?",
      answer:
        "It provides a personalized overview of your health, activity level, and fitness goals to help you track progress more effectively.",
    },
    {
      id: "faq-2",
      question: "How do AI-generated quotes work?",
      answer:
        "Our AI analyzes your mood, activity trends, and preferences to generate motivating quotes tailored just for you.",
    },
    {
      id: "faq-3",
      question: "Can I make donations through the platform?",
      answer:
        "Yes, you can securely support verified causes and community initiatives directly from our donation section.",
    },
    {
      id: "faq-4",
      question: "Is the video calling feature free to use?",
      answer:
        "Yes, the video calling system is completely free and offers high-quality calls without requiring additional installations.",
    },
    {
      id: "faq-5",
      question: "Does the platform support dark and light modes?",
      answer:
        "Absolutely. You can switch between dark and light themes anytime for a smoother viewing experience.",
    },
    {
      id: "faq-6",
      question: "Is my data safe on this platform?",
      answer:
        "We use industry-standard encryption and strict privacy controls to ensure your personal data remains secure.",
    },
    {
      id: "faq-7",
      question: "Do I need an account to get started?",
      answer:
        "Some features like personalized fitness insights and video calls require an account, while others such as viewing content do not.",
    }
  ]

}) => {
  return (
    <section className="py-32">
      <div className="container w-full flex items-center flex-col">
        <h1 className="mb-4 text-3xl font-semibold md:mb-11 md:text-4xl">
          {heading}
        </h1>
        <Accordion type="single" collapsible>
          {items.map((item, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger className="hover:no-underline">
                {item.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};

export { Faq };
