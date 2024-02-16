import path from 'path'
import dotenv, { config } from 'dotenv'

import { Pinecone } from '@pinecone-database/pinecone'
import { OpenAIEmbeddings } from 'langchain/embeddings/openai'
import { PineconeStore } from 'langchain/vectorstores/pinecone'
import { PDFLoader } from 'langchain/document_loaders/fs/pdf'
import { TextLoader } from 'langchain/document_loaders/fs/text'
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter'
import { DirectoryLoader } from 'langchain/document_loaders/fs/directory'


import { PINECONE_NAME_SPACE } from "../config/pinecone.js"

dotenv.config()

if (!process.env.PINECONE_ENVIRONMENT || !process.env.PINECONE_API_KEY) {
  throw new Error('Pinecone environment or api key missing')
}

const pineconeInstance = async () => {
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

const initPineconeDB = async () => {
  try {
    const pineconeConfig = {
      apiKey: process.env.PINECONE_API_KEY,
      environment: process.env.PINECONE_ENVIRONMENT,
    }
    const pineconeClient = new Pinecone(pineconeConfig)
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
    console.log('Ingest docs:', Docs)

    /* Create and store the embeddings in the vectorStore */
    const embeddings = new OpenAIEmbeddings({ openAIApiKey: process.env.OPEN_AI_KEY })
    
    /* Remove original docs */
    const pineconeIndex = pineconeClient.Index(process.env.PINECONE_INDEX_NAME)
    const namespaceIndex = pineconeIndex.namespace(PINECONE_NAME_SPACE)
    await namespaceIndex.deleteAll()

    /* Add new docs */
    await PineconeStore.fromDocuments(Docs, embeddings, {
      pineconeIndex: pineconeIndex,
      namespace: PINECONE_NAME_SPACE,
      textKey: 'text',
    })

    console.log("Ingest result db:", await pineconeClient.index(process.env.PINECONE_INDEX_NAME).describeIndexStats())
  } catch (error) {
    console.log('Ingest error:', error)
  }
}

const removePineconeDB = async () => {
  try {
    const pineconeConfig = {
      apiKey: process.env.PINECONE_API_KEY,
      environment: process.env.PINECONE_ENVIRONMENT,
    }
    const pineconeClient = new Pinecone(pineconeConfig)

    /* Remove original docs */
    const pineconeIndex = pineconeClient.Index(process.env.PINECONE_INDEX_NAME)
    const namespaceIndex = pineconeIndex.namespace(PINECONE_NAME_SPACE)
    await namespaceIndex.deleteAll()

    console.log("removePineconeDB result:", await pineconeClient.index(process.env.PINECONE_INDEX_NAME).describeIndexStats())
  } catch (error) {
    console.log('removePineconeDB error:', error)
  }
}

export { pineconeInstance, initPineconeDB, removePineconeDB }
export default pineconeInstance