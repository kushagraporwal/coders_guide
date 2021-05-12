const mongoose= require('mongoose');
const passportLocalMongoose= require('passport-local-mongoose');
const blogsSchema= new mongoose.Schema({
    name : {
        type: String,
        required: true
    },
    blog : {
        type: String,
        required: true,
        unique:true
    },
    date : {
        type: String,
        required: true,
        
    }
    
})
//blogsSchema.plugin(passportLocalMongoose, { usernameField : 'email' });
const Bloglist = new mongoose.model("Bloglist", blogsSchema);
module.exports = Bloglist;