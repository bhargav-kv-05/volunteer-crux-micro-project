import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Mail, ShieldCheck } from "lucide-react";

export default function JoinNGOPage() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
            <Card className="w-full max-w-lg text-center">
                <CardHeader>
                    <div className="flex justify-center mb-4">
                        <div className="p-3 bg-green-100 rounded-full">
                            <ShieldCheck className="h-10 w-10 text-green-600" />
                        </div>
                    </div>
                    <CardTitle className="text-2xl font-bold">Partner with Volunteer Crux</CardTitle>
                    <CardDescription className="text-base mt-2">
                        To ensure the safety and trust of our volunteers, we manually verify all NGO organizations.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <p className="text-gray-600">
                        If you represent a registered NGO and wish to post events on our platform, please contact our administrative team for verification and account creation.
                    </p>

                    <div className="bg-white p-4 rounded-lg border border-gray-200 flex items-center justify-center gap-3">
                        <Mail className="h-5 w-5 text-gray-500" />
                        <a href="mailto:bhargakv05@gmail.com" className="text-green-600 font-medium hover:underline">
                            bhargakv05@gmail.com
                        </a>
                    </div>

                    <div className="pt-4">
                        <Link href="/">
                            <Button variant="ghost">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Home
                            </Button>
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
