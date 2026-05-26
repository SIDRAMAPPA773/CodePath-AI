const AppError = require("../utils/AppError");
const User = require("../models/user.model");
const Problem = require("../models/problem.model");
const CompanyProblem = require("../models/companyProblem.model");
const { generateAIResponse } = require("../utils/aiService");

exports.getInsights = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const solvedProblems = await Problem.find({ userId });
    
    const topicCounts = {};
    const difficultyCounts = { Easy: 0, Medium: 0, Hard: 0 };

    solvedProblems.forEach(p => {
      topicCounts[p.topic] = (topicCounts[p.topic] || 0) + 1;
      let diff = p.difficulty || "Unknown";
      diff = diff.charAt(0).toUpperCase() + diff.slice(1).toLowerCase();
      difficultyCounts[diff] = (difficultyCounts[diff] || 0) + 1;
    });

    const userSkills = [...new Set(solvedProblems.map(p => p.topic))];
    
    const prompt = `You are an AI placement analytics engine.
Analyze the following student data and provide insights on their weaknesses and preparation strategy.

User Skills: ${userSkills.join(", ")}
Topics Solved: ${JSON.stringify(topicCounts)}
Difficulty Solved: ${JSON.stringify(difficultyCounts)}

Identify 2-3 weak areas (topics with 0 or low solves, or lack of Hard problems) and provide a short, actionable insight.

Return JSON format:
{
  "weaknesses": ["Dynamic Programming", "Graphs"],
  "insights": "You struggle in Dynamic Programming and haven't solved enough Hard problems. Focus on Trees and DP next."
}`;

    const aiResult = await generateAIResponse(prompt, { temperature: 0.7 });

    let parsedData = { weaknesses: [], insights: "Keep practicing more problems!" };
    if (aiResult.success) {
      try {
        const jsonMatch = aiResult.text.match(/\{[\s\S]*\}/);
        const cleanedText = jsonMatch ? jsonMatch[0] : aiResult.text;
        parsedData = JSON.parse(cleanedText);
      } catch (e) {
        console.log("JSON Parse Error for Analytics:", aiResult.text);
      }
    }

    res.status(200).json({
      success: true,
      data: {
        topicCounts,
        difficultyCounts,
        aiAnalysis: parsedData
      }
    });

  } catch (error) {
    console.error("Analytics Error:", error);
    next(new AppError("Failed to generate analytics insights", 500));
  }
};
