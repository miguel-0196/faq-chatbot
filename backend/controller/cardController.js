import fs from 'fs/promises'
import path from 'path'
import process from 'process'
import Card from '../models/card.js'
import { initPineconeDB } from '../utils/pinecone.js'

const getCards = async (req, res) => {
    try {
        const cards = await Card.find()
        res.status(200).json({ sucess: true, cards: cards })
    } catch (error) {
        res.status(500).json({ error: error })
    }
}

const updateCard = async (req, res) => {
    try {
        console.log("Input to updateCard:", req.body)

        // update db
        const { answer, question, orgAnswer, orgQuestion } = req.body
        const filter = { question: orgQuestion, answer: orgAnswer }
        const data = { question: question, answer: answer }

        if (orgQuestion != '') {
            await Card.updateOne(filter, data)
            console.log("Updated a fact card")
        } else {
            const update = new Card(data)
            await update.save()
            console.log("Added a fact card")
        }

        // rewrite faq.txt with all FAQs
        const filePath = path.join(process.cwd(), 'uploads' + path.sep + 'faq.txt')
        const fileData = await Card.find({}, '-_id question answer').exec()
        let fileStr = ''
        for (const e in fileData) {
            fileStr += 'Question: ' + fileData[e]['question'] + '\n'
            fileStr += 'Answer: ' + fileData[e]['answer'] + '\n\n'
        }
        await fs.writeFile(filePath, fileStr)
        console.log("Updated the FAQ DB:", filePath)

        // ingest pinecone
        await initPineconeDB()
        res.status(200).json({ success: true })
    } catch (error) {
        res.status(500).json({ error: error })
    }
}


export { getCards, updateCard }