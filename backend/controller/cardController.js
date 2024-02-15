import Card from "../models/card.js"


const updateCard = async (req, res) => {
    const { answer, question, orgAnswer, orgQuestion } = req.body
    const filter = { question: orgQuestion, answer: orgAnswer }
    const data = { question: question, answer: answer }

    if (orgQuestion != "") {
        await Card.updateOne(filter, data)
    } else {
        const update = new Card(data)
        await update.save()
    }
    res.status(200).json({ success: true, message: "OK" })
}


export { updateCard }