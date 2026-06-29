import { TypingAnimation } from "../imports/typing-animation";

export const Hero = () => {
  return (
    <section id="hero" className="flex flex-col-reverse md:flex-row items-center justify-between w-full max-w-4xl mx-auto gap-10 pt-20 pb-10 px-5">
      <div className="flex flex-col items-start text-left space-y-4">
        <TypingAnimation
          words={["Aloha, I'm Dhaniel!"]}
          typeSpeed={75}
          className="text-4xl md:text-6xl font-bold tracking-tight"
        />
        <p className="text-xl">
          Full-stack software engineer based in Hawai'i with a passion for
          building impactful applications and tools utilizing modern
          technologies across AI, Cloud, and Web3.
        </p>
      </div>

      <div className="shrink-0">
        <img
          src="https://github.com/dhanielbolosan.png"
          alt="Dhaniel"
          className="w-48 h-48 rounded-full object-cover"
        />
      </div>
    </section>
  );
};
