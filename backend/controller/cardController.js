import fs from 'fs'
import path from 'path'
import process from 'process'
import Card from '../models/card.js'
import { ingest } from '../utils/pinecone.js'


const getCards = async (req, res) => {
    try {
        const cards = await Card.find()
        res.status(200).json({ sucess: true, cards: cards })
    } catch (error) {
        res.status(500).json({ sucess: false, error: error })
    }
}

const updateCard = async (req, res) => {
    // update db
    const { answer, question, orgAnswer, orgQuestion } = req.body
    const filter = { question: orgQuestion, answer: orgAnswer }
    const data = { question: question, answer: answer }

    if (orgQuestion != '') {
        await Card.updateOne(filter, data)
    } else {
        const update = new Card(data)
        await update.save()
    }

    // rewrite faq.txt with all FAQs
    const filePath = path.join(process.cwd(), 'uploads' + path.sep + 'faq.txt')
    const fileData = await Card.find({}, '-_id question answer').exec()
    let fileStr = ''
    for (const e in fileData) {
        fileStr += 'Question: ' + fileData[e]['question'] + '\n'
        fileStr += 'Answer: ' + fileData[e]['answer'] + '\n\n'
    }

    fs.writeFile(filePath, fileStr, async (err) => {
        if (err) throw err

        // ingest pinecone
        await ingest()
        res.status(200).json({ success: true, message: 'OK' })
    });
}


export { getCards, updateCard }