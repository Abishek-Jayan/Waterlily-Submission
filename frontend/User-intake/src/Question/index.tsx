import type { QuestionDef } from "../QuestionForm";

interface QuestionProps {
    def: QuestionDef;
    submitData: Record<number, string>;
    setSubmitData: React.Dispatch<React.SetStateAction<Record<number, string>>>;
}

const Question = ({ def, submitData, setSubmitData }: QuestionProps) => {
    const value = submitData[def.id] ?? "";
    const setValue = (v: string) =>
        setSubmitData((prev) => ({ ...prev, [def.id]: v }));

    return (
        <>
            <div className="qform-question-text">{def.question}</div>
            {def.type === "text" && (
                <input
                    type="text"
                    className="qform-input"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder="Your answer"
                />
            )}
            {def.type === "date" && (
                <input
                    type="date"
                    className="qform-input"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    max={`${new Date().getFullYear()}-12-31`}
                    placeholder="MM/DD/YY"
                />
            )}
            {def.type === "number" && (
                <input
                    type="number"
                    min="1"
                    step="1"
                    className="qform-input"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder="Enter a positive whole number"
                />
            )}
            {def.type === "select" && (
                <select
                    className="qform-input"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                >
                    <option value="">Select an option</option>
                    {def.options?.map((opt) => (
                        <option key={opt} value={opt}>
                            {opt}
                        </option>
                    ))}
                </select>
            )}
            {def.type === "radio" && (
                <div className="qform-radio-group">
                    {def.options?.map((opt) => (
                        <label key={opt} className="qform-radio">
                            <input
                                type="radio"
                                name={`q-${def.id}`}
                                value={opt}
                                checked={value === opt}
                                onChange={() => setValue(opt)}
                            />
                            <span>{opt}</span>
                        </label>
                    ))}
                </div>
            )}
        </>
    );
};

export default Question;
