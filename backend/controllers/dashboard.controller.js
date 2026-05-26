const Problem = require("../models/problem.model");
const User = require("../models/user.model");
const CompanyProblem = require("../models/companyProblem.model");
const SolvedCompanyProblem = require("../models/solvedCompanyProblem.model");
const Activity = require("../models/activity.model");
const AppError = require("../utils/AppError");

exports.getDashboard = async (req, res, next) => {
  try {
    if (!req.user || !req.user.id) {
        return next(new AppError("Not authorized", 401));
    }

    const userId = req.user.id;

    const problems = await Problem.find({ userId }).sort({ date: -1 });

    // total
    const total = problems.length;

    // difficulty count
    const difficultyCount = {};
    problems.forEach((p) => {
      let diff = p.difficulty || "Unknown";
      diff = diff.charAt(0).toUpperCase() + diff.slice(1).toLowerCase();
      difficultyCount[diff] =
        (difficultyCount[diff] || 0) + 1;
    });

    // topic count
    const topicCount = {};
    problems.forEach((p) => {
      topicCount[p.topic] =
        (topicCount[p.topic] || 0) + 1;
    });

    // recent problems
    const recent = problems.slice(0, 5);

    // skills metrics
    let strongestTopic = "N/A";
    let weakestTopic = "N/A";
    
    if (Object.keys(topicCount).length > 0) {
      const sortedTopics = Object.entries(topicCount).sort((a, b) => b[1] - a[1]);
      strongestTopic = sortedTopics[0][0];
      weakestTopic = sortedTopics[sortedTopics.length - 1][0];
    }

    res.json({
      total,
      difficultyCount,
      topicCount,
      recent,
      skills: {
        strongestTopic,
        weakestTopic
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.getPublicStats = async (req, res, next) => {
  try {
    const [
      problemsTracked, 
      activeUsers, 
      roadmapsCreated,
      resumeAnalyses,
      mockInterviews
    ] = await Promise.all([
      Problem.countDocuments(),
      User.countDocuments(),
      Activity.countDocuments({ type: "roadmap" }),
      Activity.countDocuments({ type: "resume_analysis" }),
      Activity.countDocuments({ type: "mock_interview" })
    ]);

    res.status(200).json({
      problemsTracked,
      activeUsers,
      roadmapsCreated,
      analysesCompleted: resumeAnalyses + mockInterviews
    });
  } catch (error) {
    next(error);
  }
};