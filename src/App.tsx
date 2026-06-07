import { Experience } from "./components/sections/Experience";
import { Education } from "./components/sections/Education";
import { SkillsMarquee } from "./components/sections/Skills";

function App() {
  return (
    <>
      <div className="flex flex-col items-center max-w-2xl min-h-[50vh] mx-auto w-full">
        Hero About
      </div>
      <div>
        Experience
        <Experience />
      </div>
      <div>
        Education
        <Education />
      </div>
      <div>
        Skills
        <SkillsMarquee />
      </div>
      <div>Projects</div>
      <div>Contact</div>
    </>
  );
}

export default App;
