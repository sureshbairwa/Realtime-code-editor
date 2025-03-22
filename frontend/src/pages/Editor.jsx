import React, { useState, useRef, useEffect, use } from "react";
import { io } from "socket.io-client";
import { data, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import Editor from "@monaco-editor/react";

const EditorPage = () => {
  const queryParameters = new URLSearchParams(window.location.search);

  const { roomId } = useParams();
  const [username, setUsername] = useState(
    queryParameters.get("username") || "Anonymous"
  );
  const socketRef = useRef(null);
  const [users, setUsers] = useState([]);
  const [code, setCode] = useState("hello world");
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const editorRef = useRef(null);
  const monacoRef = useRef(null);

  console.log(roomId, username);

  useEffect(() => {
    socketRef.current = io(import.meta.env.VITE_BACKEND_URL);


    socketRef.current.emit("join_room", { roomId, username });

    socketRef.current.on("message", (data) => {
      toast.success(data);
      console.log(data);
    });

    socketRef.current.on("users", (users) => {
      setUsers(users);
    });

    socketRef.current.on("group_chat",(data)=>{
      setMessages(data)
      console.log("group chat",data)
    })

    socketRef.current.on("code_synch", ({ value }) => {
      setCode(value);
    });


    return () => {
      socketRef.current.disconnect();
    };
  }, []);

  function handleEditorChange(value, event) {
    console.log(value);
    setCode(value);
    socketRef.current.emit("code_change", { roomId, value });
    // here is the current value
  }

  function handleEditorDidMount(editor, monaco) {
    editorRef.current = editor;
    monacoRef.current = monaco;
    console.log('onMount: the editor instance:', editor);

    console.log('onMount: the monaco instance:', monaco);
  }

  function handleEditorWillMount(monaco) {
    console.log('beforeMount: the msetMessages(onaco instance:', monaco);
  }

  function handleEditorValidation(markers) {
    // model markers
    
  }

  function handleCopyCode() {
    navigator.clipboard.writeText(code);
    toast.success("Code copied to clipboard");
  }


  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage === "") return;

    // console.log(newMessage);

    socketRef.current.emit("new_message", { roomId, message: newMessage });
    setNewMessage("");
  };




  return (
    <div className="flex flex-col md:flex-row h-screen" >
      {/* Left Panel - Users Online */}
      <div className="w-full md:w-1/4 bg-gray-800 p-4 md:overflow-auto border-2 border-cyan-300 flex flex-col items-center justify-between">

      <div>

     
        <p className="text-lg text-green-400 font-semibold mb-4">Users Online</p>
        <ul className="text-cyan-300 font-bold flex flex-col  items-center justify-center w-full">
          {users.map((user) => (
            <li key={user.socketId} className="py-1  text-balce rounded-lg mb-2 font-bold text-xl">
              {user.username}
            </li>
          ))}
        </ul>

        </div>

        <div className="flex flex-col items-center justify-center w-full">

        

        <div className="flex flex-col items-center justify-center w-full">
          <button
            onClick={() => {
              navigator.clipboard.writeText(roomId);
              toast.success("Room ID copied to clipboard");
            }}
            className="w-3/4 rounded-2xl border-2 border-cyan-200 hover:bg-blue-700 bg-blue-500 text-white font-bold px-4 py-2 mt-4 cursor-pointer"
          >
            Copy Room ID
          </button>




        </div >
        <div className="flex flex-col items-center justify-center w-full">

        
        <button
          onClick={handleCopyCode}
          className="w-3/4 rounded-2xl border-2 border-cyan-200 hover:bg-blue-700 bg-blue-500 text-white font-bold px-4 py-2 mt-4 cursor-pointer"
          >
          Copy Code
        </button>
        </div>
        <div className="flex flex-col items-center justify-center w-full">
          <button
            onClick={() => {
              socketRef.current.disconnect();
              window.location.href = "/";
            }}
            className="w-3/4 rounded-2xl border-2 border-cyan-200 hover:bg-red-700 bg-red-500 text-white font-bold px-4 py-2 mt-4 cursor-pointer"
          >
            Leave Room
          </button>

        </div>
        </div>
      </div>

      {/* Right Panel - Monaco Editor */}
      <div className="flex-1 p-5 border-2 border-black bg-gray-500">
        <Editor
          height="90vh"
          width="100%"
          defaultLanguage="cpp"
          defaultValue="// Write your code here"
          value={code}
          theme="vs-dark"
          options={{
            fontSize: 20,
            wordWrap: "on",
            minimap: { enabled: false },
            showUnused: false,
            folding: false,
            lineNumbers: "on",
            scrollBeyondLastLine: false,
            automaticLayout: true,
          }}
          onChange={handleEditorChange}
          onMount={handleEditorDidMount}
          beforeMount={handleEditorWillMount}
          onValidate={handleEditorValidation}
        />
      </div>

      {/* Bottom Panel - Group Chat */}
      <div className="w-full flex flex-col  justify-between md:w-1/4 bg-black  md:overflow-auto border-2 border-cyan-300 h-full">
        <div>
          <p className="text-lg text-center text-green-400 font-semibold mb-4">Group Chat</p>
          <ul className=" font-bold flex flex-col    w-full">
           <div className="max-h-[600px] overflow-y-auto" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {messages.map((message) => (

              
              
            <li key={message.username} className="py-1 px-2 text-black rounded-lg mb-2 font-bold text-xl overflow-hidden text-ellipsis whitespace-normal break-words">
            <span className="text-cyan-500">{message.username}</span>
            <span className="text-green-500">: </span>
            <span className="text-gray-400">{message.message}</span>
            </li>
              
            ))}
           </div>
          </ul>
        </div>
        <div>
          <form
            onSubmit={handleSendMessage}
            className="flex  items-center justify-between w-full p-4 mt-4 gap-1"
          >
            <input
              type="text"
              placeholder="Type a message"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="w-3/4 p-2 rounded-lg border-2 border-cyan-300 text-white"
            />
            <button
              type="submit"
              className="w-1/4 bg-cyan-500 text-white p-2 rounded-lg hover:bg-cyan-600 cursor-pointer"
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditorPage;