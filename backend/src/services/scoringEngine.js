const { KIEI_QUESTIONS } = require('../data/kieiQuestions');

// Map questions by number for fast lookup
const QUESTION_MAP = new Map(KIEI_QUESTIONS.map((q) => [q.number, q]));

// C-Scale Conversion Table (Table 5 of Kundu 1976 Manual) enriched with Clinical Guidance
const C_SCALE_TABLE = [
  {
    cScale: 0,
    min: 0,
    max: 75,
    classification: 'Extremely Extravert',
    severityLevel: 'Extreme Deviation (Clinical Attention Recommended)',
    interpretation: 'Extreme deviation towards Extraversion with intense reliance on external stimulation.',
    detailedExplanation:
      'The candidate exhibits an intense outward orientation. Their cognitive and emotional energy is almost entirely dependent on continuous social interactions, external stimulation, and active engagement with the environment. Solitude or quiet introspective settings are experienced with restlessness or acute discomfort.',
    dailyLifeImpact:
      'High enthusiasm and energetic in groups, but may struggle severely with solitary work, independent research, or tasks requiring prolonged quiet reflection. Communication is spontaneous and expressive, though prone to dominating conversations or acting on impulse.',
    potentialVulnerabilities: [
      'High vulnerability to stimulus addiction, restlessness, or boredom when alone',
      'Tendency to over-commit to social and professional obligations leading to sudden exhaustion or burnout',
      'Difficulty engaging in deep self-reflection, emotional introspection, or processing internal feelings',
      'Vulnerability to making hasty decisions without calculating long-term consequences',
    ],
    clinicalSolutions: [
      'Structured Solitude Therapy: Begin with 15–20 minutes daily of quiet, screen-free solitude (reading, journaling, or mindfulness breathing) to build comfort with internal thoughts.',
      'The 24-Hour Commitment Rule: Introduce a deliberate pause before accepting new social engagements or responsibilities to prevent over-extension and fatigue.',
      'Active Listening Exercises: In interpersonal interactions, intentionally practice pausing for 3–5 seconds after others speak before responding.',
      'Deep Focus Training: Implement the Pomodoro technique (25 minutes solitary work, 5 minutes break) to strengthen sustained attention without requiring social stimulus.',
      'Clinical Consultation with Dr. Parag Mahajan: If restlessness or anxiety arises during solitude, professional psycho-counseling can help develop internal grounding strategies.',
    ],
  },
  {
    cScale: 1,
    min: 76,
    max: 89,
    classification: 'Grossly Extravert',
    severityLevel: 'Marked Deviation',
    interpretation: 'Gross deviation towards Extraversion with pronounced preference for external activities.',
    detailedExplanation:
      'The candidate demonstrates marked extraversion, prioritizing group dynamics, public interactions, and lively external environments. They draw vitality from interpersonal connections and find solitary introspection largely unrewarding.',
    dailyLifeImpact:
      'Dynamic team player and confident speaker who thrives in collaborative workspaces. However, they may overlook subtle emotional signals in themselves and find solitary problem-solving tedious.',
    potentialVulnerabilities: [
      'Discomfort when isolated for extended periods',
      'Risk of superficial relationship depth due to broad, rapid networking',
      'Susceptibility to fatigue from maintaining high external energy outputs',
    ],
    clinicalSolutions: [
      'Reflective Journaling: Write 3 short reflections every evening focusing on personal emotions rather than external events.',
      'Protected Rest Windows: Reserve at least two evenings per week exclusively for personal recharge, quiet hobbies, or restful family time.',
      'Paced Communication: Cultivate deeper one-on-one dialogues rather than prioritizing large-group visibility.',
    ],
  },
  {
    cScale: 2,
    min: 90,
    max: 112,
    classification: 'Moderately Extravert',
    severityLevel: 'Moderate Deviation',
    interpretation: 'Moderate deviation towards Extraversion with strong interpersonal engagement.',
    detailedExplanation:
      'The candidate is sociable, energetic, and outwardly oriented, enjoying teamwork, active discussions, and community participation while maintaining reasonable functional independence.',
    dailyLifeImpact:
      'Approachable, cooperative, and effective in client-facing, leadership, or collaborative roles. Communicates ideas openly and adapts smoothly to diverse social settings.',
    potentialVulnerabilities: [
      'Occasional scheduling overload from saying "yes" to too many collaborative demands',
      'Mild impatience with highly solitary, repetitive administrative tasks',
    ],
    clinicalSolutions: [
      'Maintain an organized calendar with dedicated focus blocks alongside collaborative meetings.',
      'Incorporate restorative physical wellness activities such as swimming, yoga, or nature walks.',
    ],
  },
  {
    cScale: 3,
    min: 113,
    max: 130,
    classification: 'Slightly Extravert',
    severityLevel: 'Mild Deviation (Healthy Adaptive Range)',
    interpretation: 'Slight deviation from ambivert condition towards Extraversion.',
    detailedExplanation:
      'The candidate displays an adaptable balance leaning slightly toward social engagement, collaborative work, and open communication, comfortably near the central ambivert median.',
    dailyLifeImpact:
      'Functions comfortably in both team environments and independent roles. Well-adjusted communication style without extremes of withdrawal or over-assertiveness.',
    potentialVulnerabilities: [
      'Minor energy drain during prolonged periods of strict isolation',
    ],
    clinicalSolutions: [
      'Leverage social strengths while continuing to nurture personal independent hobbies.',
      'Maintain healthy work-life boundaries.',
    ],
  },
  {
    cScale: 4,
    min: 131,
    max: 144,
    classification: 'Ambivert',
    severityLevel: 'Balanced / Normal Population Median',
    interpretation: 'Balanced disposition; within normal range of Ambiversion.',
    detailedExplanation:
      'The candidate exhibits a harmonious ambivert personality. They possess the psychological flexibility to enjoy social gatherings and collaborative teamwork, while equally enjoying quiet solitary focus when needed.',
    dailyLifeImpact:
      'Highly adaptable to changing work environments. Can lead meetings or work alone on detailed analysis with equal efficacy. Empathetic listener and balanced communicator.',
    potentialVulnerabilities: [
      'Occasional context-switching fatigue if forced into prolonged social or prolonged solitary extremes',
    ],
    clinicalSolutions: [
      'Energy Awareness: Listen to your natural rhythm—engage socially when energized, and retreat to recharge when feeling saturated.',
      'Diverse Career Activities: Thrive in versatile roles that blend team engagement with autonomous deep work.',
    ],
  },
  {
    cScale: 5,
    min: 145,
    max: 157,
    classification: 'Ambivert',
    severityLevel: 'Central Population Median (Optimal Balance)',
    interpretation: 'Central population median; characteristic of Ambiversion.',
    detailedExplanation:
      'The candidate sits directly at the central statistical baseline of the Kundu (1976) standardization sample (Mean 144.88). They demonstrate balanced emotional regulation and behavioral equilibrium between internal reflection and external engagement.',
    dailyLifeImpact:
      'Pragmatic, flexible, and steady. Relates comfortably to both extroverted and introverted peers. Demonstrates healthy tolerance for both group activities and independent tasks.',
    potentialVulnerabilities: [
      'Minimal psychological vulnerability; standard situational stress management applies.',
    ],
    clinicalSolutions: [
      'Continue cultivating balanced habits across personal, professional, and social spheres.',
      'Maintain regular physical exercise, mindfulness, and adequate sleep.',
    ],
  },
  {
    cScale: 6,
    min: 158,
    max: 171,
    classification: 'Ambivert',
    severityLevel: 'Balanced / Normal Population Median',
    interpretation: 'Balanced disposition; within normal range of Ambiversion.',
    detailedExplanation:
      'The candidate demonstrates an ambivert profile with a slight, healthy appreciation for thoughtful reflection and selective social circles, while retaining full capacity for public engagement.',
    dailyLifeImpact:
      'Thoughtful conversationalist who values meaningful discussions over superficial chatter. Works well in teams while maintaining high individual accountability.',
    potentialVulnerabilities: [
      'Occasional mild fatigue after extensive noisy social events',
    ],
    clinicalSolutions: [
      'Allow short quiet recovery breaks following intensive social or professional meetings.',
      'Focus on cultivating quality friendships over quantity.',
    ],
  },
  {
    cScale: 7,
    min: 172,
    max: 185,
    classification: 'Slightly Introvert',
    severityLevel: 'Mild Deviation (Healthy Adaptive Range)',
    interpretation: 'Slight deviation from ambivert condition towards Introversion.',
    detailedExplanation:
      'The candidate leans thoughtfully towards introversion. They prefer smaller, close-knit social groups, quiet workspaces, and time to reflect before speaking or making decisions.',
    dailyLifeImpact:
      'Strong concentration, observant nature, and thoughtful analysis. Excels in independent projects, research, and deep one-on-one relationships.',
    potentialVulnerabilities: [
      'Reluctance to speak spontaneously in large unfamiliar gatherings without prior preparation',
    ],
    clinicalSolutions: [
      'Prepare brief talking points prior to major meetings to feel confident contributing.',
      'Protect quiet personal time to maintain emotional energy.',
    ],
  },
  {
    cScale: 8,
    min: 186,
    max: 199,
    classification: 'Moderately Introvert',
    severityLevel: 'Moderate Deviation',
    interpretation: 'Moderate deviation towards Introversion with strong introspective habits.',
    detailedExplanation:
      'The candidate displays pronounced introversion. They have a rich inner mental life, high conscientiousness, and a strong preference for solitary pursuits. Large crowds and constant verbal interaction deplete their energy quickly.',
    dailyLifeImpact:
      'Excellent independent problem-solver, highly observant, and deeply loyal to trusted friends. However, they may hesitate when meeting strangers or taking public leadership roles.',
    potentialVulnerabilities: [
      'Tendency to keep concerns, emotional stress, and personal difficulties bottled inside',
      'Hesitation or anxiety when entering unfamiliar social gatherings',
      'Over-analyzing past conversations and ruminating on what should have been said',
    ],
    clinicalSolutions: [
      'Intentional Social Contact: Schedule regular, low-pressure meetups with trusted friends to prevent accidental drift into isolation.',
      'Assertive Voice Practice: Share your insights in team settings—your thoughtful perspective is valuable even if delivered concisely.',
      'Rumination Disruption: When mental replays begin, switch to an engaging physical or creative activity (walking, music, sketching).',
      'Clinical Consultation with Dr. Parag Mahajan: Helpful for developing tailored stress-coping mechanisms and assertive communication strategies.',
    ],
  },
  {
    cScale: 9,
    min: 200,
    max: 228,
    classification: 'Grossly Introvert',
    severityLevel: 'Marked Deviation',
    interpretation: 'Gross deviation towards Introversion with marked social reticence.',
    detailedExplanation:
      'The candidate displays significant introversion characterized by marked social withdrawal, strong reluctance to engage with unfamiliar groups, and deep absorption in solitary, introspective routines.',
    dailyLifeImpact:
      'Prefers written over spoken communication and thrives exclusively in quiet, isolated environments. May experience high anxiety when required to make spontaneous phone calls, speak publicly, or navigate crowded spaces.',
    potentialVulnerabilities: [
      'Heightened risk of social alienation, chronic loneliness, and isolation',
      'Intense reluctance to seek external assistance even when experiencing significant emotional distress',
      'Social avoidance patterns that can restrict professional or personal advancement',
      'Persistent rumination and heightened sensitivity to social evaluation or criticism',
    ],
    clinicalSolutions: [
      'Graduated Social Exposure: Take small, structured steps to expand social comfort (e.g., exchanging pleasantries with neighbors, attending small gatherings for 30 minutes with an exit plan).',
      'Therapeutic Psycho-Counseling: Consultation with Dr. Parag Mahajan to explore underlying social anxiety and develop cognitive-behavioral coping tools.',
      'Expressive Emotional Outlets: Utilize structured journaling or creative arts to release suppressed emotional tension safely.',
      'Scheduled Micro-Interactions: Practice one brief, low-stakes verbal interaction daily to build confidence without overwhelming sensory limits.',
    ],
  },
  {
    cScale: 10,
    min: 229,
    max: 241,
    classification: 'Extremely Introvert',
    severityLevel: 'Extreme Deviation (Clinical Attention Recommended)',
    interpretation: 'Extreme deviation towards Introversion with profound social withdrawal.',
    detailedExplanation:
      'The candidate exhibits severe, pronounced introversion. There is an almost complete preference for isolation and a profound reluctance or distress in the face of interpersonal engagement. Daily life is characterized by intense privacy, emotional self-containment, and hypersensitivity to social stimuli.',
    dailyLifeImpact:
      'Severe avoidance of social gatherings, meetings, and spontaneous interaction. Deeply hesitant with strangers, unfamiliar peers, and opposite-sex peers. May experience severe exhaustion from routine social exposure.',
    potentialVulnerabilities: [
      'Severe vulnerability to chronic depressive isolation and severe social anxiety',
      'Complete emotional withdrawal and unwillingness to share struggles even with immediate family',
      'Impairment in collaborative academic or occupational functioning due to avoidance of necessary communication',
      'Tendency to dwell heavily in sentimental daydreaming and avoid realistic practical confrontations',
    ],
    clinicalSolutions: [
      'Priority Clinical Evaluation with Dr. Parag Mahajan: Highly recommended for a supportive, comprehensive clinical assessment to rule out depressive or avoidant personality distress and establish a personalized wellness pathway.',
      'Safe Therapeutic Alliance: Establishing a trusting 1-on-1 counseling relationship where thoughts can be expressed without fear of judgment.',
      'De-Sensitization from Social Phobia: Stepwise, gentle behavioral interventions to alleviate intense social hesitation and dread.',
      'Structured Supportive Daily Routine: Establishing predictable, calming daily habits that incorporate physical movement, natural sunlight, and structured small social connections.',
      'Communication Bridge Building: Utilizing written or digital communication as a comfortable first step before transitioning to spoken interactions.',
    ],
  },
];

// Indian Standardization Norms (Table 4 of Kundu 1976 Manual, N=318)
const NORMS = {
  sampleSize: 318,
  total: { mean: 144.88, sd: 12.70 },
  blocks: {
    A: { mean: 27.86, sd: 3.36, maxPossible: 44, minPossible: 11 },
    B: { mean: 42.22, sd: 6.36, maxPossible: 85, minPossible: 17 },
    C: { mean: 28.91, sd: 4.14, maxPossible: 42, minPossible: 14 },
    D: { mean: 25.48, sd: 3.30, maxPossible: 42, minPossible: 14 },
    E: { mean: 21.28, sd: 2.43, maxPossible: 28, minPossible: 14 },
  },
};

/**
 * Verified K.I.E.I. Scoring Engine
 * Computes block scores, raw score, C-scale point, classification, normative z-score,
 * detailed psychological explanations, and evidence-based clinical solutions.
 * @param {Array|Object} answersInput - Array of { questionNumber, selectedOption } or Map { [num]: option }
 * @returns {Object} Full scoring result with clinical guidance
 */
function calculateKIEIScore(answersInput) {
  const answerMap = new Map();
  if (Array.isArray(answersInput)) {
    answersInput.forEach((ans) => {
      if (ans && ans.questionNumber !== undefined) {
        answerMap.set(Number(ans.questionNumber), ans.selectedOption);
      }
    });
  } else if (typeof answersInput === 'object' && answersInput !== null) {
    Object.entries(answersInput).forEach(([num, opt]) => {
      answerMap.set(Number(num), opt);
    });
  }

  const answeredCount = answerMap.size;
  const missingQuestions = [];

  for (let i = 1; i <= 70; i++) {
    if (!answerMap.has(i) || answerMap.get(i) === undefined || answerMap.get(i) === null) {
      missingQuestions.push(i);
    }
  }

  if (missingQuestions.length > 0) {
    return {
      isValid: false,
      scoringValidationStatus: 'incomplete',
      answeredCount,
      missingQuestions,
      error: `Assessment is incomplete. ${missingQuestions.length} questions remaining.`,
    };
  }

  // Calculate block scores
  const blockScores = { A: 0, B: 0, C: 0, D: 0, E: 0 };
  const itemScores = [];

  for (let num = 1; num <= 70; num++) {
    const q = QUESTION_MAP.get(num);
    const chosen = answerMap.get(num);

    let weight = q.rowWeights[chosen];
    if (weight === undefined) {
      weight = q.rowWeights[String(chosen)] ?? q.rowWeights[Number(chosen)];
    }

    if (weight === undefined) {
      return {
        isValid: false,
        scoringValidationStatus: 'invalid_option',
        error: `Invalid option '${chosen}' selected for question ${num} (${q.block}).`,
      };
    }

    blockScores[q.block] += weight;
    itemScores.push({
      questionNumber: num,
      block: q.block,
      selectedOption: chosen,
      scoreWeight: weight,
    });
  }

  const rawScore =
    blockScores.A + blockScores.B + blockScores.C + blockScores.D + blockScores.E;

  // Convert Raw Score to C-Scale
  let matchedCScale = C_SCALE_TABLE.find(
    (tier) => rawScore >= tier.min && rawScore <= tier.max
  );

  if (!matchedCScale) {
    if (rawScore < 70) matchedCScale = C_SCALE_TABLE[0];
    else matchedCScale = C_SCALE_TABLE[C_SCALE_TABLE.length - 1];
  }

  // Calculate z-score against standardization norms
  const zScore = parseFloat(((rawScore - NORMS.total.mean) / NORMS.total.sd).toFixed(2));

  // Generate verified psychological interpretation
  const clinicalInterpretation =
    `The candidate achieved an overall K.I.E.I. Raw Score of ${rawScore} ` +
    `corresponding to C-Scale Point ${matchedCScale.cScale} (${matchedCScale.classification}). ` +
    `${matchedCScale.interpretation} ` +
    `Severity Classification: ${matchedCScale.severityLevel}. ` +
    `Block breakdown: Block A (Objective Situations)=${blockScores.A}, ` +
    `Block B (Introspection)=${blockScores.B}, Block C (Paired Preferences)=${blockScores.C}, ` +
    `Block D (Feeling Statements)=${blockScores.D}, Block E (Habit Choices)=${blockScores.E}. ` +
    `Supervising Clinician: Dr. Parag Mahajan. ` +
    `Note: This psychometric assessment reflects personality dimensions and behavioural preferences; ` +
    `it does not represent an independent psychiatric diagnosis.`;

  return {
    isValid: true,
    scoringValidationStatus: 'verified',
    scoringVersion: 'KIEI-1976-Standard',
    calculatedAt: new Date().toISOString(),
    rawScore,
    cScaleScore: matchedCScale.cScale,
    classification: matchedCScale.classification,
    interpretationText: clinicalInterpretation,
    blockScores,
    zScore,
    normsReference: {
      standardizationSampleSize: NORMS.sampleSize,
      normMean: NORMS.total.mean,
      normSD: NORMS.total.sd,
    },
    clinicalGuidance: {
      severityLevel: matchedCScale.severityLevel,
      detailedExplanation: matchedCScale.detailedExplanation,
      dailyLifeImpact: matchedCScale.dailyLifeImpact,
      potentialVulnerabilities: matchedCScale.potentialVulnerabilities,
      clinicalSolutions: matchedCScale.clinicalSolutions,
    },
    itemScores,
  };
}

module.exports = {
  calculateKIEIScore,
  C_SCALE_TABLE,
  NORMS,
};
