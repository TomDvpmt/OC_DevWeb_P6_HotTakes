const mongoose = require("mongoose");
const uniqueValidtor = require("mongoose-unique-validator");

const userSchema = mongoose.Schema({
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true}
});

userSchema.plugin(uniqueValidtor);
module.exports = mongoose.model("User", userSchema);