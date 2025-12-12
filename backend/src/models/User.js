import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { USER_ROLES } from "../config/constants.js";

const { Schema, model } = mongoose;

const userSchema = new Schema(
  {
    firstName: {
      type: String,
      trim: true,
      required: [true, "First name is required"],
    },
    lastName: {
      type: String,
      trim: true,
      required: [true, "Last name is required"],
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      unique: true,
      required: [true, "Email is required"],
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email",
      ],
    },
    phone: {
      type: String,
      trim: true,
      default: "",
    },
    password: {
      type: String,
      minlength: [6, "Password must be at least 6 characters"],
      required: [true, "Password is required"],
      select: false,
    },
    role: {
      type: String,
      enum: [...Object.values(USER_ROLES)],
      default: USER_ROLES.MEMBER,
    },
    passwordChangedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  const hashed = await bcrypt.hash(this.password, 12);
  this.password = hashed;

  if (!this.isNew) {
    this.passwordChangedAt = new Date(Date.now() - 1000);
  }

  next();
});

userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.changedPasswordAfter = function (jwtIat) {
  if (!this.passwordChangedAt) return false;
  const changed = Math.floor(this.passwordChangedAt.getTime() / 1000);
  return jwtIat < changed;
};

export default model("User", userSchema);