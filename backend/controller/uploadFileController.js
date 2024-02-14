import pinecone from '../utils/pinecone-client.js';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { PineconeStore } from 'langchain/vectorstores/pinecone';
import { PDFLoader } from 'langchain/document_loaders/fs/pdf';
import { DirectoryLoader } from 'langchain/document_loaders/fs/directory';
import path from 'path';
import fs from 'fs/promises'
import { PINECONE_INDEX_NAME ,PINECONE_NAME_SPACE} from "../config/pinecone.js";




 const uploadPdf = async (req, res) => {
 

    const uploadedFile = req.file.originalname;
    console.log("uploadedFile>>>>>>>", uploadedFile)

    try {
        if (!uploadedFile) {
            return res.status(400).json({ error: 'No file uploaded' });
        }
        const moduleURL = new URL(import.meta.url);
        const uploadPaths = path.join(path.dirname(moduleURL.pathname), '..', 'uploads');
        console.log("uploadPath>>>>>", uploadPaths);

        const timestamp = new Date().getTime();
        const uniqueFileName = `${timestamp}_${uploadedFile}`;
        const newpath = `${uploadPaths}/${uniqueFileName}`;
        console.log("newpath>>>>>>>", newpath)

        await fs.writeFile(`${uploadPaths}/${uploadedFile}`, req.file.buffer);
        try {
            /*load raw docs from the all files in the directory */
            const directoryLoader = new DirectoryLoader(uploadPaths, {
              '.pdf': (path) => new PDFLoader(path),
            });
            console.log("directoryLoader>>>>>>>",directoryLoader)
          
            const rawDocs = await directoryLoader.load();
              
            /* Split text into chunks */
            const textSplitter = new RecursiveCharacterTextSplitter({
              chunkSize: 2000,
              chunkOverlap: 400,
            });
        
            const Docs = await textSplitter.splitDocuments(rawDocs);
            // console.log('split docs', medicineDocs);
        
            console.log('creating vector store...');
            /*create and store the embeddings in the vectorStore*/
            const embeddings = new OpenAIEmbeddings({openAIApiKey: "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"});
            console.log("embeddings>>>>>>>>",embeddings)
            const index =  (await pinecone).Index(PINECONE_INDEX_NAME); //change to your own index name
              console.log("index>>>>>",index)
          
            await PineconeStore.fromDocuments(Docs, embeddings, {
              pineconeIndex: index,
              namespace: PINECONE_NAME_SPACE,
              textKey: 'text',
            });
          } catch (error) {
            console.log('error', error);
            throw new Error('Failed to ingest your data');
          }
        console.log('File uploaded, moved, and ingested!');
        return res.status(200).json({ status: true, message: 'File uploaded, moved, and ingested successfully!' });
       }
        catch (error) {
        console.error('Error processing file:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};

export default uploadPdf;