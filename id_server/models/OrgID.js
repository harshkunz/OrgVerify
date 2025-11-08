import mongoose from "mongoose";

const orgIDSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  middleName: { type: String },
  lastName: { type: String, required: true },
  gender: { 
    type: String, 
    required: true,
    enum: ['male', 'female'],
    lowercase: true
  },
  orgIdNumber: { type: Number, unique: true, required: true, min: 1 },
  dateOfBirth: {
    type: String,
    required: false,
  },
  phone_no: { type: String, required: true },
  address: {
    street: { type: String, trim: true },
    city: { type: String, trim: true },
    state: { type: String, trim: true },
    country: { 
      type: String, 
      trim: true,
      default: "Ethiopia" 
    },
    zipCode: { type: String, trim: true },
  },
  photo: {
    type: String,
    default: function() {
      const id = Math.floor(Math.random() * 100);
      return `https://randomuser.me/api/portraits/${this.gender === 'male' ? 'men' : 'women'}/${id}.jpg`;
    }
  },
  createdAt: { type: Date, default: Date.now },
});

const OrgID = mongoose.model("OrgID", orgIDSchema);
export default OrgID;

