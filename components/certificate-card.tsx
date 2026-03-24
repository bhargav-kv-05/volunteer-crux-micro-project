"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Award, Calendar, ExternalLink, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CertificateProps {
    volunteerName: string;
    eventName: string;
    date: string;
    organizerName?: string; // NGO Name
}

export function CertificateCard({ volunteerName, eventName, date, organizerName = "Volunteer Crux" }: CertificateProps) {

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="w-full flex flex-col items-center">
            {/* Print Styles Injection */}
            <style jsx global>{`
                @media print {
                    @page { size: landscape; margin: 0; }
                    body { -webkit-print-color-adjust: exact; }
                }
            `}</style>

            {/* The certificate is scaled dynamically using w-full and an aspect ratio. Shrinking slightly using scale-95 to prevent cutting off corners on weird aspect ratio screens */}
            <Card className="relative w-full max-w-5xl aspect-[1.414/1] min-h-[400px] md:min-h-[600px] mx-auto shadow-2xl bg-[#fffdf5] border-8 border-double border-green-800 print:shadow-none print:border-8 print:w-full print:h-full print:rounded-none overflow-hidden scale-95 md:scale-100">

                {/* Decorative Corner Ornaments */}
                <div className="absolute top-0 left-0 w-32 h-32 border-t-8 border-l-8 border-green-700 rounded-tl-3xl m-4 opacity-50"></div>
                <div className="absolute top-0 right-0 w-32 h-32 border-t-8 border-r-8 border-green-700 rounded-tr-3xl m-4 opacity-50"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 border-b-8 border-l-8 border-green-700 rounded-bl-3xl m-4 opacity-50"></div>
                <div className="absolute bottom-0 right-0 w-32 h-32 border-b-8 border-r-8 border-green-700 rounded-br-3xl m-4 opacity-50"></div>

                <CardContent className="flex flex-col items-center justify-center h-full p-16 text-center space-y-8 relative z-10">

                    {/* Header */}
                    <div className="space-y-4">
                        <div className="flex justify-center">
                            <Award className="h-20 w-20 text-green-700" />
                        </div>
                        <h1 className="text-5xl md:text-6xl font-serif font-bold text-gray-900 tracking-wider uppercase drop-shadow-sm">
                            Certificate
                        </h1>
                        <h2 className="text-2xl font-serif text-green-800 uppercase tracking-[0.5em] font-light">
                            of Participation
                        </h2>
                    </div>

                    {/* Body */}
                    <div className="w-full max-w-3xl space-y-6 py-8">
                        <p className="text-gray-500 italic text-lg font-serif">This certificate is proudly presented to</p>

                        <div className="py-4">
                            <span className="text-4xl md:text-5xl font-bold text-gray-900 font-serif border-b-2 border-green-600 px-12 pb-2 inline-block min-w-[50%]">
                                {volunteerName}
                            </span>
                        </div>

                        <p className="text-gray-500 italic text-lg font-serif">
                            for their dedicated service and successful participation in the event
                        </p>

                        <h3 className="text-3xl font-bold text-green-900">{eventName}</h3>
                    </div>

                    {/* Footer / Signatures */}
                    <div className="flex justify-between items-end w-full max-w-4xl px-12 mt-12 pt-12">
                        <div className="flex flex-col items-center gap-2">
                            <span className="font-serif text-xl border-b border-gray-400 pb-1 px-8 min-w-[200px] text-center">{date}</span>
                            <span className="text-xs uppercase tracking-widest text-gray-500">Date</span>
                        </div>

                        {/* Official NGO Seal */}
                        <div className="relative flex flex-col items-center justify-center">
                            <div className="w-28 h-28 border-[6px] border-double border-green-800 rounded-full flex flex-col items-center justify-center bg-green-50 shadow-xl relative z-10 overflow-hidden">
                                <div className="absolute inset-0 rounded-full border border-green-600 border-dashed m-1"></div>
                                <ShieldCheck className="h-10 w-10 text-green-700 mb-1" />
                                <span className="text-[8px] font-bold text-green-800 tracking-widest uppercase">Verified</span>
                            </div>
                            <div className="absolute -bottom-3 bg-green-800 text-white text-[10px] font-bold px-4 py-1 rounded-full uppercase tracking-widest shadow-md z-20 whitespace-nowrap">
                                Official NGO Partner
                            </div>
                        </div>

                        <div className="flex flex-col items-center gap-2">
                            <span className="font-serif text-xl border-b border-gray-400 pb-1 px-8 min-w-[200px] text-center font-cursive">{organizerName}</span>
                            <span className="text-xs uppercase tracking-widest text-gray-500">Organizer Signature</span>
                        </div>
                    </div>

                </CardContent>
            </Card>

            <div className="mt-8 print:hidden">
                <Button onClick={handlePrint} size="lg" className="gap-2 bg-green-700 hover:bg-green-800 shadow-lg">
                    <ExternalLink className="h-5 w-5" /> Download / Print Certificate
                </Button>
            </div>
        </div>
    );
}
