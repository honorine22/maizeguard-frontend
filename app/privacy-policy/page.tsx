import type { Metadata } from "next";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
    AlertTriangle,
    ArrowLeft,
    ArrowRight,
    CheckCircle2,
    Database,
    FileCheck2,
    FileImage,
    Leaf,
    LockKeyhole,
    Mail,
    Scale,
    ServerCog,
    ShieldCheck,
    UserCheck,
} from "lucide-react";
import { Navbar } from "../components/Navbar";

export const metadata: Metadata = {
    title: "Privacy Policy | MaizeGuard Rwanda",
    description:
        "How MaizeGuard processes uploaded maize images, handles prediction data, and communicates model limitations.",
};

const CONTACT_EMAIL = "h.igiraneza@alustudent.com";

const quickFacts = [
    "No user account is required",
    "No permanent application image database",
    "Uploaded images are not automatically added to training data",
];

type Clause = {
    id: string;
    number: string;
    icon: LucideIcon;
    label: string;
    title: string;
    summary: string;
    points: string[];
};

const clauses: Clause[] = [
    {
        id: "purpose",
        number: "01",
        icon: FileCheck2,
        label: "Purpose",
        title: "Visible screening, not certification",
        summary:
            "MaizeGuard analyses visible features in a photograph of shelled maize and returns a predicted class, confidence score, risk level, action, and recommendation.",
        points: [
            "The supported classes are good, broken, impurity, and mould risk.",
            "The result is decision support only. It is not a laboratory test, food-safety certificate, or legal guarantee.",
            "A photograph cannot confirm aflatoxin, moisture content, chemical contamination, or hidden internal damage.",
        ],
    },
    {
        id: "information",
        number: "02",
        icon: UserCheck,
        label: "Information",
        title: "What the prototype processes",
        summary:
            "The prototype processes the image selected by the user and the prediction information produced from it.",
        points: [
            "The public prototype does not require a name, email address, account, or personal profile.",
            "Users should avoid uploading photographs containing faces, identity documents, addresses, or other unrelated personal information.",
            "The result may include the predicted class, confidence, risk, action, recommendation, and model evidence.",
        ],
    },
    {
        id: "image-flow",
        number: "03",
        icon: ServerCog,
        label: "Image flow",
        title: "How an uploaded image is handled",
        summary:
            "The browser-based Next.js interface sends the selected image directly to the FastAPI prediction service.",
        points: [
            "The image is sent to the FastAPI /predict endpoint hosted on Hugging Face Spaces.",
            "The backend validates and preprocesses the image, runs the model, and creates a prediction response.",
            "The response is returned to the browser and displayed to the user.",
        ],
    },
    {
        id: "storage",
        number: "04",
        icon: Database,
        label: "Storage",
        title: "No intentional permanent image storage",
        summary:
            "MaizeGuard does not implement a permanent application image database and does not intentionally save uploaded images.",
        points: [
            "Uploaded images are not automatically added to the training dataset.",
            "Uploading an image for prediction does not give permission for research, publication, or future model training.",
            "The hosting platforms may process technical request information through their normal infrastructure, including operational logs.",
        ],
    },
    {
        id: "limitations",
        number: "05",
        icon: AlertTriangle,
        label: "Limitations",
        title: "Confidence does not mean certainty",
        summary:
            "Predictions may be affected by lighting, focus, camera distance, background objects, mixed batches, camera quality, and conditions not represented well in the training data.",
        points: [
            "A high confidence score does not prove that the prediction is correct.",
            "Unclear, unsupported, low-confidence, or high-risk results should receive human review.",
            "A qualified agricultural professional or an appropriate physical or laboratory method should be used when the decision may affect health, storage, sale, or disposal.",
        ],
    },
    {
        id: "responsible-use",
        number: "06",
        icon: Scale,
        label: "Responsible use",
        title: "Do not use one prediction as a final judgement",
        summary:
            "MaizeGuard should not be used to falsely certify maize, mislead users, or make a serious automatic decision without further inspection.",
        points: [
            "One result should not be the only reason for rejecting a farmer's produce or setting a price.",
            "The system should not be used to declare maize completely safe or to recommend disposal without further review.",
            "Users remain responsible for seeking additional assessment when a result is uncertain or high risk.",
        ],
    },
    {
        id: "research",
        number: "07",
        icon: ShieldCheck,
        label: "Research",
        title: "Future research requires separate consent",
        summary:
            "Any future local image collection, interview, observation, or user test must follow the applicable ethics approval and consent conditions.",
        points: [
            "Participants must be told why information is collected and how it will be used.",
            "They must be informed who can access it, how long it will be retained, and how withdrawal works where applicable.",
            "Consent to use the prediction tool is not the same as consent to reuse an image for research or training.",
        ],
    },
    {
        id: "security",
        number: "08",
        icon: LockKeyhole,
        label: "Security",
        title: "Use only the data that is necessary",
        summary:
            "Research records should be limited, protected against unauthorised access, and retained only for the approved project period.",
        points: [
            "Identifying information should be separated from research images where possible.",
            "Access should be limited to authorised people involved in the approved work.",
            "The public prediction prototype does not provide a personal image library because it does not intentionally maintain an application image database.",
        ],
    },
];

export default function PrivacyPolicyPage() {
    return (
        <main className="min-h-screen bg-[#f5f7f3] text-ink">

            <div className="mb-12">
                <Navbar darkText={true} />
            </div>
            <section className="border-b border-[#dfe7df] bg-[linear-gradient(135deg,#f9fbf7_0%,#eef5ee_58%,#f7f3df_100%)] px-5 py-14 md:px-8 md:py-18">
                <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1fr_380px] lg:items-center">
                    <div className="max-w-3xl">
                        <h1 className="mt-6 max-w-3xl font-display text-4xl font-semibold leading-[1.06] tracking-[-0.035em] text-ink sm:text-5xl md:text-6xl">
                            What happens when you upload a maize image?
                        </h1>

                        <p className="mt-5 max-w-2xl text-base leading-8 text-ink-soft md:text-lg">
                            This page explains what MaizeGuard processes, what it does not
                            intentionally store, and when a person should review the result.
                        </p>

                        <div className="mt-7 flex flex-wrap items-center gap-3">
                            <Link
                                href="#image-flow"
                                className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-bold text-white transition hover:bg-[#2d7447]"
                            >
                                See how images are handled
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                            <span className="text-sm font-medium text-ink-soft">
                                Last updated: 25 July 2026
                            </span>
                        </div>
                    </div>

                    <div className="rounded-[1.75rem] border border-[#d4e1d6] bg-white p-6 shadow-[0_18px_50px_rgba(20,39,15,0.08)] md:p-7">
                        <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">
                            At a glance
                        </p>
                        <div className="mt-5 space-y-4">
                            {quickFacts.map((fact) => (
                                <div key={fact} className="flex items-start gap-3">
                                    <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-success/10 text-success">
                                        <CheckCircle2 className="h-4 w-4" />
                                    </span>
                                    <p className="text-sm font-semibold leading-6 text-ink">
                                        {fact}
                                    </p>
                                </div>
                            ))}
                        </div>

                        <div className="mt-6 rounded-2xl border border-[#ead99d] bg-[#fff8df] p-4">
                            <div className="flex items-start gap-3">
                                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-[#9b6b00]" />
                                <div>
                                    <p className="font-semibold text-[#614400]">
                                        Decision support only
                                    </p>
                                    <p className="mt-1 text-sm leading-6 text-[#7a5c14]">
                                        MaizeGuard does not replace laboratory testing or qualified
                                        agricultural inspection.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="px-5 py-12 md:px-8 md:py-16">
                <div className="mx-auto max-w-7xl">
                    <div className="rounded-[1.75rem] border border-[#dfe7df] bg-white p-6 shadow-sm md:p-8">
                        <div className="flex flex-wrap items-end justify-between gap-4">
                            <div>
                                <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">
                                    Image journey
                                </p>
                                <h2 className="mt-2 font-display text-3xl font-semibold text-ink">
                                    Three simple steps
                                </h2>
                            </div>
                            <p className="max-w-xl text-sm leading-7 text-ink-soft">
                                The image is processed only to create the requested prediction.
                            </p>
                        </div>

                        <div className="mt-7 grid gap-4 md:grid-cols-3">
                            {[
                                {
                                    number: "1",
                                    icon: FileImage,
                                    title: "You select an image",
                                    text: "The browser prepares the selected maize photograph for upload.",
                                },
                                {
                                    number: "2",
                                    icon: ServerCog,
                                    title: "The model analyses it",
                                    text: "The image is sent directly to the FastAPI /predict endpoint.",
                                },
                                {
                                    number: "3",
                                    icon: CheckCircle2,
                                    title: "You receive a result",
                                    text: "The interface shows the class, confidence, risk, action, and recommendation.",
                                },
                            ].map((step) => {
                                const Icon = step.icon;
                                return (
                                    <div
                                        key={step.number}
                                        className="rounded-2xl border border-[#dfe7df] bg-[#f8faf7] p-5"
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
                                                <Icon className="h-5 w-5" />
                                            </span>
                                            <span className="text-sm font-bold text-primary/50">
                                                {step.number.padStart(2, "0")}
                                            </span>
                                        </div>
                                        <h3 className="mt-5 text-lg font-semibold text-ink">
                                            {step.title}
                                        </h3>
                                        <p className="mt-2 text-sm leading-6 text-ink-soft">
                                            {step.text}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </section>

            <section className="px-5 pb-16 md:px-8 md:pb-20">
                <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[250px_1fr]">
                    <aside className="h-fit rounded-2xl border border-[#dfe7df] bg-white p-4 shadow-sm lg:sticky lg:top-24">
                        <p className="px-3 text-xs font-bold uppercase tracking-[0.16em] text-primary">
                            On this page
                        </p>
                        <nav className="mt-3 space-y-1">
                            {clauses.map((clause) => (
                                <a
                                    key={clause.id}
                                    href={`#${clause.id}`}
                                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-ink-soft transition hover:bg-[#eef5ee] hover:text-primary"
                                >
                                    <span className="text-xs font-bold text-primary/60">
                                        {clause.number}
                                    </span>
                                    {clause.label}
                                </a>
                            ))}
                        </nav>
                    </aside>

                    <div className="space-y-5">
                        {clauses.map((clause) => {
                            const Icon = clause.icon;
                            return (
                                <article
                                    key={clause.id}
                                    id={clause.id}
                                    className="scroll-mt-28 overflow-hidden rounded-[1.5rem] border border-[#dfe7df] bg-white shadow-sm"
                                >
                                    <div className="border-b border-[#e6ece6] bg-[#f8faf7] px-6 py-5 md:px-7">
                                        <div className="flex items-start gap-4">
                                            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary text-white">
                                                <Icon className="h-5 w-5" />
                                            </span>
                                            <div>
                                                <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">
                                                    {clause.number} · {clause.label}
                                                </p>
                                                <h2 className="mt-1.5 font-display text-2xl font-semibold leading-tight text-ink md:text-3xl">
                                                    {clause.title}
                                                </h2>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="px-6 py-6 md:px-7 md:py-7">
                                        <p className="text-base font-medium leading-8 text-ink">
                                            {clause.summary}
                                        </p>
                                        <ul className="mt-5 space-y-3">
                                            {clause.points.map((point) => (
                                                <li key={point} className="flex items-start gap-3">
                                                    <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-primary" />
                                                    <span className="text-sm leading-7 text-ink-soft md:text-base">
                                                        {point}
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </article>
                            );
                        })}

                        <article className="rounded-[1.5rem] border border-primary/20 bg-[#edf5ee] p-6 md:p-8">
                            <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
                                <div className="flex items-start gap-4">
                                    <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-primary text-white">
                                        <Mail className="h-5 w-5" />
                                    </span>
                                    <div>
                                        <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">
                                            Questions or concerns
                                        </p>
                                        <h2 className="mt-2 font-display text-2xl font-semibold text-ink">
                                            Contact the project researcher
                                        </h2>
                                        <p className="mt-2 max-w-2xl text-sm leading-7 text-ink-soft md:text-base">
                                            Contact the researcher for questions about privacy,
                                            research participation, or how MaizeGuard processes an
                                            uploaded image.
                                        </p>
                                    </div>
                                </div>

                                <a
                                    href={`mailto:${CONTACT_EMAIL}`}
                                    className="inline-flex shrink-0 items-center justify-center rounded-full bg-primary px-5 py-3 text-sm font-bold text-white transition hover:bg-[#2d7447]"
                                >
                                    {CONTACT_EMAIL}
                                </a>
                            </div>
                        </article>
                    </div>
                </div>
            </section>

            <footer className="border-t border-[#dfe7df] bg-white px-5 py-8 md:px-8">
                <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 text-sm text-ink-soft">
                    <div className="flex items-center gap-2">
                        <Leaf className="h-4 w-4 text-primary" />
                        <span className="font-semibold text-ink">MaizeGuard Rwanda</span>
                        <span>· Field assessment prototype</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-5">
                        <Link href="/" className="font-semibold text-primary hover:underline">
                            Return to assessment
                        </Link>
                        <span>Post-harvest decision support · {new Date().getFullYear()}</span>
                    </div>
                </div>
            </footer>
        </main>
    );
}
