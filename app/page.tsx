"use client";

import { useEffect, useState } from "react";
import { AppFooter } from "./components/AppFooter";
import { AssessmentWorkspace } from "./components/AssessmentWorkspace";
import { HeroSection } from "./components/HeroSection";
import { Navbar } from "./components/Navbar";
import { PublicDataSection } from "./components/PublicDataSection";

type Language = "en" | "rw" | "fr";

const homeTranslations = {
  en: {
    languageName: "English",
    navbar: {
      home: "Home",
      dashboard: "Dashboard",
      data: "Data",
      assessSample: "Assess sample",
    },
    hero: {
      title: "Know your maize before storage or sale.",
      description:
        "Upload a maize image to get instant quality insights, a confidence score, and practical post-harvest guidance.",
      assessSample: "Assess a sample",
      openDashboard: "Open dashboard",
      stats: [
        ["13.8%", "Maize can be lost after harvest"],
        ["Buyer rejection", "Poor quality can reduce market value"],
        ["Act early", "Know whether to dry, sort, clean, or refer"],
      ] as Array<[string, string]>,
      qualityCheck: "Quality check",
      workflow: "Post-harvest workflow",
    },
    assessment: {
      eyebrow: "Quick assessment",
      title: "Upload a maize image from the home page.",
      readyToAssess: "Ready to assess",
      assessingImage: "Assessing image...",
      assessmentCompleted: "Assessment completed",
      modelApiUnavailable: "Model API unavailable",
      backendOnline: "Backend online",
      checkingBackend: "Checking backend",
      backendOffline: "Backend offline",
      dropToUpload: "Drop to upload",
      dropPhoto: "Drop photo or click to browse",
      fileTypes: "JPG, PNG, WebP, up to",
      modelClasses: "Model classes",
      modelClassesSubtitle: "Four categories available for maize screening.",
      classesCount: "4 classes",
      good: "Good",
      broken: "Broken",
      impurity: "Impurity",
      moldRisk: "Mold risk",
      lowRisk: "Low risk",
      mediumRisk: "Medium risk",
      highRisk: "High risk",
      prediction: "Prediction",
      assessmentResult: "Assessment result",
      screeningReport: "Screening report",
      originalImageAnalyzed: "Original image analyzed",
      result: "Result",
      backendLabel: "Backend label",
      confidence: "Confidence",
      risk: "Risk",
      recommendedAction: "Recommended action",
      backendEvidence: "Backend model evidence",
      topPrediction: "Top prediction",
      uploadToShowProbabilities: "Upload a photo to show class probabilities from the model API.",
      analyzeAnother: "Analyze another",
      replaceImage: "Replace",
      privacyTitle: "Privacy",
      privacyDescription:
        "The image is sent to the model for prediction only and is not stored by MaizeGuard. Avoid faces, documents, or private information.",
      privacyLink: "Read privacy policy",
      farmerGuidanceTitle: "What this means for the farmer",
      farmerGuidanceSubtitle: "The percentages are converted into storage, sorting, cleaning, or review decisions.",
      confidenceMeaning: "Confidence meaning",
      evidenceByClass: "Evidence by class",
      practicalSteps: "Practical next steps",
      strongConfidence: "Strong model signal",
      mediumConfidence: "Useful but check the sample",
      lowConfidence: "Uncertain result",
      strongConfidenceText:
        "The model is confident. Use the recommendation, but still check the physical batch before a final decision.",
      mediumConfidenceText:
        "The model has a useful signal. Inspect the sample and repeat with a clearer photo if the batch is important.",
      lowConfidenceText:
        "The model is uncertain. Do not rely on this result alone; take another photo or ask for manual review.",
      goodSteps: [
        "Keep the maize dry and off the floor.",
        "Store in a clean bag or container.",
        "Monitor moisture and insects during storage.",
      ],
      brokenSteps: [
        "Separate broken kernels before storage or sale.",
        "Use sorted broken grain quickly where appropriate.",
        "Re-screen the cleaner batch after sorting.",
      ],
      impuritySteps: [
        "Remove stones, husks, dust, and foreign material.",
        "Clean the batch before weighing or selling.",
        "Take another photo after cleaning to confirm improvement.",
      ],
      moldRiskSteps: [
        "Do not mix this batch with clean maize.",
        "Avoid storage until the batch is checked.",
        "Refer the sample for quality or safety review.",
      ],
      reviewSteps: [
        "Take a clearer close-up photo of shelled maize.",
        "Check that the image contains maize only.",
        "Ask for manual review before storage, sale, or consumption.",
      ],
    },
    data: {
      badge: "Public training data",
      title: "Public datasets prepared for the maize quality model.",
      description:
        "Local farmer images are kept for manual testing only. Training relies on public datasets to keep the model workflow consistent and reproducible.",
    },
    footer: {
      prototype: "Field assessment prototype",
      privacyPolicy: "Privacy Policy",
      dataSources: "Data sources",
      decisionSupport: "Post-harvest decision support",
    },
  },
  rw: {
    languageName: "Kinyarwanda",
    navbar: {
      home: "Ahabanza",
      dashboard: "Imbonerahamwe",
      data: "Amakuru",
      assessSample: "Suzuma icyitegererezo",
    },
    hero: {
      title: "Menya ubuziranenge bw'ibigori mbere yo kubika cyangwa kugurisha.",
      description:
        "Ohereza ifoto y'ibigori ubone igisubizo cyihuse, igipimo cy'icyizere, n'inama z'ibikorwa nyuma y'isarura.",
      assessSample: "Suzuma icyitegererezo",
      openDashboard: "Fungura imbonerahamwe",
      stats: [
        ["13.8%", "Ibigori bishobora gutakara nyuma y'isarura"],
        ["Kwangwa n'abaguzi", "Ubuziranenge buke bugabanya agaciro ku isoko"],
        ["Fata icyemezo kare", "Menya niba ugomba kumisha, gutoranya, gusukura, cyangwa kohereza kugenzurwa"],
      ] as Array<[string, string]>,
      qualityCheck: "Isuzuma ry'ubuziranenge",
      workflow: "Ibikorwa nyuma y'isarura",
    },
    assessment: {
      eyebrow: "Isuzuma ryihuse",
      title: "Ohereza ifoto y'ibigori uri ku rupapuro rw'ahabanza.",
      readyToAssess: "Witeguye gusuzuma",
      assessingImage: "Ifoto irasuzumwa...",
      assessmentCompleted: "Isuzuma rirarangiye",
      modelApiUnavailable: "Model API ntiboneka",
      backendOnline: "Backend iri gukora",
      checkingBackend: "Kugenzura backend",
      backendOffline: "Backend ntiri gukora",
      dropToUpload: "Rekura ifoto hano",
      dropPhoto: "Rekura ifoto cyangwa ukande uhitemo",
      fileTypes: "JPG, PNG, WebP, kugeza kuri",
      modelClasses: "Ubwoko bwa modeli",
      modelClassesSubtitle: "Ubwoko bune bukoreshwa mu gusuzuma ibigori.",
      classesCount: "Ubwoko 4",
      good: "Byiza",
      broken: "Byamenetse",
      impurity: "Bifite imyanda",
      moldRisk: "Ibyago by'uruhumbu",
      lowRisk: "Ibyago bike",
      mediumRisk: "Ibyago biciriritse",
      highRisk: "Ibyago byinshi",
      prediction: "Isuzuma",
      assessmentResult: "Igisubizo cy'isuzuma",
      screeningReport: "Raporo y'isuzuma",
      originalImageAnalyzed: "Ifoto y'umwimerere yasuzumwe",
      result: "Igisubizo",
      backendLabel: "Ikirango cya backend",
      confidence: "Icyizere",
      risk: "Ibyago",
      recommendedAction: "Igikorwa gisabwa",
      backendEvidence: "Ibimenyetso bya modeli",
      topPrediction: "Icyagaragaye cyane",
      uploadToShowProbabilities: "Ohereza ifoto kugira ngo werekane amahirwe ya buri bwoko.",
      analyzeAnother: "Suzuma indi",
      replaceImage: "Hindura",
      privacyTitle: "Ibanga",
      privacyDescription:
        "Ifoto yoherezwa kuri modeli kugira ngo isuzumwe gusa kandi MaizeGuard ntibika iyo foto. Irinde gushyiramo amasura, inyandiko, cyangwa amakuru y'ibanga.",
      privacyLink: "Soma politiki y'ibanga",
      farmerGuidanceTitle: "Icyo bivuze ku muhinzi",
      farmerGuidanceSubtitle:
        "Ijanisha rihindurwamo inama zo kubika, gutoranya, gusukura, cyangwa kugenzura.",
      confidenceMeaning: "Icyo igipimo cy'icyizere kivuze",
      evidenceByClass: "Ibimenyetso kuri buri bwoko",
      practicalSteps: "Intambwe zikurikira",
      strongConfidence: "Modeli yizeye cyane",
      mediumConfidence: "Igisubizo kirafasha ariko banza ugenzure",
      lowConfidence: "Igisubizo nticyizewe bihagije",
      strongConfidenceText:
        "Modeli yizeye igisubizo. Kurikiza inama, ariko ubanze ugenzure ibigori nyabyo mbere y'icyemezo cya nyuma.",
      mediumConfidenceText:
        "Modeli yatanze ikimenyetso gifasha. Suzuma icyitegererezo kandi wongere ufate ifoto isobanutse niba iki cyemezo ari ingenzi.",
      lowConfidenceText:
        "Modeli ntiyizeye bihagije. Ntukoreshe iki gisubizo cyonyine; fata indi foto cyangwa usabe kugenzurwa n'umuntu.",
      goodSteps: [
        "Bika ibigori byumye kandi bitari hasi.",
        "Bishyire mu mufuka cyangwa ikigega gisukuye.",
        "Komeza kugenzura ubuhehere n'udukoko mu bubiko.",
      ],
      brokenSteps: [
        "Tandukanya intete zimenetse mbere yo kubika cyangwa kugurisha.",
        "Koresha vuba intete zimenetse aho bikwiye.",
        "Ongera usuzume ibigori byatowe nyuma yo kubitandukanya.",
      ],
      impuritySteps: [
        "Kuramo amabuye, ibishishwa, umukungugu, n'indi myanda.",
        "Sukura ibigori mbere yo kubipima cyangwa kubigurisha.",
        "Fata indi foto nyuma yo gusukura kugira ngo wemeze ko byakosotse.",
      ],
      moldRiskSteps: [
        "Ntuvange ibi bigori n'ibisukuye.",
        "Ntubibike mbere y'uko byongera kugenzurwa.",
        "Ohereza icyitegererezo kugenzurwa ku bw'ubuziranenge n'umutekano.",
      ],
      reviewSteps: [
        "Fata ifoto isobanutse ya hafi y'ibigori bishishuye.",
        "Reba ko ifoto irimo ibigori gusa.",
        "Saba umuntu kubigenzura mbere yo kubika, kugurisha, cyangwa kubirya.",
      ],
    },
    data: {
      badge: "Amakuru yakoreshejwe mu kwigisha modeli",
      title: "Datasets rusange zateguwe kuri modeli y'ubuziranenge bw'ibigori.",
      description:
        "Amafoto y'abahinzi akoreshwa mu igerageza gusa. Kwigisha modeli bishingira kuri datasets rusange kugira ngo uburyo bube busobanutse kandi busubirwamo.",
    },
    footer: {
      prototype: "Prototype y'isuzuma ryo mu murima",
      privacyPolicy: "Politiki y'ibanga",
      dataSources: "Aho amakuru ava",
      decisionSupport: "Ubufasha mu gufata ibyemezo nyuma y'isarura",
    },
  },
  fr: {
    languageName: "Français",
    navbar: {
      home: "Accueil",
      dashboard: "Tableau de bord",
      data: "Données",
      assessSample: "Analyser un échantillon",
    },
    hero: {
      title: "Connaissez la qualité de votre maïs avant le stockage ou la vente.",
      description:
        "Importez une image de maïs pour obtenir rapidement une classe de qualité, un score de confiance et des conseils pratiques après récolte.",
      assessSample: "Analyser un échantillon",
      openDashboard: "Ouvrir le tableau de bord",
      stats: [
        ["13.8%", "Le maïs peut être perdu après la récolte"],
        ["Rejet par l'acheteur", "Une mauvaise qualité peut réduire la valeur marchande"],
        ["Agir tôt", "Savoir s'il faut sécher, trier, nettoyer ou référer"],
      ] as Array<[string, string]>,
      qualityCheck: "Contrôle qualité",
      workflow: "Processus après récolte",
    },
    assessment: {
      eyebrow: "Analyse rapide",
      title: "Importez une image de maïs depuis la page d'accueil.",
      readyToAssess: "Prêt à analyser",
      assessingImage: "Analyse de l'image...",
      assessmentCompleted: "Analyse terminée",
      modelApiUnavailable: "API du modèle indisponible",
      backendOnline: "Backend en ligne",
      checkingBackend: "Vérification du backend",
      backendOffline: "Backend hors ligne",
      dropToUpload: "Déposez pour importer",
      dropPhoto: "Déposez une photo ou cliquez pour parcourir",
      fileTypes: "JPG, PNG, WebP, jusqu'à",
      modelClasses: "Classes du modèle",
      modelClassesSubtitle: "Quatre catégories disponibles pour l'analyse du maïs.",
      classesCount: "4 classes",
      good: "Bon",
      broken: "Cassé",
      impurity: "Impureté",
      moldRisk: "Risque de moisissure",
      lowRisk: "Risque faible",
      mediumRisk: "Risque moyen",
      highRisk: "Risque élevé",
      prediction: "Prédiction",
      assessmentResult: "Résultat de l'analyse",
      screeningReport: "Rapport d'analyse",
      originalImageAnalyzed: "Image originale analysée",
      result: "Résultat",
      backendLabel: "Libellé backend",
      confidence: "Confiance",
      risk: "Risque",
      recommendedAction: "Action recommandée",
      backendEvidence: "Preuves du modèle backend",
      topPrediction: "Prédiction principale",
      uploadToShowProbabilities: "Importez une photo pour afficher les probabilités de chaque classe.",
      analyzeAnother: "Analyser une autre",
      replaceImage: "Remplacer",
      privacyTitle: "Confidentialité",
      privacyDescription:
        "L'image est envoyée au modèle uniquement pour la prédiction et n'est pas stockée par MaizeGuard. Évitez les visages, documents ou informations privées.",
      privacyLink: "Lire la politique de confidentialité",
      farmerGuidanceTitle: "Ce que cela signifie pour l'agriculteur",
      farmerGuidanceSubtitle:
        "Les pourcentages sont transformés en décisions de stockage, tri, nettoyage ou vérification.",
      confidenceMeaning: "Signification de la confiance",
      evidenceByClass: "Preuve par classe",
      practicalSteps: "Prochaines étapes pratiques",
      strongConfidence: "Signal fort du modèle",
      mediumConfidence: "Utile, mais vérifiez l'échantillon",
      lowConfidence: "Résultat incertain",
      strongConfidenceText:
        "Le modèle est confiant. Utilisez la recommandation, mais vérifiez quand même le lot physique avant la décision finale.",
      mediumConfidenceText:
        "Le modèle donne un signal utile. Inspectez l'échantillon et reprenez une photo plus claire si le lot est important.",
      lowConfidenceText:
        "Le modèle est incertain. Ne vous fiez pas uniquement à ce résultat; prenez une autre photo ou demandez une vérification manuelle.",
      goodSteps: [
        "Gardez le maïs sec et hors du sol.",
        "Stockez-le dans un sac ou un récipient propre.",
        "Surveillez l'humidité et les insectes pendant le stockage.",
      ],
      brokenSteps: [
        "Séparez les grains cassés avant le stockage ou la vente.",
        "Utilisez rapidement les grains cassés triés si cela convient.",
        "Analysez de nouveau le lot nettoyé après le tri.",
      ],
      impuritySteps: [
        "Retirez les pierres, les enveloppes, la poussière et les corps étrangers.",
        "Nettoyez le lot avant la pesée ou la vente.",
        "Reprenez une photo après nettoyage pour confirmer l'amélioration.",
      ],
      moldRiskSteps: [
        "Ne mélangez pas ce lot avec du maïs propre.",
        "Évitez le stockage jusqu'à une nouvelle vérification.",
        "Référez l'échantillon pour un contrôle qualité ou sécurité.",
      ],
      reviewSteps: [
        "Prenez une photo rapprochée plus claire du maïs décortiqué.",
        "Vérifiez que l'image contient uniquement du maïs.",
        "Demandez une vérification manuelle avant stockage, vente ou consommation.",
      ],
    },
    data: {
      badge: "Données publiques d'entraînement",
      title: "Jeux de données publics préparés pour le modèle de qualité du maïs.",
      description:
        "Les images locales des agriculteurs sont réservées aux tests manuels. L'entraînement utilise des jeux de données publics pour garder un processus cohérent et reproductible.",
    },
    footer: {
      prototype: "Prototype d'analyse de terrain",
      privacyPolicy: "Politique de confidentialité",
      dataSources: "Sources de données",
      decisionSupport: "Aide à la décision après récolte",
    },
  },
};

export default function Home() {
  const [language, setLanguage] = useState<Language>("en");
  const copy = homeTranslations[language];

  useEffect(() => {
    const stored = window.localStorage.getItem("maizeguard-language") as Language | null;
    if (stored && stored in homeTranslations) setLanguage(stored);
  }, []);

  function changeLanguage(nextLanguage: Language) {
    setLanguage(nextLanguage);
    window.localStorage.setItem("maizeguard-language", nextLanguage);
  }

  return (
    <main className="min-h-screen bg-[#f6f8f4] text-ink">
      <Navbar copy={copy.navbar} language={language} onLanguageChange={changeLanguage} />
      <HeroSection copy={copy.hero} />
      <section className="px-5 py-20 md:px-8">
        <div className="mx-auto max-w-7xl">
          <AssessmentWorkspace
            compact
            eyebrow={copy.assessment.eyebrow}
            title={copy.assessment.title}
            copy={copy.assessment}
          />
        </div>
      </section>
      <PublicDataSection copy={copy.data} />
      <AppFooter copy={copy.footer} />
    </main>
  );
}
