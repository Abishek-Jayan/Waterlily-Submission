import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Question from "../Question";
import { fetchJSON } from "../api";
import type { User } from "../App";
import "./index.css";

export type QuestionType = "text" | "date" | "number" | "radio" | "select";

export interface QuestionDef {
    id: number;
    question: string;
    type: QuestionType;
    options?: string[];
}

const US_STATES = [
    "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado",
    "Connecticut", "Delaware", "Florida", "Georgia", "Hawaii", "Idaho",
    "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky", "Louisiana",
    "Maine", "Maryland", "Massachusetts", "Michigan", "Minnesota",
    "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada",
    "New Hampshire", "New Jersey", "New Mexico", "New York",
    "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon",
    "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota",
    "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington",
    "West Virginia", "Wisconsin", "Wyoming",
];

const YES_NO = ["Yes", "No"];

const data: QuestionDef[] = [
    { id: 1, question: "What is your full name?", type: "text" },
    { id: 2, question: "What is your date of birth?", type: "date" },
    { id: 3, question: "What is your gender?", type: "text" },
    { id: 4, question: "What state do you currently live in?", type: "select", options: US_STATES },
    { id: 5, question: "What is your marital status?", type: "select", options: ["Single", "Married"] },
    { id: 6, question: "How would you rate your overall health (excellent, good, fair, poor)?", type: "text" },
    { id: 7, question: "Do you have any chronic conditions? If so, please list them.", type: "text" },
    { id: 8, question: "Are you currently taking any prescription medications?", type: "radio", options: YES_NO },
    { id: 9, question: "Do you smoke or use tobacco products?", type: "radio", options: YES_NO },
    { id: 10, question: "Has anyone in your immediate family needed long-term care?", type: "radio", options: YES_NO },
    { id: 11, question: "What is your approximate annual household income?", type: "number" },
    { id: 12, question: "What are your approximate total retirement savings?", type: "number" },
    { id: 13, question: "Do you currently have any long-term care insurance coverage?", type: "radio", options: YES_NO },
    { id: 14, question: "At what age do you plan to retire?", type: "number" },
    { id: 15, question: "Who would you expect to be your primary caregiver if you needed care?", type: "text" },
];

function isValid(def: QuestionDef, raw: string | undefined): boolean {
    const value = (raw ?? "").trim();
    if (!value) return false;
    switch (def.type) {
        case "number": {
            const n = Number(value);
            return Number.isInteger(n) && n > 0;
        }
        case "select":
        case "radio":
            return def.options?.includes(value) ?? false;
        case "date": {
            const year = Number(value.split("-")[0]);
            return year > 0 && year <= new Date().getFullYear();
        }
        case "text":
            return true;
    }
}

interface QuestionFormProps {
    user: User;
    onLogout: () => void;
}

interface AnswerRow {
    question_id: number;
    answer: string;
}

const QuestionForm = ({ user, onLogout }: QuestionFormProps) => {
    const [submitData, setSubmitData] = useState<Record<number, string>>({});
    const [currentIndex, setCurrentIndex] = useState(0);
    const [hasSubmission, setHasSubmission] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [answers, setAnswers] = useState<AnswerRow[]>([]);
    const [hasSubmitted, setHasSubmitted] = useState(false);

    useEffect(() => {
        (async () => {
            try {
                const existing: AnswerRow[] = await fetchJSON("/formsubmit/");
                setHasSubmission(existing.length > 0);
                if (existing.length > 0) {
                    const prefill: Record<number, string> = {};
                    for (const row of existing) prefill[row.question_id] = row.answer;
                    setSubmitData(prefill);
                }
            } catch {
                setHasSubmission(false);
            }
        })();
    }, []);

    const handleSubmit = async () => {
        const payload = Object.entries(submitData).map(([id, answer]) => ({
            question_id: Number(id),
            answer,
        }));
        try {
            await fetchJSON("/formsubmit/", {
                method: "POST",
                body: JSON.stringify(payload),
            });
            toast.success("Responses submitted!");
            setHasSubmission(true);
            setHasSubmitted(true);
        } catch {
            toast.error("Response wasn't recorded, please try again");
        }
    };

    const openModal = async () => {
        try {
            const rows: AnswerRow[] = await fetchJSON("/formsubmit/");
            setAnswers(rows);
            setModalOpen(true);
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Failed to load responses");
        }
    };

    const handleLogout = async () => {
        try {
            await fetchJSON("/logout/", { method: "POST" });
        } catch {
            /* still log out client-side */
        }
        onLogout();
    };

    const total = data.length;
    const isLast = currentIndex === total - 1;
    const progress = ((currentIndex + 1) / total) * 100;
    const currentQuestion = data[currentIndex];
    const currentValid = isValid(currentQuestion, submitData[currentQuestion.id]);

    return (
        <div className="qform-page">
            <div className="qform-topbar">
                <span className="qform-userinfo">
                    Logged in as <strong>{user.username}</strong>
                </span>
                <button className="qform-logout" onClick={handleLogout}>
                    Log out
                </button>
            </div>
            <div className="qform-body">
                {hasSubmitted ? (
                    <div className="qform-card">
                        <div>Your response has been recorded</div>
                        {hasSubmission && (
                            <button className="qform-view-responses" onClick={openModal}>
                                View Submitted Responses
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="qform-card">
                        <div className="qform-progress-label">
                            Question {currentIndex + 1} of {total}
                        </div>
                        <div className="qform-progress">
                            <div
                                className="qform-progress-fill"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                        <Question
                            def={currentQuestion}
                            submitData={submitData}
                            setSubmitData={setSubmitData}
                        />
                        <div className="qform-nav">
                            <button
                                className="qform-prev"
                                onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
                                disabled={currentIndex === 0}
                            >
                                Previous
                            </button>
                            {isLast ? (
                                <button
                                    className="qform-submit"
                                    onClick={handleSubmit}
                                    disabled={!currentValid}
                                >
                                    Submit
                                </button>
                            ) : (
                                <button
                                    className="qform-next"
                                    onClick={() => setCurrentIndex((i) => i + 1)}
                                    disabled={!currentValid}
                                >
                                    Next
                                </button>
                            )}
                        </div>
                        {hasSubmission && (
                            <button className="qform-view-responses" onClick={openModal}>
                                View Submitted Responses
                            </button>
                        )}
                    </div>
                )}
            </div>
            {modalOpen && (
                <div
                    className="qform-modal-backdrop"
                    onClick={() => setModalOpen(false)}
                >
                    <div
                        className="qform-modal"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h2>Your responses</h2>
                        <ul>
                            {answers.map((a) => {
                                const q = data.find((q) => q.id === a.question_id);
                                return (
                                    <li key={a.question_id}>
                                        <strong>
                                            {q?.question ?? `Question ${a.question_id}`}
                                        </strong>
                                        {a.answer}
                                    </li>
                                );
                            })}
                        </ul>
                        <button
                            className="qform-modal-close"
                            onClick={() => setModalOpen(false)}
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default QuestionForm;
