const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const app = express();

mongoose.connect("mongodb://localhost:27017/Sample", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => {
    console.log("Connected to MongoDB");
    app.listen(4500, () => {
        console.log("Server is running at http://localhost:4500");
    });
})
.catch((err) => {
    console.error("MongoDB connection error:", err);
});

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());

////  for making functionality to perform operation to save

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    mobile_number: { type: Number, required: true },
    password: { type: String, required: true }
});

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

userSchema.methods.comparePassword = function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model("User", userSchema);



//create User


app.post("/api/v1/user/new", async (req, res) => {
    try {
        const user = await User.create(req.body);
        res.status(200).json({
            success: true,
            user,
        }
    );
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            error: "Server error",
        });
    }
});

// read for login User

app.get("/api/v1/user",async(req,res)=> {
    const users = await User.find();

    res.status(200).json({success:true,
        users})
        
    })
    
    
    const cors = require('cors');
    app.use(cors());








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


