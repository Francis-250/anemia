import { ChatGroq } from "@langchain/groq";
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { RunnableSequence } from "@langchain/core/runnables";
import { AIMessage, HumanMessage, BaseMessage } from "@langchain/core/messages";

// ----------------------------------------------------------------
// 1. MODEL CONFIGURATION
// ----------------------------------------------------------------
export function getGroqModel() {
  return new ChatGroq({
    apiKey: process.env.GROQ_API_KEY || "gsk_placeholder",
    model: process.env.GROQ_MODEL || "openai/gpt-oss-20b",
    temperature: 0.3,
    maxTokens: 1024,
    streaming: true,
  });
}

export function getGroqFastModel() {
  return new ChatGroq({
    apiKey: process.env.GROQ_API_KEY || "gsk_placeholder",
    model: process.env.GROQ_MODEL || "openai/gpt-oss-20b",
    temperature: 0.1,
    maxTokens: 512,
    streaming: true,
  });
}

// ----------------------------------------------------------------
// 2. ANEMIA RISK PREDICTION SYSTEM PROMPT
// ----------------------------------------------------------------
const ANEMIA_SYSTEM_PROMPT = `You are AnemiaRisk AI, a specialized medical decision-support assistant 
focused exclusively on preliminary anemia risk assessment using machine learning principles and clinical indicators.

Anemia is a health condition where a person has a lower-than-normal number of red blood cells or concentration of hemoglobin in the blood.
Hemoglobin carries oxygen from the lungs to tissues.

Your role is to:
- Analyze patient demographics (Age, Sex, Pregnancy status), symptoms, dietary patterns, and medical history.
- Evaluate clinical risk indicators such as fatigue/tiredness, weakness, dizziness, headache, shortness of breath, pale appearance, heavy menstrual bleeding, low iron intake, chronic disease, blood loss history, and inherited blood disorders.
- Estimate patient's preliminary anemia risk classification: LOW RISK, MODERATE RISK, or HIGH RISK.
- Provide clear, actionable health guidance based on risk level.
- ALWAYS emphasize that this result is an AI-generated preliminary risk estimate and NOT a confirmed medical diagnosis. Diagnosis requires qualified medical evaluation and laboratory testing (e.g. Hemoglobin / Complete Blood Count testing).

Symptoms & Factors You Analyze:
- Fatigue/Tiredness
- Weakness & Low Energy
- Dizziness or Lightheadedness
- Headaches
- Shortness of Breath
- Pale Appearance (skin, lips, nail beds)
- Dietary Characteristics (Low iron intake, vegetarian/vegan without supplementation, poor nutrition)
- Medical & Menstrual History (Heavy menstrual bleeding, past anemia, blood loss, chronic disease, inherited blood disorders)

Risk Classification Criteria:
HIGH RISK: Multiple severe symptoms (extreme fatigue, shortness of breath, dizziness, paleness) combined with high-risk factors (heavy blood loss, heavy menstrual bleeding, history of chronic disease/anemia). Recommend urgent medical evaluation and laboratory testing (Hemoglobin / CBC).
MODERATE RISK: Moderate symptoms (frequent tiredness, occasional dizziness/headache) or dietary/nutritional deficiencies. Recommend consulting a healthcare professional for clinical assessment and blood test.
LOW RISK: Few or mild symptoms, adequate diet, no major risk history. Recommend monitoring health and maintaining a balanced, iron-rich diet.

Response Format:
1. RISK LEVEL: [LOW RISK / MODERATE RISK / HIGH RISK]
2. CONFIDENCE SCORE: [percentage]
3. CONTRIBUTING FACTORS DETECTED: [list identified symptoms and risk factors]
4. CLINICAL ANALYSIS: [brief explanation of risk evaluation]
5. RECOMMENDATION: [clear action steps & guidance]
6. MEDICAL DISCLAIMER: "Your information indicates a [LEVEL] risk of anemia. This is not a medical diagnosis. Please seek professional healthcare assessment."

IMPORTANT FORMATTING RULES:
- Write strictly in clean plain text.
- Do NOT use Markdown asterisks (* or **), hashes (#), or bullet asterisks.
- Never diagnose. Always frame outputs as preliminary risk estimates.`;

// ----------------------------------------------------------------
// 3. PROMPT TEMPLATES
// ----------------------------------------------------------------
export const anemiaAssessmentPrompt = ChatPromptTemplate.fromMessages([
  ["system", ANEMIA_SYSTEM_PROMPT],
  new MessagesPlaceholder("chat_history"),
  ["human", "{input}"],
]);

export const riskClassificationPrompt = ChatPromptTemplate.fromMessages([
  [
    "system",
    `You are an anemia risk classifier. Analyze the patient assessment data and return ONLY a valid JSON object.
    
    Return this exact JSON structure:
    {{
      "riskLevel": "LOW" | "MEDIUM" | "HIGH",
      "confidenceScore": <number between 0 and 1>,
      "detectedSymptoms": ["factor1", "factor2"],
      "fastScore": <number of key risk indicators present 0-4>,
      "requiresEmergency": <boolean>,
      "recommendation": "<one sentence clinical guidance>"
    }}
    
    Do not include any text outside the JSON object.`,
  ],
  ["human", "Patient information: {symptoms}"],
]);

export const followUpPrompt = ChatPromptTemplate.fromMessages([
  ["system", ANEMIA_SYSTEM_PROMPT],
  new MessagesPlaceholder("chat_history"),
  ["human", "Follow-up question: {followUp}"],
]);

// ----------------------------------------------------------------
// 4. OUTPUT PARSERS
// ----------------------------------------------------------------
export const stringParser = new StringOutputParser();

export const parseRiskJson = (text: string): RiskAssessmentResult => {
  try {
    const cleaned = text.replace(/```json|```/g, "").trim();
    return JSON.parse(cleaned);
  } catch {
    return {
      riskLevel: "MEDIUM",
      confidenceScore: 0.5,
      detectedSymptoms: [],
      fastScore: 0,
      requiresEmergency: false,
      recommendation:
        "Your information indicates a MODERATE risk of anemia. This is not a medical diagnosis. Please seek professional healthcare assessment.",
    };
  }
};

// ----------------------------------------------------------------
// 5. RUNNABLE CHAINS
// ----------------------------------------------------------------
export const anemiaAssessmentChain = RunnableSequence.from([
  anemiaAssessmentPrompt,
  getGroqModel(),
  stringParser,
]);

export const strokeAssessmentChain = anemiaAssessmentChain;

export const riskClassificationChain = RunnableSequence.from([
  riskClassificationPrompt,
  getGroqFastModel(),
  stringParser,
]);

// ----------------------------------------------------------------
// 6. TYPES
// ----------------------------------------------------------------
export interface RiskAssessmentResult {
  riskLevel: "LOW" | "MEDIUM" | "HIGH";
  confidenceScore: number;
  detectedSymptoms: string[];
  fastScore: number;
  requiresEmergency: boolean;
  recommendation: string;
}

export interface AssessmentMessage {
  role: "user" | "assistant";
  content: string;
}

export interface StreamAssessmentParams {
  symptoms: string;
  chatHistory?: AssessmentMessage[];
  patientAge?: number;
  patientGender?: string;
}

// ----------------------------------------------------------------
// 7. HELPER — convert chat history to LangChain messages
// ----------------------------------------------------------------
export function formatChatHistory(
  chatHistory: AssessmentMessage[],
): BaseMessage[] {
  return chatHistory.map((msg) =>
    msg.role === "user"
      ? new HumanMessage(msg.content)
      : new AIMessage(msg.content),
  );
}

// ----------------------------------------------------------------
// 8. CORE SERVER FUNCTIONS
// ----------------------------------------------------------------

/**
 * Stream a full anemia risk assessment
 */
export async function streamAnemiaAssessment({
  symptoms,
  chatHistory = [],
  patientAge,
  patientGender,
}: StreamAssessmentParams): Promise<AsyncIterable<string>> {
  const contextualInput = `
    ${patientAge ? `Patient Age: ${patientAge}` : ""}
    ${patientGender ? `Patient Gender: ${patientGender}` : ""}
    Reported Information & Symptoms: ${symptoms}
    Please analyze this information and provide a detailed anemia risk assessment and explanation.
  `.trim();

  const formattedHistory = formatChatHistory(chatHistory);
  const chain = RunnableSequence.from([
    anemiaAssessmentPrompt,
    getGroqModel(),
    stringParser,
  ]);

  return chain.stream({
    input: contextualInput,
    chat_history: formattedHistory,
  });
}

export const streamStrokeAssessment = streamAnemiaAssessment;

/**
 * Get a structured JSON risk classification
 */
export async function classifyAnemiaRisk(
  symptoms: string,
): Promise<RiskAssessmentResult> {
  try {
    const chain = RunnableSequence.from([
      riskClassificationPrompt,
      getGroqFastModel(),
      stringParser,
    ]);
    const result = await chain.invoke({ symptoms });
    return parseRiskJson(result);
  } catch (error) {
    console.error("[AI Classification Error]:", error);
    return {
      riskLevel: "MEDIUM",
      confidenceScore: 0.5,
      detectedSymptoms: [],
      fastScore: 0,
      requiresEmergency: false,
      recommendation:
        "Your information indicates a MODERATE risk of anemia. This is not a medical diagnosis. Please seek professional healthcare assessment.",
    };
  }
}

export const classifyStrokeRisk = classifyAnemiaRisk;

/**
 * Get recommendation copy + metadata for a given risk level
 */
export function getRiskRecommendation(riskLevel: "LOW" | "MEDIUM" | "HIGH"): {
  message: string;
  action: string;
  color: string;
  urgent: boolean;
} {
  const recommendations = {
    HIGH: {
      message:
        "Your information indicates a HIGH risk of anemia. This is not a medical diagnosis. Please seek professional healthcare assessment and appropriate laboratory testing (such as Hemoglobin / CBC test) promptly.",
      action: "SEEK_CLINICAL_ASSESSMENT",
      color: "red",
      urgent: true,
    },
    MEDIUM: {
      message:
        "Your information indicates a MODERATE risk of anemia. This is not a medical diagnosis. Please consult a qualified healthcare provider for evaluation and routine blood testing.",
      action: "CONSULT_HEALTHCARE_PROVIDER",
      color: "orange",
      urgent: false,
    },
    LOW: {
      message:
        "Your information indicates a LOW risk of anemia. This is not a medical diagnosis. Maintain a healthy, nutrient-rich diet and consult a doctor if new symptoms develop.",
      action: "MONITOR_HEALTH",
      color: "green",
      urgent: false,
    },
  };

  return recommendations[riskLevel];
}

