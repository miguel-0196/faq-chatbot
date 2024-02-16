import path from 'path'
import fs from 'fs/promises'
import { pineconeInstance, initPineconeDB, removePineconeDB } from '../utils/pinecone.js'
import { PINECONE_INDEX_NAME, PINECONE_NAME_SPACE } from "../config/pinecone.js"




const uploadPdf = async (req, res) => {  
  try {
    const uploadedFile = req.file.originalname
    console.log("uploadPdf: ", uploadedFile)
    if (!uploadedFile) {
      return res.status(400).json({ error: 'No file uploaded' })
    }

    const moduleURL = new URL(import.meta.url)
    const uploadPaths = path.join(path.dirname(moduleURL.pathname), '..', 'uploads')

    const timestamp = new Date().getTime()
    const uniqueFileName = `${timestamp}_${uploadedFile}`
    const newpath = `${uploadPaths}/${uniqueFileName}`

    await fs.writeFile(`${uploadPaths}/${uploadedFile}`, req.file.buffer)
    await initPineconeDB()

    return res.status(200).json({ status: true, message: 'File uploaded, moved, and ingested successfully!' })
  }
  catch (error) {
    console.error('Error in uploadPdf:', error)
    return res.status(500).json({ error: 'Internal Server Error' })
  }
}



const deleteUploadedDocs = async (req, res) => {

  await removePineconeDB()
  res.status(200).json({ success: true, message: "All docs deleted from pinecone" })
}

export { uploadPdf, deleteUploadedDocs }