const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const userRoutes = require('./routes/userRoutes');
var morgan = require("morgan");
var cookieParser = require("cookie-parser");
var session = require("express-session");
const cors = require('cors');
const app = express();

const PORT = 4500;
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());

app.use("/api/v1/user", userRoutes)
app.use(bodyParser.json());
app.use(morgan("dev"));
app.use(cookieParser());
const DB_URI = "mongodb://localhost:27017/Sample";

mongoose.connect(DB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => {
    console.log("Connected to MongoDB");
    app.listen(PORT, () => {
        console.log("Server is running at http://localhost:4500");
    });
})
.catch((err) => {
    console.error("MongoDB connection error:", err);
});




/////// enaabling bottom code in future for more features//





// update user create account

// app.put("/api/v1/user/:id",async(req,res)=> {

//     let user = await User.findById(req.params.id)

//     user = await User.findByIdAndUpdate(req.params.id,req.body,{new:true,
//         useFindandModify:false,
//         runValidators:true
//     })
//     res.status(200).json({
//         success:true,
//         user
//     })

// })

//delete user

// app.delete("/api/v1/user/:id",async(req,res)=> {

//     const user = await User.findById(req.params.id);

//     if(!user){
//         return res.status(500).json({
//             success:false,
//             message:"user is not found"
//         });
//     }
//     await user.deleteOne();

//     res.status(200).json({
//         success:true,
//         message:"user is deleted successfully"
//     })
// })


