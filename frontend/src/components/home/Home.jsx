import '../home/home.css';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ReactMarkdown from "react-markdown";


const Home = () => {

  //const Base_Url = "http://66.42.101.116:8000" Debug
  const Base_Url = "http://localhost:8000"

  const [file, setFile] = useState('');
  const [uploadTrue, setUploadTrue] = useState(false)
  const [card, setCard] = useState([])
  const [filterCard, setFilterCard] = useState([])

  const [lengthOfDiv, setLenghtofDiv] = useState()
  const [searchInput, setSearchInput] = useState('')
  const [inputMessage, setInputMessage] = useState('');
  const [message, setMessage] = useState([])

  const [showResponse, setShowResponse] = useState(false)
  const [chatRoomId, setChatRoomId] = useState('')

  const [dlgQuestion, setDlgQuestion] = useState("");
  const [dlgAnswer, setDlgAnswer] = useState("");
  const [dlgOpenIdx, setDlgOpenIdx] = useState(-1)

  const [orgQuestion, setOrgQuestion] = useState("");
  const [orgAnswer, setOrgAnswer] = useState("");


  const searchCard = (val) => {
    setSearchInput(val)
    setFilterCard(val ? card.filter((value) => value.question.toLowerCase().includes(val.toLowerCase())) : card)
  }

  const handleAddFactCard = async (e) => {
    setDlgQuestion("");
    setDlgAnswer("");
    setOrgQuestion("");
    setOrgAnswer("");
    setDlgOpenIdx(-1);
  }

  const openEditCardDialog = (index) => {
    setDlgQuestion(filterCard[index].question);
    setDlgAnswer(filterCard[index].answer);
    setOrgQuestion(filterCard[index].question);
    setOrgAnswer(filterCard[index].answer);
    setDlgOpenIdx(index);
  }

  const saveEditCardDialog = async () => {
    try {
      const result = await axios.post(`${Base_Url}/api/updateCard`, { question: dlgQuestion, answer: dlgAnswer, orgQuestion: orgQuestion, orgAnswer: orgAnswer });
      if (dlgOpenIdx == -1) {
        setCard([...card, {question: dlgQuestion, answer: dlgAnswer}])
        setFilterCard([...filterCard, {question: dlgQuestion, answer: dlgAnswer}])
        setDlgQuestion("");
        setDlgAnswer("");
      } else {
        setFilterCard(prevState => {
          const updatedFilterCard = [...prevState]
          updatedFilterCard[dlgOpenIdx] = {question: dlgQuestion, answer: dlgAnswer}
          return updatedFilterCard
        })
      }
    } catch (error) {
      console.log("saveEditCardDialog error:", error);
    }
  }

  const handlePdfChange = (event) => {
    const selectedFile = event.target.files[0];
    console.log("selectedfiles>>>>>>>>>", selectedFile)
    setFile(selectedFile);
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

  const loadAllData = async () => {
    const cards = await axios.get(`${Base_Url}/api/getCards`)
    if (cards.data.sucess == true) {
      setCard(cards.data.cards)
      setFilterCard(cards.data.cards)
    }

    // Debug
    const AllChat = await axios.get(`${Base_Url}/api/get-Allfaq`);
    if (AllChat.data.sucess == true && AllChat.data.userChat.length > 0) {
      setChatRoomId(AllChat.data.userChat[0]._id)
      setMessage(AllChat.data.userChat[0].messages)
    }
  }

  useEffect(() => {
    loadAllData()
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
            const cards = Chat.data.userChat.cards

            const newCardList = [];
            for (let i = 0; i < cards.length - 1; i += 2) {
              const userMessage = cards[i];
              const botMessage = cards[i + 1];

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

    // const msgOuterDiv = document.getElementById("msg_outer");
    // const lastDiv = msgOuterDiv?.lastElementChild;
    // console.log("divetofocus", lastDiv)
    // lastDiv?.focus();
    // lastDiv?.scrollIntoView({ behavior: "smooth", block: "start", inline: "nearest", scrollOffset: "50px" });

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

  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      handleSend();
    }
  };


  // useEffect(() => {

  //   const msgOuterDiv = document.getElementById("msg_outer");
  //   const lastDiv = msgOuterDiv?.lastElementChild;
  //   console.log("divetofocus", lastDiv)
  //   lastDiv?.focus();
  //   lastDiv?.scrollIntoView({ behavior: "smooth", block: "start", inline: "nearest", scrollOffset: "50px" });

  // }, [lengthOfDiv])


  // useEffect(() => {
  //   const chatLog = document.getElementById("msg_outer");
  //   const lengthOfDiv = chatLog.children.length - 1;
  //   if (lengthOfDiv > 0) {
  //     const lastMsgDiv = chatLog.children[lengthOfDiv - 1];
  //     setLenghtofDiv(lastMsgDiv.innerText);
  //   }
  // }, [message])




  const handleDeleteHistory = async (e) => {
    e.preventDefault();

    const isConfirmed = window.confirm("Are you sure you want to delete the chat history?");
    if (isConfirmed) {
      try {
        const deleteChat = await axios.delete(`${Base_Url}/api/deleteHistory/${chatRoomId}`)
        console.log("deleteChat>>>>>", deleteChat)
        toast.success(deleteChat.data.message)
        if (deleteChat.data.success === true) {
          setTimeout(() => {
            window.location.reload()
          }, 3000)
        }

      } catch (error) {
        console.log("error>>>>", error)
        toast.error("something went wrong !")
      }
    }
  }

  const handleDeleteDocs = async (e) => {
    e.preventDefault();

    try {
      const deleteDocs = await axios.delete(`${Base_Url}/api/delete-docs`);
      console.log("deleteDocs>>>>>>", deleteDocs)
      toast.success("docs deleted successFully")

    } catch (error) {
      console.log("error>>>>>>>>", error)
      toast.error("something went wrong !")
    }

  }

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

                <button type='submit' className="btn btn-primary" onClick={handleUploadDocs}>{uploadTrue ? <span className={`${uploadTrue ? "blink_me" : " "}`}>Uploading....</span> : "Upload Doc"}</button>
                <button type='button' className="btn btn-primary" onClick={handleDeleteDocs}> Delete Docs</button>
                <button type='button' className="btn btn-primary" onClick={handleAddFactCard} data-toggle="modal" data-target="#editCardDlg"> Add a fact card</button>
              </div>
            </form>




            <div className='faq'>
              <div className="search_box">
                <input type='text' className='form-control search' placeholder='SEARCH' value={searchInput} onChange={(e) => searchCard(e.target.value)}></input>
              </div>
              <div className='faq-card'>
                {filterCard && filterCard.map((value, index) => {
                  return (
                    <div className='card_box'>
                      <div className='card'>
                        <button type="button" data-toggle="modal" data-target="#editCardDlg" onClick={() => openEditCardDialog(index)} style={{ float: "right" }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"><rect width="24" height="24" fill="none"/><path fill="currentColor" d="m21.561 5.318l-2.879-2.879A1.495 1.495 0 0 0 17.621 2c-.385 0-.768.146-1.061.439L13 6H4a1 1 0 0 0-1 1v13a1 1 0 0 0 1 1h13a1 1 0 0 0 1-1v-9l3.561-3.561c.293-.293.439-.677.439-1.061s-.146-.767-.439-1.06M11.5 14.672L9.328 12.5l6.293-6.293l2.172 2.172zm-2.561-1.339l1.756 1.728L9 15zM16 19H5V8h6l-3.18 3.18c-.293.293-.478.812-.629 1.289c-.16.5-.191 1.056-.191 1.47V17h3.061c.414 0 1.108-.1 1.571-.29c.464-.19.896-.347 1.188-.64L16 13zm2.5-11.328L16.328 5.5l1.293-1.293l2.171 2.172z"/></svg>
                        </button>
                        <h4> {value.question}</h4>
                        <p> {value.answer}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div class="modal fade" id="editCardDlg" role="dialog">
              <div class="modal-dialog" style={{ textAlign: 'left' }}>
                <div class="modal-content">
                  <div class="modal-header">
                    <button type="button" class="close" data-dismiss="modal" style={{fontSize: '40px'}}>&times;</button>
                    <h3 class="modal-title">Fact card</h3>
                  </div>
                  <div class="modal-body">
                    <div class="form-group">
                      <label>Question:</label>
                      <input type='text' class="form-control" defaultValue={dlgQuestion} value={dlgQuestion} onChange={(e) => setDlgQuestion(e.target.value)} style={{ marginLeft: "0px" }} />
                    </div>
                    <div class="form-group">
                      <label>Answer:</label>
                      <textarea class="form-control" rows="5" onChange={(e) => setDlgAnswer(e.target.value)} defaultValue={dlgAnswer} value={dlgAnswer}></textarea>
                    </div>
                  </div>
                  <div class="modal-footer">
                    <button type="button" class="btn btn-primary" onClick={() => saveEditCardDialog()}>Save</button>
                  </div>
                </div>
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
            <button type="submit" className={`filter_btn ${message.length == 0 ? "disable_Button" : ""}`} disabled={message.length == 0} onClick={handleDeleteHistory} >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M3 6H5H21" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M10 11V17" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M14 11V17" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <input type='text' className='form-control' disabled={showResponse} placeholder={showResponse ? 'Waiting for response....' : 'Enter a question....'} value={inputMessage} onChange={(e) => setInputMessage(e.target.value)} onKeyPress={handleKeyPress}></input>
            <button type='submit' className='btn btn-primary' disabled={showResponse || !inputMessage} onClick={handleSend}>Send</button>
          </div>
        </div>

      </div>
    </>
  )
}

export default Home
