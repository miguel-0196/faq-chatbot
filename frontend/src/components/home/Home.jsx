import '../home/home.css';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ReactMarkdown from "react-markdown";


const Home = () => {


  const Base_Url = "http://66.42.101.116:8000"
  // const Base_Url = "http://localhost:8000"


  const [file, setFile] = useState('');
  const [uploadTrue, setUploadTrue] = useState(false)
  const [card, setCard] = useState([])
  console.log("card>>>", card)
  const [searchInput, setSearchInput] = useState('')
  const [inputMessage, setInputMessage] = useState('');
  const [message, setMessage] = useState([])
  console.log("message>>>", message)
  const [showResponse, setShowResponse] = useState(false)
  const [chatRoomId, setChatRoomId] = useState('')
  console.log("chatRoomId>>>", chatRoomId)




  const handlePdfChange = (event) => {
    const selectedFile = event.target.files[0];
    console.log("selectedfiles>>>>>>>>>", selectedFile)
    setFile(selectedFile);

  };

  const addCard = () => {
    const newCard = {
      question: "",
      answer: "",
    };
    setCard([...card, newCard]);
  };


  const handleUploadDocs = async (e) => {
    e.preventDefault();
    setUploadTrue(true)

    const formData = new FormData()
    formData.append('pdf', file)

    if (!file) {
      toast.error("please choose file...")
    }
    else {

      try {

        const result = await axios.post(`${Base_Url}/api/upload/pdf`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        console.log("result>>>>>>>", result)
        setUploadTrue(false)
        toast.success("File uploaded, moved, and ingested successfully!")

        if (result) {
          setTimeout(() => {
            window.location.reload()
          }, 3000)
        }

      } catch (error) {
        console.log("error>>>>", error)
        toast.error("Failed to upload File !")
        setUploadTrue(false)
      }
    }
  }


  useEffect(() => {
    const getAllChat = async () => {
      try {
        const AllChat = await axios.get(`${Base_Url}/api/get-Allfaq`);
        console.log("AllChat>>>>>>>>>>", AllChat)
        if (AllChat.data.sucess == true) {
          setChatRoomId(AllChat.data.userChat[0]._id)
          setMessage(AllChat.data.userChat[0].messages)

          const messageCard = AllChat.data.userChat[0].messages

          const newCardList = [];
          for (let i = 0; i < messageCard.length - 1; i += 2) {
            const userMessage = messageCard[i];
            const botMessage = messageCard[i + 1];

            if (userMessage.sender === "user" && botMessage.sender === "bot") {
              const newCard = {
                question: userMessage.content,
                answer: botMessage.content
              };
              newCardList.push(newCard);
            }
          }
          setCard(newCardList)
        }
      }
      catch (error) {
        console.log("error>>>>>>>>>", error)
      }
    }
    getAllChat()
  }, [])








  useEffect(() => {
    const getFaqs = async () => {
      try {
        if (chatRoomId) {
          const Chat = await axios.get(`${Base_Url}/api/get-faq/${chatRoomId}`);
          console.log("getDoc>>>>>>>>>>", Chat)
          if (Chat.data.sucess == true) {
            setChatRoomId(Chat.data.userChat._id)
            setMessage(Chat.data.userChat.messages)
            const messageCard = Chat.data.userChat.messages

            const newCardList = [];
            for (let i = 0; i < messageCard.length - 1; i += 2) {
              const userMessage = messageCard[i];
              const botMessage = messageCard[i + 1];

              if (userMessage.sender === "user" && botMessage.sender === "bot") {
                const newCard = {
                  question: userMessage.content,
                  answer: botMessage.content
                };
                newCardList.push(newCard);
                // setCard(prev=> [...prev,newCard])
              }
            }
            console.log("newCardList>>>>>", newCardList)
            setCard(newCardList)
          }
        }
      }
      catch (error) {
        console.log("error>>>>>>>>>", error)
      }
    }
    getFaqs()
  }, [])





  const handleSend = async () => {
    setShowResponse(true)
    const userMesseage = {
      type: 'user',
      message: inputMessage,
    }

    setMessage(prev => ([...prev, userMesseage]))
    setInputMessage('')
    try {
      let body;

      if (chatRoomId) {
        body = {
          chatRoomId: chatRoomId,
          question: inputMessage
        }
      } else {
        body = {
          question: inputMessage
        }
      }

      const result = await axios.post(`${Base_Url}/api/genrate-faq`, body)
      console.log("result>>>>>>>", result)

      if (result.data.status == true) {
        setShowResponse(false)
        setChatRoomId(result.data.chatRoomId)
        const gptResponse = {
          type: 'bot',
          message: result.data.response,
        }
        setMessage(prev => ([...prev, gptResponse]))

        const newCard = {
          question: inputMessage,
          answer: result.data.response
        }
        setCard(prev => [...prev, newCard])

      }


    } catch (error) {
      setShowResponse(false)
      console.log(error)
    }
  }



  const filterCard = searchInput ? card.filter((value) => value.question.toLowerCase().includes(searchInput.toLowerCase())) : card



  return (
    <>
      <ToastContainer />
       <div className='page_outer'>
      <div className='left_side'>
        <div className='home_main'>
          <form className="form-horizontal">
            <div className="form_outer">
              <div className='form_fields'>
                <label for="file" className="control-label">Upload File</label>
                <div className='upload_inner'>
                <input
                  type='file'
                  accept='.pdf'
                  name='file'
                  id='fileInput'
                  className='form-control'
                  onChange={handlePdfChange}
                />
                </div>
              </div>
           
              <button type='submit' className="btn btn-primary" onClick={handleUploadDocs}>{uploadTrue ? <span className={`${uploadTrue ? "blink_me" : " "}`}>"Uploading...."</span> : "Upload Doc"}</button>
            </div>
          </form>




          <div className='faq'>
            <div className="search_box">
            <input type='text' className='form-control search' placeholder='SEARCH' value={searchInput} onChange={(e) => setSearchInput(e.target.value)}></input>
            </div>
            <div className='faq-card'>
              {filterCard && filterCard.map((value, index) => {
                return (
                  <div className='card_box'>
                   <div className='card'>
                    <h4> {value.question}</h4>
                    <p> {value.answer}</p>
                  </div>
                   </div>
                )
              })}
            </div>
            </div>
          
        </div>
      </div>


      <div className='chat_side'>
        <div className="chat-messages" id="msg_outer">
          {message?.map((message, index) => {
            return (message.type || message.sender) === 'user' ? (
              <div className="user" key={index}>
                <div className="user_message">
                  <p> {message.message || message.content} </p>
                </div>
              </div>
            ) : (
              <>
                <div className="ai-response_name"><p>Bot</p></div>
                <div className="ai-response" key={index}>

                  <ReactMarkdown>{message.message || message.content}</ReactMarkdown>
                </div>

              </>
            );
          })}

          <div className="random_spinner">
            {/* {!showResponse && <div className="spinner" > */}
            {showResponse && <div className="spinner" >
              <div className="bounce1"></div>
              <div className="bounce2"></div>
              <div className="bounce3"></div>
            </div>
            }
          </div>

        </div>
        <div className='message-outer'>
          <input type='text' className='form-control' placeholder='Enter a question....' value={inputMessage} onChange={(e) => setInputMessage(e.target.value)}></input>
          <button type='submit' className='btn btn-primary' onClick={handleSend}>Send</button>
        </div>
      </div>
          
      </div>
    </>
  )
}

export default Home
