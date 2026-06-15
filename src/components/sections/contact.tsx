import { Card, CardContent } from "../imports/card"
import { Input } from "../imports/input"
import { Button } from "../imports/button"
import { IconBrandGithub, IconBrandLinkedin, IconMail } from "@tabler/icons-react"

export const Contact = () => {
    return (
        <section className="flex flex-col w-full max-w-4xl mx-auto gap-5 pb-40 px-5">
            <Card>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 px-8 py-4">
                    <div className="flex flex-col pr-4 space-y-4">
                        <h2 className="text-xl md:text-2xl font-bold tracking-tight">await contact()</h2>
                        <p className="text-base">Wanna chat? Feel free to send a message and I'll get back to you.</p>
                        <div className="flex flex-row mt-auto gap-4">
                            <a
                                href="https://github.com/dhanielbolosan"
                                target="_blank"
                                rel="noreferrer"
                            >
                                <IconBrandGithub />
                            </a>

                            <a
                                href="https://www.linkedin.com/in/dhaniel-bolosan/"
                                target="_blank"
                                rel="noreferrer"
                            >
                                <IconBrandLinkedin />
                            </a>

                            <a href="mailto:dhanielb0326@gmail.com">
                                <IconMail />
                            </a>
                        </div>
                    </div>
                    <div className="flex flex-col gap-4 pl-4">
                        <Input placeholder="Name" className="h-12 placeholder:text-base text-base" />
                        <Input placeholder="Email" className="h-12 placeholder:text-base text-base" />
                        <Input placeholder="Message" className="h-12 placeholder:text-base text-base" />
                        <Button className="h-12 text-base cursor-pointer">Submit</Button>
                    </div>
                </CardContent>
            </Card>
        </section>
    )
}