import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Question from "../Question";
import { fetchJSON } from "../api";
import type { User } from "../App";

const data = [
    { "id": 1, "question": "What is your full name?" },
    { "id": 2, "question": "How old are you?" },
];

interface QuestionFormProps {
    user: User;
    onLogout: () => void;
}

interface AnswerRow {
    question_id: number;
    answer: string;
}

const QuestionForm = ({ user, onLogout }: QuestionFormProps) => {
    const [submitData, setSubmitData] = useState({});
    const [hasSubmission, setHasSubmission] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [answers, setAnswers] = useState<AnswerRow[]>([]);

    useEffect(() => {
        (async () => {
            try {
                const existing: AnswerRow[] = await fetchJSON("/formsubmit/");
                setHasSubmission(existing.length > 0);
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
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Submit failed");
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
            onLogout();
        } catch {
            onLogout();
        }
    };

    return (
        <>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
                <span>Logged in as <strong>{user.username}</strong></span>
                <button onClick={handleLogout}>Log out</button>
            </div>
            {data.map((q) => (
                <Question
                    key={q.id}
                    id={q.id}
                    question={q.question}
                    submitData={submitData}
                    setSubmitData={setSubmitData}
                />
            ))}
            <button onClick={handleSubmit}>Submit</button>
            {hasSubmission && (
                <button onClick={openModal}>View Submitted Responses</button>
            )}
            {modalOpen && (
                <div
                    onClick={() => setModalOpen(false)}
                    style={{
                        position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                    }}
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        style={{ background: "white", color: "black", padding: 24, borderRadius: 8, minWidth: 320 }}
                    >
                        <h2>Your responses</h2>
                        <ul>
                            {answers.map((a) => {
                                const q = data.find((q) => q.id === a.question_id);
                                return (
                                    <li key={a.question_id}>
                                        <strong>{q?.question ?? `Question ${a.question_id}`}</strong>: {a.answer}
                                    </li>
                                );
                            })}
                        </ul>
                        <button onClick={() => setModalOpen(false)}>Close</button>
                    </div>
                </div>
            )}
        </>
    );
};

export default QuestionForm;
