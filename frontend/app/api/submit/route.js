import { NextResponse } from 'next/server';
import { connectDB, User, UserData, attendance } from '@/database.js';

await connectDB();


let _1 = await attendance.findOne({time:"8:00"}).exec();
let _2 = await attendance.findOne({time:"8:50"}).exec();
let _3 = await attendance.findOne({time:"9:40"}).exec();
let _4 = await attendance.findOne({time:"10:30"}).exec();
let _5 = await attendance.findOne({time:"11:20"}).exec();
let _6 = await attendance.findOne({time:"12:10"}).exec();
let _7 = await attendance.findOne({time:"1:50"}).exec();
let _8 = await attendance.findOne({time:"2:40"}).exec();
let _9 = await attendance.findOne({time:"3:30"}).exec();
let _10 = await attendance.findOne({time:"4:20"}).exec();
let _11 = await attendance.findOne({time:"5:10"}).exec();

const times = ["8:00", "8:50", "9:40", "10:30", "11:20", "12:10", "1:50", "2:40", "3:30", "4:20", "5:10"];
const attendanceRecords = [_1, _2, _3, _4, _5, _6, _7, _8, _9, _10, _11];

for (let i = 0; i < attendanceRecords.length; i++) {
  if (!attendanceRecords[i]) {
  await new attendance({
    time: times[i],
    links: []
  }).save();
  }
}


export async function POST(req) {

  const re = await req.json();
  console.log("received request:", re);
  if (re.cookie && re.link && re.time && re.questions){

    let prevQuestions = await attendance.findOne({time:re.time});
    if (!prevQuestions){
      return NextResponse.json({error:"TimeNotSupported",_status:'Unsuccessful'});
    }
    let res = await attendance.updateOne({time:re.time},{
      links: [...prevQuestions.links, {
        link:re.link,
        email:re.cookie,
        questions:[...re.questions]
    }],
    })
    console.log(
      res.matchedCount, // Number of documents matched
      res.modifiedCount, // Number of documents modified
      res.acknowledged, // Boolean indicating the MongoDB server received the operation. This may be false if Mongoose did not send an update to the server because the update was empty.
      res.upsertedId, // null or an id containing a document that had to be upserted.
      res.upsertedCount, // Number indicating how many documents had to be upserted. Will either be 0 or 1.
    );
  
    return res.acknowledged?NextResponse.json({_status:'successful'},{status:200}):NextResponse.json({_status:'Unsuccessful'},{status:200});
  }
  else{
    return  NextResponse.json('Bad Request',{ status: 400 });
  }  
}