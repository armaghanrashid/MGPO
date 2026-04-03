import type {
  ApplicationSource,
  ApplicationStage,
  AvailabilitySlot,
  DemoPanel,
  InterestTag,
  Language,
  LocalizedString,
  RequirementTag,
  SeverityLevel,
} from './types'

type LanguageCopy = {
  appName: string
  nav: {
    home: string
    pricing: string
    demo: string
    reset: string
    bilingual: string
  }
  ctas: {
    seeDemo: string
    viewPricing: string
    backToDemo: string
    launchMontreal: string
    openVolunteerPage: string
    reviewPricing: string
    resetDemo: string
  }
  home: {
    eyebrow: string
    title: string
    subtitle: string
    proofLabel: string
    proofValue: string
    storyLabel: string
    storyValue: string
    heroCards: Array<{ label: string; value: string; note: string }>
    featureTitle: string
    featureSubtitle: string
    featureCards: Array<{
      kicker: string
      title: string
      body: string
    }>
    whyTitle: string
    whyBullets: string[]
    launchTitle: string
    launchBody: string
    differentiators: Array<{ title: string; body: string }>
  }
  pricing: {
    eyebrow: string
    title: string
    subtitle: string
    addOnsTitle: string
    addOns: string[]
    compareTitle: string
    compareRows: Array<{ label: string; community: string; momentum: string; network: string }>
  }
  demo: {
    workspaceEyebrow: string
    workspaceTitle: string
    workspaceSubtitle: string
    planLabel: string
    moduleLabel: string
    premiumGateTitle: string
    premiumGateBody: string
    networkGateTitle: string
    networkGateBody: string
    metricsTitle: string
    metrics: {
      hours: string
      retention: string
      satisfaction: string
      activity: string
      applications: string
      matches: string
      trainings: string
      interviews: string
      emailsSent: string
      responses: string
    }
    panelDescriptions: Record<DemoPanel, string>
    pipeline: {
      sourceTitle: string
      sourceSubtitle: string
      actionLabel: string
      lastUpdated: string
      stagePlaceholder: string
    }
    profiles: {
      title: string
      subtitle: string
      completeness: string
      contacts: string
    }
    training: {
      title: string
      subtitle: string
      assignedTo: string
      chooseVolunteer: string
      answerLabel: string
      submit: string
      completed: string
    }
    matching: {
      title: string
      subtitle: string
      usage: string
      unlockShortlist: string
      sendEmail: string
      markResponse: string
      score: string
      template: string
    }
    interviews: {
      title: string
      subtitle: string
      volunteerLabel: string
      schedule: string
      booked: string
      available: string
    }
    alerts: {
      title: string
      subtitle: string
      sendReminder: string
      resolve: string
      deadline: string
    }
    volunteer: {
      breadcrumb: string
      title: string
      profileTitle: string
      profileSubtitle: string
      timesheetTitle: string
      timesheetSubtitle: string
      incidentTitle: string
      incidentSubtitle: string
      timelineTitle: string
      timelineSubtitle: string
      contactsTitle: string
      trainingTitle: string
      saveProfile: string
      logHours: string
      fileIncident: string
      noIncidents: string
      noTimeline: string
      fields: {
        tshirt: string
        dietary: string
        availability: string
        notes: string
        date: string
        hours: string
        rating: string
        feedback: string
        severity: string
        description: string
      }
    }
  }
  labels: {
    stages: Record<ApplicationStage, string>
    sources: Record<ApplicationSource, string>
    availability: Record<AvailabilitySlot, string>
    interests: Record<InterestTag, string>
    requirements: Record<RequirementTag, string>
    severity: Record<SeverityLevel, string>
    status: {
      open: string
      sent: string
      resolved: string
      applicant: string
      active: string
      alumni: string
    }
  }
}

export const localized = (en: string, fr: string): LocalizedString => ({ en, fr })

export const dictionary: Record<Language, LanguageCopy> = {
  en: {
    appName: 'Voluntreal',
    nav: {
      home: 'Overview',
      pricing: 'Pricing',
      demo: 'Platform',
      reset: 'Reset Demo',
      bilingual: 'EN / FR',
    },
    ctas: {
      seeDemo: 'Open platform',
      viewPricing: 'See pricing',
      backToDemo: 'Back to platform',
      launchMontreal: 'Built for Montreal nonprofits',
      openVolunteerPage: 'Open volunteer page',
      reviewPricing: 'Review plans',
      resetDemo: 'Reset workspace',
    },
    home: {
      eyebrow: 'Montreal-first volunteer operations platform',
      title: 'Volunteer operations software that centralizes applications, onboarding, training, and ongoing engagement.',
      subtitle:
        'Voluntreal centralizes applications, volunteer profiles, onboarding timelines, training, smart matching, and hours tracking for Montreal nonprofits that need one clean operating picture.',
      proofLabel: 'Montreal-ready',
      proofValue: 'EN / FR workflows for CIUSSS, campus, and community organizations',
      storyLabel: 'Why it wins',
      storyValue: 'Faster than spreadsheets, clearer than generic enterprise software',
      heroCards: [
        { label: 'Application sources', value: '5 connected', note: 'Website, CABM, McGill, referrals, CIUSSS' },
        { label: 'Volunteer hours', value: '248h', note: 'Tracked live across sites and shifts' },
        { label: 'Smart shortlist usage', value: '42 / 100', note: 'Momentum tier usage cap visible in-product' },
      ],
      featureTitle: 'Six platform pillars, one sharp workflow',
      featureSubtitle:
        'The product story is simple: everything recruiters, coordinators, and volunteers need, without bouncing between email, calendars, spreadsheets, and generic portals.',
      featureCards: [
        {
          kicker: '01',
          title: 'Applications pipeline hub',
          body: 'One stream for website forms, Centre d’action benevole referrals, McGill fairs, and direct outreach.',
        },
        {
          kicker: '02',
          title: 'Volunteer profiles',
          body: 'Standardized records with availability, interests, experience, physical requirements, T-shirt sizes, and dietary needs.',
        },
        {
          kicker: '03',
          title: 'Matching and communication',
          body: 'Role-based shortlists, reusable outreach, and plan-based match limits for growing teams.',
        },
        {
          kicker: '04',
          title: 'Training that confirms understanding',
          body: 'Video modules with short questions so teams stop repeating the same onboarding live.',
        },
        {
          kicker: '05',
          title: 'Interview and reminder hub',
          body: 'Suggested slots, follow-up prompts, and interview booking without juggling separate tools.',
        },
        {
          kicker: '06',
          title: 'Dashboard and activity tracking',
          body: 'KPI-driven reporting with hours, retention proxy, satisfaction feedback, matches, trainings, and interviews.',
        },
      ],
      whyTitle: 'What makes the platform stronger than generic volunteer software',
      whyBullets: [
        'Built specifically for Montreal organizations that operate across bilingual, multi-site teams.',
        'Turns premium features into an obvious value ladder instead of a vague enterprise quote.',
        'Includes volunteer-facing timesheets, feedback, incident reporting, and supervisor contacts.',
      ],
      launchTitle: 'Built for operational clarity',
      launchBody:
        'Voluntreal gives teams one place to manage intake, onboarding, scheduling, training completion, and volunteer activity across organizations and sites.',
      differentiators: [
        {
          title: 'Clear monetization',
          body: 'Free for smaller teams, Momentum for coordination, Network for serious multi-site operations.',
        },
        {
          title: 'Volunteer-side accountability',
          body: 'Hours, feedback, onboarding timeline, and contact fields are visible to the volunteer as well as the admin team.',
        },
        {
          title: 'Montreal realism',
          body: 'Bilingual content, local institutions, and CAD pricing make the platform feel believable from the first scroll.',
        },
      ],
    },
    pricing: {
      eyebrow: 'Transparent CAD pricing',
      title: 'Pricing plans for growing volunteer teams.',
      subtitle:
        'Each plan supports a different level of coordination, with clear volunteer caps, smart match limits, and operational tools for larger teams.',
      addOnsTitle: 'Add-ons',
      addOns: [
        'Extra batch of 25 volunteers: $10 CAD / month',
        'Extra 100 smart matches: $8 CAD / month',
        'Bilingual onboarding setup and migration support can be offered as implementation services',
      ],
      compareTitle: 'What changes by tier',
      compareRows: [
        { label: 'Volunteer profiles + timesheets', community: 'Included', momentum: 'Included', network: 'Included' },
        { label: 'Pipeline hub + dashboard', community: 'Included', momentum: 'Included', network: 'Included' },
        { label: 'Training videos + quizzes', community: 'Locked', momentum: 'Included', network: 'Included' },
        { label: 'Interview hub', community: 'Locked', momentum: 'Included', network: 'Included' },
        { label: 'Matching + communication', community: 'Locked', momentum: '100 smart matches', network: 'Unlimited' },
        { label: 'Incident reporting', community: 'Locked', momentum: 'View only', network: 'Included' },
      ],
    },
    demo: {
      workspaceEyebrow: 'Operations platform',
      workspaceTitle: 'Montreal volunteer ops command center',
      workspaceSubtitle:
        'Centralize applications, volunteer records, training progress, interviews, reminders, and reporting in one operational view.',
      planLabel: 'Plan',
      moduleLabel: 'Workspace module',
      premiumGateTitle: 'Momentum unlocks this workflow',
      premiumGateBody:
        'Training, interviews, matching, and automated reminders are premium because they remove the most staff workload.',
      networkGateTitle: 'Network unlocks incident reporting',
      networkGateBody:
        'Serious multi-site oversight requires incident documentation, escalations, and consolidated reporting.',
      metricsTitle: 'Operating snapshot',
      metrics: {
        hours: 'Volunteer hours',
        retention: 'Retention proxy',
        satisfaction: 'Feedback score',
        activity: 'Active volunteers',
        applications: 'Applications',
        matches: 'Unlocked matches',
        trainings: 'Trainings completed',
        interviews: 'Interviews booked',
        emailsSent: 'Emails sent',
        responses: 'Responses',
      },
      panelDescriptions: {
        dashboard: 'Track the KPIs that prove program health and fundraising credibility.',
        pipeline: 'Move applicants through screening, interviews, training, and activation.',
        profiles: 'View structured volunteer records across every intake source.',
        training: 'Confirm orientation understanding with video-based quizzes.',
        matching: 'Surface strong candidates and send bilingual outreach with a premium usage cap.',
        interviews: 'Book interview slots without switching between inboxes and calendars.',
        alerts: 'Keep references, orientation confirmations, and follow-ups from falling through the cracks.',
      },
      pipeline: {
        sourceTitle: 'Applications by source',
        sourceSubtitle: 'A single view across internal and external intake channels.',
        actionLabel: 'Advance stage',
        lastUpdated: 'Last updated',
        stagePlaceholder: 'Choose a stage',
      },
      profiles: {
        title: 'Volunteer directory',
        subtitle: 'Structured profiles ready for matching, onboarding, and operations.',
        completeness: 'Profile completeness',
        contacts: 'Supervisor contacts',
      },
      training: {
        title: 'Training modules',
        subtitle: 'Upload once, quiz quickly, and keep the record attached to each volunteer.',
        assignedTo: 'Assigned volunteers',
        chooseVolunteer: 'Review as volunteer',
        answerLabel: 'Question check',
        submit: 'Save response',
        completed: 'Completed',
      },
      matching: {
        title: 'Smart matching + communication',
        subtitle: 'Use reveal caps to turn coordination power into a clear premium upgrade path.',
        usage: 'Monthly smart matches used',
        unlockShortlist: 'Unlock shortlist',
        sendEmail: 'Send outreach',
        markResponse: 'Mark response',
        score: 'Match score',
        template: 'Template',
      },
      interviews: {
        title: 'Interview hub',
        subtitle: 'Offer guided time slots and schedule directly from the platform.',
        volunteerLabel: 'Assign volunteer',
        schedule: 'Book interview',
        booked: 'Booked',
        available: 'Available',
      },
      alerts: {
        title: 'Alerts and reminders',
        subtitle: 'Follow-up prompts for references, orientation, and missing information.',
        sendReminder: 'Send reminder',
        resolve: 'Resolve',
        deadline: 'Deadline',
      },
      volunteer: {
        breadcrumb: 'Volunteer page',
        title: 'Volunteer portal',
        profileTitle: 'Profile and readiness',
        profileSubtitle: 'Keep information current so matching and onboarding stay accurate.',
        timesheetTitle: 'Timesheet and feedback',
        timesheetSubtitle: 'Volunteers can log hours and share how the experience went.',
        incidentTitle: 'Incident reporting',
        incidentSubtitle: 'Capture safety issues, injuries, or risky situations in one record.',
        timelineTitle: 'Onboarding timeline',
        timelineSubtitle: 'A chronological trail from application to activation.',
        contactsTitle: 'Who to contact',
        trainingTitle: 'Training progress',
        saveProfile: 'Save profile',
        logHours: 'Log hours',
        fileIncident: 'File incident',
        noIncidents: 'No incident reports have been filed for this volunteer.',
        noTimeline: 'No onboarding events yet.',
        fields: {
          tshirt: 'T-shirt size',
          dietary: 'Dietary restrictions',
          availability: 'Availability',
          notes: 'Coordinator notes',
          date: 'Date',
          hours: 'Hours',
          rating: 'Feedback rating',
          feedback: 'Volunteer feedback',
          severity: 'Severity',
          description: 'Description',
        },
      },
    },
    labels: {
      stages: {
        received: 'Received',
        review: 'In review',
        interview: 'Interview',
        training: 'Training',
        active: 'Active',
      },
      sources: {
        website: 'Website form',
        cabm: 'Centre d’action benevole',
        mcgill: 'McGill community fair',
        referral: 'Partner referral',
        ciuss: 'CIUSSS outreach',
      },
      availability: {
        weekdays: 'Weekdays',
        evenings: 'Evenings',
        weekends: 'Weekends',
        flexible: 'Flexible',
      },
      interests: {
        'patient-support': 'Patient support',
        events: 'Events',
        'food-security': 'Food security',
        mentoring: 'Mentoring',
        admin: 'Admin',
        outreach: 'Community outreach',
      },
      requirements: {
        standing: 'Standing',
        lifting: 'Light lifting',
        bilingual: 'Bilingual communication',
        indoor: 'Indoor environment',
        outdoor: 'Outdoor environment',
      },
      severity: {
        low: 'Low',
        medium: 'Medium',
        high: 'High',
      },
      status: {
        open: 'Open',
        sent: 'Reminder sent',
        resolved: 'Resolved',
        applicant: 'Applicant',
        active: 'Active',
        alumni: 'Alumni',
      },
    },
  },
  fr: {
    appName: 'Voluntreal',
    nav: {
      home: 'Apercu',
      pricing: 'Tarifs',
      demo: 'Plateforme',
      reset: 'Reinitialiser',
      bilingual: 'FR / EN',
    },
    ctas: {
      seeDemo: 'Ouvrir la plateforme',
      viewPricing: 'Voir les tarifs',
      backToDemo: 'Retour a la plateforme',
      launchMontreal: 'Concu pour les OBNL de Montreal',
      openVolunteerPage: 'Ouvrir la page benevole',
      reviewPricing: 'Voir les forfaits',
      resetDemo: 'Reinitialiser l espace',
    },
    home: {
      eyebrow: 'Plateforme de gestion benevole pensee pour Montreal',
      title: 'Un logiciel de gestion benevole qui centralise les candidatures, l integration, la formation et le suivi continu.',
      subtitle:
        'Voluntreal centralise les candidatures, les profils, les parcours d integration, la formation, le jumelage intelligent et le suivi des heures pour les OBNL montrealais.',
      proofLabel: 'Pret pour Montreal',
      proofValue: 'Parcours EN / FR pour les organisations CIUSSS, universitaires et communautaires',
      storyLabel: 'Pourquoi ca se demarque',
      storyValue: 'Plus rapide que les feuilles de calcul et plus clair qu un logiciel generique',
      heroCards: [
        { label: 'Sources de candidature', value: '5 connectees', note: 'Site web, CABM, McGill, references, CIUSSS' },
        { label: 'Heures benevoles', value: '248 h', note: 'Suivies en direct sur plusieurs sites et quarts' },
        { label: 'Jumelages intelligents', value: '42 / 100', note: 'Le plafond du forfait Momentum est visible dans le produit' },
      ],
      featureTitle: 'Six piliers, un seul flux de travail',
      featureSubtitle:
        'L histoire du produit est simple: tout ce dont les recruteurs, coordonnateurs et benevoles ont besoin, sans passer entre courriels, calendriers, feuilles et portails generiques.',
      featureCards: [
        {
          kicker: '01',
          title: 'Hub des candidatures',
          body: 'Un seul flux pour les formulaires du site, les references du Centre d action benevole, les foires McGill et les approches directes.',
        },
        {
          kicker: '02',
          title: 'Profils benevoles',
          body: 'Des dossiers standardises avec disponibilites, interets, experience, exigences physiques, tailles de t-shirt et besoins alimentaires.',
        },
        {
          kicker: '03',
          title: 'Jumelage et communication',
          body: 'Des listes courtes par role, des messages reutilisables et des limites par forfait pour les equipes en croissance.',
        },
        {
          kicker: '04',
          title: 'Formation avec verification',
          body: 'Des modules video avec de courtes questions pour eviter de repeter l integration en personne.',
        },
        {
          kicker: '05',
          title: 'Entrevues et rappels',
          body: 'Des plages suggerees, des rappels et des entrevues reservees sans jongler avec plusieurs outils.',
        },
        {
          kicker: '06',
          title: 'Tableau de bord et activite',
          body: 'Des indicateurs sur les heures, la retention, la satisfaction, les jumelages, les formations et les entrevues.',
        },
      ],
      whyTitle: 'Pourquoi la plateforme est plus solide qu un logiciel benevole generique',
      whyBullets: [
        'Concu precisement pour des organismes montrealais avec des equipes bilingues et multisites.',
        'Transforme les fonctions premium en progression de valeur claire plutot qu en soumission floue.',
        'Inclut les feuilles de temps, la retroaction, les incidents et les contacts de supervision du cote benevole.',
      ],
      launchTitle: 'Concu pour une gestion operationnelle claire',
      launchBody:
        'Voluntreal regroupe la gestion des candidatures, l integration, la planification, la formation et le suivi benevole dans une seule vue operationnelle.',
      differentiators: [
        {
          title: 'Monetisation claire',
          body: 'Gratuit pour les petites equipes, Momentum pour la coordination, Network pour les operations multisites.',
        },
        {
          title: 'Responsabilisation du cote benevole',
          body: 'Les heures, la retroaction, le parcours d integration et les contacts sont visibles pour le benevole et l equipe admin.',
        },
        {
          title: 'Realite montrealise',
          body: 'Contenu bilingue, institutions locales et prix en CAD rendent la plateforme credible des le premier ecran.',
        },
      ],
    },
    pricing: {
      eyebrow: 'Tarification transparente en CAD',
      title: 'Des forfaits pour les equipes benevoles en croissance.',
      subtitle:
        'Chaque forfait correspond a un niveau de coordination different, avec des plafonds benevoles clairs, des limites de jumelage et des outils adaptes aux grandes equipes.',
      addOnsTitle: 'Options',
      addOns: [
        'Bloc supplementaire de 25 benevoles: 10 $ CAD / mois',
        '100 jumelages intelligents supplementaires: 8 $ CAD / mois',
        'La mise en place bilingue et la migration peuvent etre vendues comme services d implantation',
      ],
      compareTitle: 'Ce qui change selon le forfait',
      compareRows: [
        { label: 'Profils benevoles + feuilles de temps', community: 'Inclus', momentum: 'Inclus', network: 'Inclus' },
        { label: 'Hub des candidatures + tableau de bord', community: 'Inclus', momentum: 'Inclus', network: 'Inclus' },
        { label: 'Videos de formation + quiz', community: 'Verrouille', momentum: 'Inclus', network: 'Inclus' },
        { label: 'Hub des entrevues', community: 'Verrouille', momentum: 'Inclus', network: 'Inclus' },
        { label: 'Jumelage + communication', community: 'Verrouille', momentum: '100 jumelages', network: 'Illimite' },
        { label: 'Signalement d incidents', community: 'Verrouille', momentum: 'Lecture seule', network: 'Inclus' },
      ],
    },
    demo: {
      workspaceEyebrow: 'Plateforme operationnelle',
      workspaceTitle: 'Centre de commande benevole de Montreal',
      workspaceSubtitle:
        'Centralisez les candidatures, les profils benevoles, la formation, les entrevues, les rappels et les rapports dans une seule vue operationnelle.',
      planLabel: 'Forfait',
      moduleLabel: 'Module',
      premiumGateTitle: 'Momentum debloque ce flux',
      premiumGateBody:
        'La formation, les entrevues, le jumelage et les rappels automatiques sont premium parce qu ils retirent le plus de charge de travail.',
      networkGateTitle: 'Network debloque les incidents',
      networkGateBody:
        'Une supervision multisite serieuse exige de la documentation d incident, des escalades et des rapports consolides.',
      metricsTitle: 'Apercu operationnel',
      metrics: {
        hours: 'Heures benevoles',
        retention: 'Indice de retention',
        satisfaction: 'Score de satisfaction',
        activity: 'Benevoles actifs',
        applications: 'Candidatures',
        matches: 'Jumelages visibles',
        trainings: 'Formations completees',
        interviews: 'Entrevues reservees',
        emailsSent: 'Courriels envoyes',
        responses: 'Reponses',
      },
      panelDescriptions: {
        dashboard: 'Suivez les indicateurs qui prouvent la sante du programme et sa valeur.',
        pipeline: 'Faites progresser les candidatures du triage jusqu a l activation.',
        profiles: 'Consultez des profils structures provenant de chaque source d inscription.',
        training: 'Validez la comprehension des benevoles avec des quiz de formation.',
        matching: 'Faites ressortir les bons candidats et envoyez des messages bilingues avec une limite premium.',
        interviews: 'Reservez des entrevues sans alterner entre boite courriel et calendrier.',
        alerts: 'Evitez les oublis pour references, orientations et suivis.',
      },
      pipeline: {
        sourceTitle: 'Candidatures par source',
        sourceSubtitle: 'Une seule vue sur les canaux internes et externes.',
        actionLabel: 'Changer l etape',
        lastUpdated: 'Derniere mise a jour',
        stagePlaceholder: 'Choisir une etape',
      },
      profiles: {
        title: 'Repertoire des benevoles',
        subtitle: 'Des profils structures pour le jumelage, l integration et les operations.',
        completeness: 'Completeness du profil',
        contacts: 'Contacts de supervision',
      },
      training: {
        title: 'Modules de formation',
        subtitle: 'Televerser une fois, verifier rapidement et conserver la preuve par benevole.',
        assignedTo: 'Benevoles assignes',
        chooseVolunteer: 'Voir comme benevole',
        answerLabel: 'Verification',
        submit: 'Enregistrer la reponse',
        completed: 'Complete',
      },
      matching: {
        title: 'Jumelage intelligent + communication',
        subtitle: 'Utilisez les plafonds de reveles pour transformer la coordination en valeur premium.',
        usage: 'Jumelages intelligents utilises ce mois',
        unlockShortlist: 'Reveler la liste',
        sendEmail: 'Envoyer le message',
        markResponse: 'Marquer une reponse',
        score: 'Score de jumelage',
        template: 'Gabarit',
      },
      interviews: {
        title: 'Hub des entrevues',
        subtitle: 'Proposez des plages guidees et reservez directement depuis la plateforme.',
        volunteerLabel: 'Assigner le benevole',
        schedule: 'Reserver l entrevue',
        booked: 'Reserve',
        available: 'Disponible',
      },
      alerts: {
        title: 'Alertes et rappels',
        subtitle: 'Des rappels pour les references, l orientation et les informations manquantes.',
        sendReminder: 'Envoyer le rappel',
        resolve: 'Resoudre',
        deadline: 'Echeance',
      },
      volunteer: {
        breadcrumb: 'Page benevole',
        title: 'Portail benevole',
        profileTitle: 'Profil et preparation',
        profileSubtitle: 'Gardez les informations a jour pour que le jumelage et l integration restent fiables.',
        timesheetTitle: 'Feuille de temps et retroaction',
        timesheetSubtitle: 'Les benevoles peuvent consigner leurs heures et partager leur experience.',
        incidentTitle: 'Signalement d incident',
        incidentSubtitle: 'Consignez les blessures, risques ou situations dangereuses dans un seul dossier.',
        timelineTitle: 'Chronologie d integration',
        timelineSubtitle: 'Un fil chronologique de la candidature jusqu a l activation.',
        contactsTitle: 'Qui contacter',
        trainingTitle: 'Progression de formation',
        saveProfile: 'Enregistrer le profil',
        logHours: 'Ajouter des heures',
        fileIncident: 'Signaler un incident',
        noIncidents: 'Aucun incident n a ete signale pour ce benevole.',
        noTimeline: 'Aucun evenement pour le moment.',
        fields: {
          tshirt: 'Taille de t-shirt',
          dietary: 'Restrictions alimentaires',
          availability: 'Disponibilites',
          notes: 'Notes du coordonnateur',
          date: 'Date',
          hours: 'Heures',
          rating: 'Evaluation',
          feedback: 'Retroaction',
          severity: 'Gravite',
          description: 'Description',
        },
      },
    },
    labels: {
      stages: {
        received: 'Recu',
        review: 'En evaluation',
        interview: 'Entrevue',
        training: 'Formation',
        active: 'Actif',
      },
      sources: {
        website: 'Formulaire web',
        cabm: 'Centre d action benevole',
        mcgill: 'Foire communautaire McGill',
        referral: 'Reference partenaire',
        ciuss: 'Approche CIUSSS',
      },
      availability: {
        weekdays: 'Jours de semaine',
        evenings: 'Soirs',
        weekends: 'Fins de semaine',
        flexible: 'Flexible',
      },
      interests: {
        'patient-support': 'Soutien aux patients',
        events: 'Evenements',
        'food-security': 'Securite alimentaire',
        mentoring: 'Mentorat',
        admin: 'Administration',
        outreach: 'Rayonnement communautaire',
      },
      requirements: {
        standing: 'Travail debout',
        lifting: 'Leger levage',
        bilingual: 'Communication bilingue',
        indoor: 'Milieu interieur',
        outdoor: 'Milieu exterieur',
      },
      severity: {
        low: 'Faible',
        medium: 'Moyenne',
        high: 'Elevee',
      },
      status: {
        open: 'Ouverte',
        sent: 'Rappel envoye',
        resolved: 'Resolu',
        applicant: 'Candidat',
        active: 'Actif',
        alumni: 'Ancien',
      },
    },
  },
}
