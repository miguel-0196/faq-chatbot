import {generateFaq} from "../controller/chatController.js";
import getDocs from "../controller/getUploadDoc.js";
import { Router } from "express";
import { getChat } from "../controller/chatController.js";
import { getAllChat } from "../controller/chatController.js";



const genrateRoute = Router();


genrateRoute.post('/genrate-faq',generateFaq)
genrateRoute.get('/get-docs',getDocs)
genrateRoute.get('/get-faq/:chatRoomId',getChat)
genrateRoute.get('/get-Allfaq/',getAllChat)


export default genrateRoute