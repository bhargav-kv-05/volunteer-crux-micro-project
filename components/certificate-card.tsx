"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Award, Calendar, ExternalLink, ShieldCheck, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CertificateProps {
    volunteerName: string;
    eventName: string;
    date: string;
    organizerName?: string; // NGO Name
}

export function CertificateCard({ volunteerName, eventName, date, organizerName = "Volunteer Crux" }: CertificateProps) {

    const handlePrint = () => {
        const originalCert = document.getElementById("printable-certificate");
        if (!originalCert) return;

        // Create a perfect static HTML clone of the certificate to manually bypass completely ALL Radix/Next.js layout traps
        const certClone = originalCert.cloneNode(true) as HTMLElement;
        certClone.id = "print-clone";
        
        // Force the clone into pristine Document Flow explicitly demanding 1024px to natively trigger 'Shrink-To-Fit'!
        certClone.style.cssText = `
            position: relative !important;
            width: 1024px !important;
            height: 724px !important;
            margin: 0 auto !important;
            padding: 0 !important;
            background: #fffdf5 !important;
            transform: none !important;
            box-shadow: none !important;
            border: none !important;
            max-width: none !important;
            max-height: none !important;
            overflow: hidden !important;
        `;

        // Explicitly hide every single other layout node on the website structurally to isolate the Document Matrix
        const hiddenNodes: { element: HTMLElement, originalDisplay: string }[] = [];
        Array.from(document.body.children).forEach(child => {
            if (child.tagName !== 'SCRIPT' && child.tagName !== 'STYLE' && child.tagName !== 'LINK') {
                const el = child as HTMLElement;
                hiddenNodes.push({ element: el, originalDisplay: el.style.display });
                el.style.display = 'none';
            }
        });

        // Inject the isolated pristine clone natively as the ONLY physical object in the Document 
        document.body.appendChild(certClone);

        // Natively invoke print dialogue. Because Document is exactly 1024px, the browser intrinsically Shrinks-To-Fit!
        window.print();

        // Restore the layout flawlessly after the print dialogue releases the browser thread
        setTimeout(() => {
            document.body.removeChild(certClone);
            hiddenNodes.forEach(node => {
                node.element.style.display = node.originalDisplay;
            });
        }, 100);
    };

    return (
        <div className="w-full flex flex-col items-center">
            {/* Print Styles Injection */}
            <style jsx global>{`
                @media print {
                    @page { size: landscape; margin: 0; }
                    body { -webkit-print-color-adjust: exact; background: white !important; }
                }
            `}</style>

            {/* Simplified Action Bar */}
            <div className="mb-6 print:hidden flex flex-col items-center w-full">
                <Button onClick={handlePrint} size="lg" className="gap-2 bg-green-700 hover:bg-green-800 text-white shadow-md font-semibold tracking-wide h-12 px-8">
                    <Download className="h-5 w-5" /> EXPORT AS PDF
                </Button>
                <p className="text-xs text-muted-foreground mt-2 italic flex items-center gap-1">
                    (Select "Save as PDF" in the print menu)
                </p>
            </div>

            {/* Completely Fluid Native HTML Layout. Automatically expands height to strictly contain heavy text without clipping the borders! */}
            <Card id="printable-certificate" className="relative w-full max-w-[1024px] h-auto min-h-[400px] sm:min-h-[500px] md:min-h-[700px] mx-auto shadow-2xl bg-[#fffdf5] border-[8px] md:border-[12px] border-double border-green-800 print:shadow-none print:border-none print:rounded-none overflow-hidden print:overflow-visible flex flex-col items-center justify-center">

                {/* Responsive Decorative Corner Ornaments */}
                <div className="absolute top-0 left-0 w-20 h-20 sm:w-28 sm:h-28 md:w-36 md:h-36 border-t-[8px] sm:border-t-[10px] md:border-t-[12px] border-l-[8px] sm:border-l-[10px] md:border-l-[12px] border-green-700 rounded-tl-[40px] m-4 md:m-6 opacity-50"></div>
                <div className="absolute top-0 right-0 w-20 h-20 sm:w-28 sm:h-28 md:w-36 md:h-36 border-t-[8px] sm:border-t-[10px] md:border-t-[12px] border-r-[8px] sm:border-r-[10px] md:border-r-[12px] border-green-700 rounded-tr-[40px] m-4 md:m-6 opacity-50"></div>
                <div className="absolute bottom-0 left-0 w-20 h-20 sm:w-28 sm:h-28 md:w-36 md:h-36 border-b-[8px] sm:border-b-[10px] md:border-b-[12px] border-l-[8px] sm:border-l-[10px] md:border-l-[12px] border-green-700 rounded-bl-[40px] m-4 md:m-6 opacity-50"></div>
                <div className="absolute bottom-0 right-0 w-20 h-20 sm:w-28 sm:h-28 md:w-36 md:h-36 border-b-[8px] sm:border-b-[10px] md:border-b-[12px] border-r-[8px] sm:border-r-[10px] md:border-r-[12px] border-green-700 rounded-br-[40px] m-4 md:m-6 opacity-50"></div>

                <CardContent className="flex flex-col items-center justify-center h-full p-8 sm:p-12 md:p-16 text-center space-y-6 md:space-y-8 relative z-10">

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
                    <div className="w-full max-w-3xl space-y-4 sm:space-y-6 py-4 md:py-8">
                        <p className="text-gray-500 italic text-lg font-serif">This certificate is proudly presented to</p>

                        <p className="font-serif text-3xl sm:text-4xl md:text-6xl font-black text-slate-800 border-b-2 sm:border-b-4 border-green-700 pb-2 sm:pb-4 inline-block transform -rotate-1 px-4 sm:px-12 bg-white/50 rounded-xl shadow-sm">
                            {volunteerName}
                        </p>
                        <p className="text-gray-600 italic text-sm sm:text-base md:text-lg">
                            for their dedicated service and successful participation in the event
                        </p>
                        <p className="font-sans text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-green-900 border-t-2 sm:border-t-4 border-double border-green-300 pt-2 sm:pt-4 mx-4 sm:mx-16">
                            {eventName}
                        </p>
                    </div>

                    {/* Footer / Signatures */}
                    <div className="flex flex-col sm:flex-row justify-between items-center sm:items-end w-full max-w-4xl px-4 md:px-12 mt-8 md:mt-12 pt-8 gap-8 sm:gap-0">
                        <div className="flex flex-col items-center gap-1 sm:gap-2">
                            <span className="font-serif text-lg sm:text-xl border-b border-gray-400 pb-1 px-4 sm:px-8 min-w-[150px] sm:min-w-[200px] text-center">{date}</span>
                            <span className="text-[10px] sm:text-xs uppercase tracking-widest text-gray-500">Date</span>
                        </div>

                        {/* Official NGO Seal */}
                        <div className="relative flex flex-col items-center justify-center order-first sm:order-none scale-90 sm:scale-100">
                            <div className="w-24 h-24 sm:w-28 sm:h-28 border-[4px] sm:border-[6px] border-double border-green-800 rounded-full flex flex-col items-center justify-center bg-green-50 shadow-xl relative z-10 mb-2 sm:mb-0">
                                <div className="absolute inset-0 rounded-full border border-green-600 border-dashed m-1"></div>
                                <ShieldCheck className="h-8 w-8 sm:h-10 sm:w-10 text-green-700 mb-0.5 sm:mb-1" />
                                <span className="text-[8px] sm:text-[10px] font-bold uppercase tracking-widest text-green-800 bg-white/50 px-1 sm:px-2 rounded">Verified</span>
                            </div>
                            <div className="static sm:absolute sm:-bottom-3 bg-green-800 text-white text-[8px] sm:text-[10px] font-bold uppercase tracking-wider px-3 sm:px-4 py-1 rounded-full shadow-lg z-20 whitespace-nowrap">
                                Official NGO Partner
                            </div>
                        </div>

                        <div className="flex flex-col items-center gap-1 sm:gap-2">
                            <span className="font-serif text-lg sm:text-xl border-b border-gray-400 pb-1 px-4 sm:px-8 min-w-[150px] sm:min-w-[200px] text-center">{organizerName}</span>
                            <span className="text-[10px] sm:text-xs uppercase tracking-widest text-gray-500">Organizer Signature</span>
                        </div>
                    </div>

                </CardContent>
            </Card>
        </div>
    );
}
