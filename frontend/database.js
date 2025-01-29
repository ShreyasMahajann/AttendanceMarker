"use server";

import { json } from "express";
import mongoose from "mongoose";
import { cookies } from "next/headers";
import { stringify } from "querystring";

let userSchema = new mongoose.Schema({
    username:String,
    password:String,
    cookie:{type:String, default:""},
});

let userDataSchema = new mongoose.Schema({
  link:String, 
  time:String,
  cookie:String,
  questions:[{
    index:Number,
    question:String,
    answer:String
  }]
});

let attendanceSchema = new mongoose.Schema({
  time: String,
  links: [
    {
      link: { type: String },
      email: { type: String},
      subject: { type: String },
      questions: [
        {
          index: { type: Number },
          question: { type: String},
          answer: { type: String }
        }
      ],
      done:{type:Boolean,default:false}
    }
  ]
});

const UserData = mongoose.models.UserData || mongoose.model("UserData", userDataSchema, "userData");

const attendance = mongoose.models.attendance || mongoose.model("attendance",attendanceSchema);

const connectDB = async () => {
    if (mongoose.connections[0].readyState) {
      return;
    }
    await mongoose.connect('mongodb://127.0.0.1:27017/user');
    console.log("Connected to MongoDB");
  };
  
  const User = mongoose.models.User || mongoose.model("User", userSchema);
  export { connectDB, User, UserData, attendance};
