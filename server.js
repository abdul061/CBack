const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");
const { collection, subscription ,students } = require("./mongo");

require("dotenv").config();

const app = express();
const PORT = process.env.X_ZOHO_CATALYST_LISTEN_PORT || 5000;

// Middleware to parse incoming JSON data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS Configuration
app.use(cors());

// Email transporter setup
const transporter = nodemailer.createTransport({
  // service: "gmail",
  // auth: {
  //   user: process.env.Email_user,
  //   pass: process.env.Email_pass,
  // },
});
// Verify mail configuration
transporter.verify((error, success) => {
  // if (error) {
  //   console.log("Error occurred while sending mail", error);
  // } else {
  //   console.log("Mail setup verified successfully", success);
  // }
});
// Contact Form Route
app.post("/contact", async (req, res) => {
  const { name, email, message } = req.body;

  const data = {
    name,
    email,
    message,
  };

  // Store the data in your MongoDB collection
  await collection.insertMany([data]);

  // Send response
  res.status(200).json({
    message: "Thank you for contacting us! A reply email has been sent to you.",
  });

  // Send email to user
  const mailOptions = {
    from: process.env.Email_user,
    to: email,
    subject: `Thanks for contacting Coderz Academy, ${name}`,
    text: `Dear ${name},\n\nThank you for reaching out to Adiz Codez! We appreciate your interest.\n\nOur team is reviewing
     your message and will get back to you soon.\n\nBest regards,\nThe Adiz Team`,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Reply email sent:", info.response);
  } catch (error) {
    console.error("Error sending reply email:", error);
    res.status(500).json({
      message: "There was an error sending your message. Please try again later.",
    });
  }
});
// Subscription Route
app.post("/subscribe", async (req, res) => {

  console.log('Received a subscription request:', req.body); 
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  try {
    const existingSubscription = await subscription.findOne({ email });
    if (existingSubscription) {
      return res.status(200).json({ message: 'You are already supporting Adiz.' });
    }

    const newSubscription = new subscription({ email });
    await newSubscription.save();

    res.status(200).json({ message: 'Thanks for supporting Coderz academy!' });
  } catch (error) {
    console.error('Error handling subscription:', error);
    res.status(500).json({ message: 'An error occurred. Please try again.' });
  }

  const mailOptions = {
    from: process.env.Email_user,
    to: email,
    subject: `Thanks for subscribing to Adiz Codez`,
    text: `Thank you for subscribing to Adiz! We're thrilled to have you onboard.\n\nWelcome aboard, and thank you for choosing Adiz!\n\nBest regards,\nThe Adiz Team`,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Subscription email sent:", info.response);
  } catch (error) {
    console.error("Error sending subscription email:", error);
    res.status(500).json({
      message: "There was an error sending your message. Please try again later.",
    });
  }
});

//Add Students
app.post('/api/addstudent', async (req, res) => {
  try {
    const newStudent = new students(req.body);
    await newStudent.save();
    res.json({ success: true, student: newStudent });
  } catch (err) {
    console.error("Error saving student:", err);
    res.status(500).json({ error: 'Failed to save student' });
  }
});

// Get all students
app.get('/api/students', async (req, res) => {
  const all = await students.find();
  res.json(all);
});

//search student
app.post("/api/searchStudent", async (req, res) => {
  try {
    const { rollNo, dob } = req.body;

    const student = await students.findOne({ rollNo });
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Compare only the date part
    const inputDate = new Date(dob).toISOString().split("T")[0];
    const studentDOB = student.dob.toISOString().split("T")[0];

    if (inputDate !== studentDOB) {
      return res.status(404).json({ message: "Roll number found but DOB mismatch" });
    }

    res.json(student);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});
// GET all students
app.get("/api/getAllStudents", async (req, res) => {
  try {
    const studentsList = await students.find({}).sort({ name: 1 }); // optional: sort by name
    res.json(studentsList);
  } catch (err) {
    console.error("Error fetching all students:", err);
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;
  console.log(email)
  console.log(password)
  try {
    // 🔒 Replace this with hashed password check (bcrypt) in real apps
    const user = {email: "123", password:"123"}

 if (user.email !== email || user.password !== password) {
  return res.json({ success: false, message: "Invalid email or password" });
}

res.json({ success: true, message: "Login successful", user });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});
//delete student
app.delete("/api/deletestudent/:id", async (req, res) => {
  try {
    const deletedStudent = await students.findByIdAndDelete(req.params.id);
    if (!deletedStudent) {
      return res.status(404).json({ error: "Student not found" });
    }
    res.json({ success: true, message: "Student deleted successfully" });
  } catch (err) {
    console.error("Error deleting student:", err);
    res.status(500).json({ error: "Failed to delete student" });
  }
});

app.put("/api/updatestudent", async (req, res) => {
  try {
    const { rollNo, dob, name, course, duration, internship } = req.body;

    if (!rollNo || !dob) {
      return res.status(400).json({ error: "Roll number and DOB are required." });
    }

    // Convert frontend dob "YYYY-MM-DD" into real JS Date
    const dobDate = new Date(dob);
    if (isNaN(dobDate.getTime())) {
      return res.status(400).json({ error: "Invalid DOB format." });
    }

    // Find and update student
    const updatedStudent = await students.findOneAndUpdate(
      { rollNo, dob: dobDate },   // match using rollNo + dob
      {
        name,
        course,
        duration,
        internship,
      },
      { new: true } // return updated doc
    );

    if (!updatedStudent) {
      return res.status(404).json({ error: "Student not found." });
    }

    return res.json({ message: "Student updated successfully!", student: updatedStudent });

  } catch (err) {
    console.error("Update error:", err);
    return res.status(500).json({ error: "Server error while updating student." });
  }
});

app.post("/api/contact", (req, res) => {
  const { name, email, phone, message } = req.body;

  console.log("New Contact Message:");
  console.log(name, email, phone, message);

  // Later you can save to DB here

  res.json({ success: true });
});
// Start the server
 module.exports = app;
app.listen(5000, ()=> console.log("connected"))
