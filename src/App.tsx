import { Hero } from "./components/sections/hero";
import { Experience } from "./components/sections/experience";
import { Education } from "./components/sections/education";
import { Skills } from "./components/sections/skills";
import { Projects } from "./components/sections/projects";

function App() {
  return (
    <>
      <Hero />
      <Experience />
      <Education />
      <Skills />
      <Projects />

      <div>Contact</div>
    </>
  );
}

export default App;
