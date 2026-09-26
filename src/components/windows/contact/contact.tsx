import { Choices } from "../../choices";
import { CornerBox } from "../../corner-box";
import { Faded } from "../../window";
import { ContactForm } from "./contact-form";
import { ContactDialogue } from "./contact-dialogue";
import { useContact } from "./use-contact";

export const Contact = () => {
  const {
    mode,
    dialogueText,
    visibleDialogue,
    fullDialogue,
    reservedDialogueLines,
    form,
    handleFormSubmit,
    commands,
    choicesReady,
    menuChoices,
    menuReady,
    visibleResponses,
  } = useContact();

  return (
    <section className="flex grow flex-col">
      <div className="flex items-start">
        <ContactDialogue
          dialogueText={dialogueText}
          visibleDialogue={visibleDialogue}
          fullDialogue={fullDialogue}
          reservedDialogueLines={reservedDialogueLines}
        />

        <div className="-mt-5 ml-3 shrink-0">
          <CornerBox
            view={commands}
            id={commands ? commands.map((item) => item.label).join() : "title"}
            render={(items) =>
              items ? (
                <>
                  <h2 className="sr-only">Contact</h2>

                  <Choices
                    boxed
                    items={items}
                    ready={choicesReady}
                  />
                </>
              ) : (
                <h2>Contact</h2>
              )
            }
          />
        </div>
      </div>

      <Faded className="flex min-h-0 grow flex-col">
        {mode === "form" && (
          <ContactForm
            form={form}
            onSubmit={handleFormSubmit}
          />
        )}

        {mode === "menu" && (
          <div className="mt-2">
            <Choices
              items={menuChoices}
              ready={menuReady}
              typedChars={visibleResponses.length}
            />
          </div>
        )}
      </Faded>
    </section>
  );
};
