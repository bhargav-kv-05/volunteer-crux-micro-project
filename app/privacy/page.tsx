import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

export default function PrivacyPolicy() {
    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1 container mx-auto max-w-4xl px-4 py-16">
                <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
                <div className="prose prose-green max-w-none text-muted-foreground space-y-6">
                    <p className="font-medium text-foreground">Last updated: {new Date().toLocaleDateString()}</p>
                    <p>At Volunteer Crux, we take your privacy seriously. This Privacy Policy explains how we collect, use, and protect your personal information when you use our platform.</p>
                    
                    <h2 className="text-2xl font-semibold text-foreground pt-4 border-t">1. Information We Collect</h2>
                    <p>We collect information you provide directly to us, such as when you create an account, update your profile, or communicate with us. This includes your name, email address, skills, and event participation history.</p>
                    
                    <h2 className="text-2xl font-semibold text-foreground pt-4 border-t">2. How We Use Your Information</h2>
                    <p>We use the information we collect to operate our platform, match volunteers with relevant NGO events using our intelligent algorithms, verify attendance, and generate secured participation certificates.</p>
                    
                    <h2 className="text-2xl font-semibold text-foreground pt-4 border-t">3. Data Security</h2>
                    <p>We implement strict technical and organizational security protocols to protect your data against unauthorized access, modification, or destruction. We do not sell your personal data to third parties.</p>
                </div>
            </main>
            <Footer />
        </div>
    );
}
