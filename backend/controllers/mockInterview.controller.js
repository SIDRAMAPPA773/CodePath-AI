const AppError = require("../utils/AppError");
const Activity = require("../models/activity.model");
const { generateAIResponse } = require("../utils/aiService");

exports.generateQuestions = async (req, res, next) => {
  try {
    const { company, role } = req.body;

    const prompt = `You are an expert technical interviewer for ${company || 'top tech companies'}.
Generate a comprehensive mock interview for a ${role || 'Software Engineer'} role.

Provide a mix of:
1. HR / Behavioral questions (e.g., leadership principles, past conflicts)
2. Technical core concepts (e.g., OS, DBMS, OOPs, System Design)
3. DSA questions (common interview problems)

Ensure the difficulty matches a standard entry-level or mid-level Software Engineering interview.

Format your response strictly as a JSON object matching this structure:
{
  "mockInterview": {
    "hrQuestions": ["Q1", "Q2"],
    "technicalQuestions": ["Q1", "Q2"],
    "dsaQuestions": [
      {
        "title": "Problem Title",
        "topic": "Topic Name",
        "difficulty": "Medium/Hard",
        "description": "Brief problem statement"
      }
    ]
  }
}`;

    const aiResult = await generateAIResponse(prompt, { temperature: 0.7 });

    if (!aiResult.success) {
      return next(new AppError("Failed to generate mock interview. Please try again later.", 500));
    }

    let parsedData;
    try {
      let cleanedText = aiResult.text;
      if (cleanedText.includes("```json")) {
        cleanedText = cleanedText.split("```json")[1].split("```")[0];
      } else if (cleanedText.includes("```")) {
        cleanedText = cleanedText.split("```")[1];
      } else {
        const start = cleanedText.indexOf("{");
        const end = cleanedText.lastIndexOf("}");
        if (start !== -1 && end !== -1) {
          cleanedText = cleanedText.substring(start, end + 1);
        }
      }
      
      parsedData = JSON.parse(cleanedText.trim());
    } catch (e) {
      console.log("JSON Parse Error for Mock Interview:", aiResult.text);
      return next(new AppError("Invalid response format from AI.", 500));
    }

    // Log activity
    await Activity.create({ type: "mock_interview", userId: req.user?.id });

    res.status(200).json({
      success: true,
      data: parsedData.mockInterview
    });

  } catch (error) {
    console.error("Mock Interview Error:", error);
    next(new AppError("Failed to generate mock interview questions", 500));
  }
};
