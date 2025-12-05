import mongoose from 'mongoose';

const counterSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  seq: { type: mongoose.Schema.Types.Mixed, default: BigInt(0) }
});

const Counter = mongoose.model('Counter', counterSchema);

export default Counter;