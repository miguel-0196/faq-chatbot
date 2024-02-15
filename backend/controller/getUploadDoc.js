import OpenAI from "openai"
import dotenv from 'dotenv'
import { OpenAIEmbeddings } from "langchain/embeddings/openai"
import { PineconeStore } from "langchain/vectorstores/pinecone"
import pinecone from "../utils/pinecone-client.js"
import { PINECONE_INDEX_NAME, PINECONE_NAME_SPACE } from "../config/pinecone.js"



const openai = new OpenAI({ apiKey: process.env.OPEN_AI_KEY })
const getDocs = async (req, res) => {

  try {

    const index = (await pinecone).Index(PINECONE_INDEX_NAME)

    /* create vectorstore*/

    const vectorStore = await PineconeStore.fromExistingIndex(
      new OpenAIEmbeddings({ openAIApiKey: "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" }),
      {
        pineconeIndex: index,
        textKey: 'text',
        namespace: PINECONE_NAME_SPACE,
      },
    )

    // console.log("vectorStore>>>>>", vectorStore)

    const docs = await vectorStore.similaritySearch("docs", 1)
    const jsonDocs = JSON.stringify(docs)
    // console.log("docs>>>>", jsonDocs)


    const PROMPT =
      `
        * * Please generate a questions and answers according to context.a **
        context:${jsonDocs}
        =========
        Answer in Markdown:`




    const response = await openai.chat.completions.create({
      messages: [
        {
          "role": "system", // Use "system" role for the prompt
          "content": PROMPT,
        },
      ],
      model: 'gpt-3.5-turbo-1106',
    })
    console.log("responsegenerate>>>>>>>>", response.choices[0].message.content)
    const text = response.choices[0].message.content
    const lines = text.split('\n')

    // Initialize an array to store the Q&A objects
    const qnaArray = []

    // Iterate through the lines and extract Q&A pairs
    for (let i = 0; i < lines.length; i += 2) {
      const question = lines[i].trim()
      const answer = lines[i + 1].trim()

      qnaArray.push({ question, answer })
    }
    console.log("qaArray>>>>>>>>>", qnaArray)

    res.status(200).json({ success: true, message: 'doc fetch successfully !', doc: jsonDocs, response: text })

  } catch (error) {
    console.log("error>>>>", error)
    res.status(500).json({ error: "something went wrong" })
  }
}






export default getDocs