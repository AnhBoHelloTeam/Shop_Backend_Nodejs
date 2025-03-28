const Counter = require("../models/Counter");

const generateId = async (modelName) => {
    const counter = await Counter.findOneAndUpdate(
        { model: modelName },
        { $inc: { count: 1 } }, // Tăng count lên 1
        { new: true, upsert: true }
    );
    return counter.count;
};

module.exports = generateId;
