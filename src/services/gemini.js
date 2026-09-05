import { GoogleGenAI, Type } from "@google/genai";

const getAI = () => {
  const apiKey = localStorage.getItem('CUSTOM_GEMINI_API_KEY') || process.env.GEMINI_API_KEY || "";
  if (!apiKey) {
    console.warn("GEMINI_API_KEY is missing. AI features will fail.");
  }
  return new GoogleGenAI({ apiKey: apiKey || "dummy-key" });
};

export const analyzeMaterials = async (materials) => {
  try {
    const ai = getAI();
    const truncatedMaterials = materials.length > 30000 
      ? materials.substring(0, 30000) + "... [Materials truncated for analysis]"
      : materials;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analyze the following learning materials and extract a structured academic course.
      Materials: ${truncatedMaterials}
      
      Output a JSON object with:
      - title: string
      - description: string
      - units: array of {
          title: string,
          topics: array of {
            title: string,
            subtopics: array of {
              title: string,
              content: string (detailed reading material for this subtopic),
              slides: array of {
                title: string,
                content: string (concise bullet points for a slide)
              }
            },
            difficulty: 'beginner' | 'intermediate' | 'advanced'
          }
        }
      
      CRITICAL: Keep the content concise to avoid response truncation. Ensure each subtopic has exactly 4 slides. Do not repeat phrases or get stuck in loops.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            units: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  topics: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        title: { type: Type.STRING },
                        subtopics: {
                          type: Type.ARRAY,
                          items: {
                            type: Type.OBJECT,
                            properties: {
                              title: { type: Type.STRING },
                              content: { type: Type.STRING },
                              slides: {
                                type: Type.ARRAY,
                                items: {
                                  type: Type.OBJECT,
                                  properties: {
                                    title: { type: Type.STRING },
                                    content: { type: Type.STRING }
                                  }
                                }
                              }
                            }
                          }
                        },
                        difficulty: { type: Type.STRING }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });

    const text = response.text || "{}";
    try {
      return JSON.parse(text);
    } catch (parseError) {
      console.error("Failed to parse Gemini response as JSON. Raw text:", text);
      throw new Error("The AI response was incomplete or malformed. Please try again with less material.");
    }
  } catch (error) {
    console.error("Error in analyzeMaterials:", error);
    throw error;
  }
};

export const generateSessionPlan = async (courseTitle, topic) => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Create a session plan for the topic "${topic}" in the course "${courseTitle}".
      Include:
      - objectives: array of strings
      - duration: number (minutes)
      - activities: array of strings`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            objectives: { type: Type.ARRAY, items: { type: Type.STRING } },
            duration: { type: Type.NUMBER },
            activities: { type: Type.ARRAY, items: { type: Type.STRING } }
          }
        }
      }
    });
    const text = response.text || "{}";
    try {
      return JSON.parse(text);
    } catch (parseError) {
      console.error("Failed to parse session plan. Text:", text);
      return { objectives: [], duration: 0, activities: [] };
    }
  } catch (error) {
    console.error("Error in generateSessionPlan:", error);
    return { objectives: [], duration: 0, activities: [] };
  }
};

function extractSessionContext(topicOrConfig, subtopicTitleOrTranscript, maybeTranscript, subtopicContext) {
  let topic = "";
  let subtopicTitle = "";
  let transcript = "";
  let subtopicContent = "";
  let slidesText = "";
  let courseTitle = "";

  if (typeof topicOrConfig === 'object' && topicOrConfig !== null) {
    topic = topicOrConfig.topic || "";
    subtopicTitle = topicOrConfig.subtopicTitle || topicOrConfig.subtopic?.title || topicOrConfig.title || topic;
    transcript = topicOrConfig.transcript || "";
    subtopicContent = topicOrConfig.subtopic?.content || topicOrConfig.content || "";
    courseTitle = topicOrConfig.courseTitle || "";
    if (topicOrConfig.subtopic?.slides && Array.isArray(topicOrConfig.subtopic.slides)) {
      slidesText = topicOrConfig.subtopic.slides.map((s, i) => `Slide ${i + 1} (${s.title}): ${s.content}`).join('\n');
    }
  } else {
    topic = topicOrConfig || "";
    if (maybeTranscript !== undefined) {
      subtopicTitle = subtopicTitleOrTranscript || topic;
      transcript = maybeTranscript || "";
    } else {
      if (typeof subtopicTitleOrTranscript === 'string' && (subtopicTitleOrTranscript.includes('Student:') || subtopicTitleOrTranscript.includes('Tutor:') || subtopicTitleOrTranscript.length > 80)) {
        subtopicTitle = topic;
        transcript = subtopicTitleOrTranscript;
      } else {
        subtopicTitle = subtopicTitleOrTranscript || topic;
        transcript = "";
      }
    }
    if (typeof subtopicContext === 'object' && subtopicContext !== null) {
      subtopicContent = subtopicContext.content || "";
      if (subtopicContext.slides && Array.isArray(subtopicContext.slides)) {
        slidesText = subtopicContext.slides.map((s, i) => `Slide ${i + 1} (${s.title}): ${s.content}`).join('\n');
      }
    } else if (typeof subtopicContext === 'string') {
      subtopicContent = subtopicContext;
    }
  }

  return { 
    topic: topic || "Course Topic", 
    subtopicTitle: subtopicTitle || topic || "Subtopic", 
    transcript: transcript || "", 
    subtopicContent: subtopicContent || "", 
    slidesText: slidesText || "", 
    courseTitle: courseTitle || "" 
  };
}

export const generateNotes = async (topicOrConfig, subtopicTitleOrTranscript, maybeTranscript, subtopicContext) => {
  try {
    const { topic, subtopicTitle, transcript, subtopicContent, slidesText, courseTitle } = extractSessionContext(
      topicOrConfig,
      subtopicTitleOrTranscript,
      maybeTranscript,
      subtopicContext
    );

    const ai = getAI();
    const prompt = `You are a world-class academic tutor. Generate complete, highly detailed, beautifully structured study notes strictly for the subject topic "${topic}" and subtopic "${subtopicTitle}"${courseTitle ? ` in the course "${courseTitle}"` : ""}.

=== CURRICULUM & LEARNING MATERIALS ===
${subtopicContent ? `Subtopic Text / Theory:\n${subtopicContent}\n` : ""}
${slidesText ? `Key Slides & Summary Points:\n${slidesText}\n` : ""}
${transcript && transcript.trim().length > 0 ? `Classroom / Tutoring Session Transcript:\n${transcript}\n` : "(Note: Generate comprehensive study notes strictly for the specific topic and curriculum material provided above.)"}

=== MANDATORY RULES ===
1. You MUST generate comprehensive study notes strictly on "${topic}" and "${subtopicTitle}".
2. NEVER mention that a transcript is missing or short. NEVER ask the user to provide or paste a transcript.
3. NEVER switch to unrelated or generic sample topics (such as Basic Economics, Supply and Demand, or placeholder subjects).
4. Structure the output clearly in clean, readable Markdown:
   # ${subtopicTitle} — Complete Study Notes
   ## 1. Topic Overview & Core Objectives
   ## 2. Fundamental Concepts & Key Definitions
   ## 3. Detailed Explanations & Technical Breakdown
   ## 4. Key Formulas / Rules / Theorems (if applicable, else Key Principles)
   ## 5. Step-by-Step Worked Examples & Real-World Applications
   ## 6. Key Takeaways & Common Pitfalls to Avoid
   ## 7. Rapid Revision Summary`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });
    return response.text || "Notes could not be generated at this time.";
  } catch (error) {
    console.error("Error in generateNotes:", error);
    return "Failed to generate notes. Please check your network connection and try again.";
  }
};

export const generateSubtopicAssessment = async (topicOrConfig, subtopicTitleOrTranscript, maybeTranscript, subtopicContext) => {
  try {
    const { topic, subtopicTitle, transcript, subtopicContent, slidesText, courseTitle } = extractSessionContext(
      topicOrConfig,
      subtopicTitleOrTranscript,
      maybeTranscript,
      subtopicContext
    );

    const ai = getAI();
    const prompt = `Generate a high-quality 10-question multiple-choice quiz strictly for the subtopic "${subtopicTitle}" under topic "${topic}"${courseTitle ? ` in the course "${courseTitle}"` : ""}.

=== CURRICULUM & LEARNING MATERIALS ===
${subtopicContent ? `Subtopic Text / Theory:\n${subtopicContent}\n` : ""}
${slidesText ? `Key Slides & Summary Points:\n${slidesText}\n` : ""}
${transcript && transcript.trim().length > 0 ? `Classroom / Tutoring Session Transcript:\n${transcript}\n` : ""}

=== MANDATORY RULES ===
1. All 10 questions MUST be directly and strictly focused on "${subtopicTitle}" and "${topic}". Do NOT generate unrelated or generic questions.
2. Each question must test understanding of key concepts, definitions, problem solving, or practical application.
3. Provide exactly 4 plausible options for each question.
4. Specify the exact string of the correct answer in the "answer" field (must match one of the 4 options exactly).
5. Never ask the user to provide a transcript. Always produce 10 complete and valid questions.`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            questions: { 
              type: Type.ARRAY, 
              items: { 
                type: Type.OBJECT,
                properties: {
                  question: { type: Type.STRING },
                  options: { type: Type.ARRAY, items: { type: Type.STRING } },
                  answer: { type: Type.STRING }
                },
                required: ["question", "options", "answer"]
              } 
            }
          },
          required: ["questions"]
        }
      }
    });
    const text = response.text || "{}";
    try {
      const parsed = JSON.parse(text);
      return parsed.questions && parsed.questions.length > 0 ? parsed : { questions: [] };
    } catch (parseError) {
      console.error("Failed to parse subtopic assessment. Text:", text);
      return { questions: [] };
    }
  } catch (error) {
    console.error("Error in generateSubtopicAssessment:", error);
    return { questions: [] };
  }
};

export const generateAssessment = async (topicOrConfig, transcriptOrSubtopic, maybeTranscript) => {
  try {
    const { topic, subtopicTitle, transcript, subtopicContent, slidesText } = extractSessionContext(
      topicOrConfig,
      transcriptOrSubtopic,
      maybeTranscript
    );

    const ai = getAI();
    const prompt = `Generate a structured assessment strictly for the topic "${topic}" and subtopic "${subtopicTitle}".

=== CONTEXT ===
${subtopicContent ? `Reading Material:\n${subtopicContent}\n` : ""}
${slidesText ? `Slides:\n${slidesText}\n` : ""}
${transcript && transcript.trim().length > 0 ? `Session Transcript:\n${transcript}\n` : ""}

=== INSTRUCTIONS ===
1. All questions must be 100% relevant and specific to "${topic}".
2. Structure:
- 5 conceptual questions
- 3 numerical or problem-solving / application questions
- 1 challenge / advanced thinking question
3. Do NOT ask for a transcript. Generate directly based on the topic.`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            conceptual: { type: Type.ARRAY, items: { type: Type.STRING } },
            problemSolving: { type: Type.ARRAY, items: { type: Type.STRING } },
            challenge: { type: Type.STRING }
          },
          required: ["conceptual", "problemSolving", "challenge"]
        }
      }
    });
    const text = response.text || "{}";
    try {
      return JSON.parse(text);
    } catch (parseError) {
      console.error("Failed to parse assessment. Text:", text);
      return { conceptual: [], problemSolving: [], challenge: "" };
    }
  } catch (error) {
    console.error("Error in generateAssessment:", error);
    return { conceptual: [], problemSolving: [], challenge: "" };
  }
};

export const generateFinalAssessment = async (courseTitle, topics) => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate a comprehensive final assessment for the course "${courseTitle}" covering these topics: ${topics.join(', ')}.
      
      Structure:
      1. Section 1: 20 Multiple Choice Questions (MCQs) - only one correct answer.
      2. Section 2: 10 Multiple Select Questions (MSQs) - can have one or more correct answers.
      3. Section 3: 8 Descriptive/Long Answer Questions.
      
      Ensure the difficulty is balanced across the course content.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            mcqs: { 
              type: Type.ARRAY, 
              items: { 
                type: Type.OBJECT,
                properties: {
                  question: { type: Type.STRING },
                  options: { type: Type.ARRAY, items: { type: Type.STRING } },
                  answer: { type: Type.STRING }
                }
              } 
            },
            msqs: { 
              type: Type.ARRAY, 
              items: { 
                type: Type.OBJECT,
                properties: {
                  question: { type: Type.STRING },
                  options: { type: Type.ARRAY, items: { type: Type.STRING } },
                  answers: { type: Type.ARRAY, items: { type: Type.STRING } }
                }
              } 
            },
            descriptive: { 
              type: Type.ARRAY, 
              items: { 
                type: Type.OBJECT,
                properties: {
                  question: { type: Type.STRING },
                  modelAnswer: { type: Type.STRING }
                }
              } 
            }
          }
        }
      }
    });
    const text = response.text || "{}";
    try {
      return JSON.parse(text);
    } catch (parseError) {
      console.error("Failed to parse final assessment. Text:", text);
      return { mcqs: [], msqs: [], descriptive: [] };
    }
  } catch (error) {
    console.error("Error in generateFinalAssessment:", error);
    return { mcqs: [], msqs: [], descriptive: [] };
  }
};

export const gradeAssessment = async (topic, questions, answers) => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Grade the following student answers for the assessment on the topic "${topic}".
      
      Questions: ${JSON.stringify(questions)}
      Answers: ${JSON.stringify(answers)}
      
      Provide:
      - score: number (out of 100)
      - feedback: string
      - correctAnswers: array of strings explaining the correct concepts for each question`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.NUMBER },
            feedback: { type: Type.STRING },
            correctAnswers: { type: Type.ARRAY, items: { type: Type.STRING } }
          }
        }
      }
    });
    const text = response.text || "{}";
    try {
      return JSON.parse(text);
    } catch (parseError) {
      console.error("Failed to parse grading result. Text:", text);
      return { score: 0, feedback: "Error grading assessment.", correctAnswers: [] };
    }
  } catch (error) {
    console.error("Error in gradeAssessment:", error);
    return { score: 0, feedback: "Error grading assessment.", correctAnswers: [] };
  }
};
