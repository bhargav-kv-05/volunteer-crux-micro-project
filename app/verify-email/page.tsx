"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";

export default function VerifyEmailPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get("token");

    const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
    const [message, setMessage] = useState("Verifying your email...");

    useEffect(() => {
        if (!token) {
            setStatus("error");
            setMessage("Invalid or missing verification token.");
            return;
        }

        const verifyToken = async () => {
            try {
                const res = await fetch("/api/auth/verify", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ token }),
                });

                const data = await res.json();

                if (res.ok) {
                    setStatus("success");
                    setMessage("Email verified successfully! You can now log in.");
                    // Optional: Redirect after a few seconds
                    setTimeout(() => router.push("/login"), 3000);
                } else {
                    setStatus("error");
                    setMessage(data.message || "Verification failed.");
                }
            } catch (error) {
                setStatus("error");
                setMessage("Something went wrong. Please try again.");
            }
        };

        verifyToken();
    }, [token, router]);

    return (
        <div className="flex h-screen items-center justify-center bg-gray-50 p-4">
            <Card className="w-full max-w-md text-center">
                <CardHeader>
                    <div className="flex justify-center mb-4">
                        {status === "loading" && <Loader2 className="h-12 w-12 animate-spin text-blue-500" />}
                        {status === "success" && <CheckCircle2 className="h-12 w-12 text-green-500" />}
                        {status === "error" && <XCircle className="h-12 w-12 text-red-500" />}
                    </div>
                    <CardTitle className="text-2xl font-bold">
                        {status === "loading" ? "Verifying..." : status === "success" ? "Verified!" : "Verification Failed"}
                    </CardTitle>
                    <CardDescription>{message}</CardDescription>
                </CardHeader>
                <CardContent>
                    {status === "success" && (
                        <Link href="/login">
                            <Button className="w-full bg-green-600 hover:bg-green-700">Go to Login</Button>
                        </Link>
                    )}
                    {status === "error" && (
                        <Link href="/register">
                            <Button variant="outline" className="w-full">Back to Register</Button>
                        </Link>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
