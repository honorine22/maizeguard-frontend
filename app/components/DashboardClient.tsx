"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  CloudOff,
  Database,
  Globe2,
  Home,
  LayoutDashboard,
  Leaf,
  ListChecks,
  Loader2,
  LogIn,
  LogOut,
  PackageCheck,
  ShieldAlert,
  TrendingUp,
  Upload,
} from "lucide-react";
import { AssessmentWorkspace } from "./AssessmentWorkspace";
import { SupabaseAssessmentHistory, SupabaseAssessmentSaver } from "./SupabaseAssessmentHistory";
import { SupabaseAuthButtons } from "./SupabaseAuthButtons";
import { formatModelLabel } from "../lib/maizeguard";
import {
  isSupabaseConfigured,
  listenToCurrentUser,
  loadAssessmentHistory,
  signOutOfSupabase,
  type SavedAssessment,
  type SavedAssessmentInput,
} from "../lib/supabaseClient";
import type { User } from "@supabase/supabase-js";

type DashboardView = "overview" | "scan" | "history";
type Language = "en" | "rw" | "fr";

type Props = {
  view?: DashboardView;
};

const sidebarItems = [
  { key: "overview", href: "/dashboard", view: "overview", icon: LayoutDashboard },
  { key: "prediction", href: "/dashboard/scan", view: "scan", icon: Upload },
  { key: "history", href: "/dashboard/history", view: "history", icon: Database },
  { key: "home", href: "/", view: "home", icon: Home },
] as const;

const translations = {
  en: {
    languageName: "English",
    sidebarSubtitle: "Rwanda dashboard",
    backendFirst: "Backend first",
    backendFirstText: "Uploads are sent to the model backend. Signed-in users can save the result summary.",
    logout: "Logout",
    newScan: "New scan",
    nav: {
      overview: "Overview",
      prediction: "Prediction",
      history: "History",
      home: "Home",
    },
    page: {
      overview: {
        eyebrow: "Dashboard overview",
        title: "Batch quality summary",
        description: "Review risk levels, class mix, and the maize samples that need follow-up action.",
      },
      scan: {
        eyebrow: "Prediction workspace",
        title: "Upload a maize sample",
        description: "Send a clear image to the deployed model. Signed-in users can save results automatically.",
      },
      history: {
        eyebrow: "Saved results",
        title: "Assessment history",
        description: "View recent user-specific maize screening records saved in Supabase.",
      },
    },
    overviewCards: {
      assessments: "Assessments",
      highPriority: "High priority",
      avgConfidence: "Avg confidence",
      savedModel: "Saved model",
      needAction: "need action",
      visibleRecords: "Across visible records",
      classes: "4 maize classes",
      liveData: "Live user data",
      demoData: "Demo data",
    },
    overview: {
      riskDistribution: "Risk distribution",
      riskDescription: "A quick view of storage and sorting priorities.",
      lowRisk: "Low risk",
      mediumRisk: "Medium risk",
      highRisk: "High risk",
      needsReview: "Needs review",
      actionQueue: "Action queue",
      actionDescription: "Records that should be sorted, cleaned, referred, or reviewed.",
      noHighPriority: "No high-priority records in the visible dashboard.",
      storageDecision: "Storage decision",
      storageText: "Low-risk maize can be stored normally with routine monitoring.",
      sortingDecision: "Sorting decision",
      sortingText: "Broken kernels should be separated before storage or sale.",
      safetyDecision: "Safety decision",
      safetyText: "Mold-risk or unclear samples should be reviewed before consumption or storage.",
    },
    history: {
      userHistory: "User history",
      savedAssessments: "Saved assessments",
      subtitle: "Supabase keeps user-specific result history after sign-in.",
      configuredMessage:
        "Supabase is optional and is not configured in this environment. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY to enable sign-in and saved assessment history.",
      signedInAs: "Signed in as",
      privacyNote:
        "Only the prediction summary and file metadata are saved. Uploaded images are not stored in Supabase by this frontend.",
      signInPrompt: "Sign in on the dedicated login page to save and review assessment history.",
      loginToSave: "Login to save results",
      signOut: "Sign out",
      working: "Working...",
      savedMessage: "Assessment saved to your Supabase history.",
      missingTableMessage:
        "Supabase is connected, but the assessments table is missing. Run supabase/assessments.sql in the Supabase SQL editor.",
      loadError: "Could not load saved assessment history.",
      saveError: "Could not save this assessment. Confirm you are signed in and the Supabase assessments table exists.",
      savingMessage: "Saving assessment history...",
      emptySignedIn: "Analyze a maize image to save the first result.",
      emptySignedOut: "Sign in to view saved results.",
      result: "Result",
      backendLabel: "Backend label",
      risk: "Risk",
      confidence: "Confidence",
      action: "Action",
      file: "File",
      time: "Time",
    },
    assessment: {
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
  },
  rw: {
    languageName: "Kinyarwanda",
    sidebarSubtitle: "Imbonerahamwe y'u Rwanda",
    backendFirst: "Modeli ibanza",
    backendFirstText: "Amafoto yoherezwa kuri backend ya modeli. Uwinjiye ashobora kubika incamake y'igisubizo.",
    logout: "Sohoka",
    newScan: "Suzuma indi",
    nav: {
      overview: "Incamake",
      prediction: "Isuzuma",
      history: "Amateka",
      home: "Ahabanza",
    },
    page: {
      overview: {
        eyebrow: "Incamake y'imbonerahamwe",
        title: "Incamake y'ubuziranenge bw'ibigori",
        description: "Reba ibyago, ubwoko bw'ibisubizo, n'ibigori bikeneye gukurikiranwa.",
      },
      scan: {
        eyebrow: "Ahakorerwa isuzuma",
        title: "Ohereza ifoto y'ibigori",
        description: "Ohereza ifoto isobanutse kuri modeli yashyizwe ku rubuga. Uwinjiye abikirwa ibisubizo.",
      },
      history: {
        eyebrow: "Ibisubizo byabitswe",
        title: "Amateka y'isuzuma",
        description: "Reba ibisubizo by'ibigori byabitswe muri Supabase kuri konti yawe.",
      },
    },
    overviewCards: {
      assessments: "Amasuzuma",
      highPriority: "Ibyihutirwa",
      avgConfidence: "Icyizere mpuzandengo",
      savedModel: "Modeli ikoreshwa",
      needAction: "bikeneye igikorwa",
      visibleRecords: "Mu bisubizo bigaragara",
      classes: "Ubwoko 4 bw'ibigori",
      liveData: "Amakuru ya konti",
      demoData: "Amakuru y'urugero",
    },
    overview: {
      riskDistribution: "Ikwirakwizwa ry'ibyago",
      riskDescription: "Incamake y'ibikeneye kubikwa, gutoranywa, cyangwa gusuzumwa.",
      lowRisk: "Ibyago bike",
      mediumRisk: "Ibyago biciriritse",
      highRisk: "Ibyago byinshi",
      needsReview: "Bikeneye kugenzurwa",
      actionQueue: "Urutonde rw'ibikorwa",
      actionDescription: "Ibisubizo bikeneye gutoranywa, gusukurwa, koherezwa kugenzurwa, cyangwa gusuzumwa.",
      noHighPriority: "Nta gisubizo cyihutirwa kiri mu bigaragara.",
      storageDecision: "Icyemezo cyo kubika",
      storageText: "Ibigori bifite ibyago bike bishobora kubikwa bisanzwe, bikagenzurwa rimwe na rimwe.",
      sortingDecision: "Icyemezo cyo gutoranya",
      sortingText: "Intete zimenetse zigomba gutandukanywa mbere yo kubika cyangwa kugurisha.",
      safetyDecision: "Icyemezo cy'umutekano",
      safetyText: "Ibigori bifite ibyago by'uruhumbu cyangwa ibidasobanutse bigomba kongera kugenzurwa.",
    },
    history: {
      userHistory: "Amateka y'umukoresha",
      savedAssessments: "Ibisubizo byabitswe",
      subtitle: "Supabase ibika amateka y'ibisubizo bya buri mukoresha nyuma yo kwinjira.",
      configuredMessage:
        "Supabase ntiyashyizweho hano. Shyiraho NEXT_PUBLIC_SUPABASE_URL na NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY kugira ngo kwinjira no kubika ibisubizo bikore.",
      signedInAs: "Winjiye nka",
      privacyNote:
        "Habikwa gusa incamake y'igisubizo n'amakuru ya dosiye. Amafoto wohereje ntabikwa muri Supabase n'iyi frontend.",
      signInPrompt: "Injira ku rupapuro rwa login kugira ngo ubike kandi urebe amateka y'ibisubizo.",
      loginToSave: "Injira ubike ibisubizo",
      signOut: "Sohoka",
      working: "Birimo gukorwa...",
      savedMessage: "Igisubizo cyabitswe muri Supabase.",
      missingTableMessage:
        "Supabase irakora, ariko table ya assessments ntirahari. Koresha supabase/assessments.sql muri SQL editor ya Supabase.",
      loadError: "Ntibyashobotse gufungura amateka y'ibisubizo.",
      saveError: "Ntibyashobotse kubika iki gisubizo. Reba ko winjiye kandi table ya assessments iri muri Supabase.",
      savingMessage: "Kubika igisubizo mu mateka...",
      emptySignedIn: "Suzuma ifoto y'ibigori kugira ngo ubike igisubizo cya mbere.",
      emptySignedOut: "Injira kugira ngo urebe ibisubizo byabitswe.",
      result: "Igisubizo",
      backendLabel: "Ikirango cya backend",
      risk: "Ibyago",
      confidence: "Icyizere",
      action: "Igikorwa",
      file: "Dosiye",
      time: "Igihe",
    },
    assessment: {
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
  },
  fr: {
    languageName: "Français",
    sidebarSubtitle: "Tableau de bord Rwanda",
    backendFirst: "Backend d'abord",
    backendFirstText: "Les images sont envoyées au backend du modèle. Les utilisateurs connectés peuvent enregistrer le résumé du résultat.",
    logout: "Se déconnecter",
    newScan: "Nouvelle analyse",
    nav: {
      overview: "Aperçu",
      prediction: "Prédiction",
      history: "Historique",
      home: "Accueil",
    },
    page: {
      overview: {
        eyebrow: "Aperçu du tableau de bord",
        title: "Résumé de la qualité des lots",
        description: "Consultez les niveaux de risque, les classes détectées et les échantillons à traiter.",
      },
      scan: {
        eyebrow: "Espace de prédiction",
        title: "Importer un échantillon de maïs",
        description: "Envoyez une image claire au modèle déployé. Les résultats sont enregistrés pour les utilisateurs connectés.",
      },
      history: {
        eyebrow: "Résultats enregistrés",
        title: "Historique des analyses",
        description: "Consultez les analyses de maïs enregistrées dans Supabase pour l'utilisateur connecté.",
      },
    },
    overviewCards: {
      assessments: "Analyses",
      highPriority: "Priorité élevée",
      avgConfidence: "Confiance moyenne",
      savedModel: "Modèle utilisé",
      needAction: "nécessitent une action",
      visibleRecords: "Sur les enregistrements visibles",
      classes: "4 classes de maïs",
      liveData: "Données utilisateur",
      demoData: "Données de démonstration",
    },
    overview: {
      riskDistribution: "Répartition des risques",
      riskDescription: "Vue rapide des priorités de stockage et de tri.",
      lowRisk: "Risque faible",
      mediumRisk: "Risque moyen",
      highRisk: "Risque élevé",
      needsReview: "À vérifier",
      actionQueue: "File d'actions",
      actionDescription: "Enregistrements à trier, nettoyer, référer ou vérifier.",
      noHighPriority: "Aucun enregistrement prioritaire dans le tableau de bord visible.",
      storageDecision: "Décision de stockage",
      storageText: "Le maïs à faible risque peut être stocké normalement avec un suivi régulier.",
      sortingDecision: "Décision de tri",
      sortingText: "Les grains cassés doivent être séparés avant le stockage ou la vente.",
      safetyDecision: "Décision de sécurité",
      safetyText: "Les échantillons à risque de moisissure ou incertains doivent être vérifiés avant consommation ou stockage.",
    },
    history: {
      userHistory: "Historique utilisateur",
      savedAssessments: "Analyses enregistrées",
      subtitle: "Supabase conserve l'historique des résultats après connexion.",
      configuredMessage:
        "Supabase est optionnel et n'est pas configuré dans cet environnement. Ajoutez NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY pour activer la connexion et l'historique.",
      signedInAs: "Connecté en tant que",
      privacyNote:
        "Seuls le résumé de la prédiction et les métadonnées du fichier sont enregistrés. Les images importées ne sont pas stockées dans Supabase par ce frontend.",
      signInPrompt: "Connectez-vous depuis la page de connexion pour enregistrer et consulter l'historique.",
      loginToSave: "Connexion pour enregistrer",
      signOut: "Se déconnecter",
      working: "Traitement...",
      savedMessage: "Analyse enregistrée dans votre historique Supabase.",
      missingTableMessage:
        "Supabase est connecté, mais la table assessments est absente. Exécutez supabase/assessments.sql dans l'éditeur SQL de Supabase.",
      loadError: "Impossible de charger l'historique des analyses.",
      saveError: "Impossible d'enregistrer cette analyse. Vérifiez que vous êtes connecté et que la table assessments existe dans Supabase.",
      savingMessage: "Enregistrement dans l'historique...",
      emptySignedIn: "Analysez une image de maïs pour enregistrer le premier résultat.",
      emptySignedOut: "Connectez-vous pour voir les résultats enregistrés.",
      result: "Résultat",
      backendLabel: "Libellé backend",
      risk: "Risque",
      confidence: "Confiance",
      action: "Action",
      file: "Fichier",
      time: "Heure",
    },
    assessment: {
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
  },
} satisfies Record<Language, unknown>;

export function DashboardClient({ view = "overview" }: Props) {
  const [latestAssessment, setLatestAssessment] = useState<SavedAssessmentInput | null>(null);
  const [savedAssessments, setSavedAssessments] = useState<SavedAssessment[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [language, setLanguage] = useState<Language>("en");
  const t = translations[language];
  const copy = t.page[view];

  useEffect(() => {
    const stored = window.localStorage.getItem("maizeguard-language") as Language | null;
    if (stored && stored in translations) setLanguage(stored);
  }, []);

  function changeLanguage(nextLanguage: Language) {
    setLanguage(nextLanguage);
    window.localStorage.setItem("maizeguard-language", nextLanguage);
  }

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setAuthReady(true);
      return undefined;
    }

    return listenToCurrentUser((user) => {
      setCurrentUser(user);
      setAuthReady(true);
      if (!user) {
        setSavedAssessments([]);
        return;
      }

      loadAssessmentHistory()
        .then(setSavedAssessments)
        .catch(() => setSavedAssessments([]));
    });
  }, []);

  const dashboardRecords = useMemo(() => {
    return savedAssessments.map((item) => ({
      label: item.label,
      rawLabel: item.raw_label ?? item.label,
      risk: item.risk,
      confidence: Number(item.confidence ?? 0),
      action: item.action,
      fileName: item.file_name,
      time: item.created_at
        ? new Date(item.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        : "Now",
    }));
  }, [savedAssessments]);

  const riskCounts = useMemo(() => {
    return dashboardRecords.reduce(
      (acc, item) => {
        const risk = item.risk.toLowerCase();
        if (risk.includes("high")) acc.high += 1;
        else if (risk.includes("medium")) acc.medium += 1;
        else if (risk.includes("review") || risk.includes("unclear")) acc.review += 1;
        else acc.low += 1;
        return acc;
      },
      { low: 0, medium: 0, high: 0, review: 0 },
    );
  }, [dashboardRecords]);

  const classCounts = useMemo(() => {
    return dashboardRecords.reduce<Record<string, number>>((acc, item) => {
      const label = formatModelLabel(item.rawLabel).replace(" Grain", "");
      acc[label] = (acc[label] ?? 0) + 1;
      return acc;
    }, {});
  }, [dashboardRecords]);

  const totalAssessments = dashboardRecords.length;
  const highPriorityCount = riskCounts.high + riskCounts.review;
  const averageConfidence = totalAssessments
    ? Math.round(dashboardRecords.reduce((sum, item) => sum + item.confidence, 0) / totalAssessments)
    : 0;
  const highPriorityRate = totalAssessments ? Math.round((highPriorityCount / totalAssessments) * 100) : 0;
  const dashboardMode = currentUser ? t.overviewCards.liveData : t.overviewCards.demoData;

  const overviewCards = [
    {
      label: t.overviewCards.assessments,
      value: String(totalAssessments),
      detail: currentUser ? t.overviewCards.liveData : t.overviewCards.demoData,
      icon: Database,
      tone: "primary",
    },
    {
      label: t.overviewCards.highPriority,
      value: String(highPriorityCount),
      detail: `${highPriorityRate}% ${t.overviewCards.needAction}`,
      icon: ShieldAlert,
      tone: "danger",
    },
    {
      label: t.overviewCards.avgConfidence,
      value: `${averageConfidence}%`,
      detail: t.overviewCards.visibleRecords,
      icon: TrendingUp,
      tone: "success",
    },
    {
      label: t.overviewCards.savedModel,
      value: "MobileNetV3",
      detail: t.overviewCards.classes,
      icon: Activity,
      tone: "neutral",
    },
  ];

  const actionQueue = dashboardRecords
    .filter((item) => !item.risk.toLowerCase().includes("low"))
    .slice(0, 4);

  if (!authReady) {
    return <DashboardAccessState state="loading" />;
  }

  if (!currentUser) {
    return (
      <DashboardAccessState
        state={isSupabaseConfigured() ? "signed-out" : "not-configured"}
        signInPrompt={t.history.signInPrompt}
        configuredMessage={t.history.configuredMessage}
        loginToSave={t.history.loginToSave}
      />
    );
  }

  return (
    <main className="min-h-screen bg-[#f6f7f8] text-ink md:pl-72">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 border-r border-slate-200 bg-white px-5 py-5 shadow-sm md:flex md:flex-col">
        <Link href="/" className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-lg bg-primary text-white shadow-sm">
            <Leaf className="h-5 w-5" />
          </span>
          <span>
            <span className="block text-lg font-bold leading-tight text-ink">MaizeGuard</span>
            <span className="text-xs font-semibold uppercase text-ink-soft">{t.sidebarSubtitle}</span>
          </span>
        </Link>

        <nav className="mt-8 space-y-1">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const active = item.view === view;
            return (
              <Link
                key={item.key}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition ${
                  active
                    ? "bg-slate-100 text-primary shadow-sm"
                    : "text-ink-soft hover:bg-slate-50 hover:text-primary"
                }`}
              >
                <Icon className="h-4 w-4" />
                {t.nav[item.key]}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto space-y-3">
          <LanguageSwitcher language={language} onChange={changeLanguage} />

          {currentUser ? (
            <button
              type="button"
              onClick={() => void signOutOfSupabase()}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-ink shadow-sm transition hover:border-primary/30 hover:text-primary"
            >
              <LogOut className="h-4 w-4" />
              {t.logout}
            </button>
          ) : null}
        </div>
      </aside>

      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 px-5 py-4 backdrop-blur md:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
             <h1 className="mt-1 font-display text-2xl font-semibold text-ink md:text-3xl">{copy.title}</h1>
            <p className="mt-1 max-w-2xl text-sm text-ink-soft">{copy.description}</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden md:block">
              <LanguageSwitcher language={language} onChange={changeLanguage} compact />
            </div>
            <SupabaseAuthButtons darkText />
            <Link
              href="/dashboard/scan"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#2d7447]"
            >
              <Upload className="h-4 w-4" />
              {t.newScan}
            </Link>
          </div>
        </div>

        <div className="mt-3 md:hidden">
          <LanguageSwitcher language={language} onChange={changeLanguage} compact />
        </div>

        <nav className="mt-4 flex gap-2 overflow-x-auto pb-1 md:hidden">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const active = item.view === view;
            return (
              <Link
                key={item.key}
                href={item.href}
                className={`inline-flex shrink-0 items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold ${
                  active ? "border-primary/20 bg-primary/10 text-primary" : "border-slate-200 bg-white text-ink-soft"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {t.nav[item.key]}
              </Link>
            );
          })}
        </nav>
      </header>

      <div className="px-5 py-8 md:px-8">
        {view === "overview" ? (
          <DashboardOverview
            overviewCards={overviewCards}
            riskCounts={riskCounts}
            classCounts={classCounts}
            totalAssessments={totalAssessments}
            dashboardMode={dashboardMode}
            actionQueue={actionQueue}
            copy={t.overview}
          />
        ) : null}

        {view === "scan" ? (
          <div>
            <AssessmentWorkspace
              compact
              onAssessmentComplete={setLatestAssessment}
              eyebrow={copy.eyebrow}
              title={copy.title}
              copy={t.assessment}
            />
            <SupabaseAssessmentSaver
              latestAssessment={latestAssessment}
              onHistoryChange={setSavedAssessments}
              copy={t.history}
            />
          </div>
        ) : null}

        {view === "history" ? (
          <div>
            <SupabaseAssessmentHistory
              latestAssessment={null}
              onHistoryChange={setSavedAssessments}
              table
              copy={t.history}
            />
          </div>
        ) : null}
      </div>
    </main>
  );
}

function DashboardAccessState({
  state,
  signInPrompt = "Sign in to access the dashboard.",
  configuredMessage = "Supabase is not configured, so protected dashboard access is unavailable.",
  loginToSave = "Login to save results",
}: {
  state: "loading" | "signed-out" | "not-configured";
  signInPrompt?: string;
  configuredMessage?: string;
  loginToSave?: string;
}) {
  const isLoading = state === "loading";
  const isConfigured = state !== "not-configured";
  const Icon = isLoading ? Loader2 : isConfigured ? LogIn : CloudOff;

  return (
    <main className="grid min-h-screen place-items-center bg-[#f6f7f8] px-5 text-ink">
      <div className="w-full max-w-xl rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-sm md:p-8">
        <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-primary/10 text-primary">
          <Icon className={`h-5 w-5 ${isLoading ? "animate-spin" : ""}`} />
        </span>
        <h1 className="mt-5 font-display text-3xl font-semibold text-ink">
          {isLoading ? "Checking dashboard access" : "Login required"}
        </h1>
        <p className="mt-3 text-sm leading-6 text-ink-soft">
          {isLoading ? "Please wait while MaizeGuard checks your signed-in session." : isConfigured ? signInPrompt : configuredMessage}
        </p>
        {!isLoading && isConfigured ? (
          <Link
            href="/login"
            className="mt-5 inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#2d7447]"
          >
            <LogIn className="h-4 w-4" />
            {loginToSave}
          </Link>
        ) : null}
      </div>
    </main>
  );
}

type DashboardOverviewProps = {
  overviewCards: Array<{
    label: string;
    value: string;
    detail: string;
    icon: typeof Database;
    tone: string;
  }>;
  riskCounts: { low: number; medium: number; high: number; review: number };
  classCounts: Record<string, number>;
  totalAssessments: number;
  dashboardMode: string;
  actionQueue: Array<{
    label: string;
    risk: string;
    action: string;
    fileName: string;
    time: string;
  }>;
  copy: typeof translations.en.overview;
};

function DashboardOverview({
  overviewCards,
  riskCounts,
  classCounts,
  totalAssessments,
  dashboardMode,
  actionQueue,
  copy,
}: DashboardOverviewProps) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {overviewCards.map((metric) => {
          const Icon = metric.icon;
          const isPrimary = metric.tone === "primary";
          const isDanger = metric.tone === "danger";
          return (
            <div
              key={metric.label}
              className={`rounded-lg border p-5 shadow-sm ${
                isPrimary
                  ? "border-primary/15 bg-white"
                  : isDanger
                    ? "border-danger/15 bg-white"
                    : "border-slate-200 bg-white"
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-ink-soft">{metric.label}</p>
                <span className={`grid h-9 w-9 place-items-center rounded-lg ${
                  isPrimary ? "bg-primary/10 text-primary" : isDanger ? "bg-danger/10 text-danger" : "bg-slate-100 text-primary"
                }`}>
                  <Icon className="h-4 w-4" />
                </span>
              </div>
              <p className="mt-3 font-display text-3xl font-semibold text-ink">{metric.value}</p>
              <p className="mt-1 text-xs font-medium text-ink-soft">{metric.detail}</p>
            </div>
          );
        })}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm md:p-7">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="grid h-10 w-10 place-items-center rounded-lg bg-slate-100 text-primary">
                <BarChart3 className="h-5 w-5" />
              </span>
              <div>
                <h2 className="font-display text-xl font-semibold text-ink">{copy.riskDistribution}</h2>
                <p className="mt-1 text-sm text-ink-soft">{copy.riskDescription}</p>
              </div>
            </div>
            <span className="rounded-lg bg-slate-100 px-3 py-1 text-xs font-semibold text-ink-soft">
              {dashboardMode}
            </span>
          </div>

          <div className="mt-6 space-y-4">
            {[
              { label: copy.lowRisk, value: riskCounts.low, color: "bg-success" },
              { label: copy.mediumRisk, value: riskCounts.medium, color: "bg-warning" },
              { label: copy.highRisk, value: riskCounts.high, color: "bg-danger" },
              { label: copy.needsReview, value: riskCounts.review, color: "bg-clay" },
            ].map((item) => {
              const percent = totalAssessments ? Math.round((item.value / totalAssessments) * 100) : 0;
              return (
                <div key={item.label}>
                  <div className="mb-1.5 flex items-center justify-between text-sm">
                    <span className="font-semibold text-ink">{item.label}</span>
                    <span className="font-medium text-ink-soft">{item.value} / {percent}%</span>
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                    <div className={`h-full rounded-full ${item.color}`} style={{ width: `${percent}%` }} />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {Object.entries(classCounts).slice(0, 4).map(([label, count]) => (
              <div key={label} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-ink-soft">{label}</p>
                <p className="mt-1 font-display text-2xl font-semibold text-ink">{count}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm md:p-7">
          <div className="flex items-center gap-2">
            <span className="grid h-10 w-10 place-items-center rounded-lg bg-slate-100 text-primary">
              <ListChecks className="h-5 w-5" />
            </span>
            <div>
              <h2 className="font-display text-xl font-semibold text-ink">{copy.actionQueue}</h2>
              <p className="mt-1 text-sm text-ink-soft">{copy.actionDescription}</p>
            </div>
          </div>

          <ul className="mt-5 space-y-3">
            {actionQueue.length ? actionQueue.map((item) => (
              <li key={`${item.fileName}-${item.time}`} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-ink">{item.label}</p>
                    <p className="mt-1 text-sm leading-5 text-ink-soft">{item.action}</p>
                  </div>
                  <span className={`shrink-0 rounded-lg px-2.5 py-1 text-xs font-semibold ${
                    item.risk.toLowerCase().includes("high")
                      ? "bg-danger/10 text-danger"
                      : item.risk.toLowerCase().includes("review")
                        ? "bg-clay/10 text-clay"
                        : "bg-warning/10 text-warning"
                  }`}>
                    {item.risk}
                  </span>
                </div>
              </li>
            )) : (
              <li className="rounded-lg border border-success/20 bg-success/5 p-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-success">
                  <CheckCircle2 className="h-4 w-4" />
                  {copy.noHighPriority}
                </div>
              </li>
            )}
          </ul>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {[
          [copy.storageDecision, copy.storageText],
          [copy.sortingDecision, copy.sortingText],
          [copy.safetyDecision, copy.safetyText],
        ].map(([title, detail], index) => (
          <div key={title} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className={`grid h-10 w-10 place-items-center rounded-lg ${
              index === 2 ? "bg-danger/10 text-danger" : index === 1 ? "bg-warning/10 text-warning" : "bg-success/10 text-success"
            }`}>
              {index === 2 ? <AlertTriangle className="h-5 w-5" /> : <PackageCheck className="h-5 w-5" />}
            </div>
            <h3 className="mt-4 font-display text-lg font-semibold text-ink">{title}</h3>
            <p className="mt-2 text-sm leading-6 text-ink-soft">{detail}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function LanguageSwitcher({
  language,
  onChange,
  compact = false,
}: {
  language: Language;
  onChange: (language: Language) => void;
  compact?: boolean;
}) {
  return (
    <label className={`flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-sm ${
      compact ? "w-auto" : "w-full"
    }`}>
      <Globe2 className="h-4 w-4 text-primary" />
      <select
        value={language}
        onChange={(event) => onChange(event.target.value as Language)}
        className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-ink outline-none"
        aria-label="Language"
      >
        <option value="en">EN</option>
        <option value="rw">RW</option>
        <option value="fr">FR</option>
      </select>
    </label>
  );
}
