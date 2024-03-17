import mongoose from "mongoose";

const Schema = mongoose.Schema;

const userSchema = new Schema({
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    unique: true,
    required: true
  },
  stripeCustomerID: {
    type: String
  },
  profilePicture: {
    type: String
  },
  password: {
    type: String,
    required: true
  },
  resetToken: {
    type: String
  },
  resetTokenExpiration: {
    type: Date
  },
  country: {
    type: String
  },
  profession: {
    type: String
  },
  industry: {
    type: String
  },
  companyName: {
    type: String
  },
  isUpgradedPlan: {
    type: Boolean,
    default: false
  },
  favouriteTemplates: [
    {
      type: String
    }
  ],
  emailVerified: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

export default mongoose.model("User", userSchema);
