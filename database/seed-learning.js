function seedLearningPaths(db) {
  const pathCount = db.prepare('SELECT COUNT(*) as count FROM learning_paths').get();
  if (pathCount.count > 0) return;

  // Trouver ou créer un user_id parent (on utilise un ID dédié)
  let parentUser = db.prepare("SELECT id FROM users WHERE name = 'Julien'").get();
  if (!parentUser) {
    db.prepare(`
      INSERT INTO users (name, avatar, age, classe, profile_type, theme, is_dyslexic, interests, daily_limit_minutes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run('Julien', '👔', 40, 'Pro', 'entrepreneur', 'default', 0,
      JSON.stringify(['textile', 'recyclage', 'IA', 'management', 'solidarité textile', 'frip and co']), 120);
    parentUser = db.prepare("SELECT id FROM users WHERE name = 'Julien'").get();
  }

  const userId = parentUser.id;

  // =============================================
  // PARCOURS 1 : Anglais Textile / Mode / Recyclage
  // =============================================
  const path1 = db.prepare(`
    INSERT INTO learning_paths (user_id, slug, title, description, icon, total_modules)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(userId, 'english-textile',
    'Business English : Textile, Mode & Recyclage',
    'Maîtrisez l\'anglais professionnel dans le contexte de l\'industrie textile, de la mode durable et du recyclage. Conçu pour vos fonctions chez Solidarité Textile et Frip and Co.',
    '🇬🇧👔', 15);

  const pathId1 = path1.lastInsertRowid;
  const insertLesson = db.prepare(`
    INSERT INTO audio_lessons (path_id, module_number, title, subtitle, content_text, key_points, vocabulary, quiz_questions, duration_estimate, order_index)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  // Module 1
  insertLesson.run(pathId1, 1,
    'Introduction to the Textile Industry',
    'Les fondamentaux du vocabulaire textile en anglais',
    `Welcome to your first lesson on Business English for the Textile Industry.

In this module, we will cover the essential vocabulary you need to navigate professional conversations about textiles, fashion, and recycling in English.

The textile industry is one of the largest global industries. As the president of Solidarité Textile and Frip and Co, you interact with international partners, NGOs, and businesses. Let's build your confidence in English.

Let's start with the basics. The textile supply chain includes several key stages: fiber production, spinning, weaving or knitting, dyeing and finishing, cutting and sewing, and finally distribution.

In English, we distinguish between natural fibers like cotton, wool, silk, and linen, and synthetic fibers such as polyester, nylon, and acrylic. Recycled fibers are increasingly important — they come from post-consumer waste, meaning clothes that people have already worn and discarded.

When you talk about your work at Solidarité Textile, you might say: "We collect and sort second-hand clothing to give textiles a second life." Or: "Our mission is to reduce textile waste through reuse and recycling."

Key phrases for meetings: "I'd like to discuss our collection volumes." "What is your current sorting capacity?" "We need to improve our recycling rate."

Practice these phrases out loud as you drive. Repetition is key to fluency.`,
    JSON.stringify([
      'La supply chain textile en anglais',
      'Fibres naturelles vs synthétiques vs recyclées',
      'Phrases clés pour parler de Solidarité Textile',
      'Vocabulaire des réunions professionnelles'
    ]),
    JSON.stringify([
      { en: 'textile supply chain', fr: 'chaîne d\'approvisionnement textile' },
      { en: 'second-hand clothing', fr: 'vêtements de seconde main' },
      { en: 'post-consumer waste', fr: 'déchets post-consommation' },
      { en: 'sorting capacity', fr: 'capacité de tri' },
      { en: 'recycling rate', fr: 'taux de recyclage' },
      { en: 'fiber production', fr: 'production de fibres' },
      { en: 'to give a second life', fr: 'donner une seconde vie' }
    ]),
    JSON.stringify([
      { q: 'How do you say "vêtements de seconde main" in English?', a: 'Second-hand clothing' },
      { q: 'What is the English term for "taux de recyclage"?', a: 'Recycling rate' }
    ]),
    12, 1);

  // Module 2
  insertLesson.run(pathId1, 2,
    'Sustainable Fashion Vocabulary',
    'Le vocabulaire de la mode durable et responsable',
    `Welcome to module two. Today we focus on sustainable fashion — a topic at the heart of your business.

Sustainable fashion, also called eco-fashion or ethical fashion, refers to clothing that is designed, manufactured, distributed, and used in ways that are environmentally and socially responsible.

Key concepts you need to know:

Circular economy — in English, we say "circular economy" or "circularity." This means designing products with their end-of-life in mind. Instead of the linear model of "take, make, dispose," circularity promotes "reduce, reuse, recycle."

Fast fashion versus slow fashion. Fast fashion brands produce cheap clothing at high volumes. Slow fashion prioritizes quality, durability, and fair labor practices.

As the head of Frip and Co, you are part of the solution. Here are phrases you can use:

"Frip and Co is a social enterprise that promotes circular fashion."
"We believe in extending the life cycle of garments."
"Our business model contributes to waste reduction and job creation."
"We provide affordable second-hand clothing while reducing landfill waste."

When speaking at conferences or with international partners, you might need:

"The environmental impact of the textile industry is significant."
"We need to transition from a linear to a circular model."
"Our sorting process separates wearable items from those destined for recycling."
"We work with local communities to create employment through textile reuse."

Remember: confidence matters more than perfection. Your English doesn't need to be perfect — it needs to be clear and effective.`,
    JSON.stringify([
      'Sustainable / ethical / eco-fashion',
      'Circular economy vs linear model',
      'Fast fashion vs slow fashion',
      'Phrases pour présenter Frip and Co en anglais',
      'Vocabulaire des conférences internationales'
    ]),
    JSON.stringify([
      { en: 'circular economy', fr: 'économie circulaire' },
      { en: 'fast fashion', fr: 'mode jetable / fast fashion' },
      { en: 'slow fashion', fr: 'mode durable / slow fashion' },
      { en: 'life cycle', fr: 'cycle de vie' },
      { en: 'landfill waste', fr: 'déchets en décharge' },
      { en: 'social enterprise', fr: 'entreprise sociale' },
      { en: 'waste reduction', fr: 'réduction des déchets' },
      { en: 'garment', fr: 'vêtement (terme industrie)' }
    ]),
    JSON.stringify([
      { q: 'What is the opposite of "fast fashion"?', a: 'Slow fashion' },
      { q: 'How would you describe Frip and Co in English?', a: 'A social enterprise that promotes circular fashion' }
    ]),
    14, 2);

  // Module 3
  insertLesson.run(pathId1, 3,
    'Negotiation & Partnerships',
    'Négocier et construire des partenariats en anglais',
    `Module three: Negotiation and Partnerships in English.

As a business leader, you frequently negotiate with partners, suppliers, municipalities, and international organizations. Let's build your negotiation vocabulary.

Starting a negotiation:
"Thank you for taking the time to meet with us."
"I'd like to propose a partnership that benefits both sides."
"Let me outline our value proposition."

Discussing terms:
"What volumes are we looking at?"
"We can offer competitive pricing on sorted textiles."
"Our minimum order quantity is..."
"We'd need to discuss logistics and delivery timelines."

Expressing your position:
"From our perspective, the priority is quality over quantity."
"We believe this partnership aligns with both our missions."
"I'm flexible on the timeline, but the quality standards are non-negotiable."

Handling disagreements:
"I understand your concern, but let me explain our reasoning."
"Could we find a middle ground on this point?"
"Let's revisit this after reviewing the numbers."

Closing a deal:
"I think we have a solid basis for agreement."
"Shall we move forward with a pilot project?"
"I'll have our team draft a memorandum of understanding."

Social enterprise specific:
"Our social mission is integral to our business model."
"We employ people who face barriers to traditional employment."
"Every ton of textiles we process creates social impact."

Practice tip: When driving, pick one scenario and roleplay both sides of the conversation. This builds fluency and confidence.`,
    JSON.stringify([
      'Ouvrir une négociation en anglais',
      'Discuter des conditions commerciales',
      'Exprimer sa position avec diplomatie',
      'Gérer les désaccords',
      'Conclure un accord'
    ]),
    JSON.stringify([
      { en: 'value proposition', fr: 'proposition de valeur' },
      { en: 'minimum order quantity', fr: 'quantité minimale de commande' },
      { en: 'memorandum of understanding', fr: 'protocole d\'accord' },
      { en: 'pilot project', fr: 'projet pilote' },
      { en: 'non-negotiable', fr: 'non négociable' },
      { en: 'middle ground', fr: 'terrain d\'entente' },
      { en: 'social impact', fr: 'impact social' }
    ]),
    JSON.stringify([
      { q: 'How do you propose a pilot project in English?', a: 'Shall we move forward with a pilot project?' },
      { q: 'What is a "memorandum of understanding"?', a: 'A protocole d\'accord — a formal agreement between parties' }
    ]),
    15, 3);

  // Module 4
  insertLesson.run(pathId1, 4,
    'Presenting at International Conferences',
    'Prendre la parole en anglais devant un public international',
    `Module four: Public Speaking at International Events.

You represent Solidarité Textile and Frip and Co on the international stage. Here's how to deliver impactful presentations in English.

Opening your presentation:
"Good morning everyone. My name is Julien, and I'm the president of Solidarité Textile."
"Today, I'd like to share our experience in building a circular textile economy in France."
"I'll be covering three main points: our collection model, our sorting innovation, and our social impact."

Structuring your talk:
"First, let me give you some context..."
"Moving on to our second point..."
"Finally, I'd like to highlight..."
"To sum up..."

Sharing statistics:
"Last year, we collected over X tons of textiles."
"Our sorting centers process X tons per day."
"We've created X jobs for people in vulnerable situations."
"X percent of collected textiles are reused, Y percent are recycled."

Engaging the audience:
"You might be wondering how we achieve this scale."
"Let me give you a concrete example."
"I'd like to invite you to imagine..."

Handling Q&A:
"That's an excellent question."
"To be honest, that's a challenge we're still working on."
"I'd be happy to discuss this further after the session."
"The short answer is... but the nuance is important."

Closing with impact:
"The textile industry can and must become circular. We're proving it's possible."
"Thank you for your attention. I'm happy to take any questions."

Pro tip: Record yourself giving a 2-minute version of this presentation. Listen back and identify areas to improve.`,
    JSON.stringify([
      'Ouvrir une présentation avec impact',
      'Structurer un discours en 3 points',
      'Partager des chiffres et statistiques',
      'Gérer les questions-réponses',
      'Conclure avec force'
    ]),
    JSON.stringify([
      { en: 'to give you some context', fr: 'pour vous donner du contexte' },
      { en: 'concrete example', fr: 'exemple concret' },
      { en: 'vulnerable situations', fr: 'situations de précarité' },
      { en: 'Q&A session', fr: 'session de questions-réponses' },
      { en: 'to take questions', fr: 'prendre des questions' },
      { en: 'the short answer is', fr: 'la réponse courte est' }
    ]),
    JSON.stringify([
      { q: 'How do you introduce yourself at a conference?', a: 'My name is..., and I\'m the president of...' },
      { q: 'How do you transition between points?', a: 'Moving on to our second point... / Finally, I\'d like to highlight...' }
    ]),
    13, 4);

  // Module 5
  insertLesson.run(pathId1, 5,
    'Textile Sorting & Grading',
    'Le tri et le classement des textiles — vocabulaire technique',
    `Module five: Technical Vocabulary for Textile Sorting and Grading.

This is the core of your daily operations. Let's master the English terms.

Sorting categories:
"Rewearable" or "reusable" — items in good enough condition to be sold as second-hand.
"Recyclable" — items that can be processed into new fibers or materials.
"Waste" or "residual" — items with no further use.

Grading terminology:
"Grade A" or "cream" — the best quality, often exported to Africa or Eastern Europe.
"Grade B" — good quality, suitable for domestic resale.
"Grade C" — lower quality, may need repair.
"Wipers" or "rags" — industrial cleaning cloths cut from unusable textiles.

Process vocabulary:
"Collection point" — where the public drops off donations.
"Sorting line" — the conveyor belt where workers sort items.
"Baling" — compressing sorted textiles into bales for transport.
"Shredding" — mechanically breaking down textiles into fibers.
"Downcycling" — recycling into lower-value products like insulation.
"Upcycling" — transforming waste into higher-value products.

Reporting in English:
"Our throughput is X tons per week."
"The reuse rate stands at X percent."
"We've invested in optical sorting technology."
"Our contamination rate has decreased by X percent."

These terms will help you communicate effectively with international buyers, auditors, and partners.`,
    JSON.stringify([
      'Catégories de tri en anglais',
      'Système de grading (A, B, C)',
      'Vocabulaire des processus industriels',
      'Reporting en anglais'
    ]),
    JSON.stringify([
      { en: 'rewearable / reusable', fr: 'réemployable / réutilisable' },
      { en: 'baling', fr: 'mise en balles' },
      { en: 'shredding', fr: 'déchiquetage / effilochage' },
      { en: 'downcycling', fr: 'recyclage en produit de moindre valeur' },
      { en: 'upcycling', fr: 'recyclage valorisant / surcyclage' },
      { en: 'throughput', fr: 'débit / capacité de traitement' },
      { en: 'contamination rate', fr: 'taux de contamination' },
      { en: 'optical sorting', fr: 'tri optique' }
    ]),
    JSON.stringify([
      { q: 'What is the difference between downcycling and upcycling?', a: 'Downcycling creates lower-value products, upcycling creates higher-value ones' },
      { q: 'What does "throughput" mean?', a: 'The rate at which materials are processed — débit/capacité de traitement' }
    ]),
    12, 5);

  // Modules 6-8 (résumés pour ne pas surcharger)
  insertLesson.run(pathId1, 6,
    'EU Regulations & Compliance',
    'La réglementation européenne textile en anglais',
    `Module six: Understanding EU Textile Regulations in English.

The European Union is implementing major changes that directly affect your business. Let's learn to discuss them in English.

Extended Producer Responsibility, or EPR, is a policy approach where producers take responsibility for the end-of-life of their products. In French, this is the REP — Responsabilité Élargie du Producteur.

The EU Strategy for Sustainable and Circular Textiles, published in 2022, sets ambitious goals:
"All textile products placed on the EU market should be durable, repairable, and recyclable by 2030."
"The presence of hazardous substances should be minimized."
"Producers should take responsibility for their products along the value chain."

Key regulatory terms:
"Due diligence" — the obligation to verify supply chain practices.
"Traceability" — the ability to track a product's origin and journey.
"Eco-design requirements" — design standards that consider environmental impact.
"Digital product passport" — a digital record of a product's composition and lifecycle.
"Green claims directive" — rules about environmental marketing claims.

In meetings about regulation:
"We need to prepare for the upcoming EPR implementation."
"Our sorting data will be crucial for compliance reporting."
"The digital product passport will change how we track textiles."
"We welcome these regulations as they validate our business model."

These regulations are your opportunity. As a leader in textile reuse and recycling, you are ahead of the curve. Communicate this advantage confidently.`,
    JSON.stringify([
      'Extended Producer Responsibility (EPR)',
      'EU Strategy for Sustainable Textiles',
      'Vocabulaire réglementaire en anglais',
      'Communiquer sur la conformité'
    ]),
    JSON.stringify([
      { en: 'Extended Producer Responsibility', fr: 'Responsabilité Élargie du Producteur' },
      { en: 'due diligence', fr: 'devoir de vigilance' },
      { en: 'traceability', fr: 'traçabilité' },
      { en: 'eco-design', fr: 'éco-conception' },
      { en: 'digital product passport', fr: 'passeport numérique produit' },
      { en: 'compliance reporting', fr: 'reporting de conformité' }
    ]),
    JSON.stringify([
      { q: 'What does EPR stand for?', a: 'Extended Producer Responsibility' },
      { q: 'What is a digital product passport?', a: 'A digital record of a product\'s composition and lifecycle' }
    ]),
    14, 6);

  insertLesson.run(pathId1, 7,
    'Email & Written Communication',
    'Rédiger des emails professionnels en anglais textile',
    `Module seven: Professional Email Communication.

Email is often your first point of contact with international partners. Let's master the art of professional textile emails.

Subject lines:
"Partnership inquiry — Textile sorting services"
"Follow-up: Meeting on circular textile solutions"
"Proposal: Joint collection program"

Opening:
"Dear Mr./Ms. [Name]," — formal
"Hello [First name]," — when you already know the person
"I hope this email finds you well." — standard opener
"Following our conversation at [event name]..." — reference a previous meeting

Body — requesting information:
"I am writing to inquire about your textile recycling capabilities."
"Could you provide us with your current pricing for sorted Grade A textiles?"
"We are interested in exploring a partnership for textile collection in [region]."

Body — proposing a partnership:
"I would like to propose a collaboration between our organizations."
"Solidarité Textile processes over X tons of textiles annually, and we believe there is a strong synergy with your operations."
"We can offer consistent volumes of sorted, quality-graded textiles."

Closing:
"I look forward to hearing from you."
"Please don't hesitate to reach out if you have any questions."
"Would you be available for a call next week to discuss further?"
"Best regards," / "Kind regards,"

Common mistakes to avoid:
Don't write "Dear Sir or Madam" when you know the person's name.
Don't start with "I" — vary your sentence openings.
Keep paragraphs short — 2-3 sentences maximum.
Always proofread before sending.

Practice: Compose an email in your head during your drive. The structure is: greeting, purpose, details, call to action, closing.`,
    JSON.stringify([
      'Structure d\'un email professionnel',
      'Objets d\'email efficaces',
      'Formules d\'ouverture et de fermeture',
      'Proposer un partenariat par email',
      'Erreurs courantes à éviter'
    ]),
    JSON.stringify([
      { en: 'partnership inquiry', fr: 'demande de partenariat' },
      { en: 'I am writing to inquire about', fr: 'je vous écris pour me renseigner sur' },
      { en: 'I look forward to hearing from you', fr: 'dans l\'attente de votre retour' },
      { en: 'best regards', fr: 'cordialement' },
      { en: 'please don\'t hesitate to reach out', fr: 'n\'hésitez pas à me contacter' },
      { en: 'synergy', fr: 'synergie' }
    ]),
    JSON.stringify([
      { q: 'How do you close a formal email in English?', a: 'Best regards / Kind regards' },
      { q: 'What should you avoid in a professional email?', a: 'Starting every sentence with "I" and using "Dear Sir or Madam" when you know the name' }
    ]),
    11, 7);

  insertLesson.run(pathId1, 8,
    'Financial English for Textile Leaders',
    'L\'anglais financier appliqué au textile',
    `Module eight: Financial English for the Textile Industry.

As a president, you need to discuss financial performance in English. Let's cover the essential terms.

Revenue and costs:
"Our annual revenue is X million euros."
"The cost per ton of sorted textiles is..."
"Our operating margin has improved by X percent."
"We've reduced overhead costs through process optimization."

Investment:
"We're seeking investment for a new sorting facility."
"The return on investment is projected at X percent over 3 years."
"Our capex budget for this year includes..."
"We've secured funding from the European Social Fund."

Social economy metrics:
"We measure our impact in both financial and social terms."
"For every euro invested, we generate X euros of social value."
"Our social return on investment, or SROI, is..."
"We've created X full-time equivalent positions."

Financial reporting:
"The balance sheet shows a healthy financial position."
"Cash flow remains positive despite seasonal fluctuations."
"We've diversified our revenue streams across reuse, recycling, and industrial wipers."

Talking to investors or funders:
"Our business model is self-sustaining."
"The market for second-hand textiles is growing at X percent annually."
"We combine social mission with financial viability."
"The scale of our operations gives us a competitive advantage."

These phrases position you as a credible, professional leader on the international stage.`,
    JSON.stringify([
      'Revenus, coûts et marges en anglais',
      'Vocabulaire de l\'investissement',
      'Métriques de l\'économie sociale (SROI)',
      'Reporting financier en anglais',
      'Parler aux investisseurs'
    ]),
    JSON.stringify([
      { en: 'operating margin', fr: 'marge opérationnelle' },
      { en: 'return on investment (ROI)', fr: 'retour sur investissement' },
      { en: 'capex', fr: 'dépenses d\'investissement' },
      { en: 'social return on investment (SROI)', fr: 'retour social sur investissement' },
      { en: 'cash flow', fr: 'flux de trésorerie' },
      { en: 'revenue streams', fr: 'sources de revenus' },
      { en: 'full-time equivalent', fr: 'équivalent temps plein' }
    ]),
    JSON.stringify([
      { q: 'What does SROI stand for?', a: 'Social Return On Investment' },
      { q: 'How do you say "sources de revenus" in English?', a: 'Revenue streams' }
    ]),
    13, 8);

  // =============================================
  // PARCOURS 2 : IA en Entreprise — Gestion, Direction, Production
  // =============================================
  const path2 = db.prepare(`
    INSERT INTO learning_paths (user_id, slug, title, description, icon, total_modules)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(userId, 'ai-business',
    'IA en Entreprise : Gestion, Direction & Production',
    'Comprendre et exploiter l\'IA dans vos fonctions de direction. De la stratégie à l\'opérationnel, maîtrisez les concepts pour transformer votre organisation.',
    '🤖🏭', 15);

  const pathId2 = path2.lastInsertRowid;

  // Module 1
  insertLesson.run(pathId2, 1,
    'L\'IA : Comprendre les fondamentaux',
    'Ce que l\'IA est vraiment — et ce qu\'elle n\'est pas',
    `Bienvenue dans votre premier module sur l'intelligence artificielle appliquée à l'entreprise.

Vous développez déjà des applications avec l'IA — comme Homework Buddy. Vous avez une longueur d'avance. Ce parcours va structurer vos connaissances et vous aider à voir plus loin.

Commençons par les fondamentaux.

L'IA, c'est un ensemble de techniques qui permettent à des machines de réaliser des tâches qui nécessitaient auparavant l'intelligence humaine : comprendre le langage, reconnaître des images, prendre des décisions, générer du contenu.

Les trois grandes familles d'IA :

1. L'IA prédictive — elle analyse des données historiques pour prédire le futur. Exemple : prédire les volumes de collecte textile selon la saison.

2. L'IA générative — elle crée du nouveau contenu : texte, image, code, audio. C'est ce que fait Claude quand il aide vos enfants. C'est aussi ce qui pourrait générer des rapports automatiques pour Solidarité Textile.

3. L'IA d'automatisation — elle exécute des tâches répétitives de manière autonome. Exemple : trier des emails, classifier des documents, automatiser la comptabilité.

Ce qui change en 2025-2026 :
Les modèles deviennent multimodaux — ils comprennent le texte, l'image, l'audio, la vidéo simultanément.
Les "agents IA" apparaissent — des IA qui peuvent enchaîner des actions, utiliser des outils, et travailler de manière autonome sur des tâches complexes.
Le coût d'accès baisse drastiquement — ce qui était réservé aux grandes entreprises est maintenant accessible à une PME.

Pour un dirigeant, la question n'est plus "faut-il utiliser l'IA ?" mais "où l'IA aura-t-elle le plus d'impact dans mon organisation ?"

Dans les prochains modules, nous répondrons à cette question pour votre contexte spécifique.`,
    JSON.stringify([
      'IA prédictive, générative et d\'automatisation',
      'Ce qui change en 2025-2026',
      'Multimodalité et agents IA',
      'La question stratégique pour un dirigeant'
    ]),
    JSON.stringify([]),
    JSON.stringify([
      { q: 'Quelles sont les 3 familles d\'IA?', a: 'Prédictive, générative, et d\'automatisation' },
      { q: 'Qu\'est-ce qu\'un agent IA?', a: 'Une IA qui enchaîne des actions et utilise des outils de manière autonome' }
    ]),
    14, 1);

  // Module 2
  insertLesson.run(pathId2, 2,
    'IA et Direction Stratégique',
    'Utiliser l\'IA comme outil de décision au niveau direction',
    `Module deux : L'IA au service de la direction stratégique.

En tant que président, vous prenez des décisions qui engagent l'avenir de l'organisation. L'IA peut devenir votre meilleur copilote stratégique.

L'IA comme aide à la décision :

Analyse de marché : L'IA peut analyser des milliers de sources d'information — articles, rapports, données de marché — et synthétiser les tendances clés pour votre secteur. Imaginez recevoir chaque lundi un brief de 5 minutes sur les mouvements du marché textile mondial.

Scénarios prospectifs : Vous pouvez demander à l'IA de modéliser des scénarios. "Que se passe-t-il si la REP textile augmente de 30% les volumes collectés ? Quels investissements en capacité de tri faut-il prévoir ?"

Veille réglementaire : L'IA peut surveiller en continu les évolutions réglementaires européennes et françaises, et vous alerter sur celles qui impactent votre activité.

Cas concret pour Solidarité Textile :
Vous pourriez créer un agent IA qui chaque semaine analyse les données de collecte, les compare aux prévisions, identifie les anomalies, et génère un rapport de synthèse avec des recommandations.

Cas concret pour Frip and Co :
Un tableau de bord alimenté par l'IA qui suit les tendances de la mode seconde main, analyse les ventes par catégorie, et suggère les ajustements d'offre.

L'important : l'IA ne remplace pas votre jugement. Elle le nourrit avec des données que vous n'auriez pas le temps d'analyser seul. Vous restez le décideur. L'IA est l'outil qui vous rend plus rapide et plus informé.

Questions à vous poser : Quelles décisions prenez-vous régulièrement qui pourraient bénéficier de plus de données ? C'est là que l'IA vous aidera le plus.`,
    JSON.stringify([
      'L\'IA comme copilote stratégique',
      'Analyse de marché automatisée',
      'Scénarios prospectifs avec l\'IA',
      'Veille réglementaire intelligente',
      'Cas concrets Solidarité Textile et Frip and Co'
    ]),
    JSON.stringify([]),
    JSON.stringify([
      { q: 'Quel est le rôle de l\'IA dans la prise de décision?', a: 'Nourrir le jugement du dirigeant avec des données analysées, pas le remplacer' },
      { q: 'Donnez un exemple d\'agent IA utile pour Solidarité Textile', a: 'Un agent qui analyse les données de collecte, compare aux prévisions et génère un rapport hebdomadaire' }
    ]),
    15, 2);

  // Module 3
  insertLesson.run(pathId2, 3,
    'IA et Gestion de Production',
    'Optimiser les opérations de tri et de production avec l\'IA',
    `Module trois : L'IA dans la gestion de production.

Votre activité de tri textile est un processus industriel. L'IA peut l'optimiser considérablement.

Optimisation du tri :
La vision par ordinateur — computer vision — peut assister le tri textile. Des caméras couplées à l'IA peuvent identifier le type de fibre, la couleur, la marque, l'état du vêtement. Certaines entreprises comme Refashion et Pellenc ST développent déjà ces technologies.

Planification de la production :
L'IA peut optimiser la planification en croisant les données de collecte entrantes, les capacités de tri disponibles, et les commandes clients. Résultat : moins de stock tampon, moins de temps mort, plus d'efficacité.

Maintenance prédictive :
Sur vos lignes de tri, l'IA peut analyser les données des capteurs pour prédire les pannes avant qu'elles ne surviennent. Cela réduit les arrêts non planifiés et les coûts de maintenance.

Contrôle qualité :
L'IA peut automatiser une partie du contrôle qualité. Par exemple, vérifier que les balles de textile trié respectent les standards de grading exigés par vos acheteurs.

Gestion des flux :
Un système IA peut optimiser les tournées de collecte en analysant les volumes historiques par point de collecte, la météo, et le trafic routier.

Ce que vous pouvez faire demain :
Commencez simple. Utilisez ChatGPT ou Claude pour analyser vos données de production mensuelles. Donnez-lui un tableur CSV et demandez "quels sont les patterns que tu observes ? quelles améliorations suggères-tu ?"

Vous serez surpris de la pertinence des insights. C'est votre premier pas vers une production augmentée par l'IA.`,
    JSON.stringify([
      'Vision par ordinateur pour le tri textile',
      'Planification de production optimisée',
      'Maintenance prédictive',
      'Contrôle qualité automatisé',
      'Commencer simple : analyser ses données avec l\'IA'
    ]),
    JSON.stringify([]),
    JSON.stringify([
      { q: 'Qu\'est-ce que la maintenance prédictive?', a: 'Analyser les données des capteurs pour prédire les pannes avant qu\'elles ne surviennent' },
      { q: 'Comment commencer simplement avec l\'IA en production?', a: 'Donner ses données CSV à Claude/ChatGPT et demander d\'identifier des patterns et améliorations' }
    ]),
    15, 3);

  // Module 4
  insertLesson.run(pathId2, 4,
    'Automatiser l\'Administratif avec l\'IA',
    'Gagner 10h par semaine grâce à l\'automatisation intelligente',
    `Module quatre : L'automatisation administrative.

C'est le quick win le plus évident de l'IA. Chaque dirigeant perd un temps considérable sur des tâches administratives. L'IA peut en reprendre une grande partie.

Emails et communication :
L'IA peut rédiger des brouillons de réponse à vos emails, résumer de longs fils de discussion, et trier votre boîte de réception par priorité. Outils : les assistants intégrés à Outlook et Gmail, ou un agent Claude personnalisé.

Rapports et documents :
Vous produisez probablement des rapports mensuels pour votre CA, des bilans d'activité, des demandes de subvention. L'IA peut générer la première version à partir de vos données. Vous ne faites plus que relire et ajuster.

Comptabilité et finance :
Des outils IA peuvent catégoriser automatiquement les factures, rapprocher les paiements, et générer des tableaux de bord financiers en temps réel.

Ressources humaines :
Tri des CV, génération des fiches de poste, planification des plannings, suivi des formations. L'IA peut assister chacune de ces tâches.

Cas pratique — créer votre premier workflow IA :
Prenez une tâche que vous faites chaque semaine et qui prend plus de 30 minutes.
Décrivez-la étape par étape.
Identifiez les parties que l'IA pourrait faire.
Testez avec Claude ou ChatGPT.
Mesurez le temps gagné.

Exemple concret : Votre rapport de collecte hebdomadaire.
Avant : vous compilez manuellement les données de 10 centres, faites des calculs, rédigez un résumé. Temps : 2 heures.
Après : vous uploadez les données dans un agent IA qui génère le rapport complet en 2 minutes. Vous relisez en 10 minutes.

Temps gagné : 1h50 par semaine. Soit 96 heures par an. Soit plus de 2 semaines de travail.

Multipliez cela par 5 tâches automatisées et vous dégagez un temps considérable pour la stratégie et le terrain.`,
    JSON.stringify([
      'Automatiser les emails et la communication',
      'Génération automatique de rapports',
      'IA en comptabilité et finance',
      'IA en ressources humaines',
      'Créer son premier workflow IA',
      'Calcul du temps gagné'
    ]),
    JSON.stringify([]),
    JSON.stringify([
      { q: 'Combien de temps peut-on gagner en automatisant un rapport hebdomadaire?', a: 'Environ 1h50 par semaine, soit 96 heures par an' },
      { q: 'Quelles sont les 5 étapes pour créer un workflow IA?', a: 'Identifier la tâche, décrire les étapes, identifier les parties automatisables, tester avec l\'IA, mesurer le temps gagné' }
    ]),
    14, 4);

  // Module 5
  insertLesson.run(pathId2, 5,
    'Développer des Applications IA',
    'De Homework Buddy à vos futures applications métier',
    `Module cinq : Développer des applications avec l'IA.

Vous avez déjà créé Homework Buddy — une application complète avec un assistant IA intégré. C'est un acquis remarquable. Voyons comment aller plus loin.

Ce que vous savez déjà faire :
Intégrer l'API Claude dans une application web.
Créer des system prompts adaptés au contexte.
Gérer des sessions et des données utilisateur.
Déployer avec Docker.

Les prochaines étapes :

1. Les Agents IA — Au-delà du simple chat, un agent peut utiliser des outils : lire des fichiers, interroger une base de données, appeler des APIs, envoyer des emails. Anthropic propose le Claude Agent SDK pour construire ces agents.

2. RAG — Retrieval Augmented Generation. Au lieu de tout mettre dans le prompt, vous donnez à l'IA accès à une base de documents. Elle cherche l'information pertinente avant de répondre. Parfait pour une base de connaissance interne.

3. Fine-tuning vs Prompt Engineering. Le fine-tuning modifie le modèle lui-même. Le prompt engineering adapte le comportement via les instructions. Pour la plupart des cas d'entreprise, un bon prompt engineering suffit.

Applications concrètes que vous pourriez développer :

Pour Solidarité Textile :
Un chatbot interne pour les procédures de tri — les employés posent une question, l'IA répond en se basant sur vos manuels de procédure.
Un outil de génération de rapports automatiques à partir de vos données.
Un système de veille réglementaire alimenté par IA.

Pour Frip and Co :
Un assistant de pricing qui suggère les prix en fonction de la marque, l'état, et les tendances du marché.
Un outil de description produit automatique pour le e-commerce.
Un chatbot client pour répondre aux questions fréquentes.

La clé : commencez par un problème réel, pas par la technologie. Demandez-vous "quel problème me prend le plus de temps ?" et construisez l'outil IA pour le résoudre.

Vous avez les compétences de base. Chaque application que vous construisez renforce votre compréhension et ouvre de nouvelles possibilités.`,
    JSON.stringify([
      'Vos acquis avec Homework Buddy',
      'Agents IA et outils',
      'RAG — recherche documentaire augmentée',
      'Applications concrètes pour vos entreprises',
      'Partir du problème, pas de la technologie'
    ]),
    JSON.stringify([]),
    JSON.stringify([
      { q: 'Qu\'est-ce que le RAG?', a: 'Retrieval Augmented Generation — donner à l\'IA accès à des documents pour qu\'elle cherche l\'info pertinente avant de répondre' },
      { q: 'Quel conseil pour choisir sa prochaine application IA?', a: 'Partir du problème qui prend le plus de temps, pas de la technologie' }
    ]),
    16, 5);

  console.log('📚 Parcours de compétences créés avec succès !');
}

module.exports = { seedLearningPaths };
