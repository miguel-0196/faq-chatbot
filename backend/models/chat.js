import mongoose from "mongoose"

const messageSchema = new mongoose.Schema({
  sender: { type: String, enum: ['user', 'bot'] },
  content: String,
  timestamp: { type: Date, default: Date.now },
})

const questionSchema = new mongoose.Schema({
  sender: { type: String, enum: ['user', 'bot'] },
  content: String,
  timestamp: { type: Date, default: Date.now },
})

const chatSchema = new mongoose.Schema({
  messages: [messageSchema],
  cards: [questionSchema],
  timestamp: { type: Date, default: Date.now },
})

const Chat = mongoose.model('Chat', chatSchema)

export default Chat