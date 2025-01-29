"use client";
import React from "react";
import { createPortal } from "react-dom";
import  { useState,useRef,useEffect } from "react";
import Navbar from "@/comps/navbar";
import { redirect } from 'next/navigation'


const Attendenceform = ({className}) => {
  const  handleSubmit = async (e) => {
    e.preventDefault();
    let link = linkRef.current.value;
    let time = timeRef.current.value; 
    let req = {link:link, time:time, cookie:document.cookie, questions:questions};

    const response = await fetch('/api/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req),
    });   
    let jsonRes = await response.text();
    // alert(jsonRes._status);
    console.log(jsonRes);
  }


  let linkRef = useRef("");
  let timeRef = useRef("");
  
  let questionRefs = useRef([]);
  let [questions, setQuestions] = useState(
    [
      {
        index:0,
        question:"", 
        answer:""
      }
    ]
  ); 

useEffect(()=>{
console.log(JSON.stringify(questions));
},[questions]);

    return(
    <>
    <div className={`w-full flex justify-center  items-center ${className}`}>
    <form onSubmit={handleSubmit} className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md w-[400px]">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Submit a Link</h2>
      <div className="mb-4">
        <label htmlFor="link" className="block text-sm font-medium text-gray-700 mb-2">
          Enter your link:
        </label>
        <input
          placeholder="https://example.com"
          ref={linkRef}
          required
          className="w-full px-3 py-2 placeholder-gray-400 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-indigo-100 focus:border-indigo-300"
        />
      </div>

      <div className="mb-4">
        <label htmlFor="link" className="block text-sm font-medium text-gray-700 mb-2">
          Enter time:
        </label>
        <input
          required
          ref={timeRef}
          className="w-full px-3 py-2 placeholder-gray-400 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-indigo-100 focus:border-indigo-300"
        />
      </div>

      {
      questions.map((question,index)=>{
        return (
        <div className="mb-4" key={index} datakey={question.index}>
        <label htmlFor="link" className="block text-sm font-medium text-gray-700 mb-2">
          Question
        </label>
        <input
        type="text"
          required
          defaultValue={question.question}

          onChange={(e)=>{
            
            setQuestions((_questions)=>{
              let prevQs = _questions.slice(0,_questions.length-1);
              return [...prevQs, {
                index:_questions.length,
                question:e.target.value,
                 answer:_questions[_questions.length-1].answer
              }]
              
            });
          }}
          

          className="w-full px-3 py-2 placeholder-gray-400 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-indigo-100 focus:border-indigo-300"
        />
        <label htmlFor="link" className="block text-sm font-medium text-gray-700 mb-2">
          Answer
        </label>
        <input
          type="text"
          required
          defaultValue={question.answer}
          
          onChange={(e)=>{
            setQuestions((_questions)=>{

              let prevQs = _questions.slice(0,_questions.length-1);


              return [...prevQs, {
                index:_questions.length,
                question:_questions[_questions.length-1].question,
                 answer:e.target.value
              }]
            });
          }}

          className="w-full px-3 py-2 placeholder-gray-400 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-indigo-100 focus:border-indigo-300"
        />
      </div>)
      })
      }







      <button type="Button" className="w-full bg-gray-600 text-white font-bold py-2 px-4 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 transition-colors duration-300"
       onClick={()=>{
          
        setQuestions((prevQues)=>{
          return [
            ...prevQues, {
            index:questions.length+1,
            question:"",
            answer:""
          }]

        }); 


      }}>Add More questions</button>
      <button
        type="submit"
        className="mt-7 w-full bg-gray-600 text-white font-bold py-2 px-4 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 transition-colors duration-300"
      >
        Submit
      </button>
    </form>
    </div>
    </>
  );
}

function Home() {
  //redrections
    useEffect(() => {
      if (!document.cookie) {
        // router.push("/login"); // Redirect to the login page or any other page
        redirect(`/login`);
      }
    }, []);
    //done

  return (
    <>
    <Navbar/>
    <Attendenceform />
    </>
  )
  }

  export default Home;