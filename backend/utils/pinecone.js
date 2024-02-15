import dotenv from "dotenv"

import { Pinecone } from "@pinecone-database/pinecone"
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter'
import { OpenAIEmbeddings } from 'langchain/embeddings/openai'
import { PineconeStore } from 'langchain/vectorstores/pinecone'
import { PDFLoader } from 'langchain/document_loaders/fs/pdf'
import { DirectoryLoader } from 'langchain/document_loaders/fs/directory'

dotenv.config()

if (!process.env.PINECONE_ENVIRONMENT || !process.env.PINECONE_API_KEY) {
  throw new Error('Pinecone environment or api key missing')
}

const pinecone = async () => {
  try {
    const pineconeConfig = {
      apiKey: process.env.PINECONE_API_KEY,
      environment: process.env.PINECONE_ENVIRONMENT,
    }
    return new Pinecone(pineconeConfig)
  } catch (error) {
    throw new Error('Failed to initialize Pinecone Client')
  }
}

const ingest = async (uploadPaths) => {
  try {
    /* Load raw docs from the all files in the directory */
    const directoryLoader = new DirectoryLoader(uploadPaths, {
      '.pdf': (path) => new PDFLoader(path),
    })
    const rawDocs = await directoryLoader.load()

    /* Split text into chunks */
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 2000,
      chunkOverlap: 400,
    })
    const Docs = await textSplitter.splitDocuments(rawDocs)

    /* Create and store the embeddings in the vectorStore */
    const embeddings = new OpenAIEmbeddings({ openAIApiKey: process.env.OPEN_AI_KEY })
    const index = (await pinecone).Index(PINECONE_INDEX_NAME)

    await PineconeStore.fromDocuments(Docs, embeddings, {
      pineconeIndex: index,
      namespace: PINECONE_NAME_SPACE,
      textKey: 'text',
    })
  } catch (error) {
    console.log('Error:', error)
    throw new Error('Failed to ingest your data')
  }
}

export { pinecone, ingest }
export default pinecone