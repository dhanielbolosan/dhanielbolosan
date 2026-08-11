import { Hero } from "./components/sections/hero";
import { Activity } from "./components/sections/activity";
import { Experience } from "./components/sections/experience";
import { Education } from "./components/sections/education";
import { Skills } from "./components/sections/skills";
import { Projects } from "./components/sections/projects";
import { Contact } from "./components/sections/contact";
import { BlurFade } from "./components/imports/blur-fade";

function App() {
  return (
    <>
      <BlurFade delay={0.1}>
        <Hero />
      </BlurFade>
      <BlurFade delay={0.2}>
        <Activity />
      </BlurFade>
      <BlurFade delay={0.3}>
        <Experience />
      </BlurFade>
      <BlurFade delay={0.4}>
        <Education />
      </BlurFade>
      <BlurFade delay={0.5}>
        <Skills />
      </BlurFade>
      <BlurFade delay={0.6}>
        <Projects />
      </BlurFade>
      <BlurFade delay={0.7}>
        <Contact />
      </BlurFade>
    </>
  );
}

export default App;
