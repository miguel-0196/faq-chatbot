import path from 'path'
import dotenv from 'dotenv'

import { Pinecone } from '@pinecone-database/pinecone'
import { OpenAIEmbeddings } from 'langchain/embeddings/openai'
import { PineconeStore } from 'langchain/vectorstores/pinecone'
import { PDFLoader } from 'langchain/document_loaders/fs/pdf'
import { TextLoader } from 'langchain/document_loaders/fs/text'
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter'
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

const ingest = async () => {
  try {
    const pineconeConfig = {
      apiKey: process.env.PINECONE_API_KEY,
      environment: process.env.PINECONE_ENVIRONMENT,
    }
    const pinecone = new Pinecone(pineconeConfig)
    const uploadPaths = path.join(process.cwd(), 'uploads')

    /* Load raw docs from the all files in the directory */
    const directoryLoader = new DirectoryLoader(uploadPaths, {
      '.pdf': (path) => new PDFLoader(path),
      '.txt': (path) => new TextLoader(path),
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
    const index = pinecone.Index(process.env.PINECONE_INDEX_NAME)

    await PineconeStore.fromDocuments(Docs, embeddings, {
      pineconeIndex: index,
      namespace: process.env.PINECONE_NAME_SPACE,
      textKey: 'text',
    })
  } catch (error) {
    console.log('Ingest error:', error)
  }
}

export { pinecone, ingest }
export default pinecone