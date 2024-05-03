const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");

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

const userschema = new mongoose.Schema({
    username: String,
    mobile_number: Number,
    password: String,
});

const User = mongoose.model("User", userschema);


// user authenication for login 

// app.post("/api/v1/user/login", async (req))


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

// put user create account

app.put("/api/v1/user/:id",async(req,res)=> {

    let user = await User.findById(req.params.id)

    user = await User.findByIdAndUpdate(req.params.id,req.body,{new:true,
        useFindandModify:false,
        runValidators:true
    })
    res.status(200).json({
        success:true,
        user
    })

})

//delete user

app.delete("/api/v1/user/:id",async(req,res)=> {

    const user = await User.findById(req.params.id);

    if(!user){
        return res.status(500).json({
            success:false,
            message:"user is not found"
        });
    }
    await user.deleteOne();

    res.status(200).json({
        success:true,
        message:"user is deleted successfully"
    })
})


const cors = require('cors');
app.use(cors());
