import Counter from '../models/Counter.js';

export const getNextSequence = async (name) => {
  try {
    const ret = await Counter.findOneAndUpdate(
      { id: name },
      { $inc: { seq: BigInt(1) } }, // Increment using BigInt
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    if (!ret) {
      throw new Error('Failed to generate sequence number');
    }

    return ret.seq.toString(); // Convert BigInt to string for usage
  } catch (error) {
    console.error(`Error in getNextSequence: ${error.message}`);
    throw error;
  }
};