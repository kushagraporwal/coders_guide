const mongoose= require('mongoose');
const passportLocalMongoose= require('passport-local-mongoose');
const usersSchema= new mongoose.Schema({
    name : {
        type: String,
        required: true
    },
    email : {
        type: String,
        required: true,
        unique:true
    },
    password: {
        type: String,
        required: true
    }
    
})
usersSchema.plugin(passportLocalMongoose, { usernameField : 'email' });
const User = new mongoose.model("User", usersSchema);
module.exports = User;