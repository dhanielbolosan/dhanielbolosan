import { Experience } from "./components/sections/experience";
import { Education } from "./components/sections/education";
import { Skills } from "./components/sections/skills";
import { Projects } from "./components/sections/projects";

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
        <Skills />
      </div>
      <div>Projects
        <Projects />
      </div>

      <div>Contact</div>
    </>
  );
}

export default App;
