import OpenAI from "openai"
import dotenv from 'dotenv'
import { OpenAIEmbeddings } from "langchain/embeddings/openai"
import { PineconeStore } from "langchain/vectorstores/pinecone"
import pinecone from "../utils/pinecone.js"
import { PINECONE_INDEX_NAME, PINECONE_NAME_SPACE } from "../config/pinecone.js"
import Chat from "../models/chat.js"


dotenv.config()

const openai = new OpenAI({ apiKey: process.env.OPEN_AI_KEY })

const generateFaq = async (req, res) => {  
  try {
    console.log('generateFaq:', req.body)
    const { question, chatRoomId } = req.body

    /* create vectorstore */
    const pc = await pinecone()
    const index = pc.Index(PINECONE_INDEX_NAME)
    const vectorStore = await PineconeStore.fromExistingIndex(
      new OpenAIEmbeddings({ openAIApiKey: process.env.OPEN_AI_KEY }), {
        pineconeIndex: index,
        textKey: 'text',
        namespace: PINECONE_NAME_SPACE,
      },
    )

    const sanitizedQuestion = question?.trim().replaceAll('\n', ' ')
    const docs = await vectorStore.similaritySearch(sanitizedQuestion, 5)
    const jsonDocs = JSON.stringify(docs)

    const PROMPT = `
    * * Please provide a answer according to uploaded docs. **
    Question: ${question}
    =========
    context:${jsonDocs}
    =========
    Answer in Markdown:`


    if (chatRoomId) {
      const chat = await Chat.findById(chatRoomId)

      if (!chat) {
        return res.status(404).json({ error: `No chat room ${chatRoomId}` })
      }

      // Add a new message to the chat
      chat.messages.push({ sender: "user", content: question })
      chat.cards.push({ sender: "user", content: question })
      
      // Save the updated chat
      const updatedChat = await chat.save()
      const updatedChatId = updatedChat._id

      const allMessages = await Chat.findById(chatRoomId)
      console.log("allMessages>>>>>>", allMessages)

      const history = allMessages?.messages?.map(message => ({
        role: message.sender == 'user' ? 'user' : 'assistant', // Map "sender" to "role"
        content: message.content
      }))

      console.log("history>>>>", history)

      let usermsgs

      if (history) {
        console.log(history, question, ">>>>>>>>>>>if>>>>>>>>>>>>>>>.")
        usermsgs = [{ role: 'system', content: PROMPT }, ...history]
      } else {
        usermsgs = [{ role: 'system', content: PROMPT }, { role: 'user', content: question }]
      }




      const response = await openai.chat.completions.create({
        messages: usermsgs,
        model: 'gpt-3.5-turbo-1106',
      })
      console.log("responseHistory>>>>>>>>", response.choices[0].message.content)
      const text = response.choices[0].message.content
      if (updatedChat) {
        if (text) {
          chat.messages.push({ sender: "bot", content: text })
          chat.cards.push({ sender: "bot", content: text })
          const updatedChat = await chat.save()
        }
      }
      res.status(200).json({ status: true, chatRoomId: updatedChatId, response: text })
    }
    else {
      const response = await openai.chat.completions.create({
        messages: [
          {
            "role": "system", // Use "system" role for the prompt
            "content": PROMPT,
          },
          {
            "role": "user",
            "content": question
          },
        ],
        model: 'gpt-3.5-turbo-1106',
      })
      console.log("responsegenerateGPTResponsefunction>>>>>>>>", response.choices[0].message.content)
      const text = response.choices[0].message.content

      const newChat = new Chat()

      if (question) {
        const messageArray = [{ sender: "user", content: question }]
        newChat.messages.push(...messageArray)
        newChat.cards.push(...messageArray)
      }

      // Save the chat to the database
      const savedChat = await newChat.save()
      console.log("savedChat>>>>>", savedChat)

      const chatId = savedChat._id


      if (chatId) {
        console.log("chatId2>>>", chatId)
        const chat = await Chat.findById(chatId)

        if (text) {
          console.log('dummyresponse')
          chat.messages.push({ sender: "bot", content: text })
          chat.cards.push({ sender: "bot", content: text })
          const updatedChat = await chat.save()
        }
      }

      res.status(200).json({ status: true, chatRoomId: chatId, response: text })
    }
  }
  catch (error) {
    res.status(500).json({ status: false, error: error })
  }
}


const getChat = async (req, res) => {
  const { chatRoomId } = req.params

  try {
    const chat = await Chat.findById(chatRoomId)
    console.log("getChat>>>>>>>>>>",chat)

    if (!chat) {
      res.status(404).json({ error: "Chat not found" })
    }

    res.status(200).json({ sucess: true, userChat: chat })
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" })
  }
}

const getAllChat = async (req, res) => {

  try {
    const chat = await Chat.find()
    console.log("getAllChat>>>>>>>>>>", chat)

    if (!chat) {
      res.status(404).json({ error: "Chat not found" })
    }

    res.status(200).json({ sucess: true, userChat: chat })
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" })
  }
}




const deleteChat = async (req, res) => {
  const { chatRoomId } = req.params
  console.log("deleteChat>>>>>>>>>", chatRoomId)

  try {
    const chat = await Chat.findById(chatRoomId)

    if (!chat) {
      return res.status(404).json({ error: "Chat not found" })
    }
    chat.messages = []
    const updatedChat = await chat.save()
    res.status(200).json({ success: true, message: "Chat messages deleted successfully" })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: "Internal Server Error" })
  }
}



export { generateFaq, getChat, getAllChat, deleteChat }