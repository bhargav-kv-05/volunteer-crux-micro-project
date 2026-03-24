import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

export default function TermsOfService() {
    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1 container mx-auto max-w-4xl px-4 py-16">
                <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
                <div className="prose prose-green max-w-none text-muted-foreground space-y-6">
                    <p className="font-medium text-foreground">Last updated: {new Date().toLocaleDateString()}</p>
                    <p>Welcome to Volunteer Crux. By accessing or using our platform, you agree to be bound by these Terms of Service.</p>
                    
                    <h2 className="text-2xl font-semibold text-foreground pt-4 border-t">1. Acceptable Use</h2>
                    <p>You agree to use Volunteer Crux only for its intended purpose of connecting volunteers with verified NGO events. You must provide accurate profile information and honor your physical event commitments.</p>
                    
                    <h2 className="text-2xl font-semibold text-foreground pt-4 border-t">2. NGO Responsibilities</h2>
                    <p>Verified NGOs are responsible for accurately describing their events, ensuring safe environments for volunteers, and truthfully verifying attendance for gamified certificate generation.</p>
                    
                    <h2 className="text-2xl font-semibold text-foreground pt-4 border-t">3. Account Termination</h2>
                    <p>We reserve the right to suspend or terminate accounts that violate these terms, including accounts exhibiting malicious behavior, spoofing data, or repeatedly failing to attend RSVP'd events.</p>
                </div>
            </main>
            <Footer />
        </div>
    );
}
