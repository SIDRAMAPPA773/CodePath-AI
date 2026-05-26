const Problem = require("../models/problem.model");
const User = require("../models/user.model");
const AppError = require("../utils/AppError");

exports.addProblem = async (req, res, next) => {
  try {
    let { title, topic, difficulty, platform } = req.body;

    if (!title || !topic || !difficulty || !platform) {
      return next(new AppError("Please provide title, topic, difficulty, and platform", 400));
    }
    
    difficulty = difficulty.charAt(0).toUpperCase() + difficulty.slice(1).toLowerCase();

    if (!req.user || !req.user.id) {
       return next(new AppError("Not authorized", 401));
    }

    const problem = await Problem.findOneAndUpdate(
      { userId: req.user.id, title },
      {
        userId: req.user.id,
        title,
        topic,
        difficulty,
        platform,
        date: new Date()
      },
      { upsert: true, new: true }
    );

    // Check streak
    await exports.updateStreak(req.user.id);

    res.json(problem);
  } catch (error) {
    next(error);
  }
};

exports.updateStreak = async (userId) => {
  const user = await User.findById(userId);
  if (user) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const lastDate = user.lastSolvedDate
      ? new Date(user.lastSolvedDate)
      : null;

    if (lastDate) lastDate.setHours(0, 0, 0, 0);

    const diffDays = lastDate
      ? Math.floor((today - lastDate) / (1000 * 60 * 60 * 24))
      : null;

    if (!lastDate) {
      user.currentStreak = 1;
    } else if (diffDays === 0) {
      // do nothing for streak
    } else if (diffDays === 1) {
      user.currentStreak += 1;
    } else {
      user.currentStreak = 1;
    }

    user.lastSolvedDate = today;

    if (user.currentStreak > (user.longestStreak || 0)) {
      user.longestStreak = user.currentStreak;
    }
    
    await user.save();
  }
};

exports.getProblems = async (req, res, next) => {
  try {
    if (!req.user || !req.user.id) {
       return next(new AppError("Not authorized", 401));
    }
    const problems = await Problem.find({ userId: req.user.id }).sort({ date: -1 });
    res.json(problems);
  } catch (error) {
    next(error);
  }
};

exports.deleteProblem = async (req, res, next) => {
  try {
    const problem = await Problem.findByIdAndDelete(req.params.id);
    if (!problem) {
       return next(new AppError("Problem not found", 404));
    }
    res.json({ message: "Deleted" });
  } catch (error) {
    next(error);
  }
};

exports.updateProblem = async (req, res, next) => {
  try {
    const updateData = { ...req.body };
    if (updateData.difficulty) {
      updateData.difficulty = updateData.difficulty.charAt(0).toUpperCase() + updateData.difficulty.slice(1).toLowerCase();
    }
    const updated = await Problem.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );
    if (!updated) {
       return next(new AppError("Problem not found", 404));
    }
    res.json(updated);
  } catch (error) {
    next(error);
  }
};