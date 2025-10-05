const mongoose = require ('mongoose')
require('dotenv').config();

mongoose.connect(process.env.MONGODB)

.then(() => {
    console.log(`${process.env.MONGODB}`)
})
.catch((err) =>{
    console.log(err)
})

const newSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    message:{
        type:String
    }
})

const mailsubscription = mongoose.Schema({
    email:{
        type:String
    }
});
const studentSchema = new mongoose.Schema(
  {
    rollNo: {
      type: String,
      required: true,
      unique: true, // ✅ Roll number should be unique
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    dob: {
      type: Date,
      required: true,
    },
    course: {
      type: String,
      required: true,
    },
    internship: {
      type: [String], // ✅ Array of strings for checklist items
      required: true,
    },
    duration: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);
const students = mongoose.model('Students', studentSchema)
const subscription = mongoose.model('subscription',mailsubscription);
const collection = mongoose.model('collection',newSchema);

module.exports = {collection,subscription,students}