import mongoose from "mongoose";

const cardSchema = new mongoose.Schema({
  question: {type: String, default: ""},
  answer: {type: String, default: ""},
});

const Card = mongoose.model('Card', cardSchema);

export default Card;