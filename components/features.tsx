import { Card } from "@/components/ui/card"
import { Users, ShieldCheck, Award } from "lucide-react"

const features = [
  {
    icon: Users,
    title: "Skill Matching",
    description:
      "Connect with opportunities that align with your unique skills and expertise. Our intelligent matching system ensures your talents make the greatest impact.",
  },
  {
    icon: ShieldCheck,
    title: "Offline Validation",
    description:
      "Build trust through verified, in-person volunteering experiences. Every contribution is documented and authenticated by the NGOs you work with.",
  },
  {
    icon: Award,
    title: "Earned Recognition",
    description:
      "Showcase your volunteer journey with verifiable credentials. Build a portfolio of impact that employers and communities can trust.",
  },
]

export function Features() {
  return (
    <section id="how-it-works" className="bg-muted/30 py-20 sm:py-24 lg:py-28">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Why Choose Volunteer Crux
          </h2>
          <p className="mt-4 text-pretty text-lg leading-relaxed text-muted-foreground">
            A smarter way to volunteer. Built for impact, verified for trust.
          </p>
        </div>

        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon
            return (
              <Card
                key={feature.title}
                className="group relative overflow-hidden border-border bg-card p-8 transition-all hover:shadow-lg"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="mt-6 text-xl font-semibold text-card-foreground">{feature.title}</h3>
                <p className="mt-3 leading-relaxed text-muted-foreground">{feature.description}</p>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
