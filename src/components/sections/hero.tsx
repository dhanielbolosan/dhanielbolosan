export const Hero = () => {
    return (
        <section className="flex flex-col-reverse md:flex-row items-center justify-between w-full max-w-4xl mx-auto gap-10 pt-20 pb-10 px-5">

            <div className="flex flex-col items-center items-start text-left space-y-5">
                <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
                    Aloha, I'm Dhaniel
                </h1>

                <p className="text-lg">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris vel libero non lorem tempor auctor. Donec metus felis, tincidunt eget finibus eget, molestie in sem. Mauris ornare neque sed sodales tincidunt. Mauris non tincidunt justo. Sed lacinia neque quam, eu ultricies leo tincidunt luctus. Donec sit amet lacus nulla. Cras sit amet metus quam. Nunc pellentesque nunc ante.
                </p>
            </div>

            <div className="shrink-0">
                <img
                    src="https://placehold.co/600x400"
                    alt="Dhaniel"
                    className="w-48 h-48 md:w-64 md:h-64 rounded-full object-cover"
                />
            </div>

        </section>
    )
}