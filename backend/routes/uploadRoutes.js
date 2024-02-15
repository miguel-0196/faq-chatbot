import multer from "multer"
import { Router } from "express"
import { uploadPdf } from "../controller/uploadFileController.js"
import { deleteUploadedDocs } from "../controller/uploadFileController.js"

const router = Router()
const pdfstorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads'); // Save files to the 'pdf' directory
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname)
  },
})

const uploadPdfData = multer({ pdfstorage })

router.post("/upload/pdf", uploadPdfData.single('pdf'), uploadPdf)
router.delete("/delete-docs", deleteUploadedDocs)

export default router