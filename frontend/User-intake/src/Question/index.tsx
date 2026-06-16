import { useState } from "react";

interface QuestionInterface {
    id: number,
    question: string,
    submitData: any,
    setSubmitData:any
};

const Question = ({question,id,submitData,setSubmitData}:QuestionInterface) => {

    return <>
    <div>{question}</div>
    <input type="text" onBlur={(e)=>setSubmitData((prevState:any)=>({...prevState, [id]: e.target.value}))}/>
    </>
}

export default Question;